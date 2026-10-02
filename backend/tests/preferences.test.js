const request = require("supertest");
const app = require("../src/app");

describe("Preference API", () => {
    test("POST /api/preferences creates a preference", async () => {
        const response = await request(app)
            .post("/api/preferences")
            .send({
                userId: "user_123",
                songId: "spotify_track_123",
                title: "Example Song",
                artist: "Example Artist",
                genre: "Alternative",
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.preference).toEqual(
            expect.objectContaining({
                userId: "user_123",
                songId: "spotify_track_123",
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
                userId: "user_123",
                songId: "spotify_track_456",
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
            userId: "user_123",
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
            userId: "user_123",
            songId: "song_whitespace",
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
            userId: "user_get_123",
            songId: "song_get_001",
            title: "First Song",
            artist: "First Artist",
            genre: "Rock",
        })
        .expect(201);

    await request(app)
        .post("/api/preferences")
        .send({
            userId: "user_get_456",
            songId: "song_get_002",
            title: "Second Song",
            artist: "Second Artist",
            genre: "Pop",
        })
        .expect(201);

    const response = await request(app)
        .get("/api/preferences/user_get_123")
        .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.preferences).toHaveLength(1);
    expect(response.body.preferences[0]).toEqual(
        expect.objectContaining({
            userId: "user_get_123",
            songId: "song_get_001",
        })
    );
});

test("GET /api/preferences/:userId returns an empty array when no preferences exist", async () => {
    const response = await request(app)
        .get("/api/preferences/user_with_no_preferences")
        .expect(200);

    expect(response.body).toEqual({
        success: true,
        preferences: [],
    });
});

test("DELETE /api/preferences/:id removes an existing preference", async () => {
    const createResponse = await request(app)
        .post("/api/preferences")
        .send({
            userId: "user_delete_test",
            songId: "song_delete_test",
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
        .get("/api/preferences/user_delete_test")
        .expect(200);

    expect(getResponse.body.preferences).toEqual([]);
});

test("DELETE /api/preferences/:id returns 404 when preference does not exist", async () => {
    const response = await request(app)
        .delete("/api/preferences/nonexistent-preference-id")
        .expect(404);

    expect(response.body).toEqual({
        success: false,
        message: "Preference not found.",
    });
});
});