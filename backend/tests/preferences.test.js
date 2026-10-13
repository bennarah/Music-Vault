const crypto = require("crypto");
const request = require("supertest");

const app = require("../src/app");
const db = require("../config/db");
const { createSong } = require("../src/models/songModel");

describe("Preference API", () => {
    const runId = crypto.randomUUID();

    const users = {};
    const songs = {};

    async function createTestUser(name) {
        const userId = crypto.randomUUID();
        const email = `${name}-${runId}@example.com`;

        await db.execute(
            `INSERT INTO users (user_id, email, spotify_id)
             VALUES (?, ?, ?)`,
            [userId, email, null]
        );

        users[name] = userId;

        return userId;
    }

    async function createTestSong(name, options = {}) {
        const spotifyId = `${name}-${runId}`;

        const songId = await createSong({
            spotifyId,
            title: options.title || `${name} Song`,
            artistId: `${name}-artist-id`,
            artistName: options.artist || `${name} Artist`,
            genres: options.genres || ["rock"],
            albumId: null,
            albumName: null,
            albumImageUrl: null,
            durationMs: 200000,
            explicit: false,
            spotifyUrl: null,
        });

        songs[name] = {
            id: songId,
            spotifyId,
        };

        return songs[name];
    }

    beforeAll(async () => {
        await createTestUser("create");
        await createTestUser("no-genre");
        await createTestUser("get-one");
        await createTestUser("get-two");
        await createTestUser("empty");
        await createTestUser("delete");
        await createTestUser("duplicate");

        await createTestSong("create", {
            title: "Example Song",
            artist: "Example Artist",
            genres: ["alternative"],
        });

        await createTestSong("no-genre", {
            title: "Another Song",
            artist: "Another Artist",
            genres: [],
        });

        await createTestSong("get-one", {
            title: "First Song",
            artist: "First Artist",
            genres: ["rock"],
        });

        await createTestSong("get-two", {
            title: "Second Song",
            artist: "Second Artist",
            genres: ["pop"],
        });

        await createTestSong("delete", {
            title: "Delete Test Song",
            artist: "Delete Test Artist",
            genres: ["jazz"],
        });

        await createTestSong("duplicate", {
            title: "Duplicate Test Song",
            artist: "Duplicate Test Artist",
            genres: ["rock"],
        });
    });

    afterAll(async () => {
        // Remove preference rows first because they reference users and songs.
        await db.execute(
            "DELETE FROM user_song_preferences WHERE user_id IN (?, ?, ?, ?, ?, ?, ?)",
            [
                users.create,
                users["no-genre"],
                users["get-one"],
                users["get-two"],
                users.empty,
                users.delete,
                users.duplicate,
            ]
        );

        // Remove all songs created by this test run.
        await db.execute(
            "DELETE FROM songs WHERE spotify_id LIKE ?",
            [`%-${runId}`]
        );

        // Remove all users created by this test run.
        await db.execute(
            "DELETE FROM users WHERE email LIKE ?",
            [`%-${runId}@example.com`]
        );

        await db.end();
    });

    test("POST /api/preferences creates a database-backed preference", async () => {
        const response = await request(app)
            .post("/api/preferences")
            .send({
                userId: users.create,
                songId: songs.create.spotifyId,
                title: "Example Song",
                artist: "Example Artist",
                genre: "Alternative",
            })
            .expect(201);

        expect(response.body.success).toBe(true);

        expect(response.body.preference).toEqual(
            expect.objectContaining({
                userId: users.create,
                songId: songs.create.spotifyId,
                title: "Example Song",
                artist: "Example Artist",
                genre: "Alternative",
            })
        );

        expect(response.body.preference.id).toBeDefined();
    });

    test("POST /api/preferences allows genre to be omitted", async () => {
        const response = await request(app)
            .post("/api/preferences")
            .send({
                userId: users["no-genre"],
                songId: songs["no-genre"].spotifyId,
                title: "Another Song",
                artist: "Another Artist",
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.preference.genre).toBeNull();
    });

    test("POST /api/preferences rejects a request missing a required field", async () => {
        const response = await request(app)
            .post("/api/preferences")
            .send({
                userId: users.create,
                title: "Missing Song ID",
                artist: "Example Artist",
                genre: "Alternative",
            })
            .expect(400);

        expect(response.body).toEqual({
            success: false,
            message: "Missing or invalid required field: songId",
        });
    });

    test("POST /api/preferences rejects a whitespace-only required field", async () => {
        const response = await request(app)
            .post("/api/preferences")
            .send({
                userId: users.create,
                songId: songs.create.spotifyId,
                title: "   ",
                artist: "Example Artist",
                genre: "Alternative",
            })
            .expect(400);

        expect(response.body).toEqual({
            success: false,
            message: "Missing or invalid required field: title",
        });
    });

    test("GET /api/preferences/:userId returns only that user's preferences", async () => {
        await request(app)
            .post("/api/preferences")
            .send({
                userId: users["get-one"],
                songId: songs["get-one"].spotifyId,
                title: "First Song",
                artist: "First Artist",
                genre: "Rock",
            })
            .expect(201);

        await request(app)
            .post("/api/preferences")
            .send({
                userId: users["get-two"],
                songId: songs["get-two"].spotifyId,
                title: "Second Song",
                artist: "Second Artist",
                genre: "Pop",
            })
            .expect(201);

        const response = await request(app)
            .get(`/api/preferences/${users["get-one"]}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.preferences).toHaveLength(1);

        expect(response.body.preferences[0]).toEqual(
            expect.objectContaining({
                userId: users["get-one"],
                songId: songs["get-one"].spotifyId,
                title: "First Song",
                artist: "First Artist",
            })
        );
    });

    test("GET /api/preferences/:userId returns an empty array when no preferences exist", async () => {
        const response = await request(app)
            .get(`/api/preferences/${users.empty}`)
            .expect(200);

        expect(response.body).toEqual({
            success: true,
            preferences: [],
        });
    });

    test("DELETE /api/preferences/:id removes an existing database preference", async () => {
        const createResponse = await request(app)
            .post("/api/preferences")
            .send({
                userId: users.delete,
                songId: songs.delete.spotifyId,
                title: "Delete Test Song",
                artist: "Delete Test Artist",
                genre: "Jazz",
            })
            .expect(201);

        const preferenceId = createResponse.body.preference.id;

        const deleteResponse = await request(app)
            .delete(`/api/preferences/${preferenceId}`)
            .expect(200);

        expect(deleteResponse.body.success).toBe(true);
        expect(deleteResponse.body.preference.id).toBe(preferenceId);

        const getResponse = await request(app)
            .get(`/api/preferences/${users.delete}`)
            .expect(200);

        expect(getResponse.body.preferences).toEqual([]);
    });

    test("DELETE /api/preferences/:id returns 404 when preference does not exist", async () => {
        const response = await request(app)
            .delete("/api/preferences/999999999")
            .expect(404);

        expect(response.body).toEqual({
            success: false,
            message: "Preference not found.",
        });
    });

    test("POST /api/preferences rejects a duplicate preference", async () => {
        const payload = {
            userId: users.duplicate,
            songId: songs.duplicate.spotifyId,
            title: "Duplicate Test Song",
            artist: "Duplicate Test Artist",
            genre: "Rock",
        };

        await request(app)
            .post("/api/preferences")
            .send(payload)
            .expect(201);

        const response = await request(app)
            .post("/api/preferences")
            .send(payload)
            .expect(409);

        expect(response.body).toEqual({
            success: false,
            message: "Preference already exists.",
        });
    });
});