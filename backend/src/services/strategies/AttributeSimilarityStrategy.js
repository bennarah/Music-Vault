const SongSimilarityStrategy = require("./SongSimilarityStrategy");

/**
 * Calculates similarity using available song attributes.
 *
 * Currently supports duration similarity, preserving
 * Music Vault's existing 10-point duration contribution.
 */
class AttributeSimilarityStrategy extends SongSimilarityStrategy {
  calculateScore(preferredSong, candidateSong) {
    const preferredDuration = preferredSong?.durationMs;
    const candidateDuration = candidateSong?.durationMs;

    if (
      typeof preferredDuration !== "number" ||
      typeof candidateDuration !== "number" ||
      !Number.isFinite(preferredDuration) ||
      !Number.isFinite(candidateDuration) ||
      preferredDuration < 0 ||
      candidateDuration < 0
    ) {
      return 0;
    }

    const difference = Math.abs(
      preferredDuration - candidateDuration
    );

    if (difference <= 30000) {
      return 10;
    }

    if (difference <= 60000) {
      return 5;
    }

    return 0;
  }
}

module.exports = AttributeSimilarityStrategy;
