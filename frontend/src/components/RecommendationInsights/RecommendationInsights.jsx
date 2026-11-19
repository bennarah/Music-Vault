function RecommendationInsights({ analytics }) {
  if (!analytics?.summary || !analytics?.genreDistribution) {
    return null;
  }

  const { summary, genreDistribution } = analytics;

  const topGenres = Array.isArray(genreDistribution.genres)
    ? genreDistribution.genres.slice(0, 5)
    : [];

  return (
    <section
      className="recommendation-insights"
      aria-labelledby="recommendation-insights-title"
    >
      <h2 id="recommendation-insights-title">
        Recommendation Insights
      </h2>

      <p>
        Explore patterns across the songs MusicVault recommends
        based on your saved preferences.
      </p>

      <div className="recommendation-insights-summary">
        <article>
          <h3>Total Recommendations</h3>
          <p>{summary.totalRecommendations}</p>
        </article>

        <article>
          <h3>Unique Artists</h3>
          <p>{summary.uniqueArtists}</p>
        </article>

        <article>
          <h3>Unique Genres</h3>
          <p>{summary.uniqueGenres}</p>
        </article>
      </div>

      <div className="recommendation-insights-genres">
        <h3>Top Recommended Genres</h3>

        {topGenres.length === 0 ? (
          <p>No genre information is available.</p>
        ) : (
          <ul>
            {topGenres.map((item) => (
              <li key={item.genre}>
                <span>{item.genre}</span>
                <strong>{item.count} songs</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default RecommendationInsights;
