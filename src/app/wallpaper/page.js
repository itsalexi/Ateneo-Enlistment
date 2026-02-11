"use client";

import { useEffect, useMemo, useState } from "react";
import ScheduleWallpaperMaker from "@/components/ScheduleWallpaperMaker";
import semesterInfo from "@/data/semester-info.json";

const STORAGE_KEY = "rewrite-schedule-state";
const LEGACY_SCHEDULES_KEY = "schedules";
const LEGACY_ACTIVE_SCHEDULE_KEY = "activeScheduleId";
const LEGACY_SELECTED_COURSES_KEY = "selectedCourses";

function safeParseJSON(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeSchedules(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((schedule, index) => ({
    id: schedule?.id || `schedule-${index + 1}`,
    name: schedule?.name || `Schedule ${index + 1}`,
    selectedCourses: Array.isArray(schedule?.selectedCourses)
      ? schedule.selectedCourses
      : Array.isArray(schedule?.courses)
        ? schedule.courses
        : [],
  }));
}

export default function WallpaperPage() {
  const [schedules, setSchedules] = useState([]);
  const [activeScheduleId, setActiveScheduleId] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParseJSON(window.localStorage.getItem(STORAGE_KEY));
    const legacySchedules = safeParseJSON(
      window.localStorage.getItem(LEGACY_SCHEDULES_KEY)
    );
    let nextSchedules = normalizeSchedules(
      stored?.schedules || legacySchedules
    );
    if (!nextSchedules.length) {
      const legacyCourses = safeParseJSON(
        window.localStorage.getItem(LEGACY_SELECTED_COURSES_KEY)
      );
      if (Array.isArray(legacyCourses) && legacyCourses.length) {
        nextSchedules = [
          {
            id: "schedule-1",
            name: "Schedule 1",
            selectedCourses: legacyCourses,
          },
        ];
      }
    }
    const storedActiveId =
      stored?.activeScheduleId ||
      window.localStorage.getItem(LEGACY_ACTIVE_SCHEDULE_KEY);
    const resolvedActiveId = nextSchedules.some(
      (schedule) => schedule.id === storedActiveId
    )
      ? storedActiveId
      : nextSchedules[0]?.id || "";
    setSchedules(nextSchedules);
    setActiveScheduleId(resolvedActiveId);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded || !activeScheduleId || typeof window === "undefined") return;
    const stored = safeParseJSON(window.localStorage.getItem(STORAGE_KEY));
    if (stored && typeof stored === "object") {
      const next = { ...stored, activeScheduleId };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    window.localStorage.setItem(LEGACY_ACTIVE_SCHEDULE_KEY, activeScheduleId);
  }, [activeScheduleId, hasLoaded]);

  const semesterLabel = useMemo(
    () => semesterInfo?.semesterString || "",
    []
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:h-[100dvh] lg:overflow-hidden">
      <ScheduleWallpaperMaker
        schedules={schedules}
        activeScheduleId={activeScheduleId}
        onActiveScheduleChange={setActiveScheduleId}
        semesterLabel={semesterLabel}
      />
    </main>
  );
}
