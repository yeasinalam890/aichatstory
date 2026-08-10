const fetch = require('node-fetch');
const LanguageEngine = require('./LanguageEngine');

class DialogueEngine {
    static async generateResponse(context) {
        const { character, emotions, relationship, storyState, recentHistory, userMessage, languagePref } = context;
        const langInstruction = LanguageEngine.detectAndFormatInstruction(userMessage, languagePref);

        const charName = character?.name || "Aisha";

        const systemPrompt = `You are an immersive, authentic romance/drama AI character named ${charName}, styled like an interactive novel app (similar to Kavana).
Traits: ${character?.traits?.join(', ') || 'passionate, expressive, dramatic'}
Emotions: Trust ${emotions.trust}, Suspicion ${emotions.suspicion}, Tension ${relationship.tension}
Scene: ${storyState?.scene || 'Campus romance'}

CRITICAL FORMATTING & NARRATIVE RULES:
1. Format actions, environmental descriptions, and body language inside asterisks (*like this*). Format spoken character dialogue normally or with quotes (e.g., ${charName}: "Dialogue here").
2. Blend emotional depth, dramatic pauses, and realistic expressions.
3. NEVER repeat previous responses or reuse identical phrasing. Keep text fresh and captivating.
4. NEVER control the user's actions or speech. Only control ${charName} and the surrounding world.
5. ${langInstruction}`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...(recentHistory || []).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            })),
            { role: "user", content: userMessage }
        ];

        const apiKey = process.env.GEMINI_API_KEY || process.env.REPLIT_AI_API;
        if (!apiKey) {
            return `*${charName} looks at you with a quiet gaze.* (API key missing)`;
        }

        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: messages.map(m => ({
                        role: m.role === 'system' ? 'user' : m.role,
                        parts: [{ text: (m.role === 'system' ? "[SYS]\n" : "") + m.content }]
                    }))
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (err) {
            console.error("API Error:", err);
        }
        return `*${charName} narrows her eyes thoughtfully, waiting for your reply.*`;
    }
}
module.exports = DialogueEngine;
