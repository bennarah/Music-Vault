const SongSimilarityStrategy = require("./SongSimilarityStrategy");
const GenreSimilarityStrategy = require("./GenreSimilarityStrategy");
const ArtistSimilarityStrategy = require("./ArtistSimilarityStrategy");
const AttributeSimilarityStrategy = require("./AttributeSimilarityStrategy");

/**
 * Combines genre, artist, and attribute similarity scores.
 *
 * Maximum contributions:
 * Genre: 50, Artist: 40, Attribute: 10
 * Total: 100
 */
class CombinedSimilarityStrategy extends SongSimilarityStrategy {
  constructor() {
    super();

    this.strategies = [
      { strategy: new GenreSimilarityStrategy(), maxScore: 50 },
      { strategy: new ArtistSimilarityStrategy(), maxScore: 40 },
      { strategy: new AttributeSimilarityStrategy(), maxScore: 10 },
    ];
  }

  calculateScore(preferredSong, candidateSong) {
    return this.strategies.reduce((total, { strategy, maxScore }) => {
      const score = strategy.calculateScore(
        preferredSong,
        candidateSong
      );

      if (
        typeof score !== "number" ||
        !Number.isFinite(score) ||
        score < 0 ||
        score > maxScore
      ) {
        throw new Error("Invalid similarity strategy score.");
      }

      return total + score;
    }, 0);
  }
}

module.exports = CombinedSimilarityStrategy;
