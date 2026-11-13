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
