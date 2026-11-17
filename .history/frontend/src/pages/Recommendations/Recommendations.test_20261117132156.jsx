
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Recommendations from "./Recommendations";
import { getRecommendations } from "../../services/recommendationService";

vi.mock("../../services/recommendationService", () => ({
  getRecommendations: vi.fn(),
}));

describe("Recommendations Page", () => {
  test("displays loading state while recommendations are requested", () => {
    // Keep the request pending so loading remains visible.
    getRecommendations.mockReturnValue(
      new Promise(() => {})
    );

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Loading recommendations...")
    ).toBeInTheDocument();
  });

  test("displays recommendations after a successful API request", async () => {
    const mockRecommendations = [
      {
        id: "candidate-001",
        title: "Another Rock Song",
        artist: "Example Artist",
        genre: "rock",
        popularity: 75,
        score: 85,
      },
      {
        id: "candidate-002",
        title: "Rock Discovery",
        artist: "Another Artist",
        genre: "rock",
        popularity: 60,
        score: 65,
      },
    ];

    getRecommendations.mockResolvedValue(mockRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Another Rock Song")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Rock Discovery")
    ).toBeInTheDocument();

    expect(
      screen.getByText("85% match")
    ).toBeInTheDocument();

    expect(
      screen.getByText("65% match")
    ).toBeInTheDocument();

    expect(getRecommendations).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111"
    );
  });

  test("displays empty state when no recommendations are returned", async () => {
    // Simulate a successful API request with no recommendations.
    getRecommendations.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    // Verify the empty-state message appears.
    expect(
      await screen.findByText("No recommendations found")
    ).toBeInTheDocument();

    // Verify the user receives guidance.
    expect(
      screen.getByText(/Try selecting more songs/i)
    ).toBeInTheDocument();

    // Verify the user can navigate back to song selection.
    const chooseSongsLink = screen.getByRole("link", {
      name: "Choose Songs",
    });

    expect(chooseSongsLink).toBeInTheDocument();
    expect(chooseSongsLink).toHaveAttribute("href", "/songs");

    // Verify no recommendation cards are displayed.
    expect(
      document.querySelectorAll(".recommendation-card")
    ).toHaveLength(0);
  });

  test("displays an error message when the API request fails", async () => {
    // Simulate a backend connection failure.
    getRecommendations.mockRejectedValue(
      new Error("Failed to fetch")
    );

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    // Verify that the error state appears.
    expect(
      await screen.findByText("Something went wrong")
    ).toBeInTheDocument();

    // Verify that the correct error message appears.
    expect(
      screen.getByText(
        /Could not connect to the Music Vault backend/i
      )
    ).toBeInTheDocument();

    // Verify the retry button is available.
    expect(
      screen.getByRole("button", { name: "Try Again" })
    ).toBeInTheDocument();

    // Verify no recommendation cards are displayed.
    expect(
      document.querySelectorAll(".recommendation-card")
    ).toHaveLength(0);
  });

  test("retries a failed request and displays recommendations", async () => {
    const user = userEvent.setup();

    const mockRecommendations = [
      {
        id: "retry-candidate-001",
        title: "Recovered Recommendation",
        artist: "Example Artist",
        genre: "rock",
        popularity: 70,
        score: 75,
      },
    ];

    // First request fails, second succeeds.
    getRecommendations
      .mockRejectedValueOnce(new Error("Failed to fetch"))
      .mockResolvedValueOnce(mockRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    // Wait for the initial error.
    const retryButton = await screen.findByRole("button", {
      name: "Try Again",
    });

    // Retry the request.
    await user.click(retryButton);

    // Verify that the successful response appears.
    expect(
      await screen.findByText("Recovered Recommendation")
    ).toBeInTheDocument();

    expect(
      screen.getByText("75% match")
    ).toBeInTheDocument();

    // Verify that the API was called twice.
    await waitFor(() => {
      expect(getRecommendations).toHaveBeenCalledTimes(2);
    });

    // Verify the previous error is cleared.
    expect(
      screen.queryByText("Something went wrong")
    ).not.toBeInTheDocument();
  });

  test("displays fallback values for missing song metadata", async () => {
    const mockRecommendations = [
      {
        id: "missing-metadata-001",
        title: null,
        artist: "",
        genre: null,
        popularity: null,
        score: 50,
      },
    ];

    getRecommendations.mockResolvedValue(mockRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Unknown title")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unknown artist")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Not available")
    ).toHaveLength(2);

    expect(
      screen.getByText("50% match")
    ).toBeInTheDocument();
  });

  test("does not display invalid similarity percentages", async () => {
    const mockRecommendations = [
      {
        id: "invalid-score-001",
        title: "Invalid Score Song",
        artist: "Example Artist",
        genre: "rock",
        popularity: 50,
        score: 150,
      },
      {
        id: "invalid-score-002",
        title: "Missing Score Song",
        artist: "Another Artist",
        genre: "jazz",
        popularity: 60,
        score: null,
      },
    ];

    getRecommendations.mockResolvedValue(mockRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Invalid Score Song")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Missing Score Song")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("150% match")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("0% match")
    ).not.toBeInTheDocument();

    expect(
      document.querySelectorAll(".recommendation-score")
    ).toHaveLength(0);
  });
});
