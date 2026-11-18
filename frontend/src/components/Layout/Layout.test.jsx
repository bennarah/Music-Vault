import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "../../context/ThemeContext";
import Layout from "./Layout";

describe("Phase 2 - Shared Application Layout", () => {
  test("renders one main landmark with the app-main class", () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/test"]}>
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="/test"
                element={<h1>Layout Test Page</h1>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    );

    const main = screen.getByRole("main");

    expect(main.classList.contains("app-main")).toBe(true);

    expect(
      screen.getAllByRole("main")
    ).toHaveLength(1);

    expect(
      screen.getByRole("heading", {
        name: "Layout Test Page",
      })
    ).toBeTruthy();
  });
});
