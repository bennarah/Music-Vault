// Validates incoming Preference API request data.

function validatePreference({ userId, songId, title, artist }) {
    // Required fields for the Sprint 2 Preference API contract.
    const requiredFields = {
        userId,
        songId,
        title,
        artist,
    };

    // Check that every required field is present and is a non-empty string.
    for (const [fieldName, value] of Object.entries(requiredFields)) {
        if (typeof value !== "string" || value.trim() === "") {
            return {
                valid: false,
                message: `Missing or invalid required field: ${fieldName}`,
            };
        }
    }

    return {
        valid: true,
        message: null,
    };
}

module.exports = {
    validatePreference,
};