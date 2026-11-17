import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "../context/ThemeContext";
import Layout from "../components/Layout/Layout";
import SongSelectionPage from "./SongSelectionPage";

vi.mock("../services/preferenceApi", () => ({
  getPreferences: vi.fn().mockResolvedValue([]),
  savePreference: vi.fn(),
  deletePreference: vi.fn(),
}));

describe("Phase 1 - Song Selection Landmark Accessibility", () => {
  test("renders exactly one main landmark inside Layout", async () => {
    const { container } = render(
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

    const mainLandmarks = screen.getAllByRole("main");

    expect(mainLandmarks).toHaveLength(1);

    expect(
      await screen.findByRole("heading", {
        name: "Select Songs You Like",
      })
    ).toBeTruthy();

    const songSelection = container.querySelector(
      ".song-selection-page"
    );

    expect(songSelection).not.toBeNull();
    expect(mainLandmarks[0].contains(songSelection)).toBe(true);
    expect(songSelection.tagName).toBe("DIV");
  });
});
