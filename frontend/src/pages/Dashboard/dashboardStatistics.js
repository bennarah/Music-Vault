function cleanValue(value, fallback) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function countBy(preferences, field, fallback) {
  const counts = new Map();

  for (const preference of preferences) {
    const label = cleanValue(preference?.[field], fallback);
    const key = label.toLowerCase();

    if (!counts.has(key)) {
      counts.set(key, { name: label, count: 0 });
    }

    counts.get(key).count += 1;
  }

  return [...counts.values()].sort(
    (a, b) => b.count - a.count ||
      a.name.localeCompare(b.name)
  );
}

export function getDashboardStatistics(preferences) {
  const songs = Array.isArray(preferences) ? preferences : [];

  const genreDistribution = countBy(
    songs,
    "genre",
    "Unknown Genre"
  );

  const topArtists = countBy(
    songs,
    "artist",
    "Unknown Artist"
  );

  const knownGenreCount = songs.filter(
    (song) =>
      typeof song?.genre === "string" &&
      song.genre.trim()
  ).length;

  return {
    totalSongs: songs.length,
    uniqueArtists: topArtists.filter(
      (artist) => artist.name !== "Unknown Artist"
    ).length,
    knownGenreCount,
    genreDistribution,
    topArtists,
  };
}
