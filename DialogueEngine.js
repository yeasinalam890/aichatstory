const fetch = require('node-fetch');
const LanguageEngine = require('./LanguageEngine');

class DialogueEngine {
    static async generateResponse(context) {
        const { character, emotions, relationship, storyState, recentHistory, userMessage, languagePref } = context;
        const langInstruction = LanguageEngine.detectAndFormatInstruction(userMessage, languagePref);

        // Extract a clean character name, removing story title fluff
        let rawName = character?.name || "Aisha";
        if (rawName.includes("Dhadkan") || rawName.includes("CEO") || rawName.includes("Bride") || rawName.includes("Boss")) {
            rawName = "Aisha"; // Default fallback character name for romantic storylines
        }
        const charName = rawName.split(':')[0].trim();

        const systemPrompt = `You are an immersive, authentic romance/drama AI character named ${charName}, acting in an interactive novel roleplay app style.
Traits: ${character?.traits || 'feisty, confident, expressive'}
Social Status: ${character?.social || 'College Student'}
Scene Context: ${storyState?.scene || 'Romantic dramatic encounter'}

CRITICAL ROLEPLAY & FORMATTING RULES:
1. Always reply strictly in character as ${charName}. NEVER use the story title or app name as your identity.
2. Format physical actions, body language, and environmental descriptions inside asterisks (*e.g., *she crosses her arms and glares at you*).
3. Format spoken dialogue normally or with quotes (e.g., ${charName}: "Tumhe akal nahi hai kya?").
4. Keep the conversation deeply engaging, emotional, and responsive to what the user just said. Do not output generic fallback loops.
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
            return `*${charName} looks away quietly.* (API key missing)`;
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
        return `*${charName} narrows her eyes, watching you closely.*`;
    }
}

module.exports = DialogueEngine;
