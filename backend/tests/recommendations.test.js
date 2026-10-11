
const crypto = require("crypto");
const request = require("supertest");

const app = require("../src/app");
const db = require("../config/db");
const { createSong } = require("../src/models/songModel");

// These tests exercise the real Express recommendation endpoint
// against the MySQL-backed Music Vault persistence layer.
describe("Recommendation API - Database Integration", () => {
  const runId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const emptyUserId = crypto.randomUUID();

  const createdSongIds = [];

  async function createTestSong(name, artistId, genres, durationMs) {
    const spotifyId = `${name}-${runId}`;

    const songId = await createSong({
      spotifyId,
      title: `${name} Song`,
      artistId,
      artistName: `${name} Artist`,
      genres,
      albumId: null,
      albumName: null,
      albumImageUrl: null,
      durationMs,
      explicit: false,
      spotifyUrl: null,
    });

    createdSongIds.push(songId);

    return { id: songId, spotifyId };
  }

  beforeAll(async () => {
    await db.execute(
      `INSERT INTO users (user_id, email, spotify_id)
       VALUES (?, ?, ?)`,
      [userId, `recommendation-${runId}@example.com`, null]
    );

    await db.execute(
      `INSERT INTO users (user_id, email, spotify_id)
       VALUES (?, ?, ?)`,
      [emptyUserId, `empty-recommendation-${runId}@example.com`, null]
    );

    const preferred = await createTestSong(
      "preferred",
      "artist-1",
      ["rock", "indie"],
      200000
    );

    await db.execute(
      `INSERT INTO user_song_preferences (user_id, song_id)
       VALUES (?, ?)`,
      [userId, preferred.id]
    );

    await createTestSong(
      "high-match",
      "artist-1",
      ["rock", "indie"],
      205000
    );

    await createTestSong(
      "low-match",
      "artist-2",
      ["rock"],
      400000
    );
  });

  afterAll(async () => {
    // Clean up in foreign-key-safe order.
    // Cleanup is attempted even if setup failed partway through.
    try {
      await db.execute(
        "DELETE FROM user_song_preferences WHERE user_id IN (?, ?)",
        [userId, emptyUserId]
      );

      if (createdSongIds.length > 0) {
        const placeholders = createdSongIds
          .map(() => "?")
          .join(", ");

        await db.execute(
          `DELETE FROM songs WHERE id IN (${placeholders})`,
          createdSongIds
        );
      }

      await db.execute(
        "DELETE FROM users WHERE user_id IN (?, ?)",
        [userId, emptyUserId]
      );
    } catch (error) {
      // Avoid hiding the original setup error if MySQL is unavailable.
      console.error("Recommendation test cleanup failed:", error.message);
    }
  });

  test("returns ranked recommendations with 0-100 similarity scores", async () => {
    const response = await request(app)
      .get(`/api/recommendations/${userId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.recommendations)).toBe(true);

    const results = response.body.recommendations;

    const highMatch = results.find(
      (result) =>
        result.song.spotifyId === `high-match-${runId}`
    );

    const lowMatch = results.find(
      (result) =>
        result.song.spotifyId === `low-match-${runId}`
    );

    expect(highMatch).toBeDefined();
    expect(lowMatch).toBeDefined();

    expect(highMatch.score).toBe(100);
    expect(lowMatch.score).toBe(25);

    expect(results.indexOf(highMatch)).toBeLessThan(
      results.indexOf(lowMatch)
    );

    // Already-liked songs must not be recommended.
    expect(
      results.some(
        (result) =>
          result.song.spotifyId === `preferred-${runId}`
      )
    ).toBe(false);

    // Scores must remain within the agreed percentage range.
    for (const result of results) {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  test("returns an empty array when a user has no preferences", async () => {
    const response = await request(app)
      .get(`/api/recommendations/${emptyUserId}`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      recommendations: [],
    });
  });
});

// These tests do not require a MySQL connection.
describe("Recommendation API - Request Validation", () => {
  test("rejects an invalid user ID with HTTP 400", async () => {
    const response = await request(app)
      .get("/api/recommendations/not-a-valid-uuid")
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: "A valid userId is required.",
    });
  });

  test("rejects a non-UUID identifier", async () => {
    const response = await request(app)
      .get("/api/recommendations/12345")
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});