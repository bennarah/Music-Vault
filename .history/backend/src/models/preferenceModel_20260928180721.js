async function createPreference(userId, songId) {
  const [result] = await db.execute(
    "INSERT INTO user_song_preferences (user_id, song_id) VALUES (?, ?)",
    [userId, songId]
  );

  return result.insertId;
}