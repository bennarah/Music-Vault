
/**
 * Normalizes backend recommendation data for the
 * RecommendationCard component.
 *
 * Expected backend format:
 * {
 *   song: { spotifyId, title, artistName, genres, ... },
 *   score: number
 * }
 */

function safeText(value, fallback) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

export function normalizeRecommendation(result) {
  const song =
    result?.song &&
    typeof result.song === "object" &&
    !Array.isArray(result.song)
      ? result.song
      : {};

  const genres = Array.isArray(song.genres)
    ? song.genres
    : [];

  const genre = genres.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  const popularity =
    typeof song.popularity === "number" &&
    Number.isFinite(song.popularity)
      ? song.popularity
      : null;

  const score =
    typeof result?.score === "number" &&
    Number.isFinite(result.score) &&
    result.score >= 0 &&
    result.score <= 100
      ? result.score
      : null;

  return {
    id: safeText(song.spotifyId, null),
    title: safeText(song.title, "Unknown title"),
    artist: safeText(song.artistName, "Unknown artist"),
    genre: genre ? genre.trim() : null,
    popularity,
    score,
  };
}

export function normalizeRecommendations(results) {
  if (!Array.isArray(results)) {
    throw new Error("Invalid recommendation response format.");
  }

  return results.map(normalizeRecommendation);
}