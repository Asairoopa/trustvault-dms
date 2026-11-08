const express = require('express');
const router = express.Router();

// 1. Login Route
router.post('/login', (req, res) => {
    try {
        // Add your login logic here later
        res.status(200).json({ success: true, message: "Login route working successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Register Route
router.post('/register', (req, res) => {
    try {
        // Add your register logic here later
        res.status(200).json({ success: true, message: "Register route working successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;