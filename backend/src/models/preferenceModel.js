const db = require("../../config/db");


function mapPreferenceRowToSong(row) {
  let genres = row.genres;

  if (typeof genres === "string") {
    try {
      genres = JSON.parse(genres);
    } catch {
      genres = [];
    }
  }

  if (!Array.isArray(genres)) {
    genres = [];
  }

  return {
    spotifyId: row.spotify_id,
    title: row.title,
    artistId: row.artist_id,
    artistName: row.artist_name,
    genres,
    albumId: row.album_id,
    albumName: row.album_name,
    albumImageUrl: row.album_image_url,
    durationMs: row.duration_ms,
    explicit: Boolean(row.explicit),
    spotifyUrl: row.spotify_url,
  };
}

async function createPreference(userId, songId) {
  const [result] = await db.execute(
    `INSERT INTO user_song_preferences (user_id, song_id)
     VALUES (?, ?)`,
    [userId, songId]
  );

  return result.insertId;
}


async function getPreferencesByUser(userId) {
  const [rows] = await db.execute(
    `SELECT
       usp.id,
       usp.user_id,
       usp.song_id,
       s.spotify_id,
       s.title,
       s.artist_id,
       s.artist_name,
       s.genres,
       s.album_id,
       s.album_name,
       s.album_image_url,
       s.duration_ms,
       s.explicit,
       s.spotify_url,
       usp.created_at
     FROM user_song_preferences usp
     JOIN songs s
       ON s.id = usp.song_id
     WHERE usp.user_id = ?`,
    [userId]
  );

  return rows;
}

async function deletePreferenceById(id) {
  const [result] = await db.execute(
    `DELETE FROM user_song_preferences
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
}

module.exports = {
  createPreference,
  getPreferencesByUser,
  deletePreferenceById,
  mapPreferenceRowToSong,
}; 