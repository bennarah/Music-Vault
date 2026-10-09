const candidateSongs = [
    {
        spotifyId: "song-001",
        title: "Example Rock Song",
        artistName: "Artist A",
        genres: ["rock"],
        durationMs: 200000,
    },
    {
        spotifyId: "song-002",
        title: "Example Pop Song",
        artistName: "Artist B",
        genres: ["pop"],
        durationMs: 180000,
    },
    {
        spotifyId: "song-002",
        title: "Duplicate Pop Song",
        artistName: "Artist B",
        genres: ["pop"],
        durationMs: 180000,
    },
    {
        spotifyId: null,
        title: "Invalid Song",
        artistName: "Artist C",
        genres: [],
    },
];

module.exports = { candidateSongs };