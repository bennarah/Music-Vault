
function SongCard({ track, onSelect, saving = false }) {
    return (
        <article className="song-card">
            {track.albumImageUrl && (
                <img
                    src={track.albumImageUrl}
                    alt={`${track.albumName || track.title} cover`}
                    width="100"
                />
            )}

            <h3>{track.title}</h3>

            <p>{track.artistName}</p>

            {track.albumName && (
                <p>{track.albumName}</p>
            )}

            <button
                type="button"
                onClick={() => onSelect(track)}
                disabled={saving}
            >
                {saving ? "Saving..." : "Select Song"}
            </button>
        </article>
    );
}

export default SongCard;
