import { apiRequest } from "./api";
import { normalizeRecommendations } from "./recommendationAdapter";

/**
 * Retrieves personalized recommendations for a Music Vault user.
 *
 * Backend endpoint:
 * GET /api/recommendations/:userId
 */
export async function getRecommendations(userId) {
  if (!userId || typeof userId !== "string") {
    throw new Error("A valid userId is required.");
  }

  const response = await apiRequest(
    `/api/recommendations/${encodeURIComponent(userId)}`
  );

  if (!response.success || !Array.isArray(response.recommendations)) {
    throw new Error("Invalid recommendation API response.");
  }

  return normalizeRecommendations(response.recommendations);
}