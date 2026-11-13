
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
});
