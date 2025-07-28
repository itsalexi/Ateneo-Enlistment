"use client";

import React, { useMemo, useState } from "react";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isTimeInRange, parseTimeRange } from "@/lib/helper";
import { toPng } from "html-to-image";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(time, use24Hour) {
  const [startHours, startMinutes] = time.split(":").map(Number);
  let endHours = startHours;
  let endMinutes = startMinutes + 30;

  if (endMinutes >= 60) {
    endMinutes -= 60;
    endHours += 1;
  }

  const format = (hours, minutes) => {
    if (use24Hour) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    } else {
      const period = hours >= 12 ? "PM" : "AM";
      const adjustedHours = hours % 12 || 12;
      return `${adjustedHours}:${minutes
        .toString()
        .padStart(2, "0")} ${period}`;
    }
  };

  const startTimeFormatted = format(startHours, startMinutes);
  const endTimeFormatted = format(endHours, endMinutes);

  return `${startTimeFormatted}-${endTimeFormatted}`;
}

function getTimeDisplay(time, use24Hour) {
  const [hours, minutes] = time.split(":").map(Number);

  if (use24Hour) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  } else {
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }
}

export default function Calendar({
  selectedCourses = [],
  use24Hour = false,
  setSelectedSlot = () => {},
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Updated color scheme with softer, more modern colors
  const colorCodes = {
    ACCT: "bg-emerald-500/20 border-emerald-500/30",
    ANTH: "bg-purple-500/20 border-purple-500/30",
    ARTM: "bg-red-500/20 border-red-500/30",
    ARTS: "bg-green-500/20 border-green-500/30",
    ATMOS: "bg-amber-500/20 border-amber-500/30",
    ArtAp: "bg-red-500/20 border-red-500/30",
    BIO: "bg-teal-500/20 border-teal-500/30",
    CEPP: "bg-yellow-500/20 border-yellow-500/30",
    CHEM: "bg-green-600/20 border-green-600/30",
    CHEMED: "bg-amber-500/20 border-amber-500/30",
    COMM: "bg-blue-500/20 border-blue-500/30",
    CPA: "bg-indigo-500/20 border-indigo-500/30",
    CRWR: "bg-pink-500/20 border-pink-500/30",
    CSCI: "bg-red-600/20 border-red-600/30",
    CSP: "bg-purple-500/20 border-purple-500/30",
    DECSC: "bg-emerald-500/20 border-emerald-500/30",
    DECSCI: "bg-cyan-500/20 border-cyan-500/30",
    DEV: "bg-teal-500/20 border-teal-500/30",
    DIRR: "bg-blue-500/20 border-blue-500/30",
    DLQ: "bg-purple-500/20 border-purple-500/30",
    ECON: "bg-violet-500/20 border-violet-500/30",
    EDUC: "bg-indigo-500/20 border-indigo-500/30",
    ELM: "bg-pink-500/20 border-pink-500/30",
    ENE: "bg-emerald-500/20 border-emerald-500/30",
    ENGG: "bg-lime-500/20 border-lime-500/30",
    ENGL: "bg-indigo-500/20 border-indigo-500/30",
    ENLIT: "bg-yellow-500/20 border-yellow-500/30",
    ENVI: "bg-blue-600/20 border-blue-600/30",
    EURO: "bg-fuchsia-500/20 border-fuchsia-500/30",
    FIL: "bg-orange-500/20 border-orange-500/30",
    FILI: "bg-pink-600/20 border-pink-600/30",
    FINN: "bg-violet-600/20 border-violet-600/30",
    FRE: "bg-lime-500/20 border-lime-500/30",
    GDEV: "bg-green-500/20 border-green-500/30",
    GER: "bg-emerald-600/20 border-emerald-600/30",
    HISTO: "bg-lime-500/20 border-lime-500/30",
    HSCI: "bg-red-500/20 border-red-500/30",
    HUMAN: "bg-rose-500/20 border-rose-500/30",
    IDES: "bg-sky-500/20 border-sky-500/30",
    IDS: "bg-blue-500/20 border-blue-500/30",
    INTACT: "bg-rose-500/20 border-rose-500/30",
    ISCS: "bg-slate-500/20 border-slate-500/30",
    ITA: "bg-violet-500/20 border-violet-500/30",
    ITENT: "bg-lime-500/20 border-lime-500/30",
    ITMGT: "bg-rose-600/20 border-rose-600/30",
    JPN: "bg-red-500/20 border-red-500/30",
    KOR: "bg-emerald-500/20 border-emerald-500/30",
    KRN: "bg-cyan-500/20 border-cyan-500/30",
    LAS: "bg-yellow-500/20 border-yellow-500/30",
    LEAD: "bg-pink-500/20 border-pink-500/30",
    LLAW: "bg-green-500/20 border-green-500/30",
    MATH: "bg-amber-600/20 border-amber-600/30",
    MATSE: "bg-blue-600/20 border-blue-600/30",
    MEM: "bg-sky-600/20 border-sky-600/30",
    MKTG: "bg-red-500/20 border-red-500/30",
    MSYS: "bg-fuchsia-600/20 border-fuchsia-600/30",
    MTHED: "bg-red-600/20 border-red-600/30",
    NSTP: "bg-green-600/20 border-green-600/30",
    OPMAN: "bg-blue-600/20 border-blue-600/30",
    PEPC: "bg-emerald-500/20 border-emerald-500/30",
    PHILO: "bg-indigo-600/20 border-indigo-600/30",
    PHYED: "bg-lime-500/20 border-lime-500/30",
    PHYS: "bg-violet-500/20 border-violet-500/30",
    PHYSE: "bg-fuchsia-500/20 border-fuchsia-500/30",
    PNTKN: "bg-blue-500/20 border-blue-500/30",
    POLSC: "bg-emerald-600/20 border-emerald-600/30",
    PORT: "bg-amber-600/20 border-amber-600/30",
    PSYC: "bg-blue-600/20 border-blue-600/30",
    QUANT: "bg-emerald-600/20 border-emerald-600/30",
    RE: "bg-lime-500/20 border-lime-500/30",
    RELED: "bg-pink-600/20 border-pink-600/30",
    RUSS: "bg-blue-500/20 border-blue-500/30",
    SCIED: "bg-slate-600/20 border-slate-600/30",
    SEAS: "bg-teal-500/20 border-teal-500/30",
    SOAN: "bg-slate-500/20 border-slate-500/30",
    SOCDV: "bg-pink-600/20 border-pink-600/30",
    SOCIO: "bg-pink-500/20 border-pink-500/30",
    SOMGT: "bg-pink-600/20 border-pink-600/30",
    SPA: "bg-orange-600/20 border-orange-600/30",
    STS: "bg-red-600/20 border-red-600/30",
    SocSc: "bg-yellow-500/20 border-yellow-500/30",
    THEO: "bg-red-600/20 border-red-600/30",
    THTR: "bg-cyan-600/20 border-cyan-600/30",
  };

  function calculateTimeSlots(startTime, endTime) {
    const toMinutes = (time) => {
      const hours = Math.floor(time / 100);
      const minutes = time % 100;
      return hours * 60 + minutes;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    const duration = endMinutes - startMinutes;

    return Math.ceil(duration / 30);
  }

  // Generate time slots dynamically based on actual course schedules
  const timeSlots = useMemo(() => {
    if (selectedCourses.length === 0) {
      // Default time range if no courses selected
      return Array.from({ length: 20 }, (_, i) => {
        const hour = Math.floor(i / 2) + 7;
        const minute = i % 2 === 0 ? "00" : "30";
        return `${hour.toString().padStart(2, "0")}:${minute}`;
      });
    }

    const allTimes = new Set();

    selectedCourses.forEach((course) => {
      const timeSegments = parseTimeRange(course.time);

      timeSegments.forEach((segment) => {
        const { startTime, endTime } = segment;
        let time = startTime;

        while (time < endTime) {
          const hour = Math.floor(time / 100);
          const minute = time % 100;
          const formattedTime = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;
          allTimes.add(formattedTime);

          time += 30;
          if (minute + 30 >= 60) {
            time = (hour + 1) * 100 + (minute + 30 - 60);
          }
        }
      });
    });

    // Convert to array and sort
    const sortedTimes = Array.from(allTimes).sort();

    // Add some padding before and after for better visual
    const firstTime = sortedTimes[0];
    const lastTime = sortedTimes[sortedTimes.length - 1];

    if (firstTime && lastTime) {
      const [firstHour] = firstTime.split(":").map(Number);
      const [lastHour] = lastTime.split(":").map(Number);

      const startHour = Math.max(7, firstHour - 1);
      const endHour = Math.min(22, lastHour + 2);

      const extendedTimes = [];
      for (let hour = startHour; hour <= endHour; hour++) {
        extendedTimes.push(`${hour.toString().padStart(2, "0")}:00`);
        extendedTimes.push(`${hour.toString().padStart(2, "0")}:30`);
      }

      return extendedTimes;
    }

    return sortedTimes;
  }, [selectedCourses]);

  const schedule = useMemo(() => {
    const scheduleMap = new Map();

    selectedCourses.forEach((course) => {
      const timeSegments = parseTimeRange(course.time);

      timeSegments.forEach((segment) => {
        const { days, startTime, endTime } = segment;
        const timeSlotCount = calculateTimeSlots(startTime, endTime);

        days.forEach((day) => {
          if (!scheduleMap.has(day)) {
            scheduleMap.set(day, new Map());
          }

          const daySchedule = scheduleMap.get(day);
          if (!daySchedule) return;

          let time = startTime;
          let isFirst = true;

          while (time < endTime) {
            const hour = Math.floor(time / 100);
            const minute = time % 100;
            const formattedTime = `${String(hour).padStart(2, "0")}:${String(
              minute
            ).padStart(2, "0")}`;

            if (isFirst) {
              daySchedule.set(formattedTime, {
                course,
                rowspan: timeSlotCount,
                isStart: true,
              });
              isFirst = false;
            } else {
              daySchedule.set(formattedTime, {
                course,
                rowspan: timeSlotCount,
                isStart: false,
              });
            }

            time += 30;
            if (minute + 30 >= 60) {
              time = (hour + 1) * 100 + (minute + 30 - 60);
            }
          }
        });
      });
    });

    return scheduleMap;
  }, [selectedCourses]);

  return (
    <CardContent className="p-0 bg-white dark:bg-gray-900 w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="w-28 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm py-4 px-3">
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    Time
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Schedule
                  </div>
                </div>
              </TableHead>
              {days.map((day) => (
                <TableHead
                  key={day}
                  className="text-center bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm py-4 px-3 min-w-[140px]"
                >
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {day.slice(0, 3)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {day.slice(3)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((time, timeIndex) => {
              const hasAnySchedule = days.some((day, index) =>
                schedule.get(index)?.has(time)
              );

              // Skip rendering if no courses at this time and it's outside the course range
              if (!hasAnySchedule && selectedCourses.length > 0) {
                return null;
              }

              return (
                <TableRow
                  key={time}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    timeIndex % 2 === 0
                      ? "bg-gray-50/30 dark:bg-gray-800/30"
                      : ""
                  }`}
                >
                  <TableCell className="font-medium text-gray-600 dark:text-gray-400 text-sm py-3 px-3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {getTimeDisplay(time, use24Hour)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(time, use24Hour)}
                      </div>
                    </div>
                  </TableCell>
                  {days.map((day, index) => {
                    const scheduleBlock = schedule.get(index)?.get(time);

                    if (scheduleBlock && !scheduleBlock.isStart) {
                      return null;
                    }

                    return (
                      <TableCell
                        key={`${day}-${time}`}
                        className={`p-0 relative cursor-pointer transition-all duration-200 ${
                          scheduleBlock
                            ? ""
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        rowSpan={scheduleBlock?.rowspan}
                        onClick={() => {
                          if (scheduleBlock) {
                            setSelectedCourse(scheduleBlock);
                          } else {
                            setSelectedCourse(null);
                          }
                          setIsDialogOpen(true);
                          setSelectedSlot({ day: index, time });
                        }}
                      >
                        {scheduleBlock && (
                          <div
                            className={`absolute inset-1 rounded-lg border-l-4 flex flex-col justify-center p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
                              colorCodes[
                                scheduleBlock.course.catNo.split(" ")[0]
                              ] || "bg-gray-500/20 border-gray-500/30"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                                {scheduleBlock.course.catNo} -{" "}
                                {scheduleBlock.course.section}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {scheduleBlock.course.time}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                {scheduleBlock.course.instructor}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                                {scheduleBlock.course.room}
                              </div>
                            </div>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
