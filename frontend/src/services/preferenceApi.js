
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:5001";

/**
 * Save a song preference using the existing backend API.
 *
 * IMPORTANT:
 * The backend currently stores preferences in memory.
 */
export async function savePreference(preference) {
    const response = await fetch(
        `${API_BASE_URL}/api/preferences`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(preference),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to save preference."
        );
    }

    return data.preference;
}

/**
 * Retrieve preferences for a particular user.
 */
export async function getPreferences(userId) {
    const response = await fetch(
        `${API_BASE_URL}/api/preferences/${encodeURIComponent(userId)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to retrieve preferences."
        );
    }

    return data.preferences;
}

/**
 * Delete a preference by its internal preference ID.
 */
export async function deletePreference(preferenceId) {
    const response = await fetch(
        `${API_BASE_URL}/api/preferences/${encodeURIComponent(preferenceId)}`,
        {
            method: "DELETE",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to delete preference."
        );
    }

    return data.preference;
}
