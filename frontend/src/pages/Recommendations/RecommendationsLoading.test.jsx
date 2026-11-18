import { describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Recommendations from "./Recommendations";
import { getRecommendations } from "../../services/recommendationService";

vi.mock("../../services/recommendationService", () => ({
  getRecommendations: vi.fn(),
}));

const mockRecommendation = {
  id: "loading-test-1",
  title: "Midnight Drive",
  artist: "The Echo Lines",
  genre: "Alternative",
  popularity: 75,
  score: 91,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <Recommendations />
    </MemoryRouter>
  );
}

describe("Phase 4 - Recommendation Skeleton Loading", () => {
  test("displays three skeleton cards while loading", () => {
    getRecommendations.mockReturnValue(
      new Promise(() => {})
    );

    const { container } = renderPage();

    expect(
      container.querySelectorAll(".recommendation-card-skeleton")
    ).toHaveLength(3);
  });

  test("removes skeletons after recommendations load", async () => {
    getRecommendations.mockResolvedValue([mockRecommendation]);

    const { container } = renderPage();

    await screen.findByText("Midnight Drive");

    await waitFor(() => {
      expect(
        container.querySelectorAll(".recommendation-card-skeleton")
      ).toHaveLength(0);
    });

    expect(
      container.querySelectorAll(".recommendation-card:not(.recommendation-card-skeleton)")
    ).toHaveLength(1);
  });

  test("preserves accessible loading announcements", () => {
    getRecommendations.mockReturnValue(
      new Promise(() => {})
    );

    const { container } = renderPage();

    expect(
      screen.getByRole("status").textContent
    ).toContain("Loading recommendations...");

    const skeletonGrid = container.querySelector(
      ".recommendations-grid[aria-hidden='true']"
    );

    expect(skeletonGrid).not.toBeNull();

    expect(
      skeletonGrid.querySelectorAll(".recommendation-card-skeleton")
    ).toHaveLength(3);
  });
});
