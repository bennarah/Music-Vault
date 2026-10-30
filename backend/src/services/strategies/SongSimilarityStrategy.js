/**
 * Base contract for Music Vault song similarity strategies.
 *
 * Each concrete strategy must implement calculateScore()
 * and return a numeric similarity score from 0 to 100.
 *
 * This class does not change the existing recommendation
 * algorithm. Integration will occur in a later ticket.
 */
class SongSimilarityStrategy {
  calculateScore(preferredSong, candidateSong) {
    throw new Error(
      "Similarity strategies must implement calculateScore()."
    );
  }
}

module.exports = SongSimilarityStrategy;
