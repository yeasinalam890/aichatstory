class QualityController {
    static validateResponse(reply) {
        if (!reply || reply.trim().length === 0) return false;
        const low = reply.toLowerCase();
        if (low.includes("how can i help you") || low.includes("as an ai model")) return false;
        return true;
    }
}
module.exports = QualityController;
