
const {
    getTrackById,
} = require("./spotifyService");

const {
    getCandidateSongs,
} = require("./candidateSongService");

const {
    generateRecommendations,
} = require("./recommendationService");

/**
 * Generate recommendations from a list of
 * saved user preferences.
 *
 * Each preference must contain a Spotify song ID.
 */
async function generateFromPreferences(preferences) {
    if (!Array.isArray(preferences)) {
        throw new Error(
            "Preferences must be an array."
        );
    }

    if (preferences.length === 0) {
        return [];
    }

    // Retrieve complete metadata for preferred songs.
    const preferredSongs = await Promise.all(
        preferences.map((preference) =>
            getTrackById(preference.songId)
        )
    );

    const validPreferredSongs = preferredSongs.filter(
        (song) => song && song.spotifyId
    );

    if (validPreferredSongs.length === 0) {
        return [];
    }

    // Use the first preferred artist to discover candidates.
    const artistName =
        validPreferredSongs[0].artistName;

    const selectedIds = validPreferredSongs.map(
        (song) => song.spotifyId
    );

    const candidates = await getCandidateSongs(
        artistName,
        selectedIds,
        20
    );

    // Adam's algorithm ranks the prepared candidates.
    return generateRecommendations(
        validPreferredSongs,
        candidates
    );
}

module.exports = {
    generateFromPreferences,
};
