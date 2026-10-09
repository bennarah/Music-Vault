const {
    searchTracks,
} = require("./spotifyService");

const {
    deduplicateTracks,
} = require("../utils/deduplicateTracks");

const { searchTracks } = require("./spotifyService");
const { prepareCandidates } = require("./candidatePreparation");

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

module.exports = { getCandidateSongs };

module.exports = {
    getCandidateSongs,
};