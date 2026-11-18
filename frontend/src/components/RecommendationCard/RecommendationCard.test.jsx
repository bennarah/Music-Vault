import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import RecommendationCard from "./RecommendationCard";

const mockRecommendation = {
  title: "Midnight Drive",
  artist: "The Echo Lines",
  genre: "Indie",
  popularity: 75,
  albumName: "Night Lights",
  albumImageUrl: "https://example.com/album.jpg",
  durationMs: 215000,
  score: 91.4,
};

describe("Phase 4 - RecommendationCard UI", () => {
  test("displays song metadata and similarity score", () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByRole("heading", {
      name: "Midnight Drive",
    })).toBeTruthy();

    expect(screen.getByText("The Echo Lines")).toBeTruthy();
    expect(screen.getByText("Indie")).toBeTruthy();
    expect(screen.getByText("Night Lights")).toBeTruthy();
    expect(screen.getByText("3:35")).toBeTruthy();
    expect(screen.getByText("91% match")).toBeTruthy();
  });

  test("displays album artwork when available", () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    const image = screen.getByRole("img", {
      name: "Night Lights cover",
    });

    expect(image.getAttribute("src")).toBe(
      "https://example.com/album.jpg"
    );
    expect(image.getAttribute("loading")).toBe("lazy");
  });

  test("shows artwork placeholder when image is missing", () => {
    const recommendation = {
      ...mockRecommendation,
      albumImageUrl: null,
    };

    const { container } = render(
      <RecommendationCard recommendation={recommendation} />
    );

    expect(
      container.querySelector(
        ".recommendation-card-artwork-placeholder"
      )
    ).not.toBeNull();
  });

  test("uses fallback values for missing metadata", () => {
    render(<RecommendationCard recommendation={{}} />);

    expect(screen.getByText("Unknown title")).toBeTruthy();
    expect(screen.getByText("Unknown artist")).toBeTruthy();

    expect(
      screen.getAllByText("Not available").length
    ).toBeGreaterThan(0);
  });

  test("does not display invalid similarity scores", () => {
    const recommendation = {
      ...mockRecommendation,
      score: 150,
    };

    render(<RecommendationCard recommendation={recommendation} />);

    expect(screen.queryByText("150% match")).toBeNull();
    expect(screen.queryByText(/% match/)).toBeNull();
  });
});
