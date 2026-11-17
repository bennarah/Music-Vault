
/**
 * Validate and prepare normalized MusicVault tracks
 * for the recommendation algorithm.
 *
 * Uses a single iteration to:
 * - Reject invalid tracks.
 * - Exclude already-selected songs.
 * - Normalize candidate metadata.
 * - Remove duplicate Spotify IDs.
 *
 * This avoids creating intermediate filtered and mapped arrays.
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
    const seenIds = new Set();

    const preparedCandidates = [];

    for (const track of tracks) {
        // Reject invalid records and missing Spotify IDs.
        if (
            !track ||
            typeof track.spotifyId !== "string" ||
            !track.spotifyId.trim() ||
            typeof track.title !== "string" ||
            !track.title.trim() ||
            typeof track.artistName !== "string" ||
            !track.artistName.trim()
        ) {
            continue;
        }

        const spotifyId = track.spotifyId;

        // Exclude songs already selected by the user.
        if (selectedIds.has(spotifyId)) {
            continue;
        }

        // Remove duplicate Spotify IDs.
        if (seenIds.has(spotifyId)) {
            continue;
        }

        seenIds.add(spotifyId);

        // Normalize metadata while creating one new object.
        const preparedTrack = {
            ...track,

            genres: Array.isArray(track.genres)
                ? track.genres.filter(
                    genre =>
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
        };

        preparedCandidates.push(preparedTrack);
    }

    return preparedCandidates;
}

module.exports = {
    prepareCandidates,
};
