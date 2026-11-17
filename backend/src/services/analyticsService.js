
/**
 * MusicVault Analytics Service
 *
 * Aggregates recommendation results into chart-ready statistics.
 *
 * Supported analytics:
 * - Artist frequency
 * - Genre distribution
 * - Explicit-content distribution
 * - Song duration statistics
 * - Album frequency
 * - Recommendation score statistics
 *
 * Input format:
 * [
 *   {
 *     song: { ...normalizedSong },
 *     score: 75
 *   }
 * ]
 */

function percentage(count, total) {
    if (total === 0) {
        return 0;
    }

    return Number(((count / total) * 100).toFixed(2));
}


function getValidRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) {
        throw new Error(
            "Recommendations must be an array."
        );
    }

    return recommendations.filter(
        result =>
            result &&
            typeof result === "object" &&
            result.song &&
            typeof result.song === "object"
    );
}


// Calculates how frequently each artist appears.

function calculateArtistFrequency(recommendations) {
    const artists = new Map();

    for (const result of getValidRecommendations(recommendations)) {
        const song = result.song;

        const artistName =
            typeof song.artistName === "string"
                ? song.artistName.trim()
                : "";

        if (!artistName) {
            continue;
        }

        const artistId =
            typeof song.artistId === "string" &&
            song.artistId.trim()
                ? song.artistId.trim()
                : null;

        // Use Spotify artist ID when available.
        // Otherwise use normalized artist name.

        const key = artistId
            ? `id:${artistId}`
            : `name:${artistName.toLowerCase()}`;

        if (!artists.has(key)) {
            artists.set(key, {
                artistId,
                artistName,
                count: 0,
            });
        }

        artists.get(key).count += 1;
    }

    const total = Array.from(artists.values())
        .reduce((sum, artist) => sum + artist.count, 0);

    return Array.from(artists.values())
        .map(artist => ({
            ...artist,
            percentage: percentage(artist.count, total),
        }))
        .sort((a, b) => b.count - a.count);
}


// Calculates genre frequency.
//
// A song contributes at most once to each genre.

function calculateGenreDistribution(recommendations) {
    const genreCounts = new Map();

    let songsWithGenres = 0;

    for (const result of getValidRecommendations(recommendations)) {
        const genres = Array.isArray(result.song.genres)
            ? result.song.genres
            : [];

        const validGenres = new Set(
            genres
                .filter(
                    genre =>
                        typeof genre === "string" &&
                        genre.trim() !== ""
                )
                .map(genre => genre.trim().toLowerCase())
        );

        if (validGenres.size === 0) {
            continue;
        }

        songsWithGenres += 1;

        for (const genre of validGenres) {
            genreCounts.set(
                genre,
                (genreCounts.get(genre) || 0) + 1
            );
        }
    }

    const totalGenreAssignments = Array.from(
        genreCounts.values()
    ).reduce((sum, count) => sum + count, 0);

    return {
        songsWithGenres,
        songsWithoutGenres:
            getValidRecommendations(recommendations).length -
            songsWithGenres,

        genres: Array.from(genreCounts.entries())
            .map(([genre, count]) => ({
                genre,
                count,
                percentage: percentage(
                    count,
                    totalGenreAssignments
                ),
            }))
            .sort((a, b) => b.count - a.count),
    };
}


// Calculates explicit and non-explicit song distribution.

function calculateExplicitDistribution(recommendations) {
    let explicit = 0;
    let nonExplicit = 0;
    let unknown = 0;

    for (const result of getValidRecommendations(recommendations)) {
        const value = result.song.explicit;

        if (value === true || value === 1) {
            explicit += 1;
        } else if (value === false || value === 0) {
            nonExplicit += 1;
        } else {
            unknown += 1;
        }
    }

    const knownTotal = explicit + nonExplicit;

    return {
        explicit: {
            count: explicit,
            percentage: percentage(explicit, knownTotal),
        },
        nonExplicit: {
            count: nonExplicit,
            percentage: percentage(nonExplicit, knownTotal),
        },
        unknown,
        knownTotal,
    };
}


// Calculates duration statistics using valid durations only.

function calculateDurationStatistics(recommendations) {
    const durations = getValidRecommendations(recommendations)
        .map(result => result.song.durationMs)
        .filter(
            duration =>
                typeof duration === "number" &&
                Number.isFinite(duration) &&
                duration >= 0
        );

    if (durations.length === 0) {
        return {
            count: 0,
            averageDurationMs: null,
            minimumDurationMs: null,
            maximumDurationMs: null,
        };
    }

    const total = durations.reduce(
        (sum, duration) => sum + duration,
        0
    );

    return {
        count: durations.length,
        averageDurationMs: Math.round(
            total / durations.length
        ),
        minimumDurationMs: Math.min(...durations),
        maximumDurationMs: Math.max(...durations),
    };
}


// Calculates album frequency.

function calculateAlbumFrequency(recommendations) {
    const albums = new Map();

    for (const result of getValidRecommendations(recommendations)) {
        const albumName =
            typeof result.song.albumName === "string"
                ? result.song.albumName.trim()
                : "";

        if (!albumName) {
            continue;
        }

        albums.set(
            albumName,
            (albums.get(albumName) || 0) + 1
        );
    }

    const total = Array.from(albums.values())
        .reduce((sum, count) => sum + count, 0);

    return Array.from(albums.entries())
        .map(([albumName, count]) => ({
            albumName,
            count,
            percentage: percentage(count, total),
        }))
        .sort((a, b) => b.count - a.count);
}


// Calculates recommendation score statistics.

function calculateScoreStatistics(recommendations) {
    const scores = getValidRecommendations(recommendations)
        .map(result => result.score)
        .filter(
            score =>
                typeof score === "number" &&
                Number.isFinite(score)
        );

    if (scores.length === 0) {
        return {
            count: 0,
            averageScore: null,
            minimumScore: null,
            maximumScore: null,
        };
    }

    const total = scores.reduce(
        (sum, score) => sum + score,
        0
    );

    return {
        count: scores.length,
        averageScore: Number(
            (total / scores.length).toFixed(2)
        ),
        minimumScore: Math.min(...scores),
        maximumScore: Math.max(...scores),
    };
}


// Generates the complete analytics response.

function generateRecommendationAnalytics(recommendations) {
    const validRecommendations =
        getValidRecommendations(recommendations);

    const totalRecommendations = validRecommendations.length;

    return {
        success: true,

        summary: {
            totalRecommendations,
            uniqueArtists:
                calculateArtistFrequency(validRecommendations).length,
            uniqueGenres:
                calculateGenreDistribution(validRecommendations)
                    .genres.length,
        },

        artistFrequency:
            calculateArtistFrequency(validRecommendations),

        genreDistribution:
            calculateGenreDistribution(validRecommendations),

        explicitDistribution:
            calculateExplicitDistribution(validRecommendations),

        durationStatistics:
            calculateDurationStatistics(validRecommendations),

        albumFrequency:
            calculateAlbumFrequency(validRecommendations),

        scoreStatistics:
            calculateScoreStatistics(validRecommendations),

        metadataCoverage: {
            totalRecommendations,

            artistNamesAvailable:
                validRecommendations.filter(
                    result =>
                        typeof result.song.artistName === "string" &&
                        result.song.artistName.trim() !== ""
                ).length,

            genreMetadataAvailable:
                validRecommendations.filter(
                    result =>
                        Array.isArray(result.song.genres) &&
                        result.song.genres.some(
                            genre =>
                                typeof genre === "string" &&
                                genre.trim() !== ""
                        )
                ).length,

            durationMetadataAvailable:
                validRecommendations.filter(
                    result =>
                        typeof result.song.durationMs === "number" &&
                        Number.isFinite(result.song.durationMs) &&
                        result.song.durationMs >= 0
                ).length,
        },
    };
}


module.exports = {
    calculateArtistFrequency,
    calculateGenreDistribution,
    calculateExplicitDistribution,
    calculateDurationStatistics,
    calculateAlbumFrequency,
    calculateScoreStatistics,
    generateRecommendationAnalytics,
};
