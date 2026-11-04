
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

        expect(normalizeTrack(rawTrack)).toEqual({
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
        const result = normalizeTrack({
            id: "missing-data-track",
        });

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

    test("returns null for malformed primitive input", () => {
        expect(normalizeTrack(null)).toBeNull();
        expect(normalizeTrack(undefined)).toBeNull();
        expect(normalizeTrack("invalid")).toBeNull();
        expect(normalizeTrack(123)).toBeNull();
    });

    test("handles missing artist information", () => {
        const result = normalizeTrack({
            id: "track-001",
            name: "Song Without Artist",
            artists: [],
        });

        expect(result.artistId).toBeNull();
        expect(result.artistName).toBe("Unknown Artist");
    });

    test("uses the primary artist when multiple artists exist", () => {
        const result = normalizeTrack({
            id: "track-002",
            name: "Collaboration",
            artists: [
                {
                    id: "artist-001",
                    name: "Primary Artist",
                },
                {
                    id: "artist-002",
                    name: "Secondary Artist",
                },
            ],
        });

        expect(result.artistId).toBe("artist-001");
        expect(result.artistName).toBe("Primary Artist");
    });

    test("handles missing album artwork", () => {
        const result = normalizeTrack({
            id: "track-003",
            name: "Song",
            album: {
                id: "album-001",
                name: "Album",
                images: [],
            },
        });

        expect(result.albumId).toBe("album-001");
        expect(result.albumName).toBe("Album");
        expect(result.albumImageUrl).toBeNull();
    });

    test("handles incorrect optional metadata types", () => {
        const result = normalizeTrack({
            id: "track-004",
            name: "Song",
            duration_ms: "not-a-number",
            explicit: "false",
        });

        expect(result.durationMs).toBeNull();
        expect(result.explicit).toBe(false);
    });

    test("does not invent Spotify genres", () => {
        const result = normalizeTrack({
            id: "track-005",
            name: "Song",
        });

        expect(result.genres).toEqual([]);
    });

    test.todo(
        "Rejects arrays and other non-track object inputs"
    );
});
