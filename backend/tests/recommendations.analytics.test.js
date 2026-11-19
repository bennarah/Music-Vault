const request = require("supertest");

jest.mock("../src/services/userRecommendationService", () => ({
  getRecommendationsForUser: jest.fn(),
}));

const {
  getRecommendationsForUser,
} = require("../src/services/userRecommendationService");

const app = require("../src/app");

describe("SCRUM-131 - Recommendation Analytics Endpoint", () => {
  const userId = "123e4567-e89b-42d3-a456-426614174000";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns aggregated recommendation statistics", async () => {
    getRecommendationsForUser.mockResolvedValue({
      recommendations: [
        {
          song: {
            artistId: "artist001",
            artistName: "Example Artist",
            genres: ["rock", "indie"],
            albumName: "Example Album",
            durationMs: 200000,
            explicit: false,
          },
          score: 80,
        },
        {
          song: {
            artistId: "artist001",
            artistName: "Example Artist",
            genres: ["rock"],
            albumName: "Example Album",
            durationMs: 220000,
            explicit: true,
          },
          score: 90,
        },
      ],
      outcome: "success",
    });

    const response = await request(app)
      .get(`/api/recommendations/${userId}/analytics`)
      .expect(200);

    expect(response.body.success).toBe(true);

    expect(response.body.summary).toEqual({
      totalRecommendations: 2,
      uniqueArtists: 1,
      uniqueGenres: 2,
    });

    expect(response.body.artistFrequency[0].count).toBe(2);
    expect(response.body.genreDistribution.genres[0].genre).toBe("rock");
    expect(response.body.scoreStatistics.averageScore).toBe(85);

    expect(getRecommendationsForUser).toHaveBeenCalledWith(
      userId,
      expect.any(Object)
    );
  });

  test("returns empty analytics for users without preferences", async () => {
    getRecommendationsForUser.mockResolvedValue({
      recommendations: [],
      outcome: "no_preferences",
    });

    const response = await request(app)
      .get(`/api/recommendations/${userId}/analytics`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.summary.totalRecommendations).toBe(0);
    expect(response.body.artistFrequency).toEqual([]);
    expect(response.body.genreDistribution.genres).toEqual([]);
    expect(response.body.scoreStatistics.averageScore).toBeNull();
  });

  test("rejects invalid user IDs", async () => {
    const response = await request(app)
      .get("/api/recommendations/invalid-user/analytics")
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: "A valid userId is required.",
    });

    expect(getRecommendationsForUser).not.toHaveBeenCalled();
  });

  test("returns safe errors when recommendation retrieval fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    getRecommendationsForUser.mockRejectedValue(
      new Error("Simulated database failure")
    );

    const response = await request(app)
      .get(`/api/recommendations/${userId}/analytics`)
      .expect(500);

    expect(response.body).toEqual({
      success: false,
      message: "Unable to generate recommendation analytics.",
    });

    expect(response.text).not.toContain(
      "Simulated database failure"
    );
  });
});
