import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Home from "./Home";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe("Phase 5 - Home Page", () => {
  test("displays the main hero heading", () => {
    renderHome();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Rediscover the songs you forgot you loved.",
      })
    ).toBeInTheDocument();
  });

  test("displays the hero image with alternative text", () => {
    renderHome();

    const image = screen.getByRole("img", {
      name: "Vinyl record beside colorful album covers",
    });

    expect(image).toBeInTheDocument();
    expect(image.getAttribute("src")).toContain("hero");
  });

  test("links to Song Selection", () => {
    renderHome();

    const link = screen.getByRole("link", {
      name: "Start Picking Songs",
    });

    expect(link).toHaveAttribute("href", "/songs");
  });

  test("displays all three How It Works steps", () => {
    renderHome();

    const section = screen.getByRole("region", {
      name: "How It Works",
    });

    expect(
      within(section).getByRole("heading", {
        name: "Pick Your Favorites",
      })
    ).toBeInTheDocument();

    expect(
      within(section).getByRole("heading", {
        name: "Discover New Music",
      })
    ).toBeInTheDocument();

    expect(
      within(section).getByRole("heading", {
        name: "Rediscover Your Sound",
      })
    ).toBeInTheDocument();

    expect(
      within(section).getAllByRole("article")
    ).toHaveLength(3);
  });

  test("uses the correct heading hierarchy", () => {
    renderHome();

    expect(
      screen.getAllByRole("heading", { level: 1 })
    ).toHaveLength(1);

    expect(
      screen.getAllByRole("heading", { level: 2 })
    ).toHaveLength(1);

    expect(
      screen.getAllByRole("heading", { level: 3 })
    ).toHaveLength(3);
  });
});
