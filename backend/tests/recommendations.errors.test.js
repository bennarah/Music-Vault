
const request = require("supertest");

jest.mock("../src/models/preferenceModel", () => ({
    getPreferencesByUser: jest.fn(),
    mapPreferenceRowToSong: jest.fn(),
}));

jest.mock("../src/models/songModel", () => ({
    getCandidateSongsForUser: jest.fn(),
}));

const {
    getPreferencesByUser,
} = require("../src/models/preferenceModel");

const {
    getCandidateSongsForUser,
} = require("../src/models/songModel");

const app = require("../src/app");

describe("Recommendation API - Error Handling", () => {
    const userId = "123e4567-e89b-42d3-a456-426614174000";

    beforeEach(() => {
        jest.clearAllMocks();

        // Candidate retrieval succeeds independently.
        getCandidateSongsForUser.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("returns HTTP 500 when preference retrieval fails", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        getPreferencesByUser.mockRejectedValue(
            new Error("Simulated database failure")
        );

        const response = await request(app)
            .get(`/api/recommendations/${userId}`)
            .expect(500);

        expect(getPreferencesByUser).toHaveBeenCalledWith(userId);

        expect(getCandidateSongsForUser).toHaveBeenCalledWith(userId);

        expect(response.body).toEqual({
            success: false,
            message: "Unable to generate recommendations.",
        });
    });

    test("returns HTTP 500 when candidate retrieval fails", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        getPreferencesByUser.mockResolvedValue([
            {
                spotify_id: "preferred-001",
                title: "Preferred Song",
                artist_id: "artist-001",
                artist_name: "Test Artist",
                genres: [],
                duration_ms: 200000,
                explicit: false,
            },
        ]);

        getCandidateSongsForUser.mockRejectedValue(
            new Error("Simulated candidate database failure")
        );

        const response = await request(app)
            .get(`/api/recommendations/${userId}`)
            .expect(500);

        expect(response.body).toEqual({
            success: false,
            message: "Unable to generate recommendations.",
        });
    });
});
