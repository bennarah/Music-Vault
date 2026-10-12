
/**
 * Temporary recommendation data used while the backend
 * recommendation REST endpoint is unavailable.
 *
 * Scores use the team's planned 0–100 percentage scale.
 */
export const mockRecommendations = [
  {
    id: "mock-song-1",
    title: "Midnight Drive",
    artist: "The Echo Lines",
    genre: "Alternative",
    popularity: 42,
    score: 91,
  },
  {
    id: "mock-song-2",
    title: "Paper Satellites",
    artist: "Northbound",
    genre: "Indie Rock",
    popularity: 35,
    score: 84,
  },
  {
    id: "mock-song-3",
    title: "Afterglow",
    artist: "Velvet Static",
    genre: null,
    popularity: null,
    score: 79,
  },
];
