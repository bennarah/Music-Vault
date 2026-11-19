const express = require("express");

const {
    getRecommendationsForUser,
} = require("../services/userRecommendationService");

const {
    createPerformanceMetrics,
} = require("../utils/performanceMetrics");

const {
    generateRecommendationCsv,
} = require("../services/recommendationCsvService");

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
        const {
            recommendations,
            outcome,
        } = await getRecommendationsForUser(userId, metrics);

        metrics.finish({
            outcome,
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

// GET /api/recommendations/:userId/export
// Downloads ranked recommendations in CSV format.

router.get("/:userId/export", async (req, res) => {
    const { userId } = req.params;

    const validUserId =
        typeof userId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (!validUserId) {
        return res.status(400).json({
            success: false,
            message: "A valid userId is required.",
        });
    }

    const metrics = createPerformanceMetrics(
        "recommendation_csv_export"
    );

    try {
        const { recommendations, outcome } =
            await getRecommendationsForUser(userId, metrics);

        const csv = generateRecommendationCsv(recommendations);

        metrics.finish({
            outcome,
            statusCode: 200,
        });

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="musicvault-recommendations.csv"'
        );

        return res.status(200).send(csv);
    } catch (error) {
        metrics.finish({
            outcome: "error",
            statusCode: 500,
        });

        console.error(
            "Failed to export recommendations:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to export recommendations.",
        });
    }
});

module.exports = router;
