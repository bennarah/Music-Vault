const AttributeSimilarityStrategy = require(
  "../services/strategies/AttributeSimilarityStrategy"
);

describe("AttributeSimilarityStrategy", () => {
  const strategy = new AttributeSimilarityStrategy();

  test("returns 10 for identical durations", () => {
    expect(
      strategy.calculateScore(
        { durationMs: 200000 },
        { durationMs: 200000 }
      )
    ).toBe(10);
  });

  test("returns 10 for exactly 30 seconds difference", () => {
    expect(
      strategy.calculateScore(
        { durationMs: 200000 },
        { durationMs: 230000 }
      )
    ).toBe(10);
  });

  test("returns 5 for 30001 milliseconds difference", () => {
    expect(
      strategy.calculateScore(
        { durationMs: 200000 },
        { durationMs: 230001 }
      )
    ).toBe(5);
  });

  test("returns 5 for exactly 60 seconds difference", () => {
    expect(
      strategy.calculateScore(
        { durationMs: 200000 },
        { durationMs: 260000 }
      )
    ).toBe(5);
  });

  test("returns 0 for more than 60 seconds difference", () => {
    expect(
      strategy.calculateScore(
        { durationMs: 200000 },
        { durationMs: 260001 }
      )
    ).toBe(0);
  });

  test("returns 0 for missing or null durations", () => {
    expect(strategy.calculateScore({}, {})).toBe(0);
    expect(strategy.calculateScore(null, null)).toBe(0);
    expect(
      strategy.calculateScore(
        { durationMs: null },
        { durationMs: 200000 }
      )
    ).toBe(0);
  });

  test("returns 0 for invalid duration types", () => {
    expect(
      strategy.calculateScore(
        { durationMs: "200000" },
        { durationMs: 200000 }
      )
    ).toBe(0);
  });

  test("returns 0 for negative or non-finite durations", () => {
    expect(
      strategy.calculateScore(
        { durationMs: -100 },
        { durationMs: 200000 }
      )
    ).toBe(0);

    expect(
      strategy.calculateScore(
        { durationMs: Infinity },
        { durationMs: 200000 }
      )
    ).toBe(0);

    expect(
      strategy.calculateScore(
        { durationMs: NaN },
        { durationMs: 200000 }
      )
    ).toBe(0);
  });
});
