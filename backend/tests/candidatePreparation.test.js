const {
    prepareCandidates,
} = require("../src/services/candidatePreparation");

const {
    candidateSongs,
} = require("./fixtures/candidateSongs");

describe("Candidate preparation", () => {

    test("removes duplicate Spotify IDs", () => {
        const result = prepareCandidates(candidateSongs);

        expect(result).toHaveLength(2);
    });

    test("removes already-selected songs", () => {
        const result = prepareCandidates(
            candidateSongs,
            ["song-001"]
        );

        expect(result).toHaveLength(1);
        expect(result[0].spotifyId).toBe("song-002");
    });

    test("handles an empty candidate list", () => {
        expect(prepareCandidates([])).toEqual([]);
    });

    test("rejects malformed candidate input", () => {
        expect(() => prepareCandidates(null)).toThrow(
            "Candidate tracks must be an array."
        );
    });

});


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
            {
                ...validTrack,
                title: "Duplicate Song",
            },
            {
                ...validTrack,
                spotifyId: "track-002",
                title: "Different Song",
            },
        ];

        const result = prepareCandidates(tracks);

        expect(result).toHaveLength(2);

        expect(
            result.map((track) => track.spotifyId)
        ).toEqual(["track-001", "track-002"]);
    });

    test("removes already-selected songs", () => {
        const tracks = [
            validTrack,
            {
                ...validTrack,
                spotifyId: "track-002",
            },
        ];

        const result = prepareCandidates(
            tracks,
            ["track-001"]
        );

        expect(result).toHaveLength(1);
        expect(result[0].spotifyId).toBe("track-002");
    });

    test("filters records with missing Spotify IDs", () => {
        const tracks = [
            validTrack,
            {
                title: "Missing ID",
                artistName: "Example Artist",
            },
        ];

        const result = prepareCandidates(tracks);

        expect(result).toHaveLength(1);
        expect(result[0].spotifyId).toBe("track-001");
    });

    test("filters records with missing titles", () => {
        const tracks = [
            validTrack,
            {
                ...validTrack,
                spotifyId: "track-002",
                title: "",
            },
        ];

        expect(prepareCandidates(tracks)).toHaveLength(1);
    });

    test("filters records with missing artist names", () => {
        const tracks = [
            validTrack,
            {
                ...validTrack,
                spotifyId: "track-002",
                artistName: null,
            },
        ];

        expect(prepareCandidates(tracks)).toHaveLength(1);
    });

    test("normalizes missing optional metadata", () => {
        const tracks = [
            {
                spotifyId: "track-003",
                title: "Incomplete Song",
                artistName: "Example Artist",
                genres: null,
                durationMs: "invalid",
                artistId: 123,
            },
        ];

        const result = prepareCandidates(tracks);

        expect(result[0].genres).toEqual([]);
        expect(result[0].durationMs).toBeNull();
        expect(result[0].artistId).toBeNull();
    });

    test("filters invalid genre entries", () => {
        const tracks = [
            {
                ...validTrack,
                genres: [
                    "rock",
                    "",
                    " ",
                    null,
                    123,
                    "alternative",
                ],
            },
        ];

        const result = prepareCandidates(tracks);

        expect(result[0].genres).toEqual([
            "rock",
            "alternative",
        ]);
    });

    test("converts negative and non-finite durations to null", () => {
        const tracks = [
            {
                ...validTrack,
                durationMs: -100,
            },
            {
                ...validTrack,
                spotifyId: "track-002",
                durationMs: Infinity,
            },
        ];

        const result = prepareCandidates(tracks);

        expect(result[0].durationMs).toBeNull();
        expect(result[1].durationMs).toBeNull();
    });

    test("handles an empty candidate list", () => {
        expect(prepareCandidates([])).toEqual([]);
    });

    test("rejects malformed candidate input", () => {
        expect(() => prepareCandidates(null)).toThrow(
            "Candidate tracks must be an array."
        );
    });

    test("rejects malformed selected song IDs", () => {
        expect(() =>
            prepareCandidates([validTrack], "track-001")
        ).toThrow(
            "Selected song IDs must be an array."
        );
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