import { Link } from 'react-router-dom';
import { useTheme } from '../../context/useTheme';

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav>
      <Link to="/">Music Vault</Link>

      <div>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/recommendations">Recommendations</Link>
        <Link to="/songs">Select Songs</Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;