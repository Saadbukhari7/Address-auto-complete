const express = require('express');
const router = express.Router();

// In-memory API keys storage
const apiKeys = {
    "user1": "apiKey1",
    "user2": "apiKey2"
};

// Route to get API key for a user
router.get('/apikey', (req, res) => {
    const userId = req.query.userId;
    const userApiKey = apiKeys[userId];

    if (userApiKey) {
        res.json({ apiKey: userApiKey });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Route to add a new API key for a user
router.post('/apikey', (req, res) => {
    const { userId, apiKey } = req.body;
    apiKeys[userId] = apiKey;

    res.status(201).json({ message: 'API key added successfully' });
});

module.exports = router;
