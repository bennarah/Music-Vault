function RecommendationCardSkeleton() {
  return (
    <div
      className="recommendation-card recommendation-card-skeleton"
      aria-hidden="true"
    >
      <div className="recommendation-card-artwork skeleton-block" />

      <div className="recommendation-card-body">
        <div className="skeleton-block recommendation-skeleton-title" />
        <div className="skeleton-block recommendation-skeleton-artist" />

        <div className="recommendation-skeleton-details">
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      </div>
    </div>
  );
}

export default RecommendationCardSkeleton;
