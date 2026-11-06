
const crypto = require("crypto");

const db = require("../../config/db");

const {
    getCandidateSongsForUser,
} = require("../models/songModel");

describe("Candidate song database retrieval", () => {
    let userId;
    let preferredSpotifyId;
    let candidateSpotifyId;

    beforeAll(async () => {
        userId = crypto.randomUUID();

        preferredSpotifyId = `preferred-${crypto.randomUUID()}`;
        candidateSpotifyId = `candidate-${crypto.randomUUID()}`;

        await db.execute(
            `INSERT INTO users (user_id, email, spotify_id)
             VALUES (?, ?, ?)`,
            [
                userId,
                `benchmark-${userId}@example.com`,
                null,
            ]
        );

        await db.execute(
            `INSERT INTO songs (
                spotify_id,
                title,
                artist_name,
                genres,
                duration_ms,
                explicit
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                preferredSpotifyId,
                "Preferred Test Song",
                "Test Artist",
                JSON.stringify(["rock"]),
                200000,
                false,
            ]
        );

        await db.execute(
            `INSERT INTO songs (
                spotify_id,
                title,
                artist_name,
                genres,
                duration_ms,
                explicit
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                candidateSpotifyId,
                "Candidate Test Song",
                "Another Artist",
                JSON.stringify(["rock"]),
                205000,
                false,
            ]
        );

        const [preferredRows] = await db.execute(
            "SELECT id FROM songs WHERE spotify_id = ?",
            [preferredSpotifyId]
        );

        await db.execute(
            `INSERT INTO user_song_preferences
             (user_id, song_id)
             VALUES (?, ?)`,
            [userId, preferredRows[0].id]
        );
    });

    afterAll(async () => {
        try {
            if (userId) {
                await db.execute(
                    "DELETE FROM user_song_preferences WHERE user_id = ?",
                    [userId]
                );
            }

            if (preferredSpotifyId) {
                await db.execute(
                    "DELETE FROM songs WHERE spotify_id = ?",
                    [preferredSpotifyId]
                );
            }

            if (candidateSpotifyId) {
                await db.execute(
                    "DELETE FROM songs WHERE spotify_id = ?",
                    [candidateSpotifyId]
                );
            }

            if (userId) {
                await db.execute(
                    "DELETE FROM users WHERE user_id = ?",
                    [userId]
                );
            }
        } finally {
            await db.end();
        }
    });

    test("excludes songs already preferred by the user", async () => {
        const candidates = await getCandidateSongsForUser(userId);

        const spotifyIds = candidates.map(
            song => song.spotify_id
        );

        expect(spotifyIds).toContain(candidateSpotifyId);

        expect(spotifyIds).not.toContain(
            preferredSpotifyId
        );
    });

    test("rejects an empty user ID", async () => {
        await expect(
            getCandidateSongsForUser("")
        ).rejects.toThrow(
            "A valid user ID is required."
        );
    });

    test("rejects a missing user ID", async () => {
        await expect(
            getCandidateSongsForUser(null)
        ).rejects.toThrow(
            "A valid user ID is required."
        );
    });
});
