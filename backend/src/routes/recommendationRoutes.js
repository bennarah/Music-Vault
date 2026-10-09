
const express = require("express");

const {
  getPreferencesByUser,
  mapPreferenceRowToSong,
} = require("../models/preferenceModel");

const { getAllSongs } = require("../models/songModel");

const {
  generateRecommendations,
} = require("../services/recommendationService");

const router = express.Router();

// Converts a database song row into the format expected
// by the recommendation algorithm.
function mapSongRow(row) {
  let genres = row.genres;

  if (typeof genres === "string") {
    try {
      genres = JSON.parse(genres);
    } catch {
      genres = [];
    }
  }

  if (!Array.isArray(genres)) {
    genres = [];
  }

  return {
    spotifyId: row.spotify_id,
    title: row.title,
    artistId: row.artist_id,
    artistName: row.artist_name,
    genres,
    albumId: row.album_id,
    albumName: row.album_name,
    albumImageUrl: row.album_image_url,
    durationMs: row.duration_ms,
    explicit: Boolean(row.explicit),
    spotifyUrl: row.spotify_url,
  };
}

// GET /api/recommendations/:userId
// Generates ranked recommendations from saved user preferences.
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId || !userId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid userId is required.",
    });
  }

  try {
    // Retrieve saved user preferences.
    const preferenceRows = await getPreferencesByUser(userId);

    // A user with no preferences has no recommendations yet.
    if (preferenceRows.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
      });
    }

    const preferredSongs = preferenceRows.map(mapPreferenceRowToSong);

    // Retrieve candidate songs from the database.
    const songRows = await getAllSongs();
    const candidateSongs = songRows.map(mapSongRow);

    // Reuse Adam's existing similarity/ranking algorithm.
    const recommendations = generateRecommendations(
      preferredSongs,
      candidateSongs
    );

    return res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Failed to generate recommendations:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate recommendations.",
    });
  }
});

module.exports = router;