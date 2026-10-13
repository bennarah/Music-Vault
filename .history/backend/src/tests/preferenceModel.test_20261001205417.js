const crypto = require("crypto");
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
    userId = crypto.randomUUID();

    await db.execute(
      `INSERT INTO users (user_id, email, spotify_id)
       VALUES (?, ?, ?)`,
      [userId, testEmail, null]
    );

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
      spotifyUrl: null
    });
  });

  afterAll(async () => {
    if (userId) {
      await db.execute(
        "DELETE FROM user_song_preferences WHERE user_id = ?",
        [userId]
      );
    }

    if (songId) {
      await db.execute(
        "DELETE FROM songs WHERE id = ?",
        [songId]
      );
    }

    if (userId) {
      await db.execute(
        "DELETE FROM users WHERE user_id = ?",
        [userId]
      );
    }

    await db.end();
  });

//   test("creates and retrieves a user song preference", async () => {
//     await createPreference(userId, songId);

//     const preferences = await getPreferencesByUser(userId);

//     expect(preferences.length).toBeGreaterThan(0);
//   });
// });

test("retrieves preferences with song metadata", async () => {
  await createPreference(userId, songId);

  const preferences = await getPreferencesByUser(userId);

  expect(preferences.length).toBeGreaterThan(0);

  const preference = preferences[0];

  expect(preference.id).toBeDefined();
  expect(preference.user_id).toBe(userId);
  expect(preference.song_id).toBe(songId);
  expect(preference.title).toBe("Preference Test Song");
  expect(preference.artist_name).toBe("Test Artist");
});