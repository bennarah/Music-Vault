
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Recommendations.css";

import RecommendationCard from "../../components/RecommendationCard/RecommendationCard";
import { getRecommendations } from "../../services/recommendationService";
import { mockRecommendations } from "../../mocks/recommendations";

// Use mock recommendations until live integration is ready.
const useMockRecommendations =
  import.meta.env.VITE_USE_MOCK_RECOMMENDATIONS === "true";

// Temporary development-only user ID.
// Replace with real user context when authentication is implemented.
const devUserId = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_USER_ID
  : undefined;

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        let results;

        if (useMockRecommendations) {
          // Temporary mock data for frontend development.
          await new Promise((resolve) => setTimeout(resolve, 800));
          results = mockRecommendations;
        } else {
          if (!devUserId) {
            throw new Error("No development user ID is configured.");
          }

          results = await getRecommendations(devUserId);
        }

        if (active) {
          setRecommendations(results);
        }
      } catch (err) {
        if (active) {
          setRecommendations([]);
          setError("Unable to load recommendations.");
          console.error("Recommendation request failed:", err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="recommendations-page"
      aria-busy={loading}
    >
      <div className="recommendations-header">
        <p className="recommendations-eyebrow">Music Vault</p>
        <h1>Your Recommendations</h1>
        <p>
          Songs selected from your preferences and ranked by similarity.
        </p>
      </div>

      {loading && (
        <div className="recommendations-state" role="status">
          <div
            className="recommendations-spinner"
            aria-hidden="true"
          />
          <h2>Loading recommendations...</h2>
          <p>Please wait while Music Vault prepares your results.</p>
        </div>
      )}

      {!loading && error && (
        <div className="recommendations-state" role="alert">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="recommendations-state" role="status">
          <h2>No recommendations found</h2>
          <p>
            We couldn't find any matching songs yet.
            Try selecting more songs to help Music Vault
            generate recommendations.
          </p>

          <Link
            to="/songs"
            className="recommendations-empty-link"
          >
            Choose Songs
          </Link>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="recommendations-grid">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.id ?? index}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Recommendations;