import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Recommendations from "./Recommendations";
import { getRecommendations } from "../../services/recommendationService";
import { getRecommendationAnalytics } from "../../services/analyticsApi";
import { downloadRecommendationCsv } from "../../services/recommendationCsvApi";

vi.mock("../../services/recommendationService", () => ({
  getRecommendations: vi.fn(),
}));

vi.mock("../../services/analyticsApi", () => ({
  getRecommendationAnalytics: vi.fn(),
}));

vi.mock("../../services/recommendationCsvApi", () => ({
  downloadRecommendationCsv: vi.fn(),
}));

describe("SCRUM-239 - CSV Export Button Integration", () => {
  const userId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();

    getRecommendations.mockResolvedValue([
      {
        id: "track001",
        title: "Demo Recommendation",
        artist: "Demo Artist",
        genre: "rock",
        score: 90,
        popularity: 75,
      },
    ]);

    getRecommendationAnalytics.mockResolvedValue({
      success: true,
      summary: {
        totalRecommendations: 1,
        uniqueArtists: 1,
        uniqueGenres: 1,
      },
      genreDistribution: {
        songsWithGenres: 1,
        songsWithoutGenres: 0,
        genres: [{ genre: "rock", count: 1, percentage: 100 }],
      },
    });

    downloadRecommendationCsv.mockResolvedValue(undefined);
  });

  function renderPage() {
    return render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );
  }

  test("downloads CSV when the button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const button = await screen.findByRole("button", {
      name: "Download CSV",
    });

    await user.click(button);

    expect(downloadRecommendationCsv).toHaveBeenCalledWith(userId);
    expect(downloadRecommendationCsv).toHaveBeenCalledTimes(1);
  });

  test("disables the button while downloading", async () => {
    const user = userEvent.setup();

    downloadRecommendationCsv.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    const button = await screen.findByRole("button", {
      name: "Download CSV",
    });

    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Downloading CSV..." })
    ).toBeDisabled();

    expect(
      screen.getByText("Demo Recommendation")
    ).toBeInTheDocument();
  });

  test("shows an error without hiding recommendations", async () => {
    const user = userEvent.setup();

    downloadRecommendationCsv.mockRejectedValue(
      new Error("Export failed")
    );

    renderPage();

    const button = await screen.findByRole("button", {
      name: "Download CSV",
    });

    await user.click(button);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to download recommendations. Please try again."
    );

    expect(
      screen.getByText("Demo Recommendation")
    ).toBeInTheDocument();
  });

  test("does not show the download button for empty recommendations", async () => {
    getRecommendations.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("No recommendations found")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Download CSV" })
    ).not.toBeInTheDocument();
  });
});
