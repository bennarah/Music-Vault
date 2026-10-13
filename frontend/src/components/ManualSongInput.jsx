
import { useState } from "react";

function ManualSongInput({ onSubmit, saving = false }) {
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        const cleanTitle = title.trim();
        const cleanArtist = artist.trim();

        if (!cleanTitle || !cleanArtist) {
            setError("Please enter both a song title and artist.");
            return;
        }

        setError("");

        try {
            await onSubmit({
                title: cleanTitle,
                artist: cleanArtist,
            });

            setTitle("");
            setArtist("");
        } catch (err) {
            setError(err.message || "Unable to add song.");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Enter a Song Manually</h2>

            <label htmlFor="manual-song-title">
                Song title
            </label>

            <input
                id="manual-song-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter song title"
                disabled={saving}
            />

            <label htmlFor="manual-song-artist">
                Artist
            </label>

            <input
                id="manual-song-artist"
                type="text"
                value={artist}
                onChange={(event) => setArtist(event.target.value)}
                placeholder="Enter artist name"
                disabled={saving}
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Song"}
            </button>
        </form>
    );
}

export default ManualSongInput;
