const {
    deduplicateTracks,
} = require("../utils/deduplicateTracks");

function prepareCandidates(tracks, selectedSongIds = []) {
    if (!Array.isArray(tracks)) {
        throw new Error("Candidate tracks must be an array.");
    }

    const selectedIds = new Set(selectedSongIds);

    const valid = tracks.filter((track) => {
        return (
            track &&
            typeof track.spotifyId === "string" &&
            track.spotifyId.trim() !== "" &&
            typeof track.title === "string" &&
            track.title.trim() !== "" &&
            typeof track.artistName === "string" &&
            track.artistName.trim() !== "" &&
            !selectedIds.has(track.spotifyId)
        );
    });

    return deduplicateTracks(valid);
}

module.exports = {
    prepareCandidates,
};