import { describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
      ["MusicVault", "/"],
      ["Home", "/"],
      ["Dashboard", "/dashboard"],
      ["Select Songs", "/songs"],
      ["Recommendations", "/recommendations"],
      ["Log In", "/login"],
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

describe("Phase 2 - Responsive Navbar", () => {
  function renderNavbar(path = "/songs") {
    return render(
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <Navbar />
        </MemoryRouter>
      </ThemeProvider>
    );
  }

  test("menu opens and closes with accessible state", () => {
    renderNavbar();

    const openButton = screen.getByLabelText("Open menu");

    expect(openButton.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(openButton);

    const closeButton = screen.getByLabelText("Close menu");

    expect(closeButton.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById("navbar-links").classList.contains("is-open"))
      .toBe(true);

    fireEvent.click(closeButton);

    expect(
      screen.getByLabelText("Open menu")
        .getAttribute("aria-expanded")
    ).toBe("false");
  });

  test("selecting a navigation link closes the menu", () => {
    renderNavbar();

    fireEvent.click(
      screen.getByLabelText("Open menu")
    );

    fireEvent.click(
      screen.getByRole("link", { name: "Dashboard" })
    );

    expect(
      screen.getByLabelText("Open menu")
        .getAttribute("aria-expanded")
    ).toBe("false");
  });

  test("highlights the active navigation link", () => {
    renderNavbar("/songs");

    const activeLink = screen.getByRole("link", {
      name: "Select Songs",
    });

    expect(activeLink.classList.contains("is-active")).toBe(true);
    expect(activeLink.getAttribute("aria-current")).toBe("page");
  });

  test("preserves the accessible theme toggle", () => {
    renderNavbar();

    const themeSwitch = screen.getByRole("switch", {
      name: "Dark mode",
    });

    expect(themeSwitch).toBeTruthy();
    expect(["true", "false"]).toContain(
      themeSwitch.getAttribute("aria-checked")
    );
  });
});
