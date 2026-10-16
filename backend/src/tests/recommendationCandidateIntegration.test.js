
jest.mock("../services/spotifyService", () => ({
    getTrackById: jest.fn(),
}));

jest.mock("../services/candidateSongService", () => ({
    getCandidateSongs: jest.fn(),
}));

const {
    getTrackById,
} = require("../services/spotifyService");

const {
    getCandidateSongs,
} = require("../services/candidateSongService");

const {
    generateFromPreferences,
} = require("../services/recommendationIntegrationService");

describe("Candidate-to-recommendation integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("passes retrieved candidates to the ranking algorithm", async () => {
        const preferredSong = {
            spotifyId: "preferred-001",
            title: "Preferred Song",
            artistId: "artist-001",
            artistName: "Test Artist",
            genres: ["rock"],
            durationMs: 200000,
        };

        const candidateSong = {
            spotifyId: "candidate-001",
            title: "Candidate Song",
            artistId: "artist-001",
            artistName: "Test Artist",
            genres: ["rock"],
            durationMs: 205000,
        };

        getTrackById.mockResolvedValue(preferredSong);
        getCandidateSongs.mockResolvedValue([
            candidateSong,
        ]);

        const result = await generateFromPreferences([
            {
                songId: "preferred-001",
                title: "Preferred Song",
                artist: "Test Artist",
            },
        ]);

        expect(getTrackById).toHaveBeenCalledWith(
            "preferred-001"
        );

        expect(getCandidateSongs).toHaveBeenCalledWith(
            "Test Artist",
            ["preferred-001"],
            20
        );

        expect(result).toHaveLength(1);

        expect(result[0].song.spotifyId).toBe(
            "candidate-001"
        );

        // Same artist: 40
        // One shared genre: 25
        // Similar duration: 10
        expect(result[0].score).toBe(75);
    });

    test("returns no recommendations when preferences are empty", async () => {
        const result = await generateFromPreferences([]);

        expect(result).toEqual([]);
        expect(getTrackById).not.toHaveBeenCalled();
        expect(getCandidateSongs).not.toHaveBeenCalled();
    });

    test("handles Spotify track retrieval failure", async () => {
        getTrackById.mockRejectedValue(
            new Error("Spotify API unavailable")
        );

        await expect(
            generateFromPreferences([
                { songId: "preferred-001" },
            ])
        ).rejects.toThrow("Spotify API unavailable");
    });

    test("returns no recommendations when no candidates exist", async () => {
        getTrackById.mockResolvedValue({
            spotifyId: "preferred-001",
            title: "Preferred Song",
            artistId: "artist-001",
            artistName: "Test Artist",
            genres: [],
            durationMs: 200000,
        });

        getCandidateSongs.mockResolvedValue([]);

        const result = await generateFromPreferences([
            { songId: "preferred-001" },
        ]);

        expect(result).toEqual([]);
    });
});
