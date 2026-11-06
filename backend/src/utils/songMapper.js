
/**
 * Shared MusicVault song mapper.
 *
 * Converts database song records into the normalized
 * MusicVault song structure used by the application.
 *
 * Used by:
 * - preferenceModel.js
 * - recommendationRoutes.js
 */

/**
 * Safely converts database genre data into an array.
 *
 * MySQL JSON values may be returned as either an array
 * or a JSON string depending on the environment.
 */
function normalizeGenres(genres) {
    if (typeof genres === "string") {
        try {
            genres = JSON.parse(genres);
        } catch {
            genres = [];
        }
    }

    if (!Array.isArray(genres)) {
        return [];
    }

    return genres;
}

/**
 * Converts a database song row into the shared
 * MusicVault song format.
 */
function mapSongRowToSong(row) {
    if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
    ) {
        return null;
    }

    return {
        spotifyId: row.spotify_id,
        title: row.title,
        artistId: row.artist_id,
        artistName: row.artist_name,
        genres: normalizeGenres(row.genres),
        albumId: row.album_id,
        albumName: row.album_name,
        albumImageUrl: row.album_image_url,
        durationMs: row.duration_ms,
        explicit: Boolean(row.explicit),
        spotifyUrl: row.spotify_url,
    };
}

module.exports = {
    normalizeGenres,
    mapSongRowToSong,
};
