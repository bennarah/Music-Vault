import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/useTheme";
import "./Navbar.css";

const navigationLinks = [
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/recommendations", label: "Recommendations" },
  { to: "/songs", label: "Select Songs" },
];

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <NavLink
          to="/"
          end
          className="navbar-logo"
          onClick={closeMenu}
        >
          MusicVault
        </NavLink>

        <div className="navbar-actions">
          <div className="navbar-theme-control">
            <span className="navbar-theme-icon" aria-hidden="true">
              ☀
            </span>

            <button
              type="button"
              role="switch"
              className="navbar-theme-toggle"
              aria-label="Dark mode"
              aria-checked={theme === "dark"}
              onClick={toggleTheme}
            >
              <span className="navbar-theme-thumb" aria-hidden="true" />
            </button>

            <span className="navbar-theme-icon" aria-hidden="true">
              ☾
            </span>
          </div>

          <button
            type="button"
            className="navbar-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="navbar-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>

        <div
          id="navbar-links"
          className={`navbar-links ${menuOpen ? "is-open" : ""}`}
        >
          {navigationLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "is-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
