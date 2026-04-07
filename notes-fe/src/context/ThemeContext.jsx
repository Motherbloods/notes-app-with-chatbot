import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();

// Hitung radius maksimal dari pojok kiri atas
function getMaxRadius(x, y) {
  const w = globalThis.innerWidth;
  const h = globalThis.innerHeight;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
}

async function animateThemeTransition(isDarkNext, applyTheme) {
  const x = 0;
  const y = 0;
  const radius = getMaxRadius(x, y);

  const clipStart = `circle(0px at ${x}px ${y}px)`;
  const clipEnd = `circle(${radius}px at ${x}px ${y}px)`;

  // Fallback kalau tidak support
  if (!document.startViewTransition) {
    applyTheme(isDarkNext);
    return;
  }

  const keyframes = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }
    ::view-transition-new(root) {
      animation: theme-clip-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes theme-clip-in {
      from { clip-path: ${clipStart}; }
      to   { clip-path: ${clipEnd}; }
    }
  `;

  const existingStyle = document.getElementById("theme-transition-style");
  if (existingStyle) {
    existingStyle.textContent = keyframes;
  } else {
    const style = document.createElement("style");
    style.id = "theme-transition-style";
    style.textContent = keyframes;
    document.head.appendChild(style);
  }

  const transition = document.startViewTransition(() => {
    applyTheme(isDarkNext);
  });

  await transition.finished;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply theme tanpa animasi
  const applyThemeClass = (dark) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  // Initial apply
  useEffect(() => {
    applyThemeClass(isDark);
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    await animateThemeTransition(next, applyThemeClass);
    setIsDark(next);
  };

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
