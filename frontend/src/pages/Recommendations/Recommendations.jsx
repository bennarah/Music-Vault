
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Recommendations.css";

import RecommendationCard from "../../components/RecommendationCard/RecommendationCard";
import RecommendationCardSkeleton from "../../components/RecommendationCard/RecommendationCardSkeleton";
import { getRecommendations } from "../../services/recommendationService";
import { getRecommendationAnalytics } from "../../services/analyticsApi";
import RecommendationInsights from "../../components/RecommendationInsights/RecommendationInsights";
import { mockRecommendations } from "../../mocks/recommendations";
import { DEV_USER_ID } from "../../config/devUser";

// Use mock recommendations until live integration is ready.
const useMockRecommendations =
  import.meta.env.VITE_USE_MOCK_RECOMMENDATIONS === "true";



function getRecommendationErrorMessage(error) {
  const message = error?.message || "";

  if (message === "No development user ID is configured.") {
    return "No development user is configured. Check your frontend environment settings.";
  }

  if (
    message.includes("Failed to fetch") ||
    message.includes("NetworkError")
  ) {
    return "Could not connect to the Music Vault backend. Please check that the server is running.";
  }

  return "Unable to load recommendations. Please try again.";
}

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("score-desc");
  const [genreFilter, setGenreFilter] = useState("all");
  // Recommendation analytics load independently from song cards.
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");


  // Prevent updates from requests belonging to an older effect.
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;

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
          if (!DEV_USER_ID) {
            throw new Error("No development user ID is configured.");
          }

          results = await getRecommendations(DEV_USER_ID);
        }

        if (currentRequest === requestId.current) {
          setRecommendations(results);
        }
      } catch (err) {
        if (currentRequest === requestId.current) {
          setRecommendations([]);
          setError(getRecommendationErrorMessage(err));
          console.error("Recommendation request failed:", err);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      requestId.current += 1;
    };
  }, [retryCount]);

  // Load recommendation analytics independently from song cards.
  useEffect(() => {
    let active = true;

    // Mock recommendations do not correspond to live backend analytics.
    if (useMockRecommendations || !DEV_USER_ID) {
      return () => {
        active = false;
      };
    }

    async function loadAnalytics() {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      setAnalytics(null);

      try {
        const result = await getRecommendationAnalytics(DEV_USER_ID);

        if (active) {
          setAnalytics(result);
        }
      } catch {
        if (active) {
          setAnalytics(null);
          setAnalyticsError(
            "Recommendation insights are temporarily unavailable."
          );
        }
      } finally {
        if (active) {
          setAnalyticsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const normalizeGenre = (genre) =>
    typeof genre === "string"
      ? genre.trim().toLowerCase()
      : "";

  const availableGenres = useMemo(() => {
    const genres = recommendations
      .map((item) => normalizeGenre(item?.genre))
      .filter(Boolean);

    return [...new Set(genres)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    if (genreFilter === "all") return recommendations;

    if (genreFilter === "unknown") {
      return recommendations.filter(
        (item) => !normalizeGenre(item?.genre)
      );
    }

    return recommendations.filter(
      (item) => normalizeGenre(item?.genre) === genreFilter
    );
  }, [recommendations, genreFilter]);

  const sortedRecommendations = useMemo(() => {
    const validValue = (recommendation, field) => {
      const value = recommendation?.[field];

      return typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 100
        ? value
        : null;
    };

    const sortByPopularity = sortOrder.startsWith("popularity-");
    const field = sortByPopularity ? "popularity" : "score";
    const ascending = sortOrder.endsWith("-asc");

    return [...filteredRecommendations].sort((a, b) => {
      const valueA = validValue(a, field);
      const valueB = validValue(b, field);

      // Missing or invalid values always appear last.
      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return 1;
      if (valueB === null) return -1;

      return ascending
        ? valueA - valueB
        : valueB - valueA;
    });
  }, [filteredRecommendations, sortOrder]);

  function handleRetry() {
    if (!loading) {
      setRetryCount((count) => count + 1);
    }
  }

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
        <div className="recommendations-loading">
          <div className="recommendations-loading-message" role="status">
            <h2>Loading recommendations...</h2>
            <p>Please wait while Music Vault prepares your results.</p>
          </div>

          <div className="recommendations-grid" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <RecommendationCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="recommendations-state" role="alert">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button
            type="button"
            className="recommendations-retry-button"
            onClick={handleRetry}
          >
            Try Again
          </button>
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
        <>
          {!useMockRecommendations && (
            <div className="recommendations-analytics">
              {analyticsLoading && (
                <p role="status">
                  Loading recommendation insights...
                </p>
              )}

              {!analyticsLoading && analyticsError && (
                <p className="recommendations-analytics-error" role="status">
                  {analyticsError}
                </p>
              )}

              {!analyticsLoading && !analyticsError && analytics && (
                <RecommendationInsights analytics={analytics} />
              )}
            </div>
          )}

          <div className="recommendations-toolbar">
            <label htmlFor="recommendations-genre">
              Filter by genre
            </label>

            <select
              id="recommendations-genre"
              value={genreFilter}
              onChange={(event) => setGenreFilter(event.target.value)}
            >
              <option value="all">All Genres</option>
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
              <option value="unknown">Unknown Genre</option>
            </select>

            <label htmlFor="recommendations-sort">
              Sort by
            </label>

            <select
              id="recommendations-sort"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="score-desc">Highest match first</option>
              <option value="score-asc">Lowest match first</option>
              <option value="popularity-desc">Highest popularity first</option>
              <option value="popularity-asc">Lowest popularity first</option>
            </select>
          </div>

          {sortedRecommendations.length === 0 ? (
            <div className="recommendations-state" role="status">
              <h2>No matching recommendations</h2>
              <p>
                No songs match the selected genre.
                Try another genre or view all recommendations.
              </p>
              <button
                type="button"
                className="recommendations-retry-button"
                onClick={() => setGenreFilter("all")}
              >
                Show All Genres
              </button>
            </div>
          ) : (
            <div className="recommendations-grid">
              {sortedRecommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.id ?? index}
                  recommendation={recommendation}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Recommendations;