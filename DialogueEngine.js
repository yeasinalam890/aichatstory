const fetch = require('node-fetch');
const LanguageEngine =./LanguageEngine');

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
2. Format physical actions in asterisks (*action*) and spoken dialogue in quotes (${charName}: "speech").
3. Keep the conversation moving forward naturally and emotionally.
4. ${langInstruction}`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...(recentHistory || []).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            })),
            { role: "user", content: userMessage }
        ];

        const apiKey = process.env.GROQ_API_KEY || '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';

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: messages,
                    temperature: 0.8,
                    max_tokens: 300
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]?.message?.content) {
                return data.choices[0].message.content.trim();
            } else if (data.error) {
                console.error("Groq API Error:", data.error);
                return `*${charName} blinks.* ${charName}: "(Groq Error: ${data.error.message || 'API limit'})"`;
            }
        } catch (err) {
            console.error("Groq Fetch Exception:", err);
        }

        return `*${charName} looks at you closely.* ${charName}: "Tum sun bhi rahe ho ya kahin aur khoye ho?"`;
    }
}

module.exports = DialogueEngine;
