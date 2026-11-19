const request = require("supertest");

jest.mock("../src/services/userRecommendationService", () => ({
    getRecommendationsForUser: jest.fn(),
}));

const {
    getRecommendationsForUser,
} = require("../src/services/userRecommendationService");

const app = require("../src/app");

describe("SCRUM-116 - Recommendation CSV Export Endpoint", () => {
    const userId = "123e4567-e89b-42d3-a456-426614174000";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("returns downloadable CSV with correct headers and data", async () => {
        getRecommendationsForUser.mockResolvedValue({
            recommendations: [
                {
                    song: {
                        spotifyId: "track001",
                        title: "Midnight Drive",
                        artistName: "The Echo Lines",
                        genres: ["indie rock"],
                        albumName: "Night Lights",
                        durationMs: 210000,
                        spotifyUrl: "https://example.com/track001",
                    },
                    score: 95,
                },
            ],
            outcome: "success",
        });

        const response = await request(app)
            .get(`/api/recommendations/${userId}/export`)
            .expect(200);

        expect(response.headers["content-type"])
            .toMatch(/^text\/csv/);

        expect(response.headers["content-disposition"])
            .toContain("attachment;");

        expect(response.headers["content-disposition"])
            .toContain("musicvault-recommendations.csv");

        expect(response.text).toContain(
            "title,artist,genre,album,duration_ms,similarity_score,spotify_id,spotify_url"
        );

        expect(response.text).toContain(
            "Midnight Drive,The Echo Lines,indie rock,Night Lights,210000,95,track001,https://example.com/track001"
        );

        expect(getRecommendationsForUser).toHaveBeenCalledWith(
            userId,
            expect.any(Object)
        );
    });

    test("returns header-only CSV for empty recommendations", async () => {
        getRecommendationsForUser.mockResolvedValue({
            recommendations: [],
            outcome: "no_preferences",
        });

        const response = await request(app)
            .get(`/api/recommendations/${userId}/export`)
            .expect(200);

        expect(response.text).toBe(
            "title,artist,genre,album,duration_ms,similarity_score,spotify_id,spotify_url\r\n"
        );
    });

    test("rejects invalid user IDs with HTTP 400", async () => {
        const response = await request(app)
            .get("/api/recommendations/invalid-user/export")
            .expect(400);

        expect(response.body).toEqual({
            success: false,
            message: "A valid userId is required.",
        });

        expect(getRecommendationsForUser).not.toHaveBeenCalled();
    });

    test("returns a safe error when recommendation generation fails", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        getRecommendationsForUser.mockRejectedValue(
            new Error("Simulated database failure")
        );

        const response = await request(app)
            .get(`/api/recommendations/${userId}/export`)
            .expect(500);

        expect(response.body).toEqual({
            success: false,
            message: "Unable to export recommendations.",
        });

        expect(response.text).not.toContain(
            "Simulated database failure"
        );
    });
});
