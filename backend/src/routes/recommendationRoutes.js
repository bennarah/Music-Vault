
const express = require("express");

const {
    getPreferencesByUser,
    mapPreferenceRowToSong,
} = require("../models/preferenceModel");

const {
    getAllSongs,
} = require("../models/songModel");

const {
    generateRecommendations,
} = require("../services/recommendationService");

const {
    prepareCandidates,
} = require("../services/candidatePreparation");

const {
    createPerformanceMetrics,
} = require("../utils/performanceMetrics");

const router = express.Router();


// Converts a database song row into the format expected
// by the recommendation algorithm.

function mapSongRow(row) {
    let genres = row.genres;

    if (typeof genres === "string") {
        try {
            genres = JSON.parse(genres);
        } catch {
            genres = [];
        }
    }

    if (!Array.isArray(genres)) {
        genres = [];
    }

    return {
        spotifyId: row.spotify_id,
        title: row.title,
        artistId: row.artist_id,
        artistName: row.artist_name,
        genres,
        albumId: row.album_id,
        albumName: row.album_name,
        albumImageUrl: row.album_image_url,
        durationMs: row.duration_ms,
        explicit: Boolean(row.explicit),
        spotifyUrl: row.spotify_url,
    };
}


// GET /api/recommendations/:userId
// Generates ranked recommendations from saved user preferences.

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    // Music Vault user IDs use UUID format.

    const validUserId =
        typeof userId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (!validUserId) {
        return res.status(400).json({
            success: false,
            message: "A valid userId is required.",
        });
    }

    // Create an opt-in performance recorder.
    const metrics = createPerformanceMetrics(
        "recommendation_generation"
    );

    try {
        // ------------------------------------------------
        // 1. Retrieve saved user preferences.
        // ------------------------------------------------

        metrics.incrementCount("databaseQueries");

        const preferenceRows = await metrics.measure(
            "preferenceQuery",
            () => getPreferencesByUser(userId)
        );

        metrics.setCount(
            "preferredSongRows",
            preferenceRows.length
        );

        // A user with no preferences has no recommendations.

        if (preferenceRows.length === 0) {
            metrics.setCount("candidateSongRows", 0);
            metrics.setCount("preparedCandidates", 0);
            metrics.setCount("recommendationsGenerated", 0);

            metrics.finish({
                outcome: "no_preferences",
                statusCode: 200,
            });

            return res.status(200).json({
                success: true,
                recommendations: [],
            });
        }

        // ------------------------------------------------
        // 2. Convert preference database rows.
        // ------------------------------------------------

        const preferredSongs = metrics.measureSync(
            "preferenceMapping",
            () => preferenceRows.map(mapPreferenceRowToSong)
        );

        // ------------------------------------------------
        // 3. Retrieve candidate songs from MySQL.
        // ------------------------------------------------

        metrics.incrementCount("databaseQueries");

        const songRows = await metrics.measure(
            "candidateQuery",
            () => getAllSongs()
        );

        metrics.setCount(
            "candidateSongRows",
            songRows.length
        );

        // ------------------------------------------------
        // 4. Normalize database candidate records.
        // ------------------------------------------------

        const normalizedCandidates = metrics.measureSync(
            "candidateNormalization",
            () => songRows.map(mapSongRow)
        );

        // Identify songs already selected by the user.

        const selectedSongIds = preferredSongs
            .map((song) => song.spotifyId)
            .filter(Boolean);

        // ------------------------------------------------
        // 5. Validate and prepare candidates.
        // ------------------------------------------------

        const candidateSongs = metrics.measureSync(
            "candidatePreparation",
            () => prepareCandidates(
                normalizedCandidates,
                selectedSongIds
            )
        );

        metrics.setCount(
            "preparedCandidates",
            candidateSongs.length
        );

        // ------------------------------------------------
        // 6. Generate ranked recommendations.
        // ------------------------------------------------

        const recommendations = metrics.measureSync(
            "recommendationRanking",
            () => generateRecommendations(
                preferredSongs,
                candidateSongs
            )
        );

        metrics.setCount(
            "recommendationsGenerated",
            recommendations.length
        );

        // Record successful completion.

        metrics.finish({
            outcome: "success",
            statusCode: 200,
        });

        return res.status(200).json({
            success: true,
            recommendations,
        });

    } catch (error) {
        // Record failure without including sensitive data.

        metrics.finish({
            outcome: "error",
            statusCode: 500,
        });

        console.error(
            "Failed to generate recommendations:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to generate recommendations.",
        });
    }
});

module.exports = router;
