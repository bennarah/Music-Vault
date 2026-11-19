const {
  calculateExplicitDistribution,
  calculateDurationStatistics,
  calculateAlbumFrequency,
  calculateScoreStatistics,
  generateRecommendationAnalytics,
} = require("../src/services/analyticsService");

describe("SCRUM-127 - Additional Attribute Aggregation", () => {
  test("groups album names regardless of capitalization and whitespace", () => {
    const result = calculateAlbumFrequency([
      { song: { albumName: " Night Lights " } },
      { song: { albumName: "night lights" } },
      { song: { albumName: "Other Album" } },
    ]);

    expect(result).toEqual([
      { albumName: "Night Lights", count: 2, percentage: 66.67 },
      { albumName: "Other Album", count: 1, percentage: 33.33 },
    ]);
  });

  test("sorts albums alphabetically when counts are tied", () => {
    const result = calculateAlbumFrequency([
      { song: { albumName: "Zebra Album" } },
      { song: { albumName: "alpha album" } },
      { song: { albumName: "Middle Album" } },
    ]);

    expect(result.map((album) => album.albumName)).toEqual([
      "alpha album",
      "Middle Album",
      "Zebra Album",
    ]);
  });

  test("ignores missing album metadata", () => {
    const result = calculateAlbumFrequency([
      { song: { albumName: null } },
      { song: { albumName: " " } },
      { song: { albumName: 123 } },
      { song: { albumName: "Valid Album" } },
    ]);

    expect(result).toEqual([
      { albumName: "Valid Album", count: 1, percentage: 100 },
    ]);
  });

  test("calculates explicit percentages excluding unknown values", () => {
    const result = calculateExplicitDistribution([
      { song: { explicit: true } },
      { song: { explicit: false } },
      { song: { explicit: null } },
    ]);

    expect(result).toEqual({
      explicit: { count: 1, percentage: 50 },
      nonExplicit: { count: 1, percentage: 50 },
      unknown: 1,
      knownTotal: 2,
    });
  });

  test("handles entirely unknown explicit metadata", () => {
    const result = calculateExplicitDistribution([
      { song: { explicit: null } },
      { song: {} },
    ]);

    expect(result.explicit.percentage).toBe(0);
    expect(result.nonExplicit.percentage).toBe(0);
    expect(result.unknown).toBe(2);
    expect(result.knownTotal).toBe(0);
  });

  test("ignores invalid durations and calculates valid statistics", () => {
    const result = calculateDurationStatistics([
      { song: { durationMs: 180000 } },
      { song: { durationMs: 210000 } },
      { song: { durationMs: null } },
      { song: { durationMs: -1 } },
      { song: { durationMs: Infinity } },
    ]);

    expect(result).toEqual({
      count: 2,
      averageDurationMs: 195000,
      minimumDurationMs: 180000,
      maximumDurationMs: 210000,
    });
  });

  test("returns null duration statistics when no valid durations exist", () => {
    expect(calculateDurationStatistics([
      { song: { durationMs: null } },
    ])).toEqual({
      count: 0,
      averageDurationMs: null,
      minimumDurationMs: null,
      maximumDurationMs: null,
    });
  });

  test("calculates similarity score statistics from finite numbers", () => {
    const result = calculateScoreStatistics([
      { song: {}, score: 60 },
      { song: {}, score: 90 },
      { song: {}, score: null },
      { song: {}, score: Infinity },
    ]);

    expect(result).toEqual({
      count: 2,
      averageScore: 75,
      minimumScore: 60,
      maximumScore: 90,
    });
  });

  test("returns null score statistics for empty data", () => {
    expect(calculateScoreStatistics([])).toEqual({
      count: 0,
      averageScore: null,
      minimumScore: null,
      maximumScore: null,
    });
  });

  test("reports metadata coverage consistently", () => {
    const result = generateRecommendationAnalytics([
      {
        song: {
          artistName: "Example Artist",
          genres: ["rock"],
          durationMs: 200000,
        },
        score: 80,
      },
      {
        song: {
          artistName: "",
          genres: [],
          durationMs: null,
        },
        score: 60,
      },
    ]);

    expect(result.metadataCoverage).toEqual({
      totalRecommendations: 2,
      artistNamesAvailable: 1,
      genreMetadataAvailable: 1,
      durationMetadataAvailable: 1,
    });
  });
});
