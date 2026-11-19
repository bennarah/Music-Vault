const {
  calculateArtistFrequency,
} = require("../src/services/analyticsService");

describe("SCRUM-124 - Artist Frequency Aggregation", () => {
  test("groups songs by Spotify artist ID", () => {
    const result = calculateArtistFrequency([
      { song: { artistId: "artist-001", artistName: "Example Artist" } },
      { song: { artistId: "artist-001", artistName: "EXAMPLE ARTIST" } },
      { song: { artistId: "artist-002", artistName: "Other Artist" } },
    ]);

    expect(result).toEqual([
      {
        artistId: "artist-001",
        artistName: "Example Artist",
        count: 2,
        percentage: 66.67,
      },
      {
        artistId: "artist-002",
        artistName: "Other Artist",
        count: 1,
        percentage: 33.33,
      },
    ]);
  });

  test("groups missing artist IDs by normalized names", () => {
    const result = calculateArtistFrequency([
      { song: { artistName: " Example Artist " } },
      { song: { artistName: "example artist" } },
    ]);

    expect(result).toEqual([
      {
        artistId: null,
        artistName: "Example Artist",
        count: 2,
        percentage: 100,
      },
    ]);
  });

  test("sorts artists alphabetically when counts are tied", () => {
    const result = calculateArtistFrequency([
      { song: { artistName: "Zebra Artist" } },
      { song: { artistName: "alpha artist" } },
      { song: { artistName: "Middle Artist" } },
    ]);

    expect(result.map((artist) => artist.artistName)).toEqual([
      "alpha artist",
      "Middle Artist",
      "Zebra Artist",
    ]);
  });

  test("calculates percentages using valid artist assignments", () => {
    const result = calculateArtistFrequency([
      { song: { artistName: "Artist One" } },
      { song: { artistName: "Artist One" } },
      { song: { artistName: "Artist Two" } },
      { song: { artistName: "" } },
    ]);

    expect(result[0].count).toBe(2);
    expect(result[0].percentage).toBe(66.67);
    expect(result[1].count).toBe(1);
    expect(result[1].percentage).toBe(33.33);
  });

  test("ignores missing and invalid artist metadata", () => {
    const result = calculateArtistFrequency([
      { song: { artistName: null } },
      { song: { artistName: " " } },
      { song: { artistName: 123 } },
      { song: { artistName: "Valid Artist" } },
      null,
      {},
    ]);

    expect(result).toEqual([
      {
        artistId: null,
        artistName: "Valid Artist",
        count: 1,
        percentage: 100,
      },
    ]);
  });

  test("returns an empty array for no recommendations", () => {
    expect(calculateArtistFrequency([])).toEqual([]);
  });

  test("rejects non-array recommendation input", () => {
    expect(() => calculateArtistFrequency(null))
      .toThrow("Recommendations must be an array.");
  });
});
