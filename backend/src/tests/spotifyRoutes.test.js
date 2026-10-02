const request = require("supertest");

// Mock the Spotify service before loading app.js
jest.mock("../services/spotifyService", () => ({
    searchTracks: jest.fn(),
    getTrackById: jest.fn(),
    testSpotifyConnection: jest.fn(),
    validateSpotifyConfig: jest.fn(),
    getClientCredentialsToken: jest.fn(),
    spotifyRequest: jest.fn(),
}));

const {
    searchTracks,
    getTrackById,
} = require("../services/spotifyService");

const app = require("../app");

describe("Spotify API routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/spotify/search returns 400 when query is missing", async () => {
        const response = await request(app)
            .get("/api/spotify/search")
            .expect(400);

        expect(response.body).toEqual({
            success: false,
            message: "Query parameter 'q' is required.",
        });

        expect(searchTracks).not.toHaveBeenCalled();
    });

    test("GET /api/spotify/search returns normalized tracks on success", async () => {
        searchTracks.mockResolvedValue([
            {
                spotifyId: "track123",
                title: "Example Song",
                artistId: "artist123",
                artistName: "Example Artist",
                albumId: "album123",
                albumName: "Example Album",
                albumImageUrl: null,
                durationMs: 200000,
                explicit: false,
                spotifyUrl: "https://open.spotify.com/track/track123",
                genres: [],
            },
        ]);

        const response = await request(app)
            .get("/api/spotify/search")
            .query({
                q: "Example Song",
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(1);
        expect(response.body.tracks).toHaveLength(1);

        expect(searchTracks).toHaveBeenCalledWith("Example Song");
    });

    test("GET /api/spotify/search returns 500 when Spotify service fails", async () => {
        searchTracks.mockRejectedValue(
            new Error("Spotify API unavailable")
        );

        const response = await request(app)
            .get("/api/spotify/search")
            .query({
                q: "Example Song",
            })
            .expect(500);

        expect(response.body).toEqual({
            success: false,
            message: "Spotify search failed.",
        });
    });

    test("GET /api/spotify/tracks/:id returns a track on success", async () => {
        getTrackById.mockResolvedValue({
            spotifyId: "track123",
            title: "Example Song",
            artistId: "artist123",
            artistName: "Example Artist",
            albumId: null,
            albumName: null,
            albumImageUrl: null,
            durationMs: 200000,
            explicit: false,
            spotifyUrl: null,
            genres: [],
        });

        const response = await request(app)
            .get("/api/spotify/tracks/track123")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.track.spotifyId).toBe("track123");

        expect(getTrackById).toHaveBeenCalledWith("track123");
    });

    test("GET /api/spotify/tracks/:id returns 500 when Spotify service fails", async () => {
        getTrackById.mockRejectedValue(
            new Error("Spotify track lookup failed")
        );

        const response = await request(app)
            .get("/api/spotify/tracks/bad-track-id")
            .expect(500);

        expect(response.body).toEqual({
            success: false,
            message: "Spotify track lookup failed.",
        });
    });
});