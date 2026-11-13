/**
 * Music Vault Recommendation CSV Generator
 *
 * Jira: SCRUM-108
 * Developer: Bassma Ennarah
 *
 * Converts ranked recommendation results into CSV format.
 * Uses the schema defined in:
 * docs/recommendation-csv-schema.md
 */

const CSV_HEADERS = [
  "title",
  "artist",
  "genre",
  "album",
  "duration_ms",
  "similarity_score",
  "spotify_id",
  "spotify_url",
];

/**
 * Converts a value into a CSV-safe string.
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Converts a recommendation into a CSV row.
 */
function recommendationToRow(recommendation) {
  const song = recommendation?.song ?? {};

  const genres = Array.isArray(song.genres)
    ? song.genres.filter(
        (genre) => typeof genre === "string" && genre.trim()
      ).join("; ")
    : "";

  const duration =
    typeof song.durationMs === "number" &&
    Number.isFinite(song.durationMs)
      ? song.durationMs
      : "";

  const score =
    typeof recommendation?.score === "number" &&
    Number.isFinite(recommendation.score) &&
    recommendation.score >= 0 &&
    recommendation.score <= 100
      ? recommendation.score
      : "";

  return [
    song.title ?? "",
    song.artistName ?? "",
    genres,
    song.albumName ?? "",
    duration,
    score,
    song.spotifyId ?? "",
    song.spotifyUrl ?? "",
  ].map(escapeCsvValue).join(",");
}

/**
 * Generates a CSV document from recommendation results.
 */
function generateRecommendationCsv(recommendations) {
  if (!Array.isArray(recommendations)) {
    throw new TypeError(
      "Recommendations must be an array."
    );
  }

  const rows = recommendations.map(recommendationToRow);

  return [
    CSV_HEADERS.join(","),
    ...rows,
  ].join("\r\n") + "\r\n";
}

module.exports = {
  CSV_HEADERS,
  escapeCsvValue,
  recommendationToRow,
  generateRecommendationCsv,
};
