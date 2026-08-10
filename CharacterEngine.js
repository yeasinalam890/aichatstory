class CharacterEngine {
    constructor(characterData = {}) {
        this.name = characterData.title || "Elena";
        this.traits = characterData.traits ? characterData.traits.split(',').map(s => s.trim()) : ["Mysterious", "Intelligent", "Observant", "Guarded"];
        this.speaking_style = "Nuanced, dramatic, emotionally resonant, avoiding robotic AI clichés";
        this.goals = ["Find out whether the user can be trusted"];
        this.secrets = ["She knows why the setting was abandoned."];
    }
    getState() {
        return { name: this.name, traits: this.traits, speaking_style: this.speaking_style, secrets: this.secrets };
    }
}
module.exports = CharacterEngine;
