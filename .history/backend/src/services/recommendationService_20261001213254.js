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

  const sharedGenres = preferredGenres.filter((genre) =>
    candidateGenres.includes(genre)
  );

  score += sharedGenres.length * 25;

  // Similar duration
  const durationDifference = Math.abs(
    preferredSong.durationMs - candidateSong.durationMs
  );

  if (durationDifference <= 30000) {
    score += 10;
  } else if (durationDifference <= 60000) {
    score += 5;
  }

  return score;
}

function generateRecommendations(preferredSongs, candidateSongs) {
  if (!preferredSongs.length || !candidateSongs.length) {
    return [];
  }

  // Get the Spotify IDs of songs the user already likes
  const preferredIds = new Set(
    preferredSongs.map((song) => song.spotifyId)
  );

  // Remove already-liked songs from recommendation candidates
  const newCandidates = candidateSongs.filter(
    (song) => !preferredIds.has(song.spotifyId)
  );

  // Score and rank the remaining candidates
  return newCandidates
    .map((candidate) => {
      const scores = preferredSongs.map((preferred) =>
        calculateSimilarity(preferred, candidate)
      );

      const score = Math.max(...scores);

      return {
        song: candidate,
        score,
      };
    })
    .filter((result) => result.score > 0)
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

module.exports = {
  calculateSimilarity,
  generateRecommendations,
  rankRecommendations,
};