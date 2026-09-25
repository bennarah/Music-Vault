const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const preferences = [];

router.post("/", async (req, res) => {
    const {
        userId,
        songId,
        title,
        artist,
        genre = null,
    } = req.body;

    const preference = {
        id: crypto.randomUUID(),
        userId,
        songId,
        title,
        artist,
        genre,
    };

    preferences.push(preference);

    res.status(201).json({
        success: true,
        preference,
    });
});

module.exports = router;