const express = require("express");

const {
    searchTracks,
    getTrackById,
} = require("../services/spotifyService");

const router = express.Router();

router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Query parameter 'q' is required.",
            });
        }

        const tracks = await searchTracks(q);

        res.status(200).json({
            success: true,
            count: tracks.length,
            tracks,
        });
    } catch (error) {
        console.error("Spotify search failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Spotify search failed.",
        });
    }
});

router.get("/tracks/:id", async (req, res) => {
    try {
        const track = await getTrackById(req.params.id);

        res.status(200).json({
            success: true,
            track,
        });
    } catch (error) {
        console.error("Spotify track lookup failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Spotify track lookup failed.",
        });
    }
});

module.exports = router;