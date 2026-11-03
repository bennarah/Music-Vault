const SongSimilarityStrategy = require("./SongSimilarityStrategy");

/**
 * Calculates genre similarity between two songs.
 *
 * Each unique shared genre contributes 25 points,
 * capped at 50 points.
 */
class GenreSimilarityStrategy extends SongSimilarityStrategy {
  calculateScore(preferredSong, candidateSong) {
    const preferredGenres = Array.isArray(preferredSong?.genres)
      ? preferredSong.genres
      : [];

    const candidateGenres = Array.isArray(candidateSong?.genres)
      ? candidateSong.genres
      : [];

    const sharedGenres = new Set(
      preferredGenres.filter((genre) =>
        candidateGenres.includes(genre)
      )
    );

    return Math.min(sharedGenres.size, 2) * 25;
  }
}

module.exports = GenreSimilarityStrategy;
