import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Navbar from "../components/Navbar/Navbar";

const STORAGE_KEY = "musicvault-theme";

function mockSystemTheme(prefersDark) {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: dark)" && prefersDark,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
}

function renderNavbar() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("Phase 2 - MusicVault Theme Management", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    mockSystemTheme(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  test("theme switch updates its accessible checked state", async () => {
    renderNavbar();

    const themeSwitch = screen.getByRole("switch", {
      name: "Dark mode",
    });

    expect(themeSwitch.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(themeSwitch);

    await waitFor(() => {
      expect(themeSwitch.getAttribute("aria-checked")).toBe("true");
      expect(document.documentElement.dataset.theme).toBe("dark");
    });

    fireEvent.click(themeSwitch);

    await waitFor(() => {
      expect(themeSwitch.getAttribute("aria-checked")).toBe("false");
      expect(document.documentElement.dataset.theme).toBe("light");
    });
  });

  test("theme switch updates its accessible checked state", async () => {
    renderNavbar();

    const themeSwitch = screen.getByRole("switch", {
      name: "Dark mode",
    });

    expect(themeSwitch.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(themeSwitch);

    await waitFor(() => {
      expect(themeSwitch.getAttribute("aria-checked")).toBe("true");
      expect(document.documentElement.dataset.theme).toBe("dark");
    });

    fireEvent.click(themeSwitch);

    await waitFor(() => {
      expect(themeSwitch.getAttribute("aria-checked")).toBe("false");
      expect(document.documentElement.dataset.theme).toBe("light");
    });
  });

  test("restores a saved dark theme", () => {
    window.localStorage.setItem(STORAGE_KEY, "dark");

    renderNavbar();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(
      screen.getByRole("switch", { name: "Dark mode" })
    ).toBeTruthy();
  });

  test("uses system dark preference when nothing is saved", () => {
    mockSystemTheme(true);

    renderNavbar();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("uses system light preference when nothing is saved", () => {
    renderNavbar();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("restores the selected theme after remounting", async () => {
    const { unmount } = renderNavbar();

    fireEvent.click(
      screen.getByRole("switch", { name: "Dark mode" })
    );

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark");
    });

    unmount();

    renderNavbar();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(
      screen.getByRole("switch", { name: "Dark mode" })
    ).toBeTruthy();
  });

  test("toggles theme and saves the selected preference", async () => {
    renderNavbar();

    fireEvent.click(
      screen.getByRole("switch", { name: "Dark mode" })
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark");
    });

    expect(
      screen.getByRole("switch", { name: "Dark mode" })
    ).toBeTruthy();
  });
});
