const {
  calculateGenreDistribution,
} = require("../src/services/analyticsService");

describe("SCRUM-121 - Genre Distribution Aggregation", () => {
  test("normalizes capitalization and surrounding whitespace", () => {
    const result = calculateGenreDistribution([
      { song: { genres: [" Rock ", "INDIE"] } },
      { song: { genres: ["rock", " indie "] } },
    ]);

    expect(result).toEqual({
      songsWithGenres: 2,
      songsWithoutGenres: 0,
      genres: [
        { genre: "indie", count: 2, percentage: 50 },
        { genre: "rock", count: 2, percentage: 50 },
      ],
    });
  });

  test("counts duplicate genres only once per song", () => {
    const result = calculateGenreDistribution([
      { song: { genres: ["rock", "ROCK", " rock ", "pop"] } },
    ]);

    expect(result.genres).toEqual([
      { genre: "pop", count: 1, percentage: 50 },
      { genre: "rock", count: 1, percentage: 50 },
    ]);
  });

  test("sorts tied genre counts alphabetically", () => {
    const result = calculateGenreDistribution([
      { song: { genres: ["jazz", "rock", "ambient"] } },
    ]);

    expect(result.genres.map((item) => item.genre)).toEqual([
      "ambient",
      "jazz",
      "rock",
    ]);
  });

  test("calculates percentages using genre assignments", () => {
    const result = calculateGenreDistribution([
      { song: { genres: ["rock", "indie"] } },
      { song: { genres: ["rock"] } },
      { song: { genres: ["pop"] } },
    ]);

    expect(result.genres).toEqual([
      { genre: "rock", count: 2, percentage: 50 },
      { genre: "indie", count: 1, percentage: 25 },
      { genre: "pop", count: 1, percentage: 25 },
    ]);
  });

  test("tracks missing and invalid genre metadata", () => {
    const result = calculateGenreDistribution([
      { song: { genres: [] } },
      { song: { genres: null } },
      { song: { genres: ["", " ", null, 42] } },
      { song: { genres: ["rock"] } },
      null,
      {},
    ]);

    expect(result).toEqual({
      songsWithGenres: 1,
      songsWithoutGenres: 3,
      genres: [
        { genre: "rock", count: 1, percentage: 100 },
      ],
    });
  });

  test("returns an empty distribution for no recommendations", () => {
    expect(calculateGenreDistribution([])).toEqual({
      songsWithGenres: 0,
      songsWithoutGenres: 0,
      genres: [],
    });
  });

  test("rejects non-array recommendation input", () => {
    expect(() => calculateGenreDistribution(null))
      .toThrow("Recommendations must be an array.");
  });
});
