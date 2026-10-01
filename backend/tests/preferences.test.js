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
});