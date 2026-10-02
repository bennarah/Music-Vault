import { useState } from "react";

function SongSelectionPage() {
    const [query, setQuery] = useState("");
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedTrack, setSelectedTrack] = useState(null);

    return (
        <div>
            <h1>Select Songs You Like</h1>
        </div>
    );
}

export default SongSelectionPage;