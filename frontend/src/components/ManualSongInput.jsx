
import { useState } from "react";

function ManualSongInput({ onSubmit, saving = false }) {
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [error, setError] = useState("");
    const [errorType, setErrorType] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();

        const cleanTitle = title.trim();
        const cleanArtist = artist.trim();

        if (!cleanTitle || !cleanArtist) {
            setErrorType("validation");
            setError("Please enter both a song title and artist.");
            return;
        }

        setError("");
        setErrorType(null);

        try {
            await onSubmit({
                title: cleanTitle,
                artist: cleanArtist,
            });

            setTitle("");
            setArtist("");
        } catch (err) {
            setErrorType("server");
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
                onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                    setErrorType(null);
                }}
                placeholder="Enter song title"
                disabled={saving}
                aria-invalid={errorType === "validation" && !title.trim()}
                aria-describedby={errorType === "validation" ? "manual-song-error" : undefined}
            />

            <label htmlFor="manual-song-artist">
                Artist
            </label>

            <input
                id="manual-song-artist"
                type="text"
                value={artist}
                onChange={(event) => {
                    setArtist(event.target.value);
                    setError("");
                    setErrorType(null);
                }}
                placeholder="Enter artist name"
                disabled={saving}
                aria-invalid={errorType === "validation" && !artist.trim()}
                aria-describedby={errorType === "validation" ? "manual-song-error" : undefined}
            />

            {error && (
                <p id="manual-song-error" role="alert">
                    {error}
                </p>
            )}

            <button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Song"}
            </button>
        </form>
    );
}

export default ManualSongInput;
