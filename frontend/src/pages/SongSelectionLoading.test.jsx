import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "../context/ThemeContext";
import Layout from "../components/Layout/Layout";
import SongSelectionPage from "./SongSelectionPage";

vi.mock("../services/preferenceApi", () => ({
  getPreferences: vi.fn().mockResolvedValue([]),
  savePreference: vi.fn(),
  deletePreference: vi.fn(),
}));

const mockTrack = {
  spotifyId: "spotify-test-123",
  title: "Midnight Drive",
  artistName: "The Echo Lines",
  albumName: "Night Lights",
  albumImageUrl: null,
};

let resolveSearch;

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={["/songs"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/songs" element={<SongSelectionPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("Phase 3 - Song Selection Skeleton Loading", () => {
  beforeEach(() => {
    resolveSearch = undefined;

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function startSearch() {
    fireEvent.change(
      screen.getByRole("textbox", { name: "Song or artist" }),
      { target: { value: "Midnight Drive" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Search" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });
  }

  test("shows three skeleton cards while searching", async () => {
    const { container } = renderPage();

    await startSearch();

    expect(
      container.querySelectorAll(".song-card-skeleton")
    ).toHaveLength(3);
  });

  test("removes skeletons after results arrive", async () => {
    const { container } = renderPage();

    await startSearch();

    resolveSearch({
      ok: true,
      json: async () => ({ tracks: [mockTrack] }),
    });

    await waitFor(() => {
      expect(
        container.querySelectorAll(".song-card-skeleton")
      ).toHaveLength(0);
    });

    expect(
      screen.getByRole("heading", { name: "Midnight Drive" })
    ).toBeTruthy();
  });

  test("announces loading without exposing skeleton content", async () => {
    const { container } = renderPage();

    await startSearch();

    expect(
      screen.getByRole("status").textContent
    ).toContain("Searching for songs...");

    const grid = container.querySelector(
      ".song-results-grid[aria-hidden='true']"
    );

    expect(grid).not.toBeNull();

    expect(
      within(grid).queryAllByRole("button")
    ).toHaveLength(0);
  });
});
