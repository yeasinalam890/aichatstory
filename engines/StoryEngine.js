class StoryEngine {
    constructor(storyDetails = {}) {
        this.scene = storyDetails.prompt || "Opening scene conversation";
        this.location = storyDetails.social || "Atmospheric Setting";
    }
    updateStoryState() { return { scene: this.scene, location: this.location }; }
}
module.exports = StoryEngine;
