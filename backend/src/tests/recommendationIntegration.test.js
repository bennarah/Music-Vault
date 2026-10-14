
const crypto = require("crypto");
const db = require("../../config/db");

const { createSong } = require("../models/songModel");

const {
  createPreference,
  getPreferencesByUser,
  mapPreferenceRowToSong,
} = require("../models/preferenceModel");

const {
  generateRecommendations,
} = require("../services/recommendationService");

describe("Recommendation Database Integration", () => {
  let userId;
  let songId;

  beforeAll(async () => {
    // Create a unique test user
    userId = crypto.randomUUID();

    await db.execute(
      `INSERT INTO users (user_id, email, spotify_id)
       VALUES (?, ?, ?)`,
      [userId, `ci-${userId}@example.com`, null]
    );

    // Create a preferred song in MySQL
    songId = await createSong({
      spotifyId: `preferred-${userId}`,
      title: "Integration Test Song",
      artistId: "artist-001",
      artistName: "Test Artist",
      genres: ["rock", "indie"],
      albumId: null,
      albumName: null,
      albumImageUrl: null,
      durationMs: 200000,
      explicit: false,
      spotifyUrl: null,
    });

    // Link the user to the preferred song
    await createPreference(userId, songId);
  });

  afterAll(async () => {
    try {
      // Delete the preference first
      if (userId) {
        await db.execute(
          `DELETE FROM user_song_preferences
           WHERE user_id = ?`,
          [userId]
        );
      }

      // Then delete the song
      if (songId) {
        await db.execute(
          "DELETE FROM songs WHERE id = ?",
          [songId]
        );
      }

      // Finally delete the user
      if (userId) {
        await db.execute(
          "DELETE FROM users WHERE user_id = ?",
          [userId]
        );
      }
    } finally {
      // Close MySQL connections even if cleanup fails
      await db.end();
    }
  });

  test("generates recommendations from stored preferences", async () => {
    // Step 1: Retrieve real database records
    const rows = await getPreferencesByUser(userId);

    expect(rows).toHaveLength(1);

    // Step 2: Convert MySQL rows to normalized songs
    const preferredSongs = rows.map(mapPreferenceRowToSong);

    expect(preferredSongs).toHaveLength(1);

    expect(preferredSongs[0].spotifyId)
      .toBe(`preferred-${userId}`);

    expect(preferredSongs[0].artistId)
      .toBe("artist-001");

    expect(preferredSongs[0].genres)
      .toEqual(["rock", "indie"]);

    // Step 3: Create known recommendation candidates
    const candidateSongs = [
      {
        spotifyId: "candidate-001",
        title: "Similar Song",
        artistId: "artist-001",
        artistName: "Test Artist",
        genres: ["rock", "indie"],
        durationMs: 205000,
      },
      {
        spotifyId: "candidate-002",
        title: "Different Song",
        artistId: "artist-999",
        artistName: "Other Artist",
        genres: ["jazz"],
        durationMs: 400000,
      },
    ];

    // Step 4: Run recommendation algorithm
    const recommendations = generateRecommendations(
      preferredSongs,
      candidateSongs
    );

    // Step 5: Verify the expected recommendation
    expect(recommendations).toHaveLength(1);

    expect(recommendations[0].song.spotifyId)
      .toBe("candidate-001");

    // Same artist: 40
    // Two shared genres: 50
    // Duration within 30 seconds: 10
    // Total: 100
    expect(recommendations[0].score).toBe(100);
  });
});
