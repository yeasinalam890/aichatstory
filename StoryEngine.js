class StoryEngine {
    constructor(storyDetails) {
        this.storyDetails = storyDetails || {};
    }

    getInitialOpening() {
        return [
            {
                sender: 'assistant',
                text: "*Che mahine beet gaye, Aisha... tum sach mein aa gaye! Maine socha shayad tum wahan ki chaka-chondh mein mujhe bhool gaye hoge.*\n\n*Usne rote hue Aarav ko gale laga liya, ubh ke beech ki har doori khatam ho chuki thi.*"
            },
            {
                sender: 'assistant',
                text: "Aisha: \"Main bhi mujhe kal dusri jagah jaana lekin main proof kr ke rahunga. Issed liya abhi mein tumse Direct 6 mahine baat tumhari papa ke sath milunga. Abhi ke liye idhar pause krte hain,promise mein lot ke aunga.\""
            }
        ];
    }

    updateStoryState() {
        return {
            scene: this.storyDetails.scene || "Royal Crest University Campus - Dramatic Encounter"
        };
    }
}

module.exports = StoryEngine;
