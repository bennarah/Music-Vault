const CombinedSimilarityStrategy = require(
  "../services/strategies/CombinedSimilarityStrategy"
);

describe("CombinedSimilarityStrategy", () => {
  const strategy = new CombinedSimilarityStrategy();

  test("returns 100 for a perfect match", () => {
    expect(strategy.calculateScore(
      {
        artistId: "artist-1",
        genres: ["rock", "indie"],
        durationMs: 200000
      },
      {
        artistId: "artist-1",
        genres: ["rock", "indie"],
        durationMs: 200000
      }
    )).toBe(100);
  });

  test("returns 40 for same artist only", () => {
    expect(strategy.calculateScore(
      { artistId: "artist-1", genres: ["rock"], durationMs: 200000 },
      { artistId: "artist-1", genres: ["jazz"], durationMs: 400000 }
    )).toBe(40);
  });

  test("returns 25 for one shared genre only", () => {
    expect(strategy.calculateScore(
      { artistId: "artist-1", genres: ["rock"], durationMs: 200000 },
      { artistId: "artist-2", genres: ["rock"], durationMs: 400000 }
    )).toBe(25);
  });

  test("returns 10 for similar duration only", () => {
    expect(strategy.calculateScore(
      { artistId: "artist-1", genres: ["rock"], durationMs: 200000 },
      { artistId: "artist-2", genres: ["jazz"], durationMs: 210000 }
    )).toBe(10);
  });

  test("returns 70 for a partial match across all strategies", () => {
    expect(strategy.calculateScore(
      {
        artistId: "artist-1",
        genres: ["rock", "indie"],
        durationMs: 200000
      },
      {
        artistId: "artist-1",
        genres: ["rock"],
        durationMs: 250000
      }
    )).toBe(70);
  });

  test("returns 0 when songs have no similarity", () => {
    expect(strategy.calculateScore(
      { artistId: "artist-1", genres: ["rock"], durationMs: 200000 },
      { artistId: "artist-2", genres: ["jazz"], durationMs: 400000 }
    )).toBe(0);
  });

  test("handles missing or invalid metadata safely", () => {
    expect(strategy.calculateScore({}, {})).toBe(0);
    expect(strategy.calculateScore(null, null)).toBe(0);
    expect(strategy.calculateScore(
      { artistId: 123, genres: "rock", durationMs: "200000" },
      { artistId: "artist-1", genres: ["rock"], durationMs: 200000 }
    )).toBe(0);
  });

  test("rejects invalid scores returned by a strategy", () => {
    const invalidStrategy = new CombinedSimilarityStrategy();

    invalidStrategy.strategies[0].strategy.calculateScore = () => 75;

    expect(() =>
      invalidStrategy.calculateScore({}, {})
    ).toThrow("Invalid similarity strategy score.");
  });
});
