"use client";

import React from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { useSchedules } from "@/lib/context";
import PhoneWallpaper from "@/components/PhoneWallpaper";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
});

export default function WallpaperPage() {
  const { selectedCourses } = useSchedules();

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-[#121212] text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              Phone Wallpaper Maker
            </h1>
            <p className="text-slate-400">
              Create a custom phone wallpaper with your class schedule
            </p>
          </div>

          <PhoneWallpaper selectedCourses={selectedCourses} use24Hour={true} />
        </div>
      </div>
    </ThemeProvider>
  );
}
