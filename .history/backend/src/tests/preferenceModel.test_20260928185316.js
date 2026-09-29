const db = require("../../config/db");

const {
  createSong
} = require("../models/songModel");

const {
  createPreference,
  getPreferencesByUser,
  deletePreference,
} = require("../models/preferenceModel");

describe("Preference Model", () => {
  let userId;
  let songId;

  const testEmail = "ci-preference-test@example.com";
  const testSpotifyId = "ci-preference-song-001";

  beforeAll(async () => {
    const [userResult] = await db.execute(
      "INSERT INTO users (email) VALUES (?)",
      [testEmail]
    );

    userId = userResult.insertId;

    songId = await createSong({
      spotifyId: testSpotifyId,
      title: "Preference Test Song",
      artistId: "test-artist",
      artistName: "Test Artist",
      genres: ["rock"],
      albumId: null,
      albumName: null,
      albumImageUrl: null,
      durationMs: 200000,
      explicit: false,
      spotifyUrl: null,
    });
  });

  afterAll(async () => {
    await db.execute(
      "DELETE FROM user_song_preferences WHERE user_id = ?",
      [userId]
    );

    await db.execute(
      "DELETE FROM songs WHERE id = ?",
      [songId]
    );

    await db.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    await db.end();
  });

  test("creates and retrieves a user song preference", async () => {
    await createPreference(userId, songId);

    const preferences = await getPreferencesByUser(userId);

    expect(preferences.length).toBeGreaterThan(0);
    expect(preferences[0].title).toBe("Preference Test Song");
  });
});