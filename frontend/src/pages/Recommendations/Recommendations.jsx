import { useEffect, useState } from "react";
import "./Recommendations.css";

const mockRecommendations = [
  {
    id: 1,
    title: "Midnight Drive",
    artist: "The Echo Lines",
    genre: "Alternative",
    popularity: 42,
    score: 0.91,
  },
  {
    id: 2,
    title: "Paper Satellites",
    artist: "Northbound",
    genre: "Indie Rock",
    popularity: 35,
    score: 0.84,
  },
  {
    id: 3,
    title: "Afterglow",
    artist: "Velvet Static",
    genre: null,
    popularity: null,
    score: 0.79,
  },
];

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        // Temporary mock while the backend recommendation endpoint
        // remains unavailable.
        await new Promise((resolve) => setTimeout(resolve, 800));

        setRecommendations(mockRecommendations);
      } catch {
        setError("Unable to load recommendations.");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  return (
    <section className="recommendations-page">
      <div className="recommendations-header">
        <p className="recommendations-eyebrow">Music Vault</p>
        <h1>Your Recommendations</h1>
        <p>
          Songs selected from your preferences and ranked by similarity.
        </p>
      </div>

      {loading && (
        <div className="recommendations-state" role="status">
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
        <div className="recommendations-state">
          <h2>No recommendations found</h2>
          <p>
            Add more song preferences and try generating recommendations again.
          </p>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="recommendations-grid">
          {recommendations.map((recommendation) => (
            <article
              className="recommendation-card"
              key={recommendation.id}
            >
              <div className="recommendation-card-heading">
                <div>
                  <h2>{recommendation.title || "Unknown title"}</h2>
                  <p>{recommendation.artist || "Unknown artist"}</p>
                </div>

                {recommendation.score != null && (
                  <span className="recommendation-score">
                    {Math.round(recommendation.score * 100)}% match
                  </span>
                )}
              </div>

              <dl className="recommendation-details">
                <div>
                  <dt>Genre</dt>
                  <dd>{recommendation.genre || "Not available"}</dd>
                </div>

                <div>
                  <dt>Popularity</dt>
                  <dd>
                    {recommendation.popularity != null
                      ? recommendation.popularity
                      : "Not available"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Recommendations;