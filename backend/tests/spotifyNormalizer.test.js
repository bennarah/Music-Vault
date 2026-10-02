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

    test("handles missing Spotify metadata safely", () => {
        const rawTrack = {
            id: "missing-data-track",
        };

        const result = normalizeTrack(rawTrack);

        expect(result).toEqual({
            spotifyId: "missing-data-track",
            title: "Unknown Track",

            artistId: null,
            artistName: "Unknown Artist",

            albumId: null,
            albumName: null,
            albumImageUrl: null,

            durationMs: null,
            explicit: false,

            spotifyUrl: null,

            genres: [],
        });
    });
    
    test("returns null for malformed input", () => {
        expect(normalizeTrack(null)).toBeNull();
        expect(normalizeTrack(undefined)).toBeNull();
        expect(normalizeTrack("invalid")).toBeNull();
    });
});