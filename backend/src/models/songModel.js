const db = require("../config/db");

async function createSong(song) {
  const {
    spotifyId,
    title,
    artistId,
    artistName,
    albumId,
    albumName,
    albumImageUrl,
    durationMs,
    explicit,
    spotifyUrl,
  } = song;

  const [result] = await db.execute(
    `INSERT INTO songs (
      spotify_id,
      title,
      artist_id,
      artist_name,
      album_id,
      album_name,
      album_image_url,
      duration_ms,
      explicit,
      spotify_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      spotifyId,
      title,
      artistId,
      artistName,
      albumId,
      albumName,
      albumImageUrl,
      durationMs,
      explicit,
      spotifyUrl,
    ]
  );

  return result.insertId;
}

async function getSongById(id) {
  const [rows] = await db.execute(
    "SELECT * FROM songs WHERE id = ?",
    [id]
  );

  return rows[0] || null;
}

async function getSongBySpotifyId(spotifyId) {
  const [rows] = await db.execute(
    "SELECT * FROM songs WHERE spotify_id = ?",
    [spotifyId]
  );

  return rows[0] || null;
}

async function getAllSongs() {
  const [rows] = await db.execute(
    "SELECT * FROM songs"
  );

  return rows;
}

module.exports = {
  createSong,
  getSongById,
  getSongBySpotifyId,
  getAllSongs,
};

async function upsertSong(song) {
  const {
    spotifyId,
    title,
    artistId,
    artistName,
    albumId,
    albumName,
    albumImageUrl,
    durationMs,
    explicit,
    spotifyUrl,
  } = song;

  const [result] = await db.execute(
    `INSERT INTO songs (
      spotify_id,
      title,
      artist_id,
      artist_name,
      album_id,
      album_name,
      album_image_url,
      duration_ms,
      explicit,
      spotify_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      artist_id = VALUES(artist_id),
      artist_name = VALUES(artist_name),
      album_id = VALUES(album_id),
      album_name = VALUES(album_name),
      album_image_url = VALUES(album_image_url),
      duration_ms = VALUES(duration_ms),
      explicit = VALUES(explicit),
      spotify_url = VALUES(spotify_url)`,
    [
      spotifyId,
      title,
      artistId,
      artistName,
      albumId,
      albumName,
      albumImageUrl,
      durationMs,
      explicit,
      spotifyUrl,
    ]
  );

  return result;
}