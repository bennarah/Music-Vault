
const { searchTracks } = require("./spotifyService");

const {
    prepareCandidates,
} = require("./candidatePreparation");

/**
 * Retrieve candidate songs from Spotify and prepare
 * them for the recommendation algorithm.
 *
 * @param {string} query - Spotify search query
 * @param {string[]} selectedSongIds - Songs already liked
 * @param {number} limit - Maximum Spotify search results
 * @returns {Promise<object[]>} Prepared candidate songs
 */
async function getCandidateSongs(
    query,
    selectedSongIds = [],
    limit = 20
) {
    if (typeof query !== "string" || !query.trim()) {
        throw new Error("A search query is required.");
    }

    const tracks = await searchTracks(query.trim(), limit);

    return prepareCandidates(tracks, selectedSongIds);
}

module.exports = {
    getCandidateSongs,
};
