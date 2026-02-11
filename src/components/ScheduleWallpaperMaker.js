"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DAYS, DEFAULT_TIME_RANGE, getTimeSlots } from "@/lib/time";
import { expandScheduleBlocks } from "@/lib/course-data";

const WALLPAPER_SETTINGS_KEY = "rewrite-wallpaper-settings";
const SIZE_OPTIONS = [
  { id: "wide", label: "Desktop 2560 x 1440", width: 2560, height: 1440 },
  { id: "laptop", label: "Laptop 2880 x 1800", width: 2880, height: 1800 },
  { id: "phone", label: "Phone 1440 x 3120", width: 1440, height: 3120 },
];
const DEFAULT_SETTINGS = {
  size: "wide",
  layout: "grid",
  theme: "light",
  timeFormat: "12h",
  showCourse: true,
  showSection: true,
  showTime: true,
  showRoom: true,
  showInstructor: false,
};
const THEME_STYLES = {
  light: {
    bg: "#f6f1e8",
    panel: "#fffaf2",
    text: "#1f1a16",
    muted: "#6b645c",
    line: "rgba(31, 26, 22, 0.14)",
    grid: "rgba(31, 26, 22, 0.08)",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.16)",
  },
  dark: {
    bg: "#0f141b",
    panel: "#151b24",
    text: "#f1f5f9",
    muted: "#9aa4b2",
    line: "rgba(148, 163, 184, 0.18)",
    grid: "rgba(148, 163, 184, 0.14)",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.2)",
  },
};

function safeParseJSON(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatTime(minutes, use24Hour) {
  const total = Math.max(0, minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (use24Hour) {
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }
  const period = hours >= 12 ? "PM" : "AM";
  const adjusted = hours % 12 || 12;
  return `${adjusted}:${String(mins).padStart(2, "0")} ${period}`;
}

function formatRange(start, end, use24Hour) {
  return `${formatTime(start, use24Hour)} - ${formatTime(end, use24Hour)}`;
}

function resolveTimeRange(blocks) {
  if (!blocks.length) {
    return { start: DEFAULT_TIME_RANGE.start, end: DEFAULT_TIME_RANGE.end };
  }
  const starts = blocks.map((block) => block.start);
  const ends = blocks.map((block) => block.end);
  const minStart = Math.min(...starts);
  const maxEnd = Math.max(...ends);
  const start = Math.max(
    DEFAULT_TIME_RANGE.start,
    Math.floor((minStart - 60) / 60) * 60
  );
  const end = Math.min(
    DEFAULT_TIME_RANGE.end,
    Math.ceil((maxEnd + 60) / 60) * 60
  );
  return { start, end };
}

export default function ScheduleWallpaperMaker({
  schedules,
  activeScheduleId,
  onActiveScheduleChange,
  semesterLabel,
}) {
  const [settings, setSettings] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const stored = safeParseJSON(
      window.localStorage.getItem(WALLPAPER_SETTINGS_KEY)
    );
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const previewShellRef = useRef(null);
  const artboardRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      WALLPAPER_SETTINGS_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  const activeSchedule =
    schedules.find((schedule) => schedule.id === activeScheduleId) ||
    schedules[0] ||
    null;
  const scheduledSections = activeSchedule?.selectedCourses || [];
  const noTimeSections = scheduledSections.filter((section) => section.noTime);
  const blocks = useMemo(
    () => expandScheduleBlocks(scheduledSections),
    [scheduledSections]
  );
  const activeDays = useMemo(() => {
    const daySet = new Set(blocks.map((block) => block.day));
    const includeSaturday = daySet.has(5);
    return DAYS.filter((day) => (includeSaturday ? day.index <= 5 : day.index <= 4));
  }, [blocks]);
  const blocksByDay = useMemo(() => {
    const map = new Map();
    for (const day of activeDays) {
      map.set(day.index, []);
    }
    for (const block of blocks) {
      if (!map.has(block.day)) continue;
      map.get(block.day).push(block);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start - b.start);
    }
    return map;
  }, [activeDays, blocks]);
  const timeRange = useMemo(() => resolveTimeRange(blocks), [blocks]);
  const timeSlots = useMemo(
    () =>
      getTimeSlots({
        start: timeRange.start,
        end: timeRange.end,
        step: 60,
      }),
    [timeRange]
  );
  const activeSize =
    SIZE_OPTIONS.find((option) => option.id === settings.size) ||
    SIZE_OPTIONS[0];
  const isPhone = settings.size === "phone";
  const palette =
    settings.theme === "dark" ? THEME_STYLES.dark : THEME_STYLES.light;
  const baseFont = activeSize.width / 120;
  const phoneTopInset = isPhone ? Math.round(activeSize.height * 0.14) : 0;
  const headerPaddingTop = baseFont * (isPhone ? 1.4 : 2.6);
  const headerPaddingX = baseFont * 3;
  const headerPaddingBottom = baseFont * 1.6;
  const contentPaddingX = baseFont * 3;
  const contentPaddingBottom = baseFont * 3;
  const timeColumnWidth = Math.min(
    140,
    Math.max(80, Math.round(activeSize.width * 0.08))
  );
  const gridTemplateColumns = `${timeColumnWidth}px repeat(${activeDays.length}, minmax(0, 1fr))`;
  const gridTemplateRows = `repeat(${timeSlots.length}, minmax(0, 1fr))`;
  const agendaColumns =
    activeSize.width >= 2200 ? "repeat(2, minmax(0, 1fr))" : "1fr";
  const previewWidth = activeSize.width * previewScale;
  const previewHeight = activeSize.height * previewScale;
  const showEmptyState = scheduledSections.length === 0;
  const use24Hour = settings.timeFormat === "24h";
  const showAgenda = settings.layout === "agenda";

  useEffect(() => {
    const target = previewShellRef.current;
    if (!target || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width || 1;
      const paddingInset = 32;
      const availableWidth = Math.max(1, width - paddingInset);
      const frameWidth = isPhone ? Math.min(360, availableWidth) : availableWidth;
      const nextScale = Math.min(1, frameWidth / activeSize.width);
      setPreviewScale(nextScale);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [activeSize.width, isPhone]);

  const handleExport = async () => {
    if (!artboardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
      const { toPng } = await import("html-to-image");
      const node = artboardRef.current;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: palette.bg,
        width: activeSize.width,
        height: activeSize.height,
        style: {
          width: `${activeSize.width}px`,
          height: `${activeSize.height}px`,
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      const name = (activeSchedule?.name || "schedule")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const fileName = `${name || "schedule"}-wallpaper.png`;
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export wallpaper.", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-4 bg-[color:var(--panel)]/35 p-4 lg:flex-row lg:items-stretch">
      <div className="flex w-full flex-col gap-4 lg:w-[360px] lg:shrink-0">
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--muted)]">
            Wallpaper maker
          </p>
          <h1 className="mt-2 font-display text-2xl text-[color:var(--ink)]">
            Schedule wallpaper
          </h1>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Export your schedule at a fixed size for desktop or phone.
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-4">
          <label className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Schedule
          </label>
          <select
            value={activeSchedule?.id || ""}
            onChange={(event) => onActiveScheduleChange?.(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]/80 px-3 py-2 text-sm text-[color:var(--ink)]"
          >
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-4">
          <div className="grid gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Canvas size
              </p>
              <div className="mt-2 grid gap-2">
                {SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, size: option.id }))
                    }
                    className={`rounded-full border px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition ${
                      settings.size === option.id
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Layout
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["grid", "agenda"].map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, layout }))
                    }
                    className={`rounded-full border px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition ${
                      settings.layout === layout
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {layout === "grid" ? "Weekly grid" : "Agenda list"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Theme
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["light", "dark"].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, theme }))
                    }
                    className={`rounded-full border px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition ${
                      settings.theme === theme
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {theme === "light" ? "Studio" : "Night"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Time format
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["12h", "24h"].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, timeFormat: format }))
                    }
                    className={`rounded-full border px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition ${
                      settings.timeFormat === format
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Card details
              </p>
              <div className="mt-2 grid gap-2 text-[0.7rem] text-[color:var(--muted)]">
                {[
                  { key: "showCourse", label: "Course code" },
                  { key: "showSection", label: "Section" },
                  { key: "showTime", label: "Time" },
                  { key: "showRoom", label: "Room" },
                  { key: "showInstructor", label: "Instructor" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={() =>
                        setSettings((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className="h-3 w-3 accent-[color:var(--accent)]"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || showEmptyState}
          className="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)]/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-[color:var(--accent)] disabled:opacity-50"
        >
          {isExporting ? "Exporting..." : "Export wallpaper"}
        </button>
        {showEmptyState && (
          <p className="text-xs text-[color:var(--muted)]">
            Add sections to your schedule before exporting a wallpaper.
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/40 p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Preview
          </p>
          <p className="text-xs text-[color:var(--muted)]">
            {activeSize.width} x {activeSize.height}px
          </p>
        </div>
        <div
          ref={previewShellRef}
          className="flex-1 overflow-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/30 p-4"
        >
          <div className={isPhone ? "mx-auto w-full max-w-[360px]" : ""}>
            <div
              className={
                isPhone
                  ? "relative overflow-hidden rounded-[34px] border-[10px] border-slate-900/80 bg-slate-950 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.6)]"
                  : "relative"
              }
              style={{ width: previewWidth, height: previewHeight }}
            >
              {isPhone && (
                <>
                  <div className="pointer-events-none absolute left-1/2 top-3 z-10 h-4 w-28 -translate-x-1/2 rounded-full bg-slate-900/80" />
                  <div className="pointer-events-none absolute left-6 top-3 z-10 text-[10px] font-semibold tracking-[0.08em] text-white/80">
                    9:41
                  </div>
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 h-1.5 w-28 -translate-x-1/2 rounded-full bg-white/20" />
                </>
              )}
              <div
                ref={artboardRef}
                style={{
                  width: `${activeSize.width}px`,
                  height: `${activeSize.height}px`,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  background: palette.bg,
                  color: palette.text,
                  fontSize: `${baseFont}px`,
                }}
                className="relative overflow-hidden font-sans"
              >
                <div className="flex h-full flex-col">
                  <div
                    style={{
                      padding: `${headerPaddingTop + phoneTopInset}px ${headerPaddingX}px ${headerPaddingBottom}px`,
                    }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p
                        style={{
                          color: palette.accent,
                          letterSpacing: "0.35em",
                        }}
                        className="text-[0.65em] uppercase"
                      >
                        Ateneo Enlistment
                      </p>
                      <h2 className="font-display text-[2.2em] leading-tight">
                        {activeSchedule?.name || "Schedule"}
                      </h2>
                      <p
                        style={{ color: palette.muted }}
                        className="text-[0.8em]"
                      >
                        {semesterLabel || "Schedule wallpaper"}
                      </p>
                    </div>
                    <div
                      className="rounded-full border px-3 py-2 text-[0.7em] uppercase tracking-[0.2em]"
                      style={{
                        borderColor: palette.line,
                        color: palette.muted,
                        background: palette.accentSoft,
                      }}
                    >
                      {scheduledSections.length} sections
                    </div>
                  </div>

                  <div
                    style={{
                      padding: `0 ${contentPaddingX}px ${contentPaddingBottom}px`,
                    }}
                    className="flex-1"
                  >
                    {showAgenda ? (
                      <div
                        className="grid h-full gap-[1.6em]"
                        style={{ gridTemplateColumns: agendaColumns }}
                      >
                        {activeDays.map((day) => {
                          const dayBlocks = blocksByDay.get(day.index) || [];
                          if (!dayBlocks.length) return null;
                          return (
                            <div
                              key={day.index}
                              className="rounded-2xl border p-[1.2em]"
                              style={{
                                borderColor: palette.line,
                                background: palette.panel,
                              }}
                            >
                              <p
                                style={{ color: palette.muted }}
                                className="text-[0.65em] uppercase tracking-[0.3em]"
                              >
                                {day.full}
                              </p>
                              <div className="mt-[0.8em] space-y-[0.7em]">
                                {dayBlocks.map((block) => (
                                  <div
                                    key={`${block.section.id}-${block.start}-${block.end}`}
                                    className={`rounded-[0.9em] border px-[0.9em] py-[0.7em] shadow-[0_10px_20px_-18px_rgba(15,23,42,0.35)] ${block.section.colorClass}`}
                                  >
                                    <div className="flex items-start justify-between gap-[0.6em]">
                                      <div>
                                        {settings.showCourse && (
                                          <p className="text-[0.85em] font-semibold uppercase tracking-[0.08em]">
                                            {block.section.catNo}
                                          </p>
                                        )}
                                        {settings.showSection && (
                                          <p className="text-[0.7em] font-semibold opacity-85">
                                            {block.section.section}
                                          </p>
                                        )}
                                        {settings.showTime && (
                                          <p className="text-[0.65em] opacity-80">
                                            {formatRange(
                                              block.start,
                                              block.end,
                                              use24Hour
                                            )}
                                          </p>
                                        )}
                                      </div>
                                      {settings.showRoom && (
                                        <p className="text-[0.65em] opacity-80">
                                          {block.section.room || "Room TBD"}
                                        </p>
                                      )}
                                    </div>
                                    {settings.showInstructor && (
                                      <p className="mt-[0.4em] text-[0.6em] opacity-80">
                                        {block.section.instructor ||
                                          "Instructor TBD"}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col">
                        <div
                          className="grid text-[0.65em] uppercase tracking-[0.3em]"
                          style={{
                            gridTemplateColumns,
                            color: palette.muted,
                            paddingBottom: "0.8em",
                          }}
                        >
                          <div />
                          {activeDays.map((day) => (
                            <div key={day.index} className="text-center">
                              {day.label}
                            </div>
                          ))}
                        </div>
                        <div className="relative flex-1">
                          <div
                            className="grid h-full"
                            style={{
                              gridTemplateColumns,
                              gridTemplateRows,
                            }}
                          >
                            {timeSlots.map((minutes, row) => (
                              <div
                                key={`time-${minutes}`}
                                className="flex items-start justify-end pr-[0.8em] text-[0.65em]"
                                style={{
                                  gridColumn: 1,
                                  gridRow: row + 1,
                                  color: palette.muted,
                                  borderRight: `1px solid ${palette.grid}`,
                                  paddingTop: "0.5em",
                                }}
                              >
                                {formatTime(minutes, use24Hour)}
                              </div>
                            ))}
                            {activeDays.map((day, dayIndex) =>
                              timeSlots.map((minutes, row) => (
                                <div
                                  key={`cell-${day.index}-${minutes}`}
                                  style={{
                                    gridColumn: dayIndex + 2,
                                    gridRow: row + 1,
                                    borderLeft: `1px solid ${palette.grid}`,
                                    borderBottom:
                                      row === timeSlots.length - 1
                                        ? "none"
                                        : `1px solid ${palette.grid}`,
                                  }}
                                />
                              ))
                            )}
                          </div>

                          <div
                            className="absolute inset-0 grid"
                            style={{ gridTemplateColumns }}
                          >
                            <div />
                            {activeDays.map((day) => (
                              <div key={day.index} className="relative">
                                {(blocksByDay.get(day.index) || []).map(
                                  (block) => {
                                    const totalMinutes =
                                      timeRange.end - timeRange.start;
                                    const top =
                                      ((block.start - timeRange.start) /
                                        totalMinutes) *
                                      100;
                                    const height =
                                      ((block.end - block.start) /
                                        totalMinutes) *
                                      100;
                                    return (
                                      <div
                                        key={`${block.section.id}-${block.start}-${block.end}`}
                                        className={`absolute left-[0.4em] right-[0.4em] flex flex-col justify-center gap-[0.3em] overflow-hidden rounded-[0.9em] border px-[0.8em] py-[0.7em] text-center shadow-[0_10px_20px_-18px_rgba(15,23,42,0.35)] ${block.section.colorClass}`}
                                        style={{
                                          top: `${top}%`,
                                          height: `${Math.max(height, 6)}%`,
                                        }}
                                      >
                                        {settings.showCourse && (
                                          <p className="text-[0.7em] font-semibold uppercase tracking-[0.08em]">
                                            {block.section.catNo}
                                          </p>
                                        )}
                                        {settings.showSection && (
                                          <p className="text-[0.6em] font-semibold opacity-85">
                                            {block.section.section}
                                          </p>
                                        )}
                                        {settings.showTime && (
                                          <p className="text-[0.55em] opacity-80">
                                            {formatRange(
                                              block.start,
                                              block.end,
                                              use24Hour
                                            )}
                                          </p>
                                        )}
                                        {settings.showRoom && (
                                          <p className="text-[0.55em] opacity-80">
                                            {block.section.room || "Room TBD"}
                                          </p>
                                        )}
                                        {settings.showInstructor && (
                                          <p className="text-[0.5em] opacity-80">
                                            {block.section.instructor ||
                                              "Instructor TBD"}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {noTimeSections.length > 0 && (
                      <div
                        className="mt-[1.6em] rounded-2xl border px-[1.2em] py-[1em]"
                        style={{
                          borderColor: palette.line,
                          color: palette.muted,
                          background: palette.panel,
                        }}
                      >
                        <p className="text-[0.6em] uppercase tracking-[0.3em]">
                          No scheduled time
                        </p>
                        <div className="mt-[0.6em] flex flex-wrap gap-[0.6em] text-[0.7em]">
                          {noTimeSections.map((section) => (
                            <span key={section.id}>
                              {section.catNo} {section.section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
