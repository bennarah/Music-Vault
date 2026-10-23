
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:5000"
).replace(/\/+$/, "");

export async function getRecommendations(userId) {
    if (!userId) {
        throw new Error("A user ID is required.");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/recommendations/${encodeURIComponent(userId)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to retrieve recommendations."
        );
    }

    return data.recommendations;
}
