
const {
    validateSpotifyConfig,
    getClientCredentialsToken,
    spotifyRequest,
    testSpotifyConnection,
    searchTracks,
    getTrackById,
} = require("../src/services/spotifyService");

function mockResponse(body, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: jest.fn().mockResolvedValue(body),
    };
}

describe("Spotify Service", () => {
    let fetchSpy;

    const originalClientId = process.env.SPOTIFY_CLIENT_ID;
    const originalClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    beforeEach(() => {
        process.env.SPOTIFY_CLIENT_ID = "test-client-id";
        process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";

        fetchSpy = jest.spyOn(global, "fetch");
    });

    afterEach(() => {
        jest.restoreAllMocks();

        if (originalClientId === undefined) {
            delete process.env.SPOTIFY_CLIENT_ID;
        } else {
            process.env.SPOTIFY_CLIENT_ID = originalClientId;
        }

        if (originalClientSecret === undefined) {
            delete process.env.SPOTIFY_CLIENT_SECRET;
        } else {
            process.env.SPOTIFY_CLIENT_SECRET = originalClientSecret;
        }
    });

    const tokenResponse = () =>
        mockResponse({
            access_token: "mock-access-token",
            token_type: "Bearer",
            expires_in: 3600,
        });

    test("validates Spotify configuration successfully", () => {
        expect(validateSpotifyConfig()).toEqual({
            clientId: "test-client-id",
            clientSecret: "test-client-secret",
        });
    });

    test("rejects missing Spotify client ID", () => {
        delete process.env.SPOTIFY_CLIENT_ID;

        expect(() => validateSpotifyConfig()).toThrow(
            "Missing SPOTIFY_CLIENT_ID environment variable."
        );
    });

    test("rejects missing Spotify client secret", () => {
        delete process.env.SPOTIFY_CLIENT_SECRET;

        expect(() => validateSpotifyConfig()).toThrow(
            "Missing SPOTIFY_CLIENT_SECRET environment variable."
        );
    });

    test("requests a Spotify client credentials token", async () => {
        fetchSpy.mockResolvedValue(
            tokenResponse()
        );

        const result = await getClientCredentialsToken();

        expect(result).toEqual({
            accessToken: "mock-access-token",
            tokenType: "Bearer",
            expiresIn: 3600,
        });

        expect(fetchSpy).toHaveBeenCalledTimes(1);

        const [url, options] = fetchSpy.mock.calls[0];

        expect(url).toBe(
            "https://accounts.spotify.com/api/token"
        );

        expect(options.method).toBe("POST");

        expect(options.headers.Authorization).toBe(
            "Basic " +
            Buffer.from(
                "test-client-id:test-client-secret"
            ).toString("base64")
        );

        expect(
            new URLSearchParams(options.body).get("grant_type")
        ).toBe("client_credentials");
    });

    test("handles Spotify authentication failures", async () => {
        fetchSpy.mockResolvedValue(
            mockResponse(
                {
                    error: "invalid_client",
                    error_description: "Invalid credentials",
                },
                401
            )
        );

        await expect(
            getClientCredentialsToken()
        ).rejects.toThrow(
            "Spotify authentication failed (401)"
        );
    });

    test("requires an access token for Spotify API requests", async () => {
        await expect(
            spotifyRequest("/search", null)
        ).rejects.toThrow(
            "Spotify access token is required."
        );

        expect(fetchSpy).not.toHaveBeenCalled();
    });

    test("makes authenticated Spotify API requests", async () => {
        fetchSpy.mockResolvedValue(
            mockResponse({
                tracks: {
                    items: [],
                },
            })
        );

        const result = await spotifyRequest(
            "/search",
            "mock-access-token"
        );

        expect(result.tracks.items).toEqual([]);

        expect(fetchSpy).toHaveBeenCalledWith(
            "https://api.spotify.com/v1/search",
            expect.objectContaining({
                headers: {
                    Authorization: "Bearer mock-access-token",
                },
            })
        );
    });

    test("handles Spotify API request failures", async () => {
        fetchSpy.mockResolvedValue(
            mockResponse(
                {
                    error: {
                        message: "Rate limit exceeded",
                    },
                },
                429
            )
        );

        await expect(
            spotifyRequest("/search", "mock-access-token")
        ).rejects.toThrow(
            "Spotify API request failed (429)"
        );
    });

    test("searches Spotify and returns normalized unique tracks", async () => {
        const rawTrack = {
            id: "track-001",
            name: "Imagine",
            duration_ms: 187866,
            explicit: false,
            artists: [
                {
                    id: "artist-001",
                    name: "John Lennon",
                },
            ],
            album: {
                id: "album-001",
                name: "Imagine",
                images: [],
            },
        };

        fetchSpy
            .mockResolvedValueOnce(tokenResponse())
            .mockResolvedValueOnce(
                mockResponse({
                    tracks: {
                        items: [
                            rawTrack,
                            rawTrack,
                            {
                                id: "track-002",
                                name: "Another Song",
                                artists: [],
                            },
                        ],
                    },
                })
            );

        const result = await searchTracks("Imagine", 10);

        expect(fetchSpy).toHaveBeenCalledTimes(2);

        expect(result).toHaveLength(2);

        expect(result[0].spotifyId).toBe("track-001");
        expect(result[0].title).toBe("Imagine");
        expect(result[0].artistName).toBe("John Lennon");

        expect(result[1].spotifyId).toBe("track-002");

        const searchUrl = fetchSpy.mock.calls[1][0];

        const parsedUrl = new URL(searchUrl);

        expect(parsedUrl.searchParams.get("q")).toBe("Imagine");
        expect(parsedUrl.searchParams.get("type")).toBe("track");
        expect(parsedUrl.searchParams.get("limit")).toBe("10");
    });

    test("returns an empty array when Spotify has no search results", async () => {
        fetchSpy
            .mockResolvedValueOnce(tokenResponse())
            .mockResolvedValueOnce(
                mockResponse({
                    tracks: {
                        items: [],
                    },
                })
            );

        const result = await searchTracks("Nonexistent Song");

        expect(result).toEqual([]);
    });

    test("rejects an empty search query without making requests", async () => {
        await expect(
            searchTracks("")
        ).rejects.toThrow(
            "A Spotify search query is required."
        );

        expect(fetchSpy).not.toHaveBeenCalled();
    });

    test("retrieves and normalizes a Spotify track by ID", async () => {
        const rawTrack = {
            id: "track-123",
            name: "Imagine",
            duration_ms: 187866,
            explicit: false,
            artists: [
                {
                    id: "artist-123",
                    name: "John Lennon",
                },
            ],
            album: {
                id: "album-123",
                name: "Imagine",
                images: [],
            },
        };

        fetchSpy
            .mockResolvedValueOnce(tokenResponse())
            .mockResolvedValueOnce(
                mockResponse(rawTrack)
            );

        const result = await getTrackById("track-123");

        expect(result.spotifyId).toBe("track-123");
        expect(result.title).toBe("Imagine");

        expect(fetchSpy).toHaveBeenCalledTimes(2);

        expect(fetchSpy.mock.calls[1][0]).toBe(
            "https://api.spotify.com/v1/tracks/track-123"
        );
    });

    test("rejects a missing Spotify track ID", async () => {
        await expect(
            getTrackById("")
        ).rejects.toThrow(
            "Spotify track ID is required."
        );

        expect(fetchSpy).not.toHaveBeenCalled();
    });

    test("handles the Spotify connectivity test successfully", async () => {
        fetchSpy
            .mockResolvedValueOnce(tokenResponse())
            .mockResolvedValueOnce(
                mockResponse({
                    tracks: {
                        items: [
                            {
                                id: "track-001",
                                name: "Imagine",
                                artists: [
                                    { name: "John Lennon" },
                                ],
                                album: {
                                    name: "Imagine",
                                },
                            },
                        ],
                    },
                })
            );

        const result = await testSpotifyConnection();

        expect(result.connected).toBe(true);
        expect(result.tokenType).toBe("Bearer");

        expect(result.sampleTrack).toEqual({
            id: "track-001",
            name: "Imagine",
            artist: "John Lennon",
            album: "Imagine",
        });
    });
});
