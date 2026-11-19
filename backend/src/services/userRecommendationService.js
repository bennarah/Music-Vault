const {
    getPreferencesByUser,
    mapPreferenceRowToSong,
} = require("../models/preferenceModel");

const {
    getCandidateSongsForUser,
} = require("../models/songModel");

const {
    generateRecommendations,
} = require("./recommendationService");

const {
    prepareCandidates,
} = require("./candidatePreparation");

const {
    mapSongRowToSong,
} = require("../utils/songMapper");

/**
 * Generates recommendations using the existing
 * MySQL-backed recommendation pipeline.
 *
 * The metrics recorder is supplied by the caller
 * to preserve existing performance instrumentation.
 */
async function getRecommendationsForUser(userId, metrics) {
    metrics.incrementCount("databaseQueries", 2);

    const [preferenceRows, songRows] = await Promise.all([
        metrics.measure(
            "preferenceQuery",
            () => getPreferencesByUser(userId)
        ),
        metrics.measure(
            "candidateQuery",
            () => getCandidateSongsForUser(userId)
        ),
    ]);

    metrics.setCount("preferredSongRows", preferenceRows.length);
    metrics.setCount("candidateSongRows", songRows.length);

    if (preferenceRows.length === 0) {
        metrics.setCount("preparedCandidates", 0);
        metrics.setCount("recommendationsGenerated", 0);

        return {
            recommendations: [],
            outcome: "no_preferences",
        };
    }

    const preferredSongs = metrics.measureSync(
        "preferenceMapping",
        () => preferenceRows
            .map(mapPreferenceRowToSong)
            .filter(Boolean)
    );

    const normalizedCandidates = metrics.measureSync(
        "candidateNormalization",
        () => songRows
            .map(mapSongRowToSong)
            .filter(Boolean)
    );

    const selectedSongIds = preferredSongs
        .map((song) => song.spotifyId)
        .filter(Boolean);

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

    return {
        recommendations,
        outcome: "success",
    };
}

module.exports = {
    getRecommendationsForUser,
};
