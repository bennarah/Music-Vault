
jest.mock("../src/services/spotifyService", () => ({
    searchTracks: jest.fn(),
}));

jest.mock("../src/services/candidatePreparation", () => ({
    prepareCandidates: jest.fn(),
}));

const {
    searchTracks,
} = require("../src/services/spotifyService");

const {
    prepareCandidates,
} = require("../src/services/candidatePreparation");

const {
    getCandidateSongs,
} = require("../src/services/candidateSongService");

describe("Candidate song service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("retrieves Spotify tracks and prepares candidates", async () => {
        const spotifyTracks = [
            {
                spotifyId: "track-001",
                title: "Example Song",
                artistName: "Example Artist",
            },
        ];

        const preparedTracks = [
            {
                spotifyId: "track-001",
                title: "Example Song",
                artistName: "Example Artist",
                genres: [],
                durationMs: null,
            },
        ];

        searchTracks.mockResolvedValue(spotifyTracks);
        prepareCandidates.mockReturnValue(preparedTracks);

        const result = await getCandidateSongs("Imagine");

        expect(searchTracks).toHaveBeenCalledWith(
            "Imagine",
            20
        );

        expect(prepareCandidates).toHaveBeenCalledWith(
            spotifyTracks,
            []
        );

        expect(result).toEqual(preparedTracks);
    });

    test("trims whitespace from the search query", async () => {
        searchTracks.mockResolvedValue([]);
        prepareCandidates.mockReturnValue([]);

        await getCandidateSongs("  Imagine  ");

        expect(searchTracks).toHaveBeenCalledWith(
            "Imagine",
            20
        );
    });

    test("uses a custom search result limit", async () => {
        searchTracks.mockResolvedValue([]);
        prepareCandidates.mockReturnValue([]);

        await getCandidateSongs(
            "Imagine",
            [],
            10
        );

        expect(searchTracks).toHaveBeenCalledWith(
            "Imagine",
            10
        );
    });

    test("passes selected song IDs to candidate preparation", async () => {
        const selectedIds = [
            "already-liked-001",
            "already-liked-002",
        ];

        searchTracks.mockResolvedValue([]);
        prepareCandidates.mockReturnValue([]);

        await getCandidateSongs(
            "Imagine",
            selectedIds
        );

        expect(prepareCandidates).toHaveBeenCalledWith(
            [],
            selectedIds
        );
    });

    test("rejects an empty search query", async () => {
        await expect(
            getCandidateSongs("")
        ).rejects.toThrow(
            "A search query is required."
        );

        expect(searchTracks).not.toHaveBeenCalled();
        expect(prepareCandidates).not.toHaveBeenCalled();
    });

    test("rejects a whitespace-only search query", async () => {
        await expect(
            getCandidateSongs("   ")
        ).rejects.toThrow(
            "A search query is required."
        );

        expect(searchTracks).not.toHaveBeenCalled();
    });

    test("propagates Spotify retrieval failures", async () => {
        searchTracks.mockRejectedValue(
            new Error("Spotify API unavailable")
        );

        await expect(
            getCandidateSongs("Imagine")
        ).rejects.toThrow(
            "Spotify API unavailable"
        );

        expect(prepareCandidates).not.toHaveBeenCalled();
    });

    test("propagates candidate preparation failures", async () => {
        searchTracks.mockResolvedValue([
            { spotifyId: "track-001" },
        ]);

        prepareCandidates.mockImplementation(() => {
            throw new Error("Invalid candidate data");
        });

        await expect(
            getCandidateSongs("Imagine")
        ).rejects.toThrow(
            "Invalid candidate data"
        );
    });
});
