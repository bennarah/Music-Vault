const {
    normalizeTrack,
} = require("../src/services/spotifyNormalizer");

describe("Spotify track normalization", () => {

    test("normalizes a complete Spotify track", () => {
        const rawTrack = {
            id: "abc123",
            name: "Test Song",
            duration_ms: 215000,
            explicit: false,

            artists: [
                {
                    id: "artist123",
                    name: "Test Artist",
                },
            ],

            album: {
                id: "album123",
                name: "Test Album",
                images: [
                    {
                        url: "https://example.com/album.jpg",
                    },
                ],
            },

            external_urls: {
                spotify:
                    "https://open.spotify.com/track/abc123",
            },
        };

        const result = normalizeTrack(rawTrack);

        expect(result).toEqual({
            spotifyId: "abc123",
            title: "Test Song",

            artistId: "artist123",
            artistName: "Test Artist",

            albumId: "album123",
            albumName: "Test Album",
            albumImageUrl:
                "https://example.com/album.jpg",

            durationMs: 215000,
            explicit: false,

            spotifyUrl:
                "https://open.spotify.com/track/abc123",

            genres: [],
        });
    });

});