function SongCardSkeleton() {
  return (
    <div className="song-card song-card-skeleton" aria-hidden="true">
      <div className="song-card-artwork skeleton-block" />

      <div className="song-card-content">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-artist" />
        <div className="skeleton-block skeleton-button" />
      </div>
    </div>
  );
}

export default SongCardSkeleton;
