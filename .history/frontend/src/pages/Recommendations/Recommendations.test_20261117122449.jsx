
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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
});
