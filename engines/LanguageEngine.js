class LanguageEngine {
    static detectAndFormatInstruction(userMessage, preference = "Auto") {
        let detected = preference;
        if (preference === "Auto") {
            if (/[अ-ह]/.test(userMessage)) detected = "Hindi";
            else if (/[অ-হ]/.test(userMessage)) detected = "Bengali";
            else if (/[ٱ-ي]/.test(userMessage)) detected = "Urdu";
            else if (/(hai|kya|kaise|nahi|aur|mein|tum|aap)/i.test(userMessage)) detected = "Hinglish";
            else detected = "English";
        }
        return `Language Instruction: The user is communicating in [${detected}]. You MUST reply naturally in this exact language style (${detected}). Do NOT translate into standard English.`;
    }
}
module.exports = LanguageEngine;
