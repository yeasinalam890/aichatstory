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

        const systemPrompt = `You are an interactive AI roleplay character named ${charName}. 
Traits: ${character?.traits || 'feisty, confident'}
Scene: ${storyState?.scene || 'Campus romance'}

Rules:
1. Respond directly to the user's latest message in character as ${charName}.
2. Format physical actions in asterisks (*action*) and spoken dialogue with quotes (${charName}: "speech").
3. Never repeat previous assistant messages or reuse identical fallback lines. Keep the conversation moving forward dynamically.
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
            return `*${charName} looks at you.* ${charName}: "API key is missing."`;
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
                return data.candidates[0].content.parts[0].text.trim();
            } else if (data.error) {
                console.error("Gemini API Error Details:", data.error);
                return `*${charName} raises an eyebrow.* ${charName}: "(${data.error.message || 'API Error'})"`;
            }
        } catch (err) {
            console.error("Fetch Exception:", err);
        }

        return `*${charName} stares at you intently.* ${charName}: "Tum sun bhi rahe ho ya kahin aur khoye ho?"`;
    }
}

module.exports = DialogueEngine;
