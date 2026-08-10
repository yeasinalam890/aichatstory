const fetch = require('node-fetch');
const LanguageEngine = require('./LanguageEngine');

class DialogueEngine {
    static async generateResponse(context) {
        const { character, emotions, relationship, storyState, recentHistory, userMessage, languagePref } = context;
        const langInstruction = LanguageEngine.detectAndFormatInstruction(userMessage, languagePref);

        let charName = character?.name || "Aisha";
        if (charName.includes("Dhadkan") || charName.includes("CEO") || charName.includes("Bride") || charName.includes("Boss")) {
            charName = "Aisha";
        }

        const systemPrompt = `You are an immersive romance/drama roleplay character named ${charName}. 
Traits: ${character?.traits || 'feisty, confident, expressive'}
Scene: ${storyState?.scene || 'Campus romance'}

CRITICAL INSTRUCTIONS:
1. React uniquely and creatively to the user's latest message. NEVER repeat your previous lines or use static fallback text.
2. Format actions in asterisks (*action*) and spoken dialogue in quotes (${charName}: "speech").
3. Keep the conversation moving forward naturally.
4. ${langInstruction}`;

        // Clean and deduplicate history to prevent API looping blocks
        const cleanHistory = [];
        if (recentHistory && Array.isArray(recentHistory)) {
            for (let m of recentHistory) {
                if (m.text && m.sender) {
                    cleanHistory.push({
                        role: m.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: m.text }]
                    });
                }
            }
        }

        const payloadContents = [
            { role: 'user', parts: [{ text: `[SYSTEM_INSTRUCTION]\n${systemPrompt}` }] },
            ...cleanHistory,
            { role: 'user', parts: [{ text: userMessage }] }
        ];

        const apiKey = process.env.GEMINI_API_KEY || process.env.REPLIT_AI_API;
        if (!apiKey) {
            return `*${charName} looks at you.* ${charName}: "API key is missing on backend server."`;
        }

        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: payloadContents })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            } else if (data.error) {
                console.error("Gemini API Error:", data.error);
                return `*${charName} blinks.* ${charName}: "(Error: ${data.error.message || 'API limit'})"`;
            }
        } catch (err) {
            console.error("Fetch Exception:", err);
        }

        return `*${charName} shifts her weight impatiently.* ${charName}: "Agle baar dhyan se baat karna, ab bolo kya kehna hai?"`;
    }
}

module.exports = DialogueEngine;
