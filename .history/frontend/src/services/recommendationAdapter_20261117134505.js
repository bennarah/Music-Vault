
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

  // Outdated normalization logic (commented out). Bring back if new implemementation breaks something.
  // return {
  //   id: safeText(song.spotifyId, null),
  //   title: safeText(song.title, "Unknown title"),
  //   artist: safeText(song.artistName, "Unknown artist"),
  //   genre: genre ? genre.trim() : null,
  //   popularity,
  //   score,
  // };

  return {
    id: safeText(song.spotifyId, null),
    title: safeText(song.title, "Unknown title"),
    artist: safeText(song.artistName, "Unknown artist"),
    genre: genre ? genre.trim() : null,
    popularity,
    score,

    // Additional metadata for recommendation cards
    albumName: safeText(song.albumName, null),
    albumImageUrl: safeText(song.albumImageUrl, null),

    durationMs:
      typeof song.durationMs === "number" &&
      Number.isFinite(song.durationMs) &&
      song.durationMs >= 0
        ? song.durationMs
        : null,

    spotifyUrl: safeText(song.spotifyUrl, null),
  };
}

export function normalizeRecommendations(results) {
  if (!Array.isArray(results)) {
    throw new Error("Invalid recommendation response format.");
  }

  return results.map(normalizeRecommendation);
}