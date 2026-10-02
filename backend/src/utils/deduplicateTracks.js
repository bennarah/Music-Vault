function deduplicateTracks(tracks) {
    const seen = new Set();

    return tracks.filter((track) => {
        if (!track?.spotifyId) {
            return true;
        }

        if (seen.has(track.spotifyId)) {
            return false;
        }

        seen.add(track.spotifyId);

        return true;
    });
}

module.exports = {
    deduplicateTracks,
};