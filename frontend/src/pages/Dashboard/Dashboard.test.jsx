import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Dashboard from "./Dashboard";
import { getPreferences } from "../../services/preferenceApi";

vi.mock("../../services/preferenceApi", () => ({
  getPreferences: vi.fn(),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const preferences = [
  {
    id: "pref-1",
    title: "Song One",
    artist: "Artist A",
    genre: "Rock",
  },
  {
    id: "pref-2",
    title: "Song Two",
    artist: "Artist A",
    genre: "rock",
  },
  {
    id: "pref-3",
    title: "Song Three",
    artist: "Artist B",
    genre: null,
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe("Phase 5 - Music Dashboard", () => {
  test("displays loading state while preferences load", () => {
    getPreferences.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Loading your music dashboard...");
  });

  test("displays saved-song statistics and top artists", async () => {
    getPreferences.mockResolvedValue(preferences);

    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: "Genre Breakdown",
      })
    ).toBeInTheDocument();

    const summary = document.querySelector(".dashboard-summary");

    expect(
      within(summary).getByText("3")
    ).toBeInTheDocument();

    expect(
      within(summary).getAllByText("2")
    ).toHaveLength(2);

    expect(
      screen.getByText("Unknown Genre")
    ).toBeInTheDocument();

    const artists = document.querySelector(
      ".dashboard-artists-list"
    );

    expect(
      within(artists).getByText("Artist A")
    ).toBeInTheDocument();

    expect(
      within(artists).getByText("Artist B")
    ).toBeInTheDocument();
  });

  test("displays an empty state with song selection link", async () => {
    getPreferences.mockResolvedValue([]);

    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: "No saved songs yet",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Start Picking Songs",
      })
    ).toHaveAttribute("href", "/songs");
  });

  test("displays a friendly API error", async () => {
    getPreferences.mockRejectedValue(new Error("Failed to fetch"));

    renderDashboard();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to load your saved songs"
    );
  });

  test("retries after a failed request", async () => {
    const user = userEvent.setup();

    getPreferences
      .mockRejectedValueOnce(new Error("Failed to fetch"))
      .mockResolvedValueOnce(preferences);

    renderDashboard();

    await screen.findByRole("alert");

    await user.click(
      screen.getByRole("button", { name: "Try Again" })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Genre Breakdown",
      })
    ).toBeInTheDocument();

    expect(getPreferences).toHaveBeenCalledTimes(2);
  });
});
