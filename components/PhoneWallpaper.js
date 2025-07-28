"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toPng } from "html-to-image";
import { parseTimeRange } from "@/lib/helper";

const defaultSettings = {
  timeFormat: "12h",
  backgroundColor: "#ffffff",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  layout: "weekly-grid",
  theme: "light",
  layoutSpacing: {
    weeklyGrid: { whiteSpace: 35, contentArea: 65 },
    dailyList: { whiteSpace: 30, contentArea: 70 },
  },
};

const fontOptions = [
  {
    value:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    label: "System",
    preview: "System",
  },
  { value: "Arial, sans-serif", label: "Arial", preview: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica", preview: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia", preview: "Georgia" },
  {
    value: "Times New Roman, serif",
    label: "Times New Roman",
    preview: "Times New Roman",
  },
  {
    value: "Courier New, monospace",
    label: "Courier New",
    preview: "Courier New",
  },
  { value: "Verdana, sans-serif", label: "Verdana", preview: "Verdana" },
  { value: "Tahoma, sans-serif", label: "Tahoma", preview: "Tahoma" },
  {
    value: "Trebuchet MS, sans-serif",
    label: "Trebuchet MS",
    preview: "Trebuchet MS",
  },
  { value: "Impact, sans-serif", label: "Impact", preview: "Impact" },
  {
    value: "Comic Sans MS, cursive",
    label: "Comic Sans MS",
    preview: "Comic Sans MS",
  },
  {
    value: "Lucida Console, monospace",
    label: "Lucida Console",
    preview: "Lucida Console",
  },
];

const allDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PhoneWallpaper({
  selectedCourses = [],
  use24Hour = false,
}) {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage on component mount
    const savedSettings = localStorage.getItem("phoneWallpaperSettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const previewRef = useRef(null);
  const contentRef = useRef(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("phoneWallpaperSettings", JSON.stringify(settings));
  }, [settings]);

  const colorCodes = {
    ACCT: "#00d4aa",
    ANTH: "#a855f7",
    ARTM: "#ff4444",
    ARTS: "#00b894",
    ATMOS: "#ff8c00",
    ArtAp: "#ff3333",
    BIO: "#00cec9",
    CEPP: "#ffd700",
    CHEM: "#00b894",
    CHEMED: "#ffa500",
    COMM: "#0984e3",
    CPA: "#6c5ce7",
    CRWR: "#fd79a8",
    CSCI: "#e17055",
    CSP: "#a29bfe",
    DECSC: "#00b894",
    DECSCI: "#74b9ff",
    DEV: "#00cec9",
    DIRR: "#0984e3",
    DLQ: "#a855f7",
    ECON: "#a29bfe",
    EDUC: "#6c5ce7",
    ELM: "#fd79a8",
    ENE: "#00b894",
    ENGG: "#00b894",
    ENGL: "#6c5ce7",
    ENLIT: "#fdcb6e",
    ENVI: "#0984e3",
    EURO: "#e84393",
    FIL: "#ff7675",
    FILI: "#fd79a8",
    FINN: "#a29bfe",
    FRE: "#00b894",
    GDEV: "#00d4aa",
    GER: "#00b894",
    HISTO: "#00b894",
    HSCI: "#ff4444",
    HUMAN: "#fd79a8",
    IDES: "#74b9ff",
    IDS: "#0984e3",
    INTACT: "#fd79a8",
    ISCS: "#636e72",
    ITA: "#a29bfe",
    ITENT: "#00b894",
    ITMGT: "#fd79a8",
    JPN: "#ff4444",
    KOR: "#00b894",
    KRN: "#74b9ff",
    LAS: "#fdcb6e",
    LEAD: "#fd79a8",
    LLAW: "#00d4aa",
    MATH: "#fdcb6e",
    MATSE: "#0984e3",
    MEM: "#74b9ff",
    MKTG: "#ff4444",
    MSYS: "#a29bfe",
    MTHED: "#e17055",
    NSTP: "#00b894",
    OPMAN: "#0984e3",
    PEPC: "#00b894",
    PHILO: "#6c5ce7",
    PHYED: "#00b894",
    PHYS: "#a29bfe",
    PHYSE: "#e84393",
    PNTKN: "#0984e3",
    POLSC: "#00b894",
    PORT: "#fdcb6e",
    PSYC: "#0984e3",
    QUANT: "#00b894",
    RE: "#00b894",
    RELED: "#fd79a8",
    RUSS: "#0984e3",
    SCIED: "#636e72",
    SEAS: "#00cec9",
    SOAN: "#636e72",
    SOCDV: "#fd79a8",
    SOCIO: "#fd79a8",
    SOMGT: "#fd79a8",
    SPA: "#ff7675",
    STS: "#e17055",
    SocSc: "#fdcb6e",
    THEO: "#e17055",
    THTR: "#74b9ff",
  };

  // Convert courses to the format expected by the schedule maker
  const convertedClasses = React.useMemo(() => {
    return selectedCourses
      .map((course) => {
        const timeSegments = parseTimeRange(course.time);
        const firstSegment = timeSegments[0];

        if (!firstSegment) return null;

        const { days, startTime, endTime } = firstSegment;

        // Convert time format from HHMM to HH:MM
        const formatTime = (time) => {
          const hours = Math.floor(time / 100);
          const minutes = time % 100;
          return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
        };

        const courseCode = course.catNo.split(" ")[0];
        const color = colorCodes[courseCode] || "#6b7280";

        return {
          id: course.id,
          name: `${course.catNo}`,
          days: days.map((day) => {
            const dayMap = {
              0: "Mon",
              1: "Tue",
              2: "Wed",
              3: "Thu",
              4: "Fri",
              5: "Sat",
            };
            return dayMap[day] || "Mon";
          }),
          startTime: formatTime(startTime),
          endTime: formatTime(endTime),
          location: course.room,
          instructor: course.instructor,
          color: color,
          originalCourse: course,
        };
      })
      .filter(Boolean);
  }, [selectedCourses, colorCodes]);

  // Get active days (hide Saturday if no classes are scheduled for it)
  const getActiveDays = () => {
    const hasSaturdayClasses = convertedClasses.some((cls) =>
      cls.days.includes("Sat")
    );
    return hasSaturdayClasses
      ? allDaysOfWeek
      : allDaysOfWeek.filter((day) => day !== "Sat");
  };

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLayoutSpacingChange = (layoutType, spacingType, value) => {
    setSettings((prev) => {
      const newLayoutSpacing = { ...prev.layoutSpacing };
      newLayoutSpacing[layoutType] = { ...newLayoutSpacing[layoutType] };

      if (spacingType === "whiteSpace") {
        newLayoutSpacing[layoutType].whiteSpace = value;
        newLayoutSpacing[layoutType].contentArea = 100 - value;
      } else {
        newLayoutSpacing[layoutType].contentArea = value;
        newLayoutSpacing[layoutType].whiteSpace = 100 - value;
      }

      return { ...prev, layoutSpacing: newLayoutSpacing };
    });
  };

  const handleExport = useCallback(async () => {
    if (previewRef.current) {
      // Temporarily hide phone frame elements for export
      const phoneFrame = previewRef.current;
      const notch = phoneFrame?.querySelector(".phone-notch");
      const homeIndicator = phoneFrame?.querySelector(".phone-home-indicator");

      // Store original styles
      const originalBorder = phoneFrame.style.border;
      const originalBorderRadius = phoneFrame.style.borderRadius;
      const originalBoxShadow = phoneFrame.style.boxShadow;

      // Hide phone frame elements
      if (notch) notch.style.display = "none";
      if (homeIndicator) homeIndicator.style.display = "none";

      // Remove phone frame styling
      phoneFrame.style.border = "none";
      phoneFrame.style.borderRadius = "0";
      phoneFrame.style.boxShadow = "none";

      try {
        // Wait a bit to ensure all rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the content area (excluding phone frame)
        const contentElement = contentRef.current;

        // Store original styles
        const originalOverflow = contentElement.style.overflow;
        const originalPadding = contentElement.style.padding;
        const originalMargin = contentElement.style.margin;
        const originalBorder = contentElement.style.border;

        // Remove any borders, padding, margins for clean export
        contentElement.style.overflow = "visible";
        contentElement.style.padding = "0";
        contentElement.style.margin = "0";
        contentElement.style.border = "none";
        contentElement.classList.add("export-no-border");

        const dataUrl = await toPng(contentElement, {
          quality: 1.0,
          pixelRatio: 3,
          backgroundColor:
            settings.theme === "dark" ? "#334155" : settings.backgroundColor,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
          filter: (node) => {
            // Include all nodes in the content area
            return true;
          },
          useCORS: false,
          allowTaint: false,
          foreignObjectRendering: false,
        });

        // Restore original styles
        contentElement.style.overflow = originalOverflow;
        contentElement.style.padding = originalPadding;
        contentElement.style.margin = originalMargin;
        contentElement.style.border = originalBorder;
        contentElement.classList.remove("export-no-border");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "class-schedule-wallpaper.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      } finally {
        // Restore phone frame elements and styling
        if (notch) notch.style.display = "";
        if (homeIndicator) homeIndicator.style.display = "";
        phoneFrame.style.border = originalBorder;
        phoneFrame.style.borderRadius = originalBorderRadius;
        phoneFrame.style.boxShadow = originalBoxShadow;
      }
    }
  }, [settings.backgroundColor, settings.theme]);

  // Helper to format time
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    if (settings.timeFormat === "12h") {
      const ampm = hours >= 12 ? " PM" : " AM";
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      if (minutes === 0) {
        return `${formattedHours}${ampm}`;
      } else {
        return `${formattedHours}:${minutes
          .toString()
          .padStart(2, "0")}${ampm}`;
      }
    }
    return time;
  };

  // Helper function to detect overlapping classes and adjust positioning
  const getAdjustedClassPositions = (dayClasses) => {
    const sortedClasses = [...dayClasses].sort((a, b) => {
      const timeA = parseInt(a.startTime.replace(":", ""));
      const timeB = parseInt(b.startTime.replace(":", ""));
      return timeA - timeB;
    });

    const adjustedClasses = [];
    const GAP_MINUTES = 7;

    for (let i = 0; i < sortedClasses.length; i++) {
      const currentClass = sortedClasses[i];
      const [startH, startM] = currentClass.startTime.split(":").map(Number);
      const [endH, endM] = currentClass.endTime.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      let adjustedClass = {
        ...currentClass,
        originalStartMinutes: startMinutes,
        originalEndMinutes: endMinutes,
        adjustedStartMinutes: startMinutes,
        adjustedEndMinutes: endMinutes,
      };

      // Check for overlap with previous classes
      for (let j = i - 1; j >= 0; j--) {
        const prevClass = adjustedClasses[j];

        // If current class starts before previous class ends (including gap)
        if (
          adjustedClass.adjustedStartMinutes <
          prevClass.adjustedEndMinutes + GAP_MINUTES
        ) {
          // Adjust start time to when previous class ends plus gap
          adjustedClass.adjustedStartMinutes =
            prevClass.adjustedEndMinutes + GAP_MINUTES;

          // Maintain original duration
          const originalDuration =
            adjustedClass.originalEndMinutes -
            adjustedClass.originalStartMinutes;
          adjustedClass.adjustedEndMinutes =
            adjustedClass.adjustedStartMinutes + originalDuration;
        }
      }

      adjustedClasses.push(adjustedClass);
    }

    return adjustedClasses;
  };

  // Render the weekly grid
  const renderWeeklyGrid = () => {
    // Fixed time range from 7am to 9pm (7:00 to 21:00)
    const startHour = 7;
    const endHour = 21;
    const activeDays = getActiveDays();

    // Find the latest class end time
    let latestEndHour = startHour;
    convertedClasses.forEach((cls) => {
      const endHour = parseInt(cls.endTime.split(":")[0]);
      if (endHour > latestEndHour) {
        latestEndHour = endHour;
      }
    });

    // Add 1 hour buffer after the latest class ends, but don't go past 9pm
    const actualEndHour = Math.min(latestEndHour + 1, endHour);

    // Generate time slots
    const timeSlots = [];
    for (let i = startHour; i < actualEndHour; i++) {
      timeSlots.push(`${i.toString().padStart(2, "0")}:00`);
    }

    const isDark = settings.theme === "dark";
    const textColorClass = isDark ? "text-light-gray" : "text-gray-700";
    const timeTextColorClass = isDark ? "text-light-gray" : "text-gray-600";

    return (
      <div
        className="h-full flex flex-col"
        style={{
          backgroundColor: isDark ? "#1E223C" : settings.backgroundColor,
        }}
      >
        {/* Dynamic white space at top */}
        <div
          style={{ height: `${settings.layoutSpacing.weeklyGrid.whiteSpace}%` }}
        ></div>

        {/* Dynamic content area */}
        <div
          style={{
            height: `${settings.layoutSpacing.weeklyGrid.contentArea}%`,
          }}
          className="relative"
        >
          {/* Day labels at the top */}
          <div className="absolute top-0 left-8 right-0 h-6 flex">
            {activeDays.map((day) => (
              <div
                key={day}
                className={`flex-1 flex items-center justify-center text-[10px] font-semibold ${textColorClass} export-text-fix`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time labels on the left */}
          <div
            className="absolute left-1 top-6 w-8 flex flex-col"
            style={{ height: "calc(100% - 24px)" }}
          >
            {timeSlots.map((time) => (
              <div
                key={time}
                className={`flex items-center justify-center text-[8px] font-medium ${timeTextColorClass} time-label export-text-fix`}
                style={{
                  height: `${100 / timeSlots.length}%`,
                }}
              >
                {formatTime(time)}
              </div>
            ))}
          </div>

          <div
            className="absolute left-9 right-0 top-6"
            style={{
              height: "calc(100% - 24px)",
              gridTemplateColumns: `repeat(${activeDays.length}, 1fr)`,
              display: "grid",
            }}
          >
            {/* Grid lines for days */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                gridTemplateColumns: `repeat(${activeDays.length}, 1fr)`,
                display: "grid",
              }}
            >
              {activeDays.map((_, index) => (
                <div key={index}></div>
              ))}
            </div>

            {/* Grid lines for time slots */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ height: "100%" }}
            >
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: "0",
                    right: "0",
                    top: `${((index + 1) * 100) / timeSlots.length}%`,
                    height: "1px",
                  }}
                ></div>
              ))}
            </div>

            {activeDays.map((day) => {
              const dayClasses = convertedClasses.filter((cls) =>
                cls.days.includes(day)
              );
              const adjustedClasses = getAdjustedClassPositions(dayClasses);

              return (
                <div key={day} className="relative">
                  {adjustedClasses.map((cls) => {
                    const dayStartMinutes = startHour * 60;
                    const dayEndMinutes = actualEndHour * 60;
                    const totalDayMinutes = dayEndMinutes - dayStartMinutes;

                    // Use adjusted times for positioning
                    const topPercent =
                      ((cls.adjustedStartMinutes - dayStartMinutes) /
                        totalDayMinutes) *
                      100;
                    const heightPercent =
                      ((cls.adjustedEndMinutes - cls.adjustedStartMinutes) /
                        totalDayMinutes) *
                      100;
                    const finalHeightPercent = Math.max(heightPercent, 8);

                    // Format the display times (use original times for display)
                    const displayStartTime = `${Math.floor(
                      cls.originalStartMinutes / 60
                    )
                      .toString()
                      .padStart(2, "0")}:${(cls.originalStartMinutes % 60)
                      .toString()
                      .padStart(2, "0")}`;
                    const displayEndTime = `${Math.floor(
                      cls.originalEndMinutes / 60
                    )
                      .toString()
                      .padStart(2, "0")}:${(cls.originalEndMinutes % 60)
                      .toString()
                      .padStart(2, "0")}`;

                    return (
                      <div
                        key={cls.id}
                        className="absolute left-0.5 right-0.5 p-0.5 text-white leading-tight rounded-md shadow-sm flex flex-col justify-center items-center text-center"
                        style={{
                          backgroundColor:
                            settings.theme === "dark"
                              ? cls.color + "cc"
                              : cls.color, // 'cc' is ~80% opacity
                          top: `${Math.max(0, topPercent)}%`,
                          height: `${finalHeightPercent}%`,
                          minHeight: "18px",
                          zIndex: 10,
                        }}
                      >
                        <div className="font-bold text-[6px] mb-0 leading-tight export-text-fix overflow-hidden">
                          {cls.name}
                        </div>
                        <div className="text-[5px] opacity-95 mb-0 break-words leading-tight export-text-fix">
                          {formatTime(displayStartTime)}-
                          {formatTime(displayEndTime)}
                        </div>
                        {cls.location && (
                          <div className="text-[5px] opacity-90 break-words leading-tight export-text-fix">
                            {cls.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom styles for better text rendering */}
        <style jsx>{`
          .export-text-fix {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            line-height: 1.2;
            padding: 2px 1px;
            margin: 0;
            vertical-align: baseline;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            overflow: visible;
            white-space: normal;
            text-overflow: clip;
          }

          .time-label {
            line-height: 1.1;
            padding-top: 2px;
            padding-bottom: 2px;
            overflow: visible;
          }

          .phone-preview {
            overflow: visible !important;
            clip-path: none !important;
          }

          .phone-preview * {
            overflow: visible !important;
            clip-path: none !important;
          }

          /* Export-specific styles to remove borders */
          .export-no-border {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }

          .export-no-border * {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }

          .slider {
            -webkit-appearance: none;
            appearance: none;
            background: #475569;
            height: 8px;
            border-radius: 4px;
            border: 1px solid #64748b;
            cursor: pointer;
            outline: none;
          }

          .slider:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }

          .slider::-webkit-slider-track {
            background: #475569;
            height: 8px;
            border-radius: 4px;
            border: 1px solid #64748b;
          }

          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            background: #3b82f6;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            cursor: pointer;
          }

          .slider::-webkit-slider-thumb:hover {
            background: #2563eb;
          }

          .slider::-webkit-slider-thumb:active {
            background: #1d4ed8;
          }

          .slider::-moz-range-track {
            background: #475569;
            height: 8px;
            border-radius: 4px;
            border: 1px solid #64748b;
            cursor: pointer;
          }

          .slider::-moz-range-thumb {
            background: #3b82f6;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            cursor: pointer;
          }

          .slider::-moz-range-thumb:hover {
            background: #2563eb;
          }

          .slider::-moz-range-thumb:active {
            background: #1d4ed8;
          }
        `}</style>
      </div>
    );
  };

  // Render the daily list
  const renderDailyList = () => {
    const activeDays = getActiveDays();
    const classesByDay = activeDays.reduce((acc, day) => {
      acc[day] = convertedClasses
        .filter((cls) => cls.days.includes(day))
        .sort((a, b) => {
          const timeA = parseInt(a.startTime.replace(":", ""));
          const timeB = parseInt(b.startTime.replace(":", ""));
          return timeA - timeB;
        });
      return acc;
    }, {});

    const isDark = settings.theme === "dark";
    const textColorClass = isDark ? "text-gray-300" : "text-gray-800";
    const cardBgClass = isDark ? "bg-gray-700" : "bg-white";
    const borderClass = isDark ? "border-gray-600" : "border-gray-100";

    return (
      <div
        className="h-full flex flex-col"
        style={{
          backgroundColor: isDark ? "#334155" : settings.backgroundColor,
        }}
      >
        {/* Dynamic white space at top */}
        <div
          style={{ height: `${settings.layoutSpacing.dailyList.whiteSpace}%` }}
        ></div>

        {/* Dynamic content area */}
        <div
          style={{ height: `${settings.layoutSpacing.dailyList.contentArea}%` }}
          className="px-3"
        >
          <div className="h-full flex flex-col gap-2">
            {activeDays
              .filter((day) => classesByDay[day].length > 0)
              .map((day) => (
                <div
                  key={day}
                  className={`${cardBgClass} rounded-lg p-2 shadow-sm border ${borderClass} flex flex-col`}
                >
                  <h3
                    className={`font-bold text-[10px] mb-1 ${textColorClass} export-text-fix`}
                  >
                    {day}
                  </h3>
                  <div className="flex-1 overflow-hidden">
                    <div className="space-y-1">
                      {classesByDay[day].map((cls) => (
                        <div
                          key={cls.id}
                          className="p-1.5 rounded border-l-3"
                          style={{
                            backgroundColor: cls.color + "10",
                            borderLeftColor: cls.color,
                          }}
                        >
                          <div
                            className={`text-[10px] ${textColorClass} export-text-fix`}
                          >
                            <span className="font-semibold">{cls.name}</span>{" "}
                            {cls.location && `(${cls.location})`}{" "}
                            <span className="font-normal">
                              {formatTime(cls.startTime)} -{" "}
                              {formatTime(cls.endTime)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            {activeDays.filter((day) => classesByDay[day].length === 0)
              .length === activeDays.length && (
              <div className="flex-1 flex items-center justify-center">
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  } italic export-text-fix`}
                >
                  No classes scheduled
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-10 px-5 md:px-20">
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto">
        {/* Settings */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Wallpaper Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme & Font */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-slate-100">Theme</Label>
                <RadioGroup
                  value={settings.theme}
                  onValueChange={(value) =>
                    handleSettingsChange("theme", value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="light"
                      id="light"
                      className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <Label
                      htmlFor="light"
                      className="text-slate-100 text-sm font-medium cursor-pointer hover:text-slate-200 transition-colors"
                    >
                      Light Mode
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="dark"
                      id="dark"
                      className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <Label
                      htmlFor="dark"
                      className="text-slate-100 text-sm font-medium cursor-pointer hover:text-slate-200 transition-colors"
                    >
                      Dark Mode
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block text-slate-100">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) =>
                    handleSettingsChange("fontFamily", value)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 hover:border-emerald-500 focus:border-emerald-500 transition-colors text-white">
                    <SelectValue
                      placeholder="Select a font"
                      className="text-white"
                    >
                      {settings.fontFamily && (
                        <span
                          style={{ fontFamily: settings.fontFamily }}
                          className="text-white"
                        >
                          {fontOptions.find(
                            (f) => f.value === settings.fontFamily
                          )?.label || "Select a font"}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                    {fontOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="hover:bg-emerald-500/20 focus:bg-emerald-500/20 py-3 text-white"
                      >
                        <span
                          style={{ fontFamily: option.value }}
                          className="text-base text-white"
                        >
                          {option.preview}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Background Color for Light Mode */}
            {settings.theme === "light" && (
              <div>
                <Label className="mb-2 block text-slate-100">
                  Background Color
                </Label>
                <Input
                  id="background-color"
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) =>
                    handleSettingsChange("backgroundColor", e.target.value)
                  }
                  className="w-20 h-10 rounded-lg border-slate-600 cursor-pointer"
                />
              </div>
            )}

            {/* Time Format & Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-slate-100">Time Format</Label>
                <RadioGroup
                  value={settings.timeFormat}
                  onValueChange={(value) =>
                    handleSettingsChange("timeFormat", value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="12h"
                      id="12h"
                      className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <Label
                      htmlFor="12h"
                      className="text-slate-100 text-sm font-medium cursor-pointer hover:text-slate-200 transition-colors"
                    >
                      12-hour (AM/PM)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="24h"
                      id="24h"
                      className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <Label
                      htmlFor="24h"
                      className="text-slate-100 text-sm font-medium cursor-pointer hover:text-slate-200 transition-colors"
                    >
                      24-hour
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block text-slate-100">Layout View</Label>
                <RadioGroup
                  value={settings.layout}
                  onValueChange={(value) =>
                    handleSettingsChange("layout", value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="weekly-grid"
                      id="weekly-grid"
                      className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <Label
                      htmlFor="weekly-grid"
                      className="text-slate-100 text-sm font-medium cursor-pointer hover:text-slate-200 transition-colors"
                    >
                      Weekly Grid
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="daily-list"
                      id="daily-list"
                      className="border-slate-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <Label
                      htmlFor="daily-list"
                      className="text-slate-100 text-sm font-medium cursor-pointer hover:text-slate-200 transition-colors"
                    >
                      Daily List
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Layout Spacing - Only show for appropriate view */}
            {settings.layout === "weekly-grid" && (
              <div>
                <Label className="mb-3 block text-slate-100">
                  Weekly Grid Spacing
                </Label>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">
                        White Space
                      </span>
                      <span className="text-sm text-slate-100 font-mono">
                        {settings.layoutSpacing.weeklyGrid.whiteSpace}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.layoutSpacing.weeklyGrid.whiteSpace]}
                      onValueChange={(value) =>
                        handleLayoutSpacingChange(
                          "weeklyGrid",
                          "whiteSpace",
                          value[0]
                        )
                      }
                      max={80}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {settings.layout === "daily-list" && (
              <div>
                <Label className="mb-3 block text-slate-100">
                  Daily List Spacing
                </Label>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">
                        White Space
                      </span>
                      <span className="text-sm text-slate-100 font-mono">
                        {settings.layoutSpacing.dailyList.whiteSpace}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.layoutSpacing.dailyList.whiteSpace]}
                      onValueChange={(value) =>
                        handleLayoutSpacingChange(
                          "dailyList",
                          "whiteSpace",
                          value[0]
                        )
                      }
                      max={80}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleExport}
          className="w-full mb-4 lg:mb-0 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl border-0"
        >
          <div className="flex items-center justify-center gap-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-lg">Export Wallpaper</span>
          </div>
        </Button>
      </div>

      {/* Right Panel: Phone Preview */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-6">
        <div
          ref={previewRef}
          className="phone-preview relative w-[340px] h-[680px] lg:w-[360px] lg:h-[720px] border-[8px] lg:border-[10px] border-gray-800 rounded-[30px] lg:rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
          style={{ fontFamily: settings.fontFamily }}
        >
          {/* Phone home indicator - modern design */}
          <div className="phone-home-indicator absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full z-10"></div>

          <div ref={contentRef} className="flex-1 overflow-hidden">
            {settings.layout === "weekly-grid"
              ? renderWeeklyGrid()
              : renderDailyList()}
          </div>
        </div>
      </div>
    </div>
  );
}
