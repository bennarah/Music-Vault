const GenreSimilarityStrategy = require(
  "../services/strategies/GenreSimilarityStrategy"
);

describe("GenreSimilarityStrategy", () => {
  const strategy = new GenreSimilarityStrategy();

  test("returns 0 for no shared genres", () => {
    expect(
      strategy.calculateScore(
        { genres: ["rock"] },
        { genres: ["jazz"] }
      )
    ).toBe(0);
  });

  test("returns 25 for one shared genre", () => {
    expect(
      strategy.calculateScore(
        { genres: ["rock", "indie"] },
        { genres: ["rock", "pop"] }
      )
    ).toBe(25);
  });

  test("returns 50 for two shared genres", () => {
    expect(
      strategy.calculateScore(
        { genres: ["rock", "indie"] },
        { genres: ["rock", "indie"] }
      )
    ).toBe(50);
  });

  test("caps three shared genres at 50", () => {
    expect(
      strategy.calculateScore(
        { genres: ["rock", "indie", "pop"] },
        { genres: ["rock", "indie", "pop"] }
      )
    ).toBe(50);
  });

  test("does not count duplicate genres multiple times", () => {
    expect(
      strategy.calculateScore(
        { genres: ["rock", "rock"] },
        { genres: ["rock"] }
      )
    ).toBe(25);
  });

  test("handles missing and invalid genre data safely", () => {
    expect(strategy.calculateScore({}, {})).toBe(0);
    expect(strategy.calculateScore(null, null)).toBe(0);
    expect(
      strategy.calculateScore(
        { genres: "rock" },
        { genres: ["rock"] }
      )
    ).toBe(0);
  });
});
