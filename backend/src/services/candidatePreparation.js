
const {
    deduplicateTracks,
} = require("../utils/deduplicateTracks");

/**
 * Validate and prepare normalized MusicVault tracks
 * for the recommendation algorithm.
 */
function prepareCandidates(tracks, selectedSongIds = []) {
    if (!Array.isArray(tracks)) {
        throw new Error(
            "Candidate tracks must be an array."
        );
    }

    if (!Array.isArray(selectedSongIds)) {
        throw new Error(
            "Selected song IDs must be an array."
        );
    }

    const selectedIds = new Set(selectedSongIds);

    const validTracks = tracks
        .filter((track) => {
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
        })
        .map((track) => ({
            ...track,

            genres: Array.isArray(track.genres)
                ? track.genres.filter(
                    (genre) =>
                        typeof genre === "string" &&
                        genre.trim() !== ""
                )
                : [],

            durationMs:
                typeof track.durationMs === "number" &&
                Number.isFinite(track.durationMs) &&
                track.durationMs >= 0
                    ? track.durationMs
                    : null,

            artistId:
                typeof track.artistId === "string"
                    ? track.artistId
                    : null,
        }));

    return deduplicateTracks(validTracks);
}

module.exports = {
    prepareCandidates,
};
