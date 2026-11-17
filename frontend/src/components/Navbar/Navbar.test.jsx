import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { ThemeProvider } from "../../context/ThemeContext";

describe("Phase 1 - Navbar Route Regression", () => {
  test("all navigation links use the correct paths", () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </ThemeProvider>
    );

    const expectedLinks = [
      ["Music Vault", "/"],
      ["Login", "/login"],
      ["Register", "/register"],
      ["Dashboard", "/dashboard"],
      ["Recommendations", "/recommendations"],
      ["Select Songs", "/songs"],
    ];

    for (const [name, path] of expectedLinks) {
      const link = screen.getByRole("link", { name });

      expect(link.getAttribute("href")).toBe(path);
    }
  });

  test("navigation links contain no leading or trailing spaces", () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </ThemeProvider>
    );

    const links = screen.getAllByRole("link");

    for (const link of links) {
      const href = link.getAttribute("href");

      expect(href).toBe(href.trim());
      expect(href).not.toMatch(/%20/);
    }
  });
});
