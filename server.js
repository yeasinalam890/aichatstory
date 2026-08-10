require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const CharacterEngine = require('./engines/CharacterEngine');
const EmotionEngine = require('./engines/EmotionEngine');
const RelationshipEngine = require('./engines/RelationshipEngine');
const StoryEngine = require('./engines/StoryEngine');
const MemoryEngine = require('./engines/MemoryEngine');
const DialogueEngine = require('./engines/DialogueEngine');
const QualityController = require('./engines/QualityController');
const AdminEngine = require('./engines/AdminEngine');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Explicit root route to load index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const sessions = {};

function getSession(storyId, storyDetails) {
    if (!sessions[storyId]) {
        sessions[storyId] = {
            character: new CharacterEngine(storyDetails),
            emotions: new EmotionEngine(),
            relationship: new RelationshipEngine(),
            story: new StoryEngine(storyDetails),
            memory: new MemoryEngine()
        };
    }
    return sessions[storyId];
}

app.post('/api/chat', async (req, res) => {
    try {
        const { storyId, message, history, storyDetails, languagePref } = req.body;
        const session = getSession(storyId || 'default', storyDetails || {});

        session.emotions.updateEmotions(message);
        session.relationship.evolve(session.emotions.getEmotions());
        session.memory.addMemory(message);

        let reply = await DialogueEngine.generateResponse({
            character: session.character.getState(),
            emotions: session.emotions.getEmotions(),
            relationship: session.relationship.getState(),
            storyState: session.story.updateStoryState(),
            recentHistory: history,
            userMessage: message,
            languagePref: languagePref || "Auto"
        });

        if (!QualityController.validateResponse(reply)) {
            reply = await DialogueEngine.generateResponse({
                character: session.character.getState(),
                emotions: session.emotions.getEmotions(),
                relationship: session.relationship.getState(),
                storyState: session.story.updateStoryState(),
                recentHistory: history,
                userMessage: message,
                languagePref: languagePref || "Auto"
            });
        }

        res.json({ reply, emotions: session.emotions.getEmotions(), relationship: session.relationship.getState() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Error" });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (AdminEngine.authenticate(username, password)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: "Invalid credentials" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Daryeam AI backend running on port ${PORT}`));
