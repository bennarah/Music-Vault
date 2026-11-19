import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";

import Recommendations from "./Recommendations";
import { getRecommendations } from "../../services/recommendationService";
import { getRecommendationAnalytics } from "../../services/analyticsApi";

vi.mock("../../services/recommendationService", () => ({
  getRecommendations: vi.fn(),
}));

vi.mock("../../services/analyticsApi", () => ({
  getRecommendationAnalytics: vi.fn(),
}));

describe("SCRUM-131 - Recommendation Insights Page Integration", () => {
  const userId = "11111111-1111-4111-8111-111111111111";

  const songs = [
    {
      id: "track001",
      title: "Example Recommendation",
      artist: "Example Artist",
      genre: "rock",
      popularity: 75,
      score: 90,
    },
  ];

  const analytics = {
    success: true,
    summary: {
      totalRecommendations: 1,
      uniqueArtists: 1,
      uniqueGenres: 1,
    },
    genreDistribution: {
      songsWithGenres: 1,
      songsWithoutGenres: 0,
      genres: [
        { genre: "rock", count: 1, percentage: 100 },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getRecommendations.mockResolvedValue(songs);
    getRecommendationAnalytics.mockResolvedValue(analytics);
  });

  function renderPage() {
    return render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );
  }

  test("displays recommendation insights alongside song cards", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "Recommendation Insights",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Example Recommendation")
    ).toBeInTheDocument();

    expect(getRecommendationAnalytics).toHaveBeenCalledWith(userId);
  });

  test("shows an independent analytics loading state", async () => {
    getRecommendationAnalytics.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    expect(
      await screen.findByText("Example Recommendation")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Loading recommendation insights...")
    ).toBeInTheDocument();
  });

  test("keeps recommendation cards visible when analytics fail", async () => {
    getRecommendationAnalytics.mockRejectedValue(
      new Error("Simulated analytics failure")
    );

    renderPage();

    expect(
      await screen.findByText(
        "Recommendation insights are temporarily unavailable."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Example Recommendation")
    ).toBeInTheDocument();
  });

  test("does not display analytics when recommendations are empty", async () => {
    getRecommendations.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("No recommendations found")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Recommendation Insights",
      })
    ).not.toBeInTheDocument();
  });

  test("preserves recommendation API behavior", async () => {
    renderPage();

    await waitFor(() => {
      expect(getRecommendations).toHaveBeenCalledWith(userId);
      expect(getRecommendationAnalytics).toHaveBeenCalledWith(userId);
    });
  });
});
