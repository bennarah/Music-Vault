
const db = require("../../config/db");

async function createSong(song) {
    const {
        spotifyId,
        title,
        artistId,
        artistName,
        albumId,
        albumName,
        albumImageUrl,
        genres,
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
            genres,
            duration_ms,
            explicit,
            spotify_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            spotifyId,
            title,
            artistId,
            artistName,
            albumId,
            albumName,
            albumImageUrl,
            JSON.stringify(genres || []),
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

// Retrieves all songs.
async function getAllSongs() {
    const [rows] = await db.execute(
        "SELECT * FROM songs"
    );

    return rows;
}

// Retrieves candidate songs while excluding songs
// already saved as preferences by the specified user.
//
// Uses NOT EXISTS to avoid retrieving already-liked songs
// from the database in the first place.

async function getCandidateSongsForUser(userId) {
    if (
        typeof userId !== "string" ||
        !userId.trim()
    ) {
        throw new Error("A valid user ID is required.");
    }

    const [rows] = await db.execute(
        `SELECT s.*
         FROM songs s
         WHERE NOT EXISTS (
             SELECT 1
             FROM user_song_preferences usp
             WHERE usp.user_id = ?
             AND usp.song_id = s.id
         )`,
        [userId]
    );

    return rows;
}

// Inserts a song or updates its metadata if its
// Spotify ID already exists.

async function upsertSong(song) {
    const {
        spotifyId,
        title,
        artistId,
        artistName,
        albumId,
        albumName,
        albumImageUrl,
        genres,
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
            genres,
            duration_ms,
            explicit,
            spotify_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            artist_id = VALUES(artist_id),
            artist_name = VALUES(artist_name),
            album_id = VALUES(album_id),
            album_name = VALUES(album_name),
            album_image_url = VALUES(album_image_url),
            genres = VALUES(genres),
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
            JSON.stringify(genres || []),
            durationMs,
            explicit,
            spotifyUrl,
        ]
    );

    return result;
}

module.exports = {
    createSong,
    getSongById,
    getSongBySpotifyId,
    getAllSongs,
    getCandidateSongsForUser,
    upsertSong,
};
