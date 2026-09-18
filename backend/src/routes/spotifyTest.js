//Defines the HTTP endpoint someone can call

const express = require("express");
const {
    testSpotifyConnection,
} = require("../services/spotifyService");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await testSpotifyConnection();

        res.status(200).json({
            success: true,
            message: "Successfully connected to Spotify.",
            spotify: result,
        });
    } catch (error) {
        console.error("Spotify connectivity test failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Spotify connectivity test failed.",
            error: error.message,
        });
    }
});

module.exports = router;