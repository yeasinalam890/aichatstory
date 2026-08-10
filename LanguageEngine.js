class LanguageEngine {
    static detectAndFormatInstruction(userMessage, preference = "Auto") {
        let detected = preference;
        if (preference === "Auto") {
            if (/[\u0900-\u097F]/.test(userMessage)) detected = "Hindi";
            else if (/[\u0980-\u09FF]/.test(userMessage)) detected = "Bengali";
            else if (/[\u0600-\u06FF]/.test(userMessage)) detected = "Urdu";
            else if (/(hai|kya|kaise|nahi|aur|mein|tum|aap)/i.test(userMessage)) detected = "Hinglish";
            else detected = "English";
        }
        return `Language Instruction: The user is communicating in [${detected}]. You MUST reply naturally in this exact language style (${detected}). Do NOT translate into standard English.`;
    }
}
module.exports = LanguageEngine;
