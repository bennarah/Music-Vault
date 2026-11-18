import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "../context/ThemeContext";
import Layout from "../components/Layout/Layout";
import SongSelectionPage from "./SongSelectionPage";
import {
  getPreferences,
  deletePreference,
} from "../services/preferenceApi";

vi.mock("../services/preferenceApi", () => ({
  getPreferences: vi.fn(),
  savePreference: vi.fn(),
  deletePreference: vi.fn(),
}));

const savedPreferences = [
  {
    id: 101,
    songId: "spotify-101",
    title: "Midnight Drive",
    artist: "The Echo Lines",
    genre: "indie",
  },
  {
    id: 102,
    songId: "spotify-102",
    title: "Afterglow",
    artist: "Velvet Static",
    genre: "rock",
  },
];

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={["/songs"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/songs"
              element={<SongSelectionPage />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("Phase 3 - Selected Song Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPreferences.mockResolvedValue(savedPreferences);
    deletePreference.mockResolvedValue({
      id: 101,
    });
  });

  test("displays saved songs and their count", async () => {
    renderPage();

    expect(
      await screen.findByText("Midnight Drive")
    ).toBeTruthy();

    expect(screen.getByText("Afterglow")).toBeTruthy();

    const heading = screen.getByRole("heading", {
      name: /Your Picks/,
    });

    expect(heading.textContent).toContain("2");

    expect(
      screen.getByRole("button", {
        name: "Remove Midnight Drive by The Echo Lines",
      })
    ).toBeTruthy();
  });

  test("manual song entry expands and collapses", async () => {
    const { container } = renderPage();

    await screen.findByText("Midnight Drive");

    const details = container.querySelector(
      ".song-manual-details"
    );

    expect(details).not.toBeNull();
    expect(details.open).toBe(false);

    const summary = screen.getByText(
      "Can't find it? Enter a song manually"
    );

    fireEvent.click(summary);

    expect(details.open).toBe(true);

    fireEvent.click(summary);

    expect(details.open).toBe(false);
  });

  test("displays search errors below the search form", async () => {
    const { container } = renderPage();

    await screen.findByText("Midnight Drive");

    fireEvent.click(
      screen.getByRole("button", { name: "Search" })
    );

    const searchSection = container.querySelector(
      ".song-search-section"
    );

    expect(searchSection).not.toBeNull();

    expect(
      within(searchSection).getByRole("alert").textContent
    ).toContain("Enter a song or artist to search.");
  });

  test("links to the Recommendations page", async () => {
    renderPage();

    await screen.findByText("Midnight Drive");

    const link = screen.getByRole("link", {
      name: "Get Recommendations",
    });

    expect(link.getAttribute("href")).toBe("/recommendations");
  });

  test("removing a song updates the count and list", async () => {
    renderPage();

    await screen.findByText("Midnight Drive");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove Midnight Drive by The Echo Lines",
      })
    );

    await waitFor(() => {
      expect(deletePreference).toHaveBeenCalledWith(101);
      expect(screen.queryByText("Midnight Drive")).toBeNull();
    });

    const heading = screen.getByRole("heading", {
      name: /Your Picks/,
    });

    expect(heading.textContent).toContain("1");
    expect(screen.getByText("Afterglow")).toBeTruthy();
  });
});
