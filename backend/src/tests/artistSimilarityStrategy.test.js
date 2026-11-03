const ArtistSimilarityStrategy = require(
  "../services/strategies/ArtistSimilarityStrategy"
);

describe("ArtistSimilarityStrategy", () => {
  const strategy = new ArtistSimilarityStrategy();

  test("returns 40 for matching artist IDs", () => {
    expect(
      strategy.calculateScore(
        { artistId: "artist-1" },
        { artistId: "artist-1" }
      )
    ).toBe(40);
  });

  test("returns 0 for different artist IDs", () => {
    expect(
      strategy.calculateScore(
        { artistId: "artist-1" },
        { artistId: "artist-2" }
      )
    ).toBe(0);
  });

  test("returns 0 for missing artist IDs", () => {
    expect(
      strategy.calculateScore(
        { artistId: "artist-1" },
        {}
      )
    ).toBe(0);
  });

  test("returns 0 for empty artist IDs", () => {
    expect(
      strategy.calculateScore(
        { artistId: "" },
        { artistId: "artist-1" }
      )
    ).toBe(0);
  });

  test("returns 0 for invalid artist ID types", () => {
    expect(
      strategy.calculateScore(
        { artistId: 123 },
        { artistId: "artist-1" }
      )
    ).toBe(0);
  });

  test("handles null song objects safely", () => {
    expect(
      strategy.calculateScore(null, null)
    ).toBe(0);
  });
});
