import {
  useEffect,
  useRef,
  useState,
} from "react";
import { ThemeContext } from "./themeContextValue";
const STORAGE_KEY = "musicvault-theme";

function getInitialTheme() {
  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // Continue with system preference if storage is unavailable.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const hasUserSelectedTheme = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    if (hasUserSelectedTheme.current) {
      try {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Theme switching works even without localStorage.
      }
    }
  }, [theme]);

  function toggleTheme() {
    hasUserSelectedTheme.current = true;

    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
