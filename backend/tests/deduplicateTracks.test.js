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