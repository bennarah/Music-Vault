const {
  generateRecommendationCsv,
  CSV_HEADERS,
} = require("../src/services/recommendationCsvService");

const {
  generateRecommendationAnalytics,
} = require("../src/services/analyticsService");

describe("SCRUM-130 - CSV and Analytics Integration", () => {
  const recommendations = [
    {
      song: {
        spotifyId: "track001",
        title: "Midnight Drive",
        artistId: "artist001",
        artistName: "Northbound",
        genres: ["rock", "indie"],
        albumName: "Night Lights",
        durationMs: 200000,
        explicit: false,
        spotifyUrl: "https://example.com/track001",
      },
      score: 90,
    },
    {
      song: {
        spotifyId: "track002",
        title: "Paper Satellites",
        artistId: "artist001",
        artistName: "Northbound",
        genres: ["rock"],
        albumName: "Night Lights",
        durationMs: 220000,
        explicit: true,
        spotifyUrl: "https://example.com/track002",
      },
      score: 80,
    },
    {
      song: {
        spotifyId: "track003",
        title: "Golden Hour",
        artistId: "artist002",
        artistName: "Velvet Static",
        genres: ["pop"],
        albumName: "Golden Skies",
        durationMs: 180000,
        explicit: false,
        spotifyUrl: "https://example.com/track003",
      },
      score: 70,
    },
  ];

  test("CSV rows match the analytics recommendation count", () => {
    const csv = generateRecommendationCsv(recommendations);
    const analytics = generateRecommendationAnalytics(recommendations);

    const lines = csv.trimEnd().split("\r\n");

    expect(lines[0]).toBe(CSV_HEADERS.join(","));
    expect(lines.length - 1).toBe(
      analytics.summary.totalRecommendations
    );
    expect(lines.length - 1).toBe(3);
  });

  test("CSV similarity scores agree with analytics statistics", () => {
    const csv = generateRecommendationCsv(recommendations);
    const analytics = generateRecommendationAnalytics(recommendations);

    const lines = csv.trimEnd().split("\r\n").slice(1);
    const scoreIndex = CSV_HEADERS.indexOf("similarity_score");

    const scores = lines.map((line) =>
      Number(line.split(",")[scoreIndex])
    );

    expect(scores).toEqual([90, 80, 70]);
    expect(analytics.scoreStatistics).toEqual({
      count: 3,
      averageScore: 80,
      minimumScore: 70,
      maximumScore: 90,
    });
  });

  test("CSV artist data agrees with artist frequency analytics", () => {
    const csv = generateRecommendationCsv(recommendations);
    const analytics = generateRecommendationAnalytics(recommendations);

    expect(csv).toContain("Northbound");
    expect(csv).toContain("Velvet Static");

    expect(analytics.artistFrequency).toEqual([
      {
        artistId: "artist001",
        artistName: "Northbound",
        count: 2,
        percentage: 66.67,
      },
      {
        artistId: "artist002",
        artistName: "Velvet Static",
        count: 1,
        percentage: 33.33,
      },
    ]);
  });

  test("CSV genre data agrees with genre distribution analytics", () => {
    const csv = generateRecommendationCsv(recommendations);
    const analytics = generateRecommendationAnalytics(recommendations);

    expect(csv).toContain("rock; indie");

    expect(analytics.genreDistribution).toEqual({
      songsWithGenres: 3,
      songsWithoutGenres: 0,
      genres: [
        { genre: "rock", count: 2, percentage: 50 },
        { genre: "indie", count: 1, percentage: 25 },
        { genre: "pop", count: 1, percentage: 25 },
      ],
    });
  });

  test("empty datasets produce consistent zero-result outputs", () => {
    const csv = generateRecommendationCsv([]);
    const analytics = generateRecommendationAnalytics([]);

    expect(csv).toBe(CSV_HEADERS.join(",") + "\r\n");
    expect(analytics.summary.totalRecommendations).toBe(0);
    expect(analytics.artistFrequency).toEqual([]);
    expect(analytics.genreDistribution.genres).toEqual([]);
    expect(analytics.scoreStatistics.averageScore).toBeNull();
  });

  test("missing metadata is handled by both services", () => {
    const incomplete = [
      {
        song: {
          spotifyId: "track-missing",
          title: "Unknown Journey",
          artistName: "Example Artist",
          genres: [],
          albumName: null,
          durationMs: null,
        },
        score: null,
      },
    ];

    const csv = generateRecommendationCsv(incomplete);
    const analytics = generateRecommendationAnalytics(incomplete);

    expect(csv).toContain(
      "Unknown Journey,Example Artist,,,,,track-missing,"
    );

    expect(analytics.summary.totalRecommendations).toBe(1);
    expect(analytics.genreDistribution.songsWithoutGenres).toBe(1);
    expect(analytics.durationStatistics.count).toBe(0);
    expect(analytics.scoreStatistics.count).toBe(0);
  });

  test("both services reject non-array input", () => {
    expect(() => generateRecommendationCsv(null))
      .toThrow("Recommendations must be an array.");

    expect(() => generateRecommendationAnalytics(null))
      .toThrow("Recommendations must be an array.");
  });

  test("neither service mutates the recommendation dataset", () => {
    const original = structuredClone(recommendations);

    generateRecommendationCsv(recommendations);
    generateRecommendationAnalytics(recommendations);

    expect(recommendations).toEqual(original);
  });
});
