const {
  generateRecommendationCsv,
  CSV_HEADERS,
} = require("../src/services/recommendationCsvService");

describe("SCRUM-108 Recommendation CSV Generation", () => {
  test("S5-DATA-01: generates correct headers and two recommendation rows", () => {
    const recommendations = [
      {
        song: {
          spotifyId: "track001",
          title: "Midnight Drive",
          artistName: "The Echo Lines",
          genres: ["alternative", "indie rock"],
          albumName: "Night Lights",
          durationMs: 210000,
          spotifyUrl: "https://open.spotify.com/track/track001",
        },
        score: 95,
      },
      {
        song: {
          spotifyId: "track002",
          title: "Paper Satellites",
          artistName: "Northbound",
          genres: ["indie rock"],
          albumName: "Northern Skies",
          durationMs: 195000,
          spotifyUrl: "https://open.spotify.com/track/track002",
        },
        score: 80,
      },
    ];

    const csv = generateRecommendationCsv(recommendations);
    const lines = csv.trimEnd().split("\r\n");

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(CSV_HEADERS.join(","));

    expect(lines[1]).toBe(
      "Midnight Drive,The Echo Lines,alternative; indie rock,Night Lights,210000,95,track001,https://open.spotify.com/track/track001"
    );

    expect(lines[2]).toBe(
      "Paper Satellites,Northbound,indie rock,Northern Skies,195000,80,track002,https://open.spotify.com/track/track002"
    );
  });
});

describe("SCRUM-111 CSV Special Characters and Missing Metadata", () => {
  test("S5-DATA-02: escapes commas, quotes, and newlines", () => {
    const recommendations = [
      {
        song: {
          spotifyId: "track-special",
          title: 'Hello, "World"',
          artistName: "Artist\nFeaturing Guest",
          genres: ["pop", "indie"],
          albumName: 'The "Best" Album',
          durationMs: 200000,
          spotifyUrl: "https://example.com/song",
        },
        score: 90,
      },
    ];

    const csv = generateRecommendationCsv(recommendations);

    const expectedRow = [
      '"Hello, ""World"""',
      '"Artist\nFeaturing Guest"',
      "pop; indie",
      '"The ""Best"" Album"',
      "200000",
      "90",
      "track-special",
      "https://example.com/song",
    ].join(",");

    expect(csv).toBe(
      CSV_HEADERS.join(",") + "\r\n" +
      expectedRow + "\r\n"
    );
  });

  test("S5-DATA-04: handles missing optional metadata", () => {
    const recommendations = [
      {
        song: {
          spotifyId: "track-missing",
          title: "Unknown Journey",
          artistName: "Example Artist",
          genres: [],
          albumName: null,
          durationMs: null,
          spotifyUrl: null,
        },
        score: null,
      },
    ];

    const csv = generateRecommendationCsv(recommendations);
    const lines = csv.trimEnd().split("\r\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(CSV_HEADERS.join(","));
    expect(lines[1]).toBe(
      "Unknown Journey,Example Artist,,,,,track-missing,"
    );
  });

  test("handles invalid similarity scores", () => {
    const recommendations = [
      {
        song: {
          title: "Invalid Score Song",
          artistName: "Test Artist",
          genres: ["rock"],
        },
        score: 150,
      },
    ];

    const csv = generateRecommendationCsv(recommendations);

    expect(csv).toContain(
      "Invalid Score Song,Test Artist,rock,,,,,"
    );
    expect(csv).not.toContain(",150,");
  });

  test("handles missing song metadata object", () => {
    const recommendations = [
      {
        score: 50,
      },
    ];

    const csv = generateRecommendationCsv(recommendations);
    const lines = csv.trimEnd().split("\r\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(CSV_HEADERS.join(","));
    expect(lines[1]).toBe(",,,,,50,,");
  });
});
