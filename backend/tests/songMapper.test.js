
const {
    normalizeGenres,
    mapSongRowToSong,
} = require("../src/utils/songMapper");

describe("MusicVault shared song mapper", () => {
    const databaseSong = {
        spotify_id: "track-001",
        title: "Example Song",
        artist_id: "artist-001",
        artist_name: "Example Artist",
        genres: ["rock", "indie"],
        album_id: "album-001",
        album_name: "Example Album",
        album_image_url: "https://example.com/album.jpg",
        duration_ms: 200000,
        explicit: 0,
        spotify_url: "https://open.spotify.com/track/track-001",
    };

    test("maps a complete database song row", () => {
        expect(mapSongRowToSong(databaseSong)).toEqual({
            spotifyId: "track-001",
            title: "Example Song",
            artistId: "artist-001",
            artistName: "Example Artist",
            genres: ["rock", "indie"],
            albumId: "album-001",
            albumName: "Example Album",
            albumImageUrl: "https://example.com/album.jpg",
            durationMs: 200000,
            explicit: false,
            spotifyUrl: "https://open.spotify.com/track/track-001",
        });
    });

    test("parses genres supplied as a JSON string", () => {
        const result = mapSongRowToSong({
            ...databaseSong,
            genres: '["rock","alternative"]',
        });

        expect(result.genres).toEqual([
            "rock",
            "alternative",
        ]);
    });

    test("handles malformed JSON genre data", () => {
        expect(normalizeGenres("{invalid json")).toEqual([]);
    });

    test("handles missing or non-array genres", () => {
        expect(normalizeGenres(null)).toEqual([]);
        expect(normalizeGenres(undefined)).toEqual([]);
        expect(normalizeGenres(123)).toEqual([]);
    });

    test("preserves valid genre arrays", () => {
        const genres = ["rock", "indie"];

        expect(normalizeGenres(genres)).toBe(genres);
    });

    test("preserves null optional metadata", () => {
        const result = mapSongRowToSong({
            spotify_id: "track-002",
            title: "Incomplete Song",
            artist_id: null,
            artist_name: "Example Artist",
            genres: null,
            album_id: null,
            album_name: null,
            album_image_url: null,
            duration_ms: null,
            explicit: 0,
            spotify_url: null,
        });

        expect(result).toEqual({
            spotifyId: "track-002",
            title: "Incomplete Song",
            artistId: null,
            artistName: "Example Artist",
            genres: [],
            albumId: null,
            albumName: null,
            albumImageUrl: null,
            durationMs: null,
            explicit: false,
            spotifyUrl: null,
        });
    });

    test("converts MySQL explicit values into booleans", () => {
        expect(
            mapSongRowToSong({
                ...databaseSong,
                explicit: 1,
            }).explicit
        ).toBe(true);

        expect(
            mapSongRowToSong({
                ...databaseSong,
                explicit: 0,
            }).explicit
        ).toBe(false);
    });

    test("returns null for malformed database rows", () => {
        expect(mapSongRowToSong(null)).toBeNull();
        expect(mapSongRowToSong(undefined)).toBeNull();
        expect(mapSongRowToSong([])).toBeNull();
    });
});
