import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "default" | "dark" | "light" | "high-contrast";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem("color-theme") as Theme;
    return storedTheme || "default";
  });

  useEffect(() => {
    // Apply theme when it changes
    document.documentElement.classList.remove("dark", "high-contrast");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "high-contrast") {
      document.documentElement.classList.add("high-contrast");
    }

    // Store the preference
    localStorage.setItem("color-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
