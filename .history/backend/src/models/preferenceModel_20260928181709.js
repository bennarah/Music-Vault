const db = require("../config/db");

async function createPreference(userId, songId) {
  const [result] = await db.execute(
    "INSERT INTO user_song_preferences (user_id, song_id) VALUES (?, ?)",
    [userId, songId]
  );

  return result.insertId;
}

async function getPreferenceById(userId) {
  const [rows] = await db.execute(
    "SELECT * FROM user_song_preferences WHERE user_id = ?",
    [userId]
  );

  return rows[0] || null;
}

async function deletePreference(userId, songId) {
  const [result] = await db.execute(
    "DELETE FROM user_song_preferences WHERE user_id = ? AND song_id = ?",
    [userId, songId]
  );

  return result.affectedRows;
}