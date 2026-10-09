const {
  calculateSimilarity,
  generateRecommendations,
  removeDuplicateSongs,
} = require("../services/recommendationService");

describe("Recommendation Service", () => {
  const preferredSong = {
    spotifyId: "preferred-1",
    title: "Preferred Song",
    artistId: "artist-1",
    artistName: "Artist One",
    genres: ["rock", "indie rock"],
    durationMs: 200000,
  };

  test("gives points for the same artist", () => {
    const candidateSong = {
      spotifyId: "candidate-1",
      title: "Candidate Song",
      artistId: "artist-1",
      artistName: "Artist One",
      genres: [],
      durationMs: 400000,
    };

    const score = calculateSimilarity(preferredSong, candidateSong);

    expect(score).toBeGreaterThanOrEqual(40);
  });

  test("gives points for shared genres", () => {
    const candidateSong = {
      spotifyId: "candidate-2",
      title: "Candidate Song",
      artistId: "artist-2",
      artistName: "Artist Two",
      genres: ["rock"],
      durationMs: 400000,
    };

    const score = calculateSimilarity(preferredSong, candidateSong);

    expect(score).toBeGreaterThanOrEqual(25);
  });

  test("gives additional points for similar duration", () => {
    const candidateSong = {
      spotifyId: "candidate-3",
      title: "Candidate Song",
      artistId: "artist-2",
      artistName: "Artist Two",
      genres: [],
      durationMs: 220000,
    };

    const score = calculateSimilarity(preferredSong, candidateSong);

    expect(score).toBe(10);
  });

  test("returns zero when songs have no similarity", () => {
    const candidateSong = {
      spotifyId: "candidate-4",
      title: "Unrelated Song",
      artistId: "artist-99",
      artistName: "Different Artist",
      genres: ["classical"],
      durationMs: 500000,
    };

    const score = calculateSimilarity(preferredSong, candidateSong);

    expect(score).toBe(0);
  });

  test("sorts recommendations from highest score to lowest", () => {
    const candidateSongs = [
      {
        spotifyId: "candidate-low",
        title: "Low Match",
        artistId: "artist-2",
        artistName: "Artist Two",
        genres: ["rock"],
        durationMs: 400000,
      },
      {
        spotifyId: "candidate-high",
        title: "High Match",
        artistId: "artist-1",
        artistName: "Artist One",
        genres: ["rock", "indie rock"],
        durationMs: 205000,
      },
    ];

    const recommendations = generateRecommendations(
      [preferredSong],
      candidateSongs
    );

    expect(recommendations.length).toBe(2);
    expect(recommendations[0].song.spotifyId).toBe("candidate-high");
    expect(recommendations[0].score)
      .toBeGreaterThan(recommendations[1].score);
  });

  test("returns an empty array when there are no preferred songs", () => {
    const recommendations = generateRecommendations(
      [],
      [
        {
          spotifyId: "candidate-1",
          title: "Candidate",
          artistId: "artist-1",
          artistName: "Artist One",
          genres: ["rock"],
          durationMs: 200000,
        },
      ]
    );

    expect(recommendations).toEqual([]);
  });

  test("returns an empty array when there are no candidate songs", () => {
    const recommendations = generateRecommendations(
      [preferredSong],
      []
    );

    expect(recommendations).toEqual([]);
  });

  test("scores candidates against multiple preferred songs", () => {
  const preferredSongs = [
    {
      spotifyId: "preferred-1",
      artistId: "artist-1",
      genres: ["rock"],
      durationMs: 200000,
    },
    {
      spotifyId: "preferred-2",
      artistId: "artist-2",
      genres: ["indie"],
      durationMs: 180000,
    },
  ];

  const candidateSongs = [
    {
      spotifyId: "candidate-1",
      title: "Candidate One",
      artistId: "artist-1",
      artistName: "Artist One",
      genres: ["rock"],
      durationMs: 200000,
    },
    {
      spotifyId: "candidate-2",
      title: "Candidate Two",
      artistId: "artist-2",
      artistName: "Artist Two",
      genres: ["indie"],
      durationMs: 180000,
    },
  ];

  const results = generateRecommendations(
    preferredSongs,
    candidateSongs
  );

  expect(results.length).toBeGreaterThan(0);
});
  test("does not recommend a song already in user preferences", () => {
    const preferredSong = {
      spotifyId: "song-1",
      title: "Already Liked Song",
      artistId: "artist-1",
      artistName: "Artist One",
      genres: ["rock"],
      durationMs: 200000,
    };

    const newSong = {
      spotifyId: "song-2",
      title: "New Song",
      artistId: "artist-1",
      artistName: "Artist One",
      genres: ["rock"],
      durationMs: 205000,
    };

    const recommendations = generateRecommendations(
      [preferredSong],
      [preferredSong, newSong]
    );

    expect(
      recommendations.some(
        (result) =>
          result.song.spotifyId === preferredSong.spotifyId
      )
    ).toBe(false);

    expect(
      recommendations.some(
        (result) =>
          result.song.spotifyId === newSong.spotifyId
      )
    ).toBe(true);
  });
  test("removes duplicate songs by Spotify ID", () => {
    const songs = [
      { spotifyId: "song-1", title: "Song A" },
      { spotifyId: "song-2", title: "Song B" },
      { spotifyId: "song-1", title: "Song A" }
    ];

    const result = removeDuplicateSongs(songs);

    expect(result).toHaveLength(2);
    expect(result.map((song) => song.spotifyId))
      .toEqual(["song-1", "song-2"]);
  });
  test("removes candidates with invalid Spotify IDs", () => {
    const songs = [
      { spotifyId: null, title: "Unknown Song" },
      { spotifyId: "", title: "Missing ID" },
      { spotifyId: "song-1", title: "Valid Song" }
    ];

    const result = removeDuplicateSongs(songs);

    expect(result).toHaveLength(1);
    expect(result[0].spotifyId).toBe("song-1");
  });
});