
import { useEffect, useRef, useState } from "react";

import {
    savePreference,
    getPreferences,
    deletePreference,
} from "../services/preferenceApi";

import SongCard from "../components/SongCard";
import ManualSongInput from "../components/ManualSongInput";

// Backend API address.
// Can be overridden through frontend/.env.
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:5001"
).replace(/\/+$/, "");

// Temporary development user.
// Replace with authenticated user information later.
const DEV_USER_ID = "musicvault-demo-user";

function SongSelectionPage() {
    const [query, setQuery] = useState("");
    const [tracks, setTracks] = useState([]);
    const [selectedTracks, setSelectedTracks] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingPreferences, setLoadingPreferences] =
        useState(true);
    const [saving, setSaving] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Prevent overlapping preference mutations.
    const savingRef = useRef(false);

    // --------------------------------------------------------
    // Load existing preferences when the page opens.
    // --------------------------------------------------------

    useEffect(() => {
        let active = true;

        async function loadPreferences() {
            try {
                const preferences = await getPreferences(
                    DEV_USER_ID
                );

                if (!active) return;

                const savedTracks = preferences.map(
                    (preference) => ({
                        spotifyId: preference.songId,
                        title: preference.title,
                        artistName: preference.artist,
                        genres: preference.genre
                            ? [preference.genre]
                            : [],
                        preferenceId: preference.id,
                    })
                );

                setSelectedTracks(savedTracks);
            } catch (err) {
                if (active) {
                    setError(
                        "Unable to load saved preferences. " +
                        "Check that the backend is running."
                    );
                }
            } finally {
                if (active) {
                    setLoadingPreferences(false);
                }
            }
        }

        loadPreferences();

        return () => {
            active = false;
        };
    }, []);

    // --------------------------------------------------------
    // Shared Spotify search helper.
    // --------------------------------------------------------

    async function fetchSpotifyTracks(searchQuery) {
        const url =
            `${API_BASE_URL}/api/spotify/search?q=` +
            encodeURIComponent(searchQuery);

        let response;

        try {
            response = await fetch(url);
        } catch {
            throw new Error(
                "Could not connect to the MusicVault backend. " +
                "Check the backend port and CORS settings."
            );
        }

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "The backend returned an invalid response."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Spotify search failed."
            );
        }

        if (!Array.isArray(data.tracks)) {
            throw new Error(
                "The backend returned an invalid song list."
            );
        }

        return data.tracks;
    }

    // --------------------------------------------------------
    // Search Spotify by song title or artist.
    // --------------------------------------------------------

    async function handleSearch(event) {
        event.preventDefault();

        const cleanQuery = query.trim();

        if (!cleanQuery) {
            setError("Enter a song or artist to search.");
            setTracks([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");
        setTracks([]);
        setHasSearched(true);

        try {
            const results = await fetchSpotifyTracks(
                cleanQuery
            );

            setTracks(results);
        } catch (err) {
            setError(
                err.message || "Unable to search for songs."
            );
        } finally {
            setLoading(false);
        }
    }

    // --------------------------------------------------------
    // Save a selected Spotify track as a preference.
    // --------------------------------------------------------

    async function handleSelectTrack(track) {
        if (savingRef.current || loadingPreferences) return;

        if (!track?.spotifyId) {
            setError("This song has no valid Spotify ID.");
            return;
        }

        const alreadySelected = selectedTracks.some(
            (song) => song.spotifyId === track.spotifyId
        );

        if (alreadySelected) {
            setError("");
            setMessage("This song is already selected.");
            return;
        }

        savingRef.current = true;
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const savedPreference = await savePreference({
                userId: DEV_USER_ID,
                songId: track.spotifyId,
                title: track.title,
                artist: track.artistName,
                genre: track.genres?.[0] || null,
            });

            setSelectedTracks((previous) => [
                ...previous,
                {
                    ...track,
                    preferenceId: savedPreference.id,
                },
            ]);

            setMessage(
                `Saved "${track.title}" by ${track.artistName}.`
            );
        } catch (err) {
            setError(
                err.message || "Unable to save preference."
            );
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    // --------------------------------------------------------
    // Resolve manually entered songs through Spotify.
    // --------------------------------------------------------

    async function handleManualSong(song) {
        if (savingRef.current) return;

        setLoading(true);
        setError("");
        setMessage("");
        setHasSearched(true);

        try {
            const searchQuery =
                `track:${song.title} artist:${song.artist}`;

            const matches = await fetchSpotifyTracks(
                searchQuery
            );

            setTracks(matches);
            setQuery(searchQuery);

            if (matches.length === 0) {
                throw new Error(
                    "No matching songs found. Try a different " +
                    "title or artist."
                );
            }

            setMessage(
                "Possible matches found. Select the correct song."
            );
        } catch (err) {
            setError(
                err.message || "Unable to look up the song."
            );

            // Let ManualSongInput retain its form values.
            throw err;
        } finally {
            setLoading(false);
        }
    }

    // --------------------------------------------------------
    // Remove a saved preference.
    // --------------------------------------------------------

    async function handleRemoveTrack(track) {
        if (savingRef.current || loadingPreferences) return;

        if (!track.preferenceId) {
            setError("Cannot remove preference: missing ID.");
            return;
        }

        savingRef.current = true;
        setSaving(true);
        setError("");
        setMessage("");

        try {
            await deletePreference(track.preferenceId);

            setSelectedTracks((previous) =>
                previous.filter(
                    (song) =>
                        song.preferenceId !== track.preferenceId
                )
            );

            setMessage(`Removed "${track.title}".`);
        } catch (err) {
            setError(
                err.message || "Unable to remove preference."
            );
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    // --------------------------------------------------------
    // Render the page.
    // --------------------------------------------------------

    return (
        <main className="song-selection-page">
            <h1>Select Songs You Like</h1>

            <section>
                <h2>Search Spotify</h2>

                <form onSubmit={handleSearch}>
                    <label htmlFor="song-search">
                        Song or artist
                    </label>

                    <input
                        id="song-search"
                        type="text"
                        value={query}
                        onChange={(event) =>
                            setQuery(event.target.value)
                        }
                        placeholder="Search for a song or artist"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>
            </section>

            <section>
                <h2>Search Results</h2>

                {loading && (
                    <p role="status">
                        Searching for songs...
                    </p>
                )}

                {!loading &&
                    hasSearched &&
                    tracks.length === 0 &&
                    !error && (
                        <p>No matching songs found.</p>
                    )}

                {!loading &&
                    !hasSearched && (
                        <p>Search for a song to get started.</p>
                    )}

                {tracks.map((track) => (
                    <SongCard
                        key={track.spotifyId}
                        track={track}
                        onSelect={handleSelectTrack}
                        saving={saving || loadingPreferences}
                    />
                ))}
            </section>

            <section>
                <ManualSongInput
                    onSubmit={handleManualSong}
                    saving={loading}
                />
            </section>

            <section>
                <h2>Selected Songs</h2>

                {loadingPreferences ? (
                    <p>Loading saved songs...</p>
                ) : selectedTracks.length === 0 ? (
                    <p>No songs selected yet.</p>
                ) : (
                    <ul>
                        {selectedTracks.map((track) => (
                            <li key={track.preferenceId}>
                                {track.title} — {track.artistName}

                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                        handleRemoveTrack(track)
                                    }
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {error && (
                <p role="alert">{error}</p>
            )}

            {message && (
                <p role="status">{message}</p>
            )}
        </main>
    );
}

export default SongSelectionPage;
