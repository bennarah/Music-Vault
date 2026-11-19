const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5001"
).replace(/\/+$/, "");

export async function getRecommendationAnalytics(userId) {
  if (typeof userId !== "string" || !userId.trim()) {
    throw new Error("A user ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/recommendations/${encodeURIComponent(userId)}/analytics`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to retrieve recommendation analytics."
    );
  }

  if (
    data.success !== true ||
    !data.summary ||
    !Array.isArray(data.artistFrequency) ||
    !data.genreDistribution ||
    !Array.isArray(data.genreDistribution.genres)
  ) {
    throw new Error("Invalid recommendation analytics response.");
  }

  return data;
}
