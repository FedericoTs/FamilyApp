import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./lib/themeProvider";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

// Initialize theme from localStorage if available
const storedTheme = localStorage.getItem("color-theme");
if (storedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else if (storedTheme === "high-contrast") {
  document.documentElement.classList.add("high-contrast");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
