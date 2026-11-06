const {
    deduplicateTracks,
} = require("../src/utils/deduplicateTracks");

describe("Spotify track deduplication", () => {

    test("removes tracks with duplicate Spotify IDs", () => {
        const tracks = [
            {
                spotifyId: "123",
                title: "Song One",
            },
            {
                spotifyId: "123",
                title: "Song One Duplicate",
            },
            {
                spotifyId: "456",
                title: "Song Two",
            },
        ];

        const result = deduplicateTracks(tracks);

        expect(result).toHaveLength(2);

        expect(result.map(track => track.spotifyId))
            .toEqual(["123", "456"]);
    });

});


describe("Track deduplication", () => {
    test("removes duplicate Spotify IDs", () => {
        const tracks = [
            { spotifyId: "track-001", title: "Song A" },
            { spotifyId: "track-002", title: "Song B" },
            { spotifyId: "track-001", title: "Song A Duplicate" },
        ];

        const result = deduplicateTracks(tracks);

        expect(result).toHaveLength(2);

        expect(
            result.map((track) => track.spotifyId)
        ).toEqual(["track-001", "track-002"]);
    });

    test("preserves unique tracks", () => {
        const tracks = [
            { spotifyId: "track-001" },
            { spotifyId: "track-002" },
            { spotifyId: "track-003" },
        ];

        expect(deduplicateTracks(tracks)).toEqual(tracks);
    });

    test("preserves records without Spotify IDs", () => {
        // The utility deduplicates by ID; candidatePreparation
        // is responsible for rejecting invalid candidate records.

        const tracks = [
            { title: "Song without ID" },
            { spotifyId: "track-001", title: "Valid Song" },
        ];

        expect(deduplicateTracks(tracks)).toEqual(tracks);
    });

    test("preserves null and undefined entries", () => {
        const tracks = [
            null,
            undefined,
            { spotifyId: "track-001" },
        ];

        expect(deduplicateTracks(tracks)).toEqual(tracks);
    });

    test("handles an empty array", () => {
        expect(deduplicateTracks([])).toEqual([]);
    });

    test("does not modify the original array", () => {
        const tracks = [
            { spotifyId: "track-001" },
            { spotifyId: "track-001" },
            { spotifyId: "track-002" },
        ];

        const original = [...tracks];

        deduplicateTracks(tracks);

        expect(tracks).toEqual(original);
        expect(tracks).toHaveLength(3);
    });

    test("keeps the first occurrence of a duplicate", () => {
        const firstTrack = {
            spotifyId: "track-001",
            title: "Original Song",
        };

        const duplicateTrack = {
            spotifyId: "track-001",
            title: "Different Song Name",
        };

        const result = deduplicateTracks([
            firstTrack,
            duplicateTrack,
        ]);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe(firstTrack);
    });
});
