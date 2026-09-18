//Actually communicates with Spotify

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

 //Make sure the Spotify credentials needed by the backend exist.
function validateSpotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId) throw new Error("Missing SPOTIFY_CLIENT_ID environment variable.");
  if (!clientSecret) throw new Error("Missing SPOTIFY_CLIENT_SECRET environment variable.");

  return { clientId, clientSecret };
}


//Request an application access token from Spotify using
//the Client Credentials flow.

async function getClientCredentialsToken() {
  const { clientId, clientSecret } = validateSpotifyConfig();

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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
        data.error_description || data.error || "Unknown Spotify error"
      }`
    );
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
}

//Make an authenticated request to the Spotify Web API.
async function spotifyRequest(endpoint, accessToken) {
  if (!accessToken) throw new Error("Spotify access token is required.");

  const response = await fetch(`${SPOTIFY_API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Spotify API request failed (${response.status}): ${
        data.error?.message || "Unknown Spotify error"
      }`
    );
  }

  return data;
}

//Simple connectivity test.
//Searches Spotify for one track. The purpose is only to prove
//that MusicVault can authenticate and communicate with Spotify.

async function testSpotifyConnection() {
  const token = await getClientCredentialsToken();

  const query = encodeURIComponent("track:Imagine artist:John Lennon");

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

module.exports = {
  validateSpotifyConfig,
  getClientCredentialsToken,
  spotifyRequest,
  testSpotifyConnection,
};