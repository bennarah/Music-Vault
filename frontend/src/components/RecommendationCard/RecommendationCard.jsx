import "./RecommendationCard.css";

function RecommendationCard({ recommendation }) {
  return (
    <article className="recommendation-card">
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
  );
}

export default RecommendationCard;