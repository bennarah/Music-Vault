const db = require("../../config/db");

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
       usp.id AS preference_id,
       usp.user_id,
       usp.song_id,
       usp.created_at,

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
       s.spotify_url

     FROM user_song_preferences usp
     JOIN songs s
       ON usp.song_id = s.id

     WHERE usp.user_id = ?

     ORDER BY usp.created_at DESC`,
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
};