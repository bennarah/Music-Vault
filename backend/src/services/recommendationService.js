const preferredSongs = [
  {
    spotifyId: "abc123",
    title: "Example Song",
    artistId: "artist1",
    artistName: "Example Artist",
    genres: ["rock", "alternative rock"],
    albumId: "album1",
    albumName: "Example Album",
    durationMs: 210000,
    explicit: false
  }
];

function calculateSimilarity(preferredSong, candidateSong) {
  let score = 0;

  // Same artist
  if (
    preferredSong.artistId &&
    candidateSong.artistId &&
    preferredSong.artistId === candidateSong.artistId
  ) {
    score += 40;
  }

  // Shared genres
  const preferredGenres = preferredSong.genres || [];
  const candidateGenres = candidateSong.genres || [];

  const sharedGenres = [
    ...new Set(
      preferredGenres.filter((genre) =>
        candidateGenres.includes(genre)
      )
    ),
  ];

  score += Math.min(sharedGenres.length, 2) * 25;

  // Similar duration
  if (
    typeof preferredSong.durationMs === "number" &&
    Number.isFinite(preferredSong.durationMs) &&
    typeof candidateSong.durationMs === "number" &&
    Number.isFinite(candidateSong.durationMs)
  ) {
    const durationDifference = Math.abs(
      preferredSong.durationMs - candidateSong.durationMs
    );

    if (durationDifference <= 30000) {
      score += 10;
    } else if (durationDifference <= 60000) {
      score += 5;
    }
  }

  return score;
}

function generateRecommendations(preferredSongs, candidateSongs) {
  if (
    !Array.isArray(preferredSongs) ||
    !Array.isArray(candidateSongs) ||
    preferredSongs.length === 0 ||
    candidateSongs.length === 0
  ) {
    return [];
  }

  // Step 1: Remove duplicate candidate songs
  const uniqueCandidates = removeDuplicateSongs(candidateSongs);

  // Step 2: Identify songs the user already likes
  const preferredIds = new Set(
    preferredSongs
      .filter((song) => song && song.spotifyId)
      .map((song) => song.spotifyId)
  );

  // Step 3: Remove already-liked songs
  const newCandidates = uniqueCandidates.filter(
    (song) => !preferredIds.has(song.spotifyId)
  );

  // Step 4: Score remaining candidates
  return newCandidates
    .map((candidate) => {
      const scores = preferredSongs
        .filter((song) => song && typeof song === "object")
        .map((preferred) =>
          calculateSimilarity(preferred, candidate)
        );

      const score = scores.length > 0
        ? Math.max(...scores)
        : 0;

      return {
        song: candidate,
        score,
      };
    })

    // Step 5: Remove candidates with no similarity
    .filter((result) => result.score > 0)

    // Step 6: Rank highest to lowest
    .sort((a, b) => b.score - a.score);
}

function rankRecommendations(preferredSongs, candidateSongs) {
  return candidateSongs
    .map((candidate) => {
      const score = Math.max(
        ...preferredSongs.map((preferred) =>
          calculateSimilarity(preferred, candidate)
        )
      );

      return {
        song: candidate,
        score,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

function removeDuplicateSongs(songs) {
  const seenIds = new Set();

  return songs.filter((song) => {
    // Skip invalid songs or missing Spotify IDs
    if (
      !song ||
      typeof song.spotifyId !== "string" ||
      !song.spotifyId.trim()
    ) {
      return false;
    }

    // Skip songs we've already encountered
    if (seenIds.has(song.spotifyId)) {
      return false;
    }

    // Remember this Spotify ID
    seenIds.add(song.spotifyId);

    return true;
  });
}

module.exports = {
  calculateSimilarity,
  generateRecommendations,
  rankRecommendations,
  removeDuplicateSongs,
};