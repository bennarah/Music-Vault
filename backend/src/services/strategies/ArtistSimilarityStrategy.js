const SongSimilarityStrategy = require("./SongSimilarityStrategy");

/**
 * Calculates artist similarity between two songs.
 *
 * Matching artist IDs contribute 40 points.
 * Missing or invalid artist IDs contribute 0 points.
 */
class ArtistSimilarityStrategy extends SongSimilarityStrategy {
  calculateScore(preferredSong, candidateSong) {
    const preferredArtist = preferredSong?.artistId;
    const candidateArtist = candidateSong?.artistId;

    if (
      typeof preferredArtist !== "string" ||
      typeof candidateArtist !== "string" ||
      !preferredArtist.trim() ||
      !candidateArtist.trim()
    ) {
      return 0;
    }

    return preferredArtist === candidateArtist ? 40 : 0;
  }
}

module.exports = ArtistSimilarityStrategy;
