function SongCard({ track, onSelect, saving = false }) {
  return (
    <article className="song-card">
      <div className="song-card-artwork">
        {track.albumImageUrl ? (
          <img
            src={track.albumImageUrl}
            alt={`${track.albumName || track.title} cover`}
            loading="lazy"
          />
        ) : (
          <div className="song-card-artwork-placeholder" aria-hidden="true">
            ♪
          </div>
        )}
      </div>

      <div className="song-card-content">
        <h3>{track.title}</h3>
        <p className="song-card-artist">{track.artistName}</p>

        {track.albumName && (
          <p className="song-card-album">{track.albumName}</p>
        )}

        <button
          type="button"
          onClick={() => onSelect(track)}
          disabled={saving}
        >
          {saving ? "Saving..." : "Select Song"}
        </button>
      </div>
    </article>
  );
}

export default SongCard;
