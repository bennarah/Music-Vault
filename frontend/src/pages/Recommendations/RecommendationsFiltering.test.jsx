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
    id: "rock-1",
    title: "Rock Song One",
    artist: "Artist A",
    genre: "Rock",
    score: 90,
  },
  {
    id: "rock-2",
    title: "Rock Song Two",
    artist: "Artist B",
    genre: " rock ",
    score: 80,
  },
  {
    id: "jazz-1",
    title: "Jazz Song",
    artist: "Artist C",
    genre: "Jazz",
    score: 70,
  },
  {
    id: "unknown-1",
    title: "Unknown Genre Song",
    artist: "Artist D",
    genre: null,
    score: 60,
  },
];

function renderPage() {
  getRecommendations.mockResolvedValue(testRecommendations);

  render(
    <MemoryRouter>
      <Recommendations />
    </MemoryRouter>
  );
}

function getDisplayedTitles() {
  const grid = document.querySelector(".recommendations-grid");

  return within(grid)
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent);
}

describe("Phase 4 - Recommendation Genre Filtering", () => {
  test("filters genres regardless of capitalization and spaces", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Rock Song One");

    const filter = screen.getByRole("combobox", {
      name: "Filter by genre",
    });

    const options = within(filter).getAllByRole("option");
    const rockOptions = options.filter(
      (option) => option.value === "rock"
    );

    expect(rockOptions).toHaveLength(1);

    await user.selectOptions(filter, "rock");

    expect(getDisplayedTitles()).toEqual([
      "Rock Song One",
      "Rock Song Two",
    ]);
  });

  test("shows songs with missing genre metadata", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Rock Song One");

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Filter by genre",
      }),
      "unknown"
    );

    expect(getDisplayedTitles()).toEqual([
      "Unknown Genre Song",
    ]);
  });

  test("shows a reset option when no songs match the filter", async () => {
    const user = userEvent.setup();

    getRecommendations.mockResolvedValue(
      testRecommendations.filter((item) => item.genre !== null)
    );

    render(
      <MemoryRouter>
        <Recommendations />
      </MemoryRouter>
    );

    await screen.findByText("Rock Song One");

    const filter = screen.getByRole("combobox", {
      name: "Filter by genre",
    });

    await user.selectOptions(filter, "unknown");

    expect(
      screen.getByRole("heading", {
        name: "No matching recommendations",
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Show All Genres",
      })
    );

    expect(screen.getByText("Rock Song One")).toBeInTheDocument();
    expect(screen.getByText("Jazz Song")).toBeInTheDocument();
  });

  test("restores all songs when All Genres is selected", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Rock Song One");

    const filter = screen.getByRole("combobox", {
      name: "Filter by genre",
    });

    await user.selectOptions(filter, "rock");
    expect(getDisplayedTitles()).toHaveLength(2);

    await user.selectOptions(filter, "all");
    expect(getDisplayedTitles()).toHaveLength(4);
  });
});
