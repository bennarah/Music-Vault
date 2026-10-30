const SongSimilarityStrategy = require(
  "../services/strategies/SongSimilarityStrategy"
);

describe("SongSimilarityStrategy Interface", () => {
  test("throws when calculateScore is not implemented", () => {
    const strategy = new SongSimilarityStrategy();

    expect(() =>
      strategy.calculateScore({}, {})
    ).toThrow(
      "Similarity strategies must implement calculateScore()."
    );
  });

  test("allows a concrete strategy to override calculateScore", () => {
    class TestStrategy extends SongSimilarityStrategy {
      calculateScore(preferredSong, candidateSong) {
        return preferredSong.artistId === candidateSong.artistId
          ? 40
          : 0;
      }
    }

    const strategy = new TestStrategy();

    expect(
      strategy.calculateScore(
        { artistId: "artist-1" },
        { artistId: "artist-1" }
      )
    ).toBe(40);

    expect(
      strategy.calculateScore(
        { artistId: "artist-1" },
        { artistId: "artist-2" }
      )
    ).toBe(0);
  });

  test("supports the agreed 0-100 scoring convention", () => {
    class PerfectMatchStrategy extends SongSimilarityStrategy {
      calculateScore() {
        return 100;
      }
    }

    const strategy = new PerfectMatchStrategy();
    const score = strategy.calculateScore({}, {});

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
