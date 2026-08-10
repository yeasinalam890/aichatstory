class EmotionEngine {
    constructor() {
        this.emotions = { trust: 20, suspicion: 70, joy: 15, curiosity: 80, affection: 5, tension: 60 };
    }
    updateEmotions(userAction) {
        const text = (userAction || "").toLowerCase();
        if (text.includes("trust") || text.includes("truth")) {
            this.emotions.trust = Math.min(100, this.emotions.trust + 5);
            this.emotions.suspicion = Math.max(0, this.emotions.suspicion - 5);
        }
        if (text.includes("lie") || text.includes("hide")) {
            this.emotions.suspicion = Math.min(100, this.emotions.suspicion + 6);
        }
        return this.emotions;
    }
    getEmotions() { return this.emotions; }
}
module.exports = EmotionEngine;
