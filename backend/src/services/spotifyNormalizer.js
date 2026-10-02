function normalizeTrack(track) {
    if (!track || typeof track !== "object") {
        return null;
    }

    const primaryArtist =
        Array.isArray(track.artists) && track.artists.length > 0
            ? track.artists[0]
            : null;

    const album = track.album || null;

    const albumImage =
        Array.isArray(album?.images) && album.images.length > 0
            ? album.images[0]
            : null;

    return {
        spotifyId: track.id || null,
        title: track.name || "Unknown Track",

        artistId: primaryArtist?.id || null,
        artistName: primaryArtist?.name || "Unknown Artist",

        albumId: album?.id || null,
        albumName: album?.name || null,
        albumImageUrl: albumImage?.url || null,

        durationMs:
            typeof track.duration_ms === "number"
                ? track.duration_ms
                : null,

        explicit:
            typeof track.explicit === "boolean"
                ? track.explicit
                : false,

        spotifyUrl:
            track.external_urls?.spotify || null,

        genres: [],
    };
}

module.exports = {
    normalizeTrack,
};