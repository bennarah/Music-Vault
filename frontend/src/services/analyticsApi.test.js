import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRecommendationAnalytics } from "./analyticsApi";

describe("SCRUM-131 - Frontend Analytics API Integration", () => {
  const userId = "123e4567-e89b-42d3-a456-426614174000";

  const validAnalytics = {
    success: true,
    summary: {
      totalRecommendations: 2,
      uniqueArtists: 1,
      uniqueGenres: 1,
    },
    artistFrequency: [
      {
        artistId: "artist001",
        artistName: "Example Artist",
        count: 2,
        percentage: 100,
      },
    ],
    genreDistribution: {
      songsWithGenres: 2,
      songsWithoutGenres: 0,
      genres: [
        { genre: "rock", count: 2, percentage: 100 },
      ],
    },
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retrieves recommendation analytics successfully", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => validAnalytics,
    });

    const result = await getRecommendationAnalytics(userId);

    expect(result).toEqual(validAnalytics);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `/api/recommendations/${userId}/analytics`
      )
    );
  });

  it("rejects missing user IDs", async () => {
    await expect(getRecommendationAnalytics(""))
      .rejects.toThrow("A user ID is required.");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns backend error messages", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        message: "Unable to generate recommendation analytics.",
      }),
    });

    await expect(getRecommendationAnalytics(userId))
      .rejects.toThrow(
        "Unable to generate recommendation analytics."
      );
  });

  it("rejects malformed analytics responses", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        summary: {},
        artistFrequency: null,
      }),
    });

    await expect(getRecommendationAnalytics(userId))
      .rejects.toThrow(
        "Invalid recommendation analytics response."
      );
  });
});
