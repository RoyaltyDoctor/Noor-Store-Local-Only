/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createHashRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import { useEffect } from "react";
import { useThemeStore } from "./themeStore";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

// Use a data router to support useBlocker
const router = createHashRouter([
  {
    path: "*",
    element: <Layout />
  }
]);

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      root.classList.remove("light", "dark");
      let activeTheme: "light" | "dark" = "light";

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        activeTheme = systemTheme;
      } else {
        root.classList.add(theme);
        activeTheme = theme;
      }

      // Automatically sync status bar under Capacitor on mobile platforms
      if (Capacitor.isNativePlatform()) {
        try {
          // Disable overlays webview to keep the app content strictly underneath the status bar immediately on boot
          StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

          if (activeTheme === "dark") {
            StatusBar.setStyle({ style: Style.Dark });
            // Exact hexadecimal match for Tailwind's bg-gray-800 in Header (dark:bg-gray-800 -> #1f2937)
            StatusBar.setBackgroundColor({ color: "#1f2937" });
          } else {
            StatusBar.setStyle({ style: Style.Light });
            // Exact hexadecimal match for Tailwind's bg-white (bg-white -> #ffffff)
            StatusBar.setBackgroundColor({ color: "#ffffff" });
          }
        } catch (err) {
          console.error("Failed to update status bar style:", err);
        }
      }
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return <RouterProvider router={router} />;
}
