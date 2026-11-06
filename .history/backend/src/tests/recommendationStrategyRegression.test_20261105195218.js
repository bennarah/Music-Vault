
const ArtistSimilarityStrategy = require(
  "../services/strategies/ArtistSimilarityStrategy"
);

describe("Recommendation Strategy Regression", () => {
  const artistStrategy = new ArtistSimilarityStrategy();

  test("matching artist IDs contribute 40 points", () => {
    const preferred = { artistId: "artist-1" };
    const candidate = { artistId: "artist-1" };

    expect(
      artistStrategy.calculateScore(preferred, candidate)
    ).toBe(40);
  });

  test("different artist IDs contribute zero points", () => {
    const preferred = { artistId: "artist-1" };
    const candidate = { artistId: "artist-2" };

    expect(
      artistStrategy.calculateScore(preferred, candidate)
    ).toBe(0);
  });

  test.each([
    [null, "artist-1"],
    [undefined, "artist-1"],
    ["", "artist-1"],
    ["   ", "artist-1"],
    [123, "artist-1"],
    ["artist-1", null],
    ["artist-1", undefined],
    ["artist-1", ""],
  ])(
    "invalid artist IDs (%s, %s) contribute zero points",
    (preferredId, candidateId) => {
      expect(
        artistStrategy.calculateScore(
          { artistId: preferredId },
          { artistId: candidateId }
        )
      ).toBe(0);
    }
  );

  test("missing song objects do not crash artist scoring", () => {
    expect(
      artistStrategy.calculateScore(null, undefined)
    ).toBe(0);
  });
});
