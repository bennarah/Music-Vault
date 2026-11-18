import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Recommendations from "./Recommendations";
import { getRecommendations } from "../../services/recommendationService";

vi.mock("../../services/recommendationService", () => ({
  getRecommendations: vi.fn(),
}));

const testRecommendations = [
  {
    id: "song-low",
    title: "Low Match Song",
    artist: "Artist A",
    score: 45,
    popularity: 90,
  },
  {
    id: "song-high",
    title: "High Match Song",
    artist: "Artist B",
    score: 95,
    popularity: 30,
  },
  {
    id: "song-medium",
    title: "Medium Match Song",
    artist: "Artist C",
    score: 70,
    popularity: 60,
  },
  {
    id: "song-invalid",
    title: "Unknown Match Song",
    artist: "Artist D",
    score: null,
    popularity: null,
  },
];

function getDisplayedTitles() {
  const grid = document.querySelector(".recommendations-grid");

  return within(grid)
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent);
}

describe("Phase 4 - Recommendation Similarity Sorting", () => {
  test("sorts by highest similarity by default", async () => {
    getRecommendations.mockResolvedValue(testRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    await screen.findByText("High Match Song");

    expect(getDisplayedTitles()).toEqual([
      "High Match Song",
      "Medium Match Song",
      "Low Match Song",
      "Unknown Match Song",
    ]);
  });

  test("sorts by highest popularity first", async () => {
    const user = userEvent.setup();

    getRecommendations.mockResolvedValue(testRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    await screen.findByText("High Match Song");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "popularity-desc"
    );

    expect(getDisplayedTitles()).toEqual([
      "Low Match Song",
      "Medium Match Song",
      "High Match Song",
      "Unknown Match Song",
    ]);
  });

  test("sorts by lowest popularity first", async () => {
    const user = userEvent.setup();

    getRecommendations.mockResolvedValue(testRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    await screen.findByText("High Match Song");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "popularity-asc"
    );

    expect(getDisplayedTitles()).toEqual([
      "High Match Song",
      "Medium Match Song",
      "Low Match Song",
      "Unknown Match Song",
    ]);
  });

  test("sorts by lowest similarity when selected", async () => {
    const user = userEvent.setup();

    getRecommendations.mockResolvedValue(testRecommendations);

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    await screen.findByText("High Match Song");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "score-asc"
    );

    expect(getDisplayedTitles()).toEqual([
      "Low Match Song",
      "Medium Match Song",
      "High Match Song",
      "Unknown Match Song",
    ]);
  });
});
