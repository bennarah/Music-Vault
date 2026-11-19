import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import RecommendationInsights from "./RecommendationInsights";

describe("SCRUM-131 - Recommendation Insights Component", () => {
  const analytics = {
    summary: {
      totalRecommendations: 12,
      uniqueArtists: 5,
      uniqueGenres: 3,
    },
    genreDistribution: {
      songsWithGenres: 12,
      songsWithoutGenres: 0,
      genres: [
        { genre: "rock", count: 8, percentage: 50 },
        { genre: "indie", count: 5, percentage: 31.25 },
        { genre: "pop", count: 3, percentage: 18.75 },
      ],
    },
  };

  test("displays recommendation summary statistics", () => {
    render(<RecommendationInsights analytics={analytics} />);

    expect(
      screen.getByRole("heading", { name: "Recommendation Insights" })
    ).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("displays recommended genres and their counts", () => {
    render(<RecommendationInsights analytics={analytics} />);

    expect(screen.getByText("rock")).toBeInTheDocument();
    expect(screen.getByText("indie")).toBeInTheDocument();
    expect(screen.getByText("pop")).toBeInTheDocument();

    expect(screen.getByText("8 songs")).toBeInTheDocument();
    expect(screen.getByText("5 songs")).toBeInTheDocument();
    expect(screen.getByText("3 songs")).toBeInTheDocument();
  });

  test("handles missing genre information", () => {
    render(
      <RecommendationInsights
        analytics={{
          ...analytics,
          genreDistribution: {
            songsWithGenres: 0,
            songsWithoutGenres: 12,
            genres: [],
          },
        }}
      />
    );

    expect(
      screen.getByText("No genre information is available.")
    ).toBeInTheDocument();
  });

  test("does not render incomplete analytics data", () => {
    const { container } = render(
      <RecommendationInsights analytics={null} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
