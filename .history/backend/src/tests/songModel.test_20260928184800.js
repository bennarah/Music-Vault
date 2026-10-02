const db = require("../../config/db");

const {
  createSong,
  getSongById,
  getSongBySpotifyId,
} = require("../models/songModel");

describe("Song Model", () => {
  let testSongId;

  const testSong = {
    spotifyId: "ci-test-song-001",
    title: "CI Test Song",
    artistId: "ci-test-artist-001",
    artistName: "CI Test Artist",
    genres: ["rock", "indie rock"],
    albumId: "ci-test-album-001",
    albumName: "CI Test Album",
    albumImageUrl: null,
    durationMs: 180000,
    explicit: false,
    spotifyUrl: "https://open.spotify.com/track/ci-test-song-001",
  };

  afterAll(async () => {
    await db.execute(
      "DELETE FROM songs WHERE spotify_id = ?",
      [testSong.spotifyId]
    );

    await db.end();
  });

  test("creates and retrieves a song by Spotify ID", async () => {
    testSongId = await createSong(testSong);

    const song = await getSongBySpotifyId(testSong.spotifyId);

    expect(song).not.toBeNull();
    expect(song.title).toBe(testSong.title);
    expect(song.artist_name).toBe(testSong.artistName);
    expect(song.duration_ms).toBe(testSong.durationMs);
  });

  test("retrieves a song by internal ID", async () => {
    const song = await getSongById(testSongId);

    expect(song).not.toBeNull();
    expect(song.spotify_id).toBe(testSong.spotifyId);
  });
});