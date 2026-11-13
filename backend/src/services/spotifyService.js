
const {
    normalizeTrack,
} = require("./spotifyNormalizer");

const {
    deduplicateTracks,
} = require("../utils/deduplicateTracks");

// Spotify API endpoints
const SPOTIFY_TOKEN_URL =
    "https://accounts.spotify.com/api/token";

const SPOTIFY_API_BASE_URL =
    "https://api.spotify.com/v1";

// In-memory access-token cache.
// Tokens are stored only within this backend process.

let cachedToken = null;
let pendingTokenRequest = null;


// Validate required Spotify credentials.

function validateSpotifyConfig() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId) {
        throw new Error(
            "Missing SPOTIFY_CLIENT_ID environment variable."
        );
    }

    if (!clientSecret) {
        throw new Error(
            "Missing SPOTIFY_CLIENT_SECRET environment variable."
        );
    }

    return {
        clientId,
        clientSecret,
    };
}


// Request a new Spotify client credentials token.

async function requestNewToken() {
    const { clientId, clientSecret } =
        validateSpotifyConfig();

    const credentials = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64");

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `Spotify authentication failed (${response.status}): ${
                data.error_description ||
                data.error ||
                "Unknown Spotify error"
            }`
        );
    }

    if (
        typeof data.access_token !== "string" ||
        !data.access_token ||
        !Number.isFinite(data.expires_in) ||
        data.expires_in <= 0
    ) {
        throw new Error(
            "Spotify returned an invalid authentication response."
        );
    }

    const now = Date.now();

    // Refresh before actual expiration.
    // Use the smaller of 60 seconds or 10% of token lifetime.

    const refreshBufferMs = Math.min(
        60000,
        data.expires_in * 100
    );

    const expiresAt =
        now + (data.expires_in * 1000) - refreshBufferMs;

    const token = {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
    };

    cachedToken = {
        ...token,
        expiresAt,
        clientId,
    };

    return token;
}


// Get a valid Spotify access token.
//
// Reuses an existing token when possible.
// Concurrent callers share the same authentication request.

async function getClientCredentialsToken() {
    const { clientId } = validateSpotifyConfig();

    // Return an existing token if it is still valid.
    // Also ensure it belongs to the currently configured client.

    if (
        cachedToken &&
        cachedToken.clientId === clientId &&
        Date.now() < cachedToken.expiresAt
    ) {
        return {
            accessToken: cachedToken.accessToken,
            tokenType: cachedToken.tokenType,
            expiresIn: cachedToken.expiresIn,
        };
    }

    // Remove expired or outdated cached credentials.

    if (
        cachedToken &&
        (
            cachedToken.clientId !== clientId ||
            Date.now() >= cachedToken.expiresAt
        )
    ) {
        cachedToken = null;
    }

    // Reuse an authentication request already in progress.

    if (pendingTokenRequest) {
        return pendingTokenRequest;
    }

    // Start a single authentication request.

    const request = requestNewToken();

    pendingTokenRequest = request.finally(() => {
        pendingTokenRequest = null;
    });

    return pendingTokenRequest;
}


// Clear the in-memory token cache.
//
// Exported to support deterministic testing and controlled
// credential rotation without restarting the application.

function resetSpotifyTokenCache() {
    cachedToken = null;
    pendingTokenRequest = null;
}


// Make an authenticated Spotify API request.

async function spotifyRequest(endpoint, accessToken) {
    if (!accessToken) {
        throw new Error(
            "Spotify access token is required."
        );
    }

    const response = await fetch(
        `${SPOTIFY_API_BASE_URL}${endpoint}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `Spotify API request failed (${response.status}): ${
                data.error?.message ||
                "Unknown Spotify error"
            }`
        );
    }

    return data;
}


// Simple Spotify connectivity test.

async function testSpotifyConnection() {
    const token = await getClientCredentialsToken();

    const query = encodeURIComponent(
        "track:Imagine artist:John Lennon"
    );

    const result = await spotifyRequest(
        `/search?q=${query}&type=track&limit=1`,
        token.accessToken
    );

    const track = result.tracks?.items?.[0];

    return {
        connected: true,
        tokenType: token.tokenType,
        tokenExpiresInSeconds: token.expiresIn,
        sampleTrack: track
            ? {
                id: track.id,
                name: track.name,
                artist: track.artists?.[0]?.name || null,
                album: track.album?.name || null,
            }
            : null,
    };
}


// Search Spotify and return normalized unique tracks.

async function searchTracks(query, limit = 10) {
    if (!query || typeof query !== "string") {
        throw new Error(
            "A Spotify search query is required."
        );
    }

    const token = await getClientCredentialsToken();

    const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: String(limit),
    });

    const result = await spotifyRequest(
        `/search?${params.toString()}`,
        token.accessToken
    );

    const tracks = result.tracks?.items || [];

    return deduplicateTracks(
        tracks
            .map(normalizeTrack)
            .filter(Boolean)
    );
}


// Retrieve an individual Spotify track.

async function getTrackById(spotifyId) {
    if (!spotifyId) {
        throw new Error(
            "Spotify track ID is required."
        );
    }

    const token = await getClientCredentialsToken();

    const track = await spotifyRequest(
        `/tracks/${encodeURIComponent(spotifyId)}`,
        token.accessToken
    );

    return normalizeTrack(track);
}


module.exports = {
    validateSpotifyConfig,
    getClientCredentialsToken,
    spotifyRequest,
    testSpotifyConnection,
    searchTracks,
    getTrackById,
    resetSpotifyTokenCache,
};
