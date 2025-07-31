"use client";

import React from "react";
import { useSchedules } from "@/lib/context";
import PhoneWallpaper from "@/components/PhoneWallpaper";

export default function WallpaperPage() {
  const { selectedCourses } = useSchedules();

  return (
    <div className="min-h-screen text-slate">
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
  );
}
