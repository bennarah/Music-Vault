
/**
 * Converts a backend recommendation result into the format
 * expected by the RecommendationCard component.
 *
 * Backend format:
 * {
 *   song: { spotifyId, title, artistName, genres, ... },
 *   score: number
 * }
 */

export function normalizeRecommendation(result) {
  const song = result?.song ?? {};

  const genres = Array.isArray(song.genres)
    ? song.genres
    : [];

  return {
    id: song.spotifyId ?? null,
    title: song.title || "Unknown title",
    artist: song.artistName || "Unknown artist",
    genre: genres[0] || null,
    popularity: song.popularity ?? null,

    // Preserve the backend's raw score.
    // The team is updating the algorithm to a 0–100 scale.
    score: result?.score ?? null,
  };
}

export function normalizeRecommendations(results) {
  if (!Array.isArray(results)) {
    throw new Error("Invalid recommendation response format.");
  }

  return results.map(normalizeRecommendation);
}