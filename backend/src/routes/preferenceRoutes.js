const express = require("express");

const { validatePreference } = require("../utils/preferenceValidation");
const {
    createPreference,
    getPreferencesByUser,
    deletePreferenceById,
} = require("../models/preferenceModel");
const {
    getSongBySpotifyId,
} = require("../models/songModel");

const router = express.Router();

function formatPreference(row) {
    let genres = row.genres;

    if (typeof genres === "string") {
        try {
            genres = JSON.parse(genres);
        } catch {
            genres = [];
        }
    }

    const genre =
        Array.isArray(genres) && genres.length > 0
            ? genres[0]
            : null;

    return {
        id: row.id,
        userId: row.user_id,
        songId: row.spotify_id,
        title: row.title,
        artist: row.artist_name,
        genre,
    };
}

router.post("/", async (req, res) => {
    const {
        userId,
        songId,
        title,
        artist,
        genre = null,
    } = req.body;

    const validation = validatePreference({
        userId,
        songId,
        title,
        artist,
    });

    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            message: validation.message,
        });
    }

    try {

        const song = await getSongBySpotifyId(songId);

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found.",
            });
        }


        const preferenceId = await createPreference(userId, song.id);

        return res.status(201).json({
            success: true,
            preference: {
                id: preferenceId,
                userId,
                songId,
                title,
                artist,
                genre,
            },
        });
    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Preference already exists.",
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        console.error("Failed to create preference:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create preference.",
        });
    }
});

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const rows = await getPreferencesByUser(userId);

        const preferences = rows.map(formatPreference);

        return res.status(200).json({
            success: true,
            preferences,
        });
    } catch (error) {
        console.error("Failed to retrieve preferences:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve preferences.",
        });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const affectedRows = await deletePreferenceById(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Preference not found.",
            });
        }

        return res.status(200).json({
            success: true,
            preference: {
                id: Number(id),
            },
        });
    } catch (error) {
        console.error("Failed to delete preference:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete preference.",
        });
    }
});

module.exports = router;