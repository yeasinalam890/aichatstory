const fetch = require('node-fetch');
const LanguageEngine = require('./LanguageEngine');

class DialogueEngine {
    static async generateResponse(context) {
        const { character, emotions, relationship, storyState, recentHistory, userMessage, languagePref } = context;
        const langInstruction = LanguageEngine.detectAndFormatInstruction(userMessage, languagePref);

        let rawName = character?.name || "Aisha";
        if (rawName.includes("Dhadkan") || rawName.includes("CEO") || rawName.includes("Bride") || rawName.includes("Boss")) {
            rawName = "Aisha";
        }
        const charName = rawName.split(':')[0].trim();

        const systemPrompt = `You are an immersive romance/drama AI character named ${charName}, acting in an interactive novel roleplay app.
Traits: ${character?.traits || 'feisty, confident, expressive'}
Social Status: ${character?.social || 'College Student'}
Scene Context: ${storyState?.scene || 'Romantic dramatic encounter'}

CRITICAL FORMATTING & DIALOGUE RULES:
1. You MUST ALWAYS include spoken dialogue in quotes along with your physical actions. Never output only body language or asterisks.
2. Format: *[Physical action or expression]* ${charName}: "[Spoken dialogue here]"
3. React naturally, emotionally, and dramatically to what the user just said. Keep the conversation flowing.
4. ${langInstruction}`;

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
            return `*${charName} looks at you closely.* ${charName}: "API key is missing on the server."`;
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
                let replyText = data.candidates[0].content.parts[0].text.trim();
                // Ensure it always has spoken dialogue
                if (!replyText.includes('"')) {
                    replyText = `*${charName} gestures expressively.* ${charName}: "${replyText}"`;
                }
                return replyText;
            }
        } catch (err) {
            console.error("API Error:", err);
        }
        return `*${charName} crosses her arms and glares at you.* ${charName}: "Tumhe lagta hai yeh sab funny hai?"`;
    }
}

module.exports = DialogueEngine;
