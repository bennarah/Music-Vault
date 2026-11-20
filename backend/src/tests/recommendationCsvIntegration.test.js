
const {
  generateRecommendations,
} = require("../services/recommendationService");

const {
  generateRecommendationCsv,
  CSV_HEADERS,
} = require("../services/recommendationCsvService");

describe("Recommendation to CSV Integration", () => {
  const preferredSong = {
    spotifyId: "preferred-001",
    title: "Test Rock Song",
    artistId: "artist-001",
    artistName: "Example Artist",
    genres: ["rock"],
    durationMs: 200000,
  };

  const candidateSongs = [
    {
      spotifyId: "candidate-001",
      title: "Another Rock Song",
      artistId: "artist-001",
      artistName: "Example Artist",
      genres: ["rock"],
      albumName: "Rock Album",
      durationMs: 205000,
      spotifyUrl: "https://example.com/track1",
    },
    {
      spotifyId: "candidate-002",
      title: "Rock Discovery",
      artistId: "artist-002",
      artistName: "Another Artist",
      genres: ["rock"],
      albumName: "Discovery Album",
      durationMs: 250000,
      spotifyUrl: "https://example.com/track2",
    },
    {
      spotifyId: "candidate-003",
      title: "Unrelated Song",
      artistId: "artist-003",
      artistName: "Different Artist",
      genres: ["jazz"],
      durationMs: 400000,
    },
    preferredSong,
  ];

  test("exports actual generated recommendations in ranked order", () => {
    const recommendations = generateRecommendations(
      [preferredSong],
      candidateSongs
    );

    expect(recommendations).toHaveLength(2);

    expect(
      recommendations.map((result) => result.score)
    ).toEqual([75, 30]);

    const csv = generateRecommendationCsv(recommendations);
    const lines = csv.trimEnd().split("\r\n");

    expect(lines[0]).toBe(CSV_HEADERS.join(","));
    expect(lines).toHaveLength(3);

    expect(lines[1]).toContain("Another Rock Song");
    expect(lines[1]).toContain("candidate-001");
    expect(lines[1]).toContain(",75,");

    expect(lines[2]).toContain("Rock Discovery");
    expect(lines[2]).toContain("candidate-002");
    expect(lines[2]).toContain(",30,");
  });

  test("does not export songs already selected by the user", () => {
    const recommendations = generateRecommendations(
      [preferredSong],
      candidateSongs
    );

    const csv = generateRecommendationCsv(recommendations);

    expect(csv).not.toContain("preferred-001");
    expect(csv).not.toContain("Test Rock Song");
  });

  test("does not export zero-similarity recommendations", () => {
    const recommendations = generateRecommendations(
      [preferredSong],
      candidateSongs
    );

    const csv = generateRecommendationCsv(recommendations);

    expect(csv).not.toContain("candidate-003");
    expect(csv).not.toContain("Unrelated Song");
  });

  test("exports duplicate candidate songs only once", () => {
    const recommendations = generateRecommendations(
      [preferredSong],
      [
        candidateSongs[0],
        candidateSongs[0],
        candidateSongs[1],
      ]
    );

    const csv = generateRecommendationCsv(recommendations);
    const lines = csv.trimEnd().split("\r\n");

    expect(recommendations).toHaveLength(2);
    expect(lines).toHaveLength(3);
  });

  test("exports headers only when no recommendations are generated", () => {
    const recommendations = generateRecommendations(
      [preferredSong],
      []
    );

    const csv = generateRecommendationCsv(recommendations);

    expect(recommendations).toEqual([]);
    expect(csv).toBe(CSV_HEADERS.join(",") + "\r\n");
  });

  test("does not modify recommendation results during CSV generation", () => {
    const recommendations = generateRecommendations(
      [preferredSong],
      candidateSongs
    );

    const original = structuredClone(recommendations);

    generateRecommendationCsv(recommendations);

    expect(recommendations).toEqual(original);
  });
});
