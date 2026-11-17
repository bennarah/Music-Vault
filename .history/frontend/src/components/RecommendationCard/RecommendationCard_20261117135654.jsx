
import "./RecommendationCard.css";

function formatDuration(durationMs) {
  if (
    typeof durationMs !== "number" ||
    !Number.isFinite(durationMs) ||
    durationMs < 0
  ) {
    return "Not available";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function RecommendationCard({ recommendation }) {
  const title =
    typeof recommendation?.title === "string" &&
    recommendation.title.trim()
      ? recommendation.title.trim()
      : "Unknown title";

  const artist =
    typeof recommendation?.artist === "string" &&
    recommendation.artist.trim()
      ? recommendation.artist.trim()
      : "Unknown artist";

  const genre =
    typeof recommendation?.genre === "string" &&
    recommendation.genre.trim()
      ? recommendation.genre.trim()
      : "Not available";

  const popularity =
    typeof recommendation?.popularity === "number" &&
    Number.isFinite(recommendation.popularity)
      ? recommendation.popularity
      : "Not available";

  const score =
    typeof recommendation?.score === "number" &&
    Number.isFinite(recommendation.score) &&
    recommendation.score >= 0 &&
    recommendation.score <= 100
      ? Math.round(recommendation.score)
      : null;

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-heading">
        <div>
          <h2>{title}</h2>
          <p>{artist}</p>
        </div>

        {score !== null && (
          <span className="recommendation-score">
            {score}% match
          </span>
        )}
      </div>

      <dl className="recommendation-details">
        <div>
          <dt>Genre</dt>
          <dd>{genre}</dd>
        </div>

        <div>
          <dt>Popularity</dt>
          <dd>{popularity}</dd>
        </div>

        <div>
          <dt>Album</dt>
          <dd>{recommendation?.albumName || "Not available"}</dd>
        </div>

        <div>
          <dt>Duration</dt>
          <dd>{formatDuration(recommendation?.durationMs)}</dd>
        </div>
      </dl>
    </article>
  );
}

export default RecommendationCard;