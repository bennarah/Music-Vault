
const express = require("express");

const {
    getPreferencesByUser,
    mapPreferenceRowToSong,
} = require("../models/preferenceModel");

const {
    getCandidateSongsForUser,
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

const {
    mapSongRowToSong,
} = require("../utils/songMapper");

const router = express.Router();


// GET /api/recommendations/:userId
// Generates ranked recommendations from saved user preferences.

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    // Validate MusicVault user ID format.

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
        // 1. Retrieve preferences and candidates concurrently.
        //
        // Both queries depend only on userId and can run
        // independently using the MySQL connection pool.
        // ------------------------------------------------

        metrics.incrementCount("databaseQueries", 2);

        const [
            preferenceRows,
            songRows,
        ] = await Promise.all([
            metrics.measure(
                "preferenceQuery",
                () => getPreferencesByUser(userId)
            ),

            metrics.measure(
                "candidateQuery",
                () => getCandidateSongsForUser(userId)
            ),
        ]);

        metrics.setCount(
            "preferredSongRows",
            preferenceRows.length
        );

        metrics.setCount(
            "candidateSongRows",
            songRows.length
        );

        // A user with no preferences has no recommendations.

        if (preferenceRows.length === 0) {
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
        // Uses the shared song mapper.
        // ------------------------------------------------

        const preferredSongs = metrics.measureSync(
            "preferenceMapping",
            () => preferenceRows
                .map(mapPreferenceRowToSong)
                .filter(Boolean)
        );

        // ------------------------------------------------
        // 3. Normalize candidate database records.
        // Uses the same shared song mapper.
        // ------------------------------------------------

        const normalizedCandidates = metrics.measureSync(
            "candidateNormalization",
            () => songRows
                .map(mapSongRowToSong)
                .filter(Boolean)
        );

        // Retain defensive exclusion in candidate preparation.

        const selectedSongIds = preferredSongs
            .map(song => song.spotifyId)
            .filter(Boolean);

        // ------------------------------------------------
        // 4. Validate and prepare candidates.
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
        // 5. Generate ranked recommendations.
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
        // Record failure without exposing sensitive information.

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
