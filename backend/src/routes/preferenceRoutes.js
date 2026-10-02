const express = require("express");
const crypto = require("crypto");

const router = express.Router();

// Temporary in-memory storage for user song preferences.
// This allows the Preference API to be developed and tested before
// the team's database persistence layer is fully integrated.
const preferences = [];

// POST /api/preferences
// Creates and temporarily stores a new song preference for a user.
router.post("/", async (req, res) => {
    // Extract the preference fields defined in the Sprint 2 API contract.
    // Genre is optional, so it defaults to null when it is not provided.
    const {
        userId,
        songId,
        title,
        artist,
        genre = null,
    } = req.body;

    // Create the preference object and assign it a unique internal ID.
    const preference = {
        id: crypto.randomUUID(),
        userId,
        songId,
        title,
        artist,
        genre,
    };

    // Temporarily save the preference in memory.
    // This will later be replaced by the team's database persistence layer.
    preferences.push(preference);

    // Return the newly created preference to the client.
    res.status(201).json({
        success: true,
        preference,
    });
});

// GET /api/preferences/:userId
// Retrieves all stored song preferences belonging to a specific user.
router.get("/:userId", async (req, res) => {
    // Read the userId supplied as part of the URL.
    const { userId } = req.params;

    // Filter the stored preferences so that only preferences belonging
    // to the requested user are returned.
    const userPreferences = preferences.filter(
        (preference) => preference.userId === userId
    );

    // Return the user's preferences.
    // If the user has no stored preferences, this returns an empty array.
    res.status(200).json({
        success: true,
        preferences: userPreferences,
    });
});

// DELETE /api/preferences/:id
// Removes a stored song preference using its unique preference ID.
router.delete("/:id", async (req, res) => {
    // Read the preference ID supplied in the URL.
    const { id } = req.params;

    // Find the index of the preference that matches the requested ID.
    const preferenceIndex = preferences.findIndex(
        (preference) => preference.id === id
    );

    // If no matching preference exists, return a not found response.
    if (preferenceIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Preference not found.",
        });
    }

    // Remove the matching preference from the temporary in-memory store.
    const [removedPreference] = preferences.splice(preferenceIndex, 1);

    // Return the deleted preference so the client can confirm what was removed.
    res.status(200).json({
        success: true,
        preference: removedPreference,
    });
});

module.exports = router;