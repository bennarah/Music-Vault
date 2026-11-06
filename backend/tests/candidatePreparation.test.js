
const {
    prepareCandidates,
} = require("../src/services/candidatePreparation");

describe("Candidate preparation", () => {
    const validTrack = {
        spotifyId: "track-001",
        title: "Example Song",
        artistId: "artist-001",
        artistName: "Example Artist",
        albumId: "album-001",
        albumName: "Example Album",
        albumImageUrl: null,
        durationMs: 200000,
        explicit: false,
        spotifyUrl: null,
        genres: ["rock"],
    };

    test("removes duplicate Spotify IDs", () => {
        const tracks = [
            validTrack,
            { ...validTrack, title: "Duplicate Song" },
            { ...validTrack, spotifyId: "track-002" },
        ];

        const result = prepareCandidates(tracks);

        expect(result).toHaveLength(2);
        expect(result.map(track => track.spotifyId))
            .toEqual(["track-001", "track-002"]);
    });

    test("removes already-selected songs", () => {
        const result = prepareCandidates(
            [
                validTrack,
                { ...validTrack, spotifyId: "track-002" },
            ],
            ["track-001"]
        );

        expect(result).toHaveLength(1);
        expect(result[0].spotifyId).toBe("track-002");
    });

    test("filters records with missing Spotify IDs", () => {
        const result = prepareCandidates([
            validTrack,
            { title: "Missing ID", artistName: "Artist" },
        ]);

        expect(result).toHaveLength(1);
    });

    test("filters records with missing titles", () => {
        const result = prepareCandidates([
            validTrack,
            { ...validTrack, spotifyId: "track-002", title: "" },
        ]);

        expect(result).toHaveLength(1);
    });

    test("filters records with missing artist names", () => {
        const result = prepareCandidates([
            validTrack,
            { ...validTrack, spotifyId: "track-002", artistName: null },
        ]);

        expect(result).toHaveLength(1);
    });

    test("normalizes missing optional metadata", () => {
        const result = prepareCandidates([{
            spotifyId: "track-003",
            title: "Incomplete Song",
            artistName: "Example Artist",
            genres: null,
            durationMs: "invalid",
            artistId: 123,
        }]);

        expect(result[0].genres).toEqual([]);
        expect(result[0].durationMs).toBeNull();
        expect(result[0].artistId).toBeNull();
    });

    test("filters invalid genre entries", () => {
        const result = prepareCandidates([{
            ...validTrack,
            genres: ["rock", "", " ", null, 123, "alternative"],
        }]);

        expect(result[0].genres).toEqual([
            "rock",
            "alternative",
        ]);
    });

    test("converts negative and non-finite durations to null", () => {
        const result = prepareCandidates([
            { ...validTrack, durationMs: -100 },
            { ...validTrack, spotifyId: "track-002", durationMs: Infinity },
        ]);

        expect(result[0].durationMs).toBeNull();
        expect(result[1].durationMs).toBeNull();
    });

    test("handles an empty candidate list", () => {
        expect(prepareCandidates([])).toEqual([]);
    });

    test("rejects malformed candidate input", () => {
        expect(() => prepareCandidates(null))
            .toThrow("Candidate tracks must be an array.");
    });

    test("rejects malformed selected song IDs", () => {
        expect(() => prepareCandidates([validTrack], "track-001"))
            .toThrow("Selected song IDs must be an array.");
    });

    test("does not modify original candidate objects", () => {
        const original = {
            ...validTrack,
            durationMs: "invalid",
            genres: null,
        };

        const originalCopy = { ...original };

        prepareCandidates([original]);

        expect(original).toEqual(originalCopy);
    });

    test("preserves valid album and Spotify metadata", () => {
        const result = prepareCandidates([validTrack]);

        expect(result[0]).toEqual(
            expect.objectContaining({
                albumId: "album-001",
                albumName: "Example Album",
                durationMs: 200000,
                explicit: false,
            })
        );
    });
});
