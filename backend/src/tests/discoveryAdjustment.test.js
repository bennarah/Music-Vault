const {
  calculateDiscoveryBonus,
  evaluateDiscoveryAdjustment,
} = require("../services/discoveryAdjustment");

describe("Discovery Adjustment Evaluation", () => {
  test("gives maximum bonus to popularity 0", () => {
    expect(calculateDiscoveryBonus(0)).toBe(5);
  });

  test("gives no bonus to popularity 100", () => {
    expect(calculateDiscoveryBonus(100)).toBe(0);
  });

  test("gives larger bonuses to less-popular songs", () => {
    expect(calculateDiscoveryBonus(20)).toBeGreaterThan(
      calculateDiscoveryBonus(80)
    );
  });

  test("returns zero bonus for missing or invalid popularity", () => {
    expect(calculateDiscoveryBonus(null)).toBe(0);
    expect(calculateDiscoveryBonus("20")).toBe(0);
    expect(calculateDiscoveryBonus(-1)).toBe(0);
    expect(calculateDiscoveryBonus(101)).toBe(0);
    expect(calculateDiscoveryBonus(NaN)).toBe(0);
  });

  test("preserves original similarity scores", () => {
    const results = evaluateDiscoveryAdjustment([
      { song: { spotifyId: "a", popularity: 20 }, score: 85 },
    ]);

    expect(results[0].score).toBe(85);
    expect(results[0].adjustedScore).toBe(89);
  });

  test("prioritizes less-popular songs with equal similarity", () => {
    const results = evaluateDiscoveryAdjustment([
      { song: { spotifyId: "popular", popularity: 90 }, score: 85 },
      { song: { spotifyId: "hidden", popularity: 20 }, score: 85 },
    ]);

    expect(results[0].song.spotifyId).toBe("hidden");
  });

  test("leaves missing popularity without a bonus", () => {
    const results = evaluateDiscoveryAdjustment([
      { song: { spotifyId: "a" }, score: 75 },
    ]);

    expect(results[0].discoveryBonus).toBe(0);
    expect(results[0].adjustedScore).toBe(75);
  });

  test("handles invalid recommendation input safely", () => {
    expect(evaluateDiscoveryAdjustment(null)).toEqual([]);
    expect(evaluateDiscoveryAdjustment([])).toEqual([]);
  });

  test("filters recommendations with invalid similarity scores", () => {
    const results = evaluateDiscoveryAdjustment([
      { song: { spotifyId: "invalid", popularity: 10 }, score: NaN },
      { song: { spotifyId: "valid", popularity: 20 }, score: 80 },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].song.spotifyId).toBe("valid");
  });

  test("keeps the original input unchanged", () => {
    const input = [
      { song: { spotifyId: "a", popularity: 20 }, score: 85 },
    ];

    evaluateDiscoveryAdjustment(input);

    expect(input[0].score).toBe(85);
    expect(input[0].adjustedScore).toBeUndefined();
  });
});
