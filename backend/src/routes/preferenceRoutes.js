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

// Converts a database preference row into the public Preference API format.
function formatPreference(row) {
    let genres = row.genres;

    // MySQL JSON values may be returned as either a JSON string or an array,
    // depending on the driver/environment.
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

// POST /api/preferences
// Creates a database-backed song preference for a user.
router.post("/", async (req, res) => {
    const {
        userId,
        songId,
        title,
        artist,
        genre = null,
    } = req.body;

    // Validate the request against the Sprint 2 Preference API contract.
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
        // The public API uses the Spotify song identifier.
        // The preference table stores the internal numeric songs.id value,
        // so look up the database song record first.
        const song = await getSongBySpotifyId(songId);

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found.",
            });
        }

        // Store the relationship using the user's Music Vault ID and
        // the song's internal database ID.
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
        // The database unique constraint prevents the same user/song
        // preference from being stored more than once.
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Preference already exists.",
            });
        }

        // A foreign-key failure means the supplied Music Vault user
        // does not exist in the database.
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

// GET /api/preferences/:userId
// Retrieves a user's stored preferences and song metadata from MySQL.
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

// DELETE /api/preferences/:id
// Removes a stored preference using its database preference ID.
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