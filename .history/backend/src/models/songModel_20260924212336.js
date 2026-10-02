const db = require("../config/db");

async function createSong({
  spotifyId,
  title,
  artist,
  genre = null,
  album = null,
  popularity = null,
}) {
  const [result] = await db.execute(
    `INSERT INTO songs
      (spotify_id, title, artist, genre, album, popularity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      spotifyId,
      title,
      artist,
      genre,
      album,
      popularity,
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