const fetch = require('node-fetch');
const LanguageEngine = require('./LanguageEngine');

class DialogueEngine {
    static async generateResponse(context) {
        const { character, emotions, relationship, storyState, recentHistory, userMessage, languagePref } = context;
        const langInstruction = LanguageEngine.detectAndFormatInstruction(userMessage, languagePref);

        const systemPrompt = `You are an immersive, authentic AI character in a dramatic storytelling simulation.
Character: ${character.name} | Traits: ${character.traits.join(', ')}
Emotions: Trust ${emotions.trust}, Suspicion ${emotions.suspicion}, Tension ${relationship.tension}
Scene: ${storyState.scene}

CRITICAL ANTI-REPETITION & HUMAN DYNAMICS RULES:
1. NEVER repeat a previous response or reuse identical phrasing from past assistant messages in the chat history. Provide fresh, unique dialogue every time.
2. Respond with genuine human emotion (happy, sad, tense, chill, guarded, playful).
3. NEVER decide what the user says, feels, or physically does. Only control your character and the world.
4. Do NOT constantly ask questions, do NOT say "I understand" or "Tell me more". Sound like a genuine human conversational partner.
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
            return `*${character.name} observes you quietly.* (API key missing on backend)`;
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
        return `*${character.name} glances away thoughtfully.*`;
    }
}
module.exports = DialogueEngine;
