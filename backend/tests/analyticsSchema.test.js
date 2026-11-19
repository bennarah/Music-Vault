const {
  generateRecommendationAnalytics,
} = require("../src/services/analyticsService");

describe("SCRUM-118 - Analytics Aggregation Schema", () => {
  const recommendations = [
    {
      song: {
        spotifyId: "track001",
        artistId: "artist001",
        artistName: "Example Artist",
        genres: ["rock", "indie"],
        albumName: "Example Album",
        durationMs: 210000,
        explicit: false,
      },
      score: 80,
    },
    {
      song: {
        spotifyId: "track002",
        artistId: "artist001",
        artistName: "Example Artist",
        genres: ["rock"],
        albumName: "Example Album",
        durationMs: 190000,
        explicit: true,
      },
      score: 90,
    },
  ];

  test("returns all required top-level analytics fields", () => {
    const result = generateRecommendationAnalytics(recommendations);

    expect(Object.keys(result)).toEqual([
      "success",
      "summary",
      "artistFrequency",
      "genreDistribution",
      "explicitDistribution",
      "durationStatistics",
      "albumFrequency",
      "scoreStatistics",
      "metadataCoverage",
    ]);
  });

  test("returns the documented summary and metadata fields", () => {
    const result = generateRecommendationAnalytics(recommendations);

    expect(result.summary).toEqual({
      totalRecommendations: 2,
      uniqueArtists: 1,
      uniqueGenres: 2,
    });

    expect(result.metadataCoverage).toEqual({
      totalRecommendations: 2,
      artistNamesAvailable: 2,
      genreMetadataAvailable: 2,
      durationMetadataAvailable: 2,
    });
  });

  test("preserves documented artist and genre structures", () => {
    const result = generateRecommendationAnalytics(recommendations);

    expect(result.artistFrequency[0]).toEqual({
      artistId: "artist001",
      artistName: "Example Artist",
      count: 2,
      percentage: 100,
    });

    expect(result.genreDistribution).toEqual({
      songsWithGenres: 2,
      songsWithoutGenres: 0,
      genres: [
        { genre: "rock", count: 2, percentage: 66.67 },
        { genre: "indie", count: 1, percentage: 33.33 },
      ],
    });
  });

  test("preserves duration, score, and explicit-content formats", () => {
    const result = generateRecommendationAnalytics(recommendations);

    expect(result.durationStatistics).toEqual({
      count: 2,
      averageDurationMs: 200000,
      minimumDurationMs: 190000,
      maximumDurationMs: 210000,
    });

    expect(result.scoreStatistics).toEqual({
      count: 2,
      averageScore: 85,
      minimumScore: 80,
      maximumScore: 90,
    });

    expect(result.explicitDistribution).toEqual({
      explicit: { count: 1, percentage: 50 },
      nonExplicit: { count: 1, percentage: 50 },
      unknown: 0,
      knownTotal: 2,
    });
  });

  test("returns the documented empty-data structure", () => {
    const result = generateRecommendationAnalytics([]);

    expect(result.success).toBe(true);
    expect(result.summary).toEqual({
      totalRecommendations: 0,
      uniqueArtists: 0,
      uniqueGenres: 0,
    });

    expect(result.artistFrequency).toEqual([]);
    expect(result.genreDistribution.genres).toEqual([]);
    expect(result.albumFrequency).toEqual([]);

    expect(result.durationStatistics.averageDurationMs).toBeNull();
    expect(result.scoreStatistics.averageScore).toBeNull();

    expect(result.metadataCoverage.totalRecommendations).toBe(0);
  });

  test("rejects non-array input", () => {
    expect(() => generateRecommendationAnalytics(null))
      .toThrow("Recommendations must be an array.");
  });
});
