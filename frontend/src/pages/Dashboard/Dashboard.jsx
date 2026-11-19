import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getPreferences } from "../../services/preferenceApi";
import { DEV_USER_ID } from "../../config/devUser";
import { getDashboardStatistics } from "./dashboardStatistics";
import { mockDashboardPreferences } from "../../mocks/dashboardPreferences";

const useMockDashboard =
  import.meta.env.DEV &&
  !import.meta.env.MODE.startsWith("test") &&
  import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";
import "./Dashboard.css";

function Dashboard() {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      setLoading(true);
      setError("");

      if (!DEV_USER_ID) {
        setError("Please sign in to view your music dashboard.");
        setLoading(false);
        return;
      }

      try {
        const results = useMockDashboard
          ? mockDashboardPreferences
          : await getPreferences(DEV_USER_ID);

        if (active) {
          if (!Array.isArray(results)) {
            throw new Error("Invalid preference response");
          }

          setPreferences(results);
        }
      } catch {
        if (active) {
          setPreferences([]);
          setError(
            "Unable to load your saved songs. Please check that the backend is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPreferences();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const statistics = getDashboardStatistics(preferences);

  return (
    <section className="dashboard-page" aria-busy={loading}>
      <header className="dashboard-header">
        <p className="dashboard-eyebrow">YOUR MUSICVAULT</p>
        <h1>Your Music Dashboard</h1>
        <p>
          Explore patterns in your saved songs and discover
          which artists and genres you love most.
        </p>
      </header>

      {loading && (
        <div className="dashboard-state" role="status">
          <h2>Loading your music dashboard...</h2>
          <p>Gathering your saved music preferences.</p>
        </div>
      )}

      {!loading && error && (
        <div className="dashboard-state" role="alert">
          <h2>Dashboard unavailable</h2>
          <p>{error}</p>
          <button
            type="button"
            className="dashboard-button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && preferences.length === 0 && (
        <div className="dashboard-state">
          <h2>No saved songs yet</h2>
          <p>
            Start selecting your favorite songs to see
            your music preferences visualized here.
          </p>
          <Link to="/songs" className="dashboard-button">
            Start Picking Songs
          </Link>
        </div>
      )}

      {!loading && !error && preferences.length > 0 && (
        <>
          <div className="dashboard-summary">
            <article className="dashboard-stat-card">
              <h2>Saved Songs</h2>
              <p>{statistics.totalSongs}</p>
            </article>

            <article className="dashboard-stat-card">
              <h2>Unique Artists</h2>
              <p>{statistics.uniqueArtists}</p>
            </article>

            <article className="dashboard-stat-card">
              <h2>Songs With Genre Data</h2>
              <p>{statistics.knownGenreCount}</p>
            </article>
          </div>

          <div className="dashboard-content">
            <section
              className="dashboard-panel"
              aria-labelledby="dashboard-genres-title"
            >
              <h2 id="dashboard-genres-title">
                Genre Breakdown
              </h2>
              <p className="dashboard-panel-description">
                Number of saved songs in each genre.
                Missing genre information is grouped
                under Unknown Genre.
              </p>

              <div
                className="dashboard-chart"
                aria-hidden="true"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={statistics.genreDistribution}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 15,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        color: "var(--color-text)",
                      }}
                      labelStyle={{
                        color: "var(--color-text)",
                        fontWeight: 700,
                      }}
                      itemStyle={{
                        color: "var(--color-text)",
                      }}
                      cursor={{
                        fill: "var(--color-surface-hover)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Saved songs"
                      fill="var(--color-accent)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ul className="dashboard-genre-list">
                {statistics.genreDistribution.map((genre) => (
                  <li key={genre.name}>
                    <span>{genre.name}</span>
                    <strong>{genre.count} songs</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="dashboard-panel"
              aria-labelledby="dashboard-artists-title"
            >
              <h2 id="dashboard-artists-title">
                Top Artists
              </h2>
              <p className="dashboard-panel-description">
                Artists ranked by how many songs you've saved.
              </p>

              <ol className="dashboard-artists-list">
                {statistics.topArtists.slice(0, 5).map((artist) => (
                  <li key={artist.name}>
                    <span>{artist.name}</span>
                    <strong>{artist.count} songs</strong>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
