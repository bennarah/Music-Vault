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
       usp.id,
       usp.user_id,
       usp.song_id,
       s.spotify_id,
       s.title,
       s.artist_name,
       s.genres,
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
};