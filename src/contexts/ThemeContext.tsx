/**
 * ThemeContext — Manages Light/Dark mode and LTR/RTL direction.
 * Toggles the 'dark' class on <html> and the 'dir' attribute.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  direction: "ltr" | "rtl";
  toggleDirection: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true); // Dark by default
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  /* Sync dark class with state */
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  /* Sync direction attribute */
  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleDirection = () =>
    setDirection((prev) => (prev === "ltr" ? "rtl" : "ltr"));

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, direction, toggleDirection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
