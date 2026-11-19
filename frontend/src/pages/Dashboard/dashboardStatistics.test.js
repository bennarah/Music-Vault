import { describe, expect, test } from "vitest";
import { getDashboardStatistics } from "./dashboardStatistics";

describe("Phase 5 - Dashboard Statistics", () => {
  test("calculates saved song and artist counts", () => {
    const result = getDashboardStatistics([
      { artist: "Artist A", genre: "Rock" },
      { artist: "Artist A", genre: "Rock" },
      { artist: "Artist B", genre: "Pop" },
    ]);

    expect(result.totalSongs).toBe(3);
    expect(result.uniqueArtists).toBe(2);
    expect(result.knownGenreCount).toBe(3);
  });

  test("groups genres without capitalization differences", () => {
    const result = getDashboardStatistics([
      { genre: "Rock", artist: "Artist A" },
      { genre: " rock ", artist: "Artist B" },
    ]);

    expect(result.genreDistribution).toEqual([
      { name: "Rock", count: 2 },
    ]);
  });

  test("represents missing genre metadata accurately", () => {
    const result = getDashboardStatistics([
      { genre: null, artist: "Artist A" },
      { genre: "", artist: "Artist B" },
      { genre: "Jazz", artist: "Artist C" },
    ]);

    expect(result.knownGenreCount).toBe(1);

    expect(result.genreDistribution).toContainEqual({
      name: "Unknown Genre",
      count: 2,
    });
  });

  test("ranks top artists by saved song count", () => {
    const result = getDashboardStatistics([
      { artist: "Artist B", genre: "Pop" },
      { artist: "Artist A", genre: "Rock" },
      { artist: "artist a", genre: "Rock" },
    ]);

    expect(result.topArtists[0]).toEqual({
      name: "Artist A",
      count: 2,
    });
  });

  test("handles empty preference data", () => {
    const result = getDashboardStatistics([]);

    expect(result.totalSongs).toBe(0);
    expect(result.uniqueArtists).toBe(0);
    expect(result.genreDistribution).toEqual([]);
    expect(result.topArtists).toEqual([]);
  });
});
