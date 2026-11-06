/**
 * Experimental discovery adjustment for Music Vault.
 *
 * Evaluates whether less-popular songs should receive
 * a small ranking advantage without changing their
 * original similarity scores.
 *
 * Not integrated into production recommendations.
 */

function calculateDiscoveryBonus(popularity) {
  if (
    typeof popularity !== "number" ||
    !Number.isFinite(popularity) ||
    popularity < 0 ||
    popularity > 100
  ) {
    return 0;
  }

  return Math.round((100 - popularity) / 20);
}

function evaluateDiscoveryAdjustment(recommendations) {
  if (!Array.isArray(recommendations)) {
    return [];
  }

  return recommendations
    .filter(
      (result) =>
        result &&
        typeof result.score === "number" &&
        Number.isFinite(result.score)
    )
    .map((result) => {
      const bonus = calculateDiscoveryBonus(
        result.song?.popularity
      );

      return {
        ...result,
        discoveryBonus: bonus,
        adjustedScore: result.score + bonus,
      };
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore);
}

module.exports = {
  calculateDiscoveryBonus,
  evaluateDiscoveryAdjustment,
};
