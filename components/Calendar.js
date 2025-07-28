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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Settings state for hiding elements
  const [settings, setSettings] = useState({
    showInstructor: true,
    showRoom: true,
    showTime: true,
    showSection: true,
  });

  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Updated color scheme with softer, more modern colors
  const colorCodes = {
    ACCT: "bg-emerald-500/25 border-emerald-500/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    ANTH: "bg-purple-500/25 border-purple-500/40 dark:bg-purple-400/20 dark:border-purple-400/40",
    ARTM: "bg-red-500/25 border-red-500/40 dark:bg-red-400/20 dark:border-red-400/40",
    ARTS: "bg-green-500/25 border-green-500/40 dark:bg-green-400/20 dark:border-green-400/40",
    ATMOS: "bg-amber-500/25 border-amber-500/40 dark:bg-amber-400/20 dark:border-amber-400/40",
    ArtAp: "bg-red-500/25 border-red-500/40 dark:bg-red-400/20 dark:border-red-400/40",
    BIO: "bg-teal-500/25 border-teal-500/40 dark:bg-teal-400/20 dark:border-teal-400/40",
    CEPP: "bg-yellow-500/25 border-yellow-500/40 dark:bg-yellow-400/20 dark:border-yellow-400/40",
    CHEM: "bg-green-600/25 border-green-600/40 dark:bg-green-400/20 dark:border-green-400/40",
    CHEMED: "bg-amber-500/25 border-amber-500/40 dark:bg-amber-400/20 dark:border-amber-400/40",
    COMM: "bg-blue-500/25 border-blue-500/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    CPA: "bg-indigo-500/25 border-indigo-500/40 dark:bg-indigo-400/20 dark:border-indigo-400/40",
    CRWR: "bg-pink-500/25 border-pink-500/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    CSCI: "bg-red-600/25 border-red-600/40 dark:bg-red-400/20 dark:border-red-400/40",
    CSP: "bg-purple-500/25 border-purple-500/40 dark:bg-purple-400/20 dark:border-purple-400/40",
    DECSC: "bg-emerald-500/25 border-emerald-500/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    DECSCI: "bg-cyan-500/25 border-cyan-500/40 dark:bg-cyan-400/20 dark:border-cyan-400/40",
    DEV: "bg-teal-500/25 border-teal-500/40 dark:bg-teal-400/20 dark:border-teal-400/40",
    DIRR: "bg-blue-500/25 border-blue-500/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    DLQ: "bg-purple-500/25 border-purple-500/40 dark:bg-purple-400/20 dark:border-purple-400/40",
    ECON: "bg-violet-500/25 border-violet-500/40 dark:bg-violet-400/20 dark:border-violet-400/40",
    EDUC: "bg-indigo-500/25 border-indigo-500/40 dark:bg-indigo-400/20 dark:border-indigo-400/40",
    ELM: "bg-pink-500/25 border-pink-500/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    ENE: "bg-emerald-500/25 border-emerald-500/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    ENGG: "bg-lime-500/25 border-lime-500/40 dark:bg-lime-400/20 dark:border-lime-400/40",
    ENGL: "bg-indigo-500/25 border-indigo-500/40 dark:bg-indigo-400/20 dark:border-indigo-400/40",
    ENLIT: "bg-yellow-500/25 border-yellow-500/40 dark:bg-yellow-400/20 dark:border-yellow-400/40",
    ENVI: "bg-blue-600/25 border-blue-600/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    EURO: "bg-fuchsia-500/25 border-fuchsia-500/40 dark:bg-fuchsia-400/20 dark:border-fuchsia-400/40",
    FIL: "bg-orange-500/25 border-orange-500/40 dark:bg-orange-400/20 dark:border-orange-400/40",
    FILI: "bg-pink-600/25 border-pink-600/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    FINN: "bg-violet-600/25 border-violet-600/40 dark:bg-violet-400/20 dark:border-violet-400/40",
    FRE: "bg-lime-500/25 border-lime-500/40 dark:bg-lime-400/20 dark:border-lime-400/40",
    GDEV: "bg-green-500/25 border-green-500/40 dark:bg-green-400/20 dark:border-green-400/40",
    GER: "bg-emerald-600/25 border-emerald-600/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    HISTO: "bg-lime-500/25 border-lime-500/40 dark:bg-lime-400/20 dark:border-lime-400/40",
    HSCI: "bg-red-500/25 border-red-500/40 dark:bg-red-400/20 dark:border-red-400/40",
    HUMAN: "bg-rose-500/25 border-rose-500/40 dark:bg-rose-400/20 dark:border-rose-400/40",
    IDES: "bg-sky-500/25 border-sky-500/40 dark:bg-sky-400/20 dark:border-sky-400/40",
    IDS: "bg-blue-500/25 border-blue-500/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    INTACT: "bg-rose-500/25 border-rose-500/40 dark:bg-rose-400/20 dark:border-rose-400/40",
    ISCS: "bg-slate-500/25 border-slate-500/40 dark:bg-slate-400/20 dark:border-slate-400/40",
    ITA: "bg-violet-500/25 border-violet-500/40 dark:bg-violet-400/20 dark:border-violet-400/40",
    ITENT: "bg-lime-500/25 border-lime-500/40 dark:bg-lime-400/20 dark:border-lime-400/40",
    ITMGT: "bg-rose-600/25 border-rose-600/40 dark:bg-rose-400/20 dark:border-rose-400/40",
    JPN: "bg-red-500/25 border-red-500/40 dark:bg-red-400/20 dark:border-red-400/40",
    KOR: "bg-emerald-500/25 border-emerald-500/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    KRN: "bg-cyan-500/25 border-cyan-500/40 dark:bg-cyan-400/20 dark:border-cyan-400/40",
    LAS: "bg-yellow-500/25 border-yellow-500/40 dark:bg-yellow-400/20 dark:border-yellow-400/40",
    LEAD: "bg-pink-500/25 border-pink-500/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    LLAW: "bg-green-500/25 border-green-500/40 dark:bg-green-400/20 dark:border-green-400/40",
    MATH: "bg-amber-600/25 border-amber-600/40 dark:bg-amber-400/20 dark:border-amber-400/40",
    MATSE: "bg-blue-600/25 border-blue-600/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    MEM: "bg-sky-600/25 border-sky-600/40 dark:bg-sky-400/20 dark:border-sky-400/40",
    MKTG: "bg-red-500/25 border-red-500/40 dark:bg-red-400/20 dark:border-red-400/40",
    MSYS: "bg-fuchsia-600/25 border-fuchsia-600/40 dark:bg-fuchsia-400/20 dark:border-fuchsia-400/40",
    MTHED: "bg-red-600/25 border-red-600/40 dark:bg-red-400/20 dark:border-red-400/40",
    NSTP: "bg-green-600/25 border-green-600/40 dark:bg-green-400/20 dark:border-green-400/40",
    OPMAN: "bg-blue-600/25 border-blue-600/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    PEPC: "bg-emerald-500/25 border-emerald-500/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    PHILO: "bg-indigo-600/25 border-indigo-600/40 dark:bg-indigo-400/20 dark:border-indigo-400/40",
    PHYED: "bg-lime-500/25 border-lime-500/40 dark:bg-lime-400/20 dark:border-lime-400/40",
    PHYS: "bg-violet-500/25 border-violet-500/40 dark:bg-violet-400/20 dark:border-violet-400/40",
    PHYSE: "bg-fuchsia-500/25 border-fuchsia-500/40 dark:bg-fuchsia-400/20 dark:border-fuchsia-400/40",
    PNTKN: "bg-blue-500/25 border-blue-500/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    POLSC: "bg-emerald-600/25 border-emerald-600/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    PORT: "bg-amber-600/25 border-amber-600/40 dark:bg-amber-400/20 dark:border-amber-400/40",
    PSYC: "bg-blue-600/25 border-blue-600/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    QUANT: "bg-emerald-600/25 border-emerald-600/40 dark:bg-emerald-400/20 dark:border-emerald-400/40",
    RE: "bg-lime-500/25 border-lime-500/40 dark:bg-lime-400/20 dark:border-lime-400/40",
    RELED: "bg-pink-600/25 border-pink-600/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    RUSS: "bg-blue-500/25 border-blue-500/40 dark:bg-blue-400/20 dark:border-blue-400/40",
    SCIED: "bg-slate-600/25 border-slate-600/40 dark:bg-slate-400/20 dark:border-slate-400/40",
    SEAS: "bg-teal-500/25 border-teal-500/40 dark:bg-teal-400/20 dark:border-teal-400/40",
    SOAN: "bg-slate-500/25 border-slate-500/40 dark:bg-slate-400/20 dark:border-slate-400/40",
    SOCDV: "bg-pink-600/25 border-pink-600/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    SOCIO: "bg-pink-500/25 border-pink-500/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    SOMGT: "bg-pink-600/25 border-pink-600/40 dark:bg-pink-400/20 dark:border-pink-400/40",
    SPA: "bg-orange-600/25 border-orange-600/40 dark:bg-orange-400/20 dark:border-orange-400/40",
    STS: "bg-red-600/25 border-red-600/40 dark:bg-red-400/20 dark:border-red-400/40",
    SocSc: "bg-yellow-500/25 border-yellow-500/40 dark:bg-yellow-400/20 dark:border-yellow-400/40",
    THEO: "bg-red-600/25 border-red-600/40 dark:bg-red-400/20 dark:border-red-400/40",
    THTR: "bg-cyan-600/25 border-cyan-600/40 dark:bg-cyan-400/20 dark:border-cyan-400/40",
  };

  const exportToPng = async () => {
    const tableElement = document.querySelector('[data-calendar-table]');
    if (tableElement) {
      try {
        const dataUrl = await toPng(tableElement, {
          backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          quality: 1.0,
          pixelRatio: 2,
        });
        
        const link = document.createElement('a');
        link.download = 'schedule.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error exporting to PNG:', error);
      }
    }
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
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
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
          const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
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
      const [firstHour] = firstTime.split(':').map(Number);
      const [lastHour] = lastTime.split(':').map(Number);
      
      const startHour = Math.max(7, firstHour - 1);
      const endHour = Math.min(22, lastHour + 2);
      
      const extendedTimes = [];
      for (let hour = startHour; hour <= endHour; hour++) {
        extendedTimes.push(`${hour.toString().padStart(2, '0')}:00`);
        extendedTimes.push(`${hour.toString().padStart(2, '0')}:30`);
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
            const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  
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
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex justify-end gap-2 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              ⚙️ Settings
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-gray-800 border-gray-700 text-gray-100">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-100">Display Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showInstructor"
                    checked={settings.showInstructor}
                    onCheckedChange={() => toggleSetting('showInstructor')}
                    className="border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                  />
                  <Label htmlFor="showInstructor" className="text-sm text-gray-300">
                    Show Instructor Names
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showRoom"
                    checked={settings.showRoom}
                    onCheckedChange={() => toggleSetting('showRoom')}
                    className="border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                  />
                  <Label htmlFor="showRoom" className="text-sm text-gray-300">
                    Show Room Numbers
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showTime"
                    checked={settings.showTime}
                    onCheckedChange={() => toggleSetting('showTime')}
                    className="border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                  />
                  <Label htmlFor="showTime" className="text-sm text-gray-300">
                    Show Time Details
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showSection"
                    checked={settings.showSection}
                    onCheckedChange={() => toggleSetting('showSection')}
                    className="border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                  />
                  <Label htmlFor="showSection" className="text-sm text-gray-300">
                    Show Section Numbers
                  </Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToPng}
          className="text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          📷 Export PNG
        </Button>
      </div>
      
      <CardContent className="p-0 bg-white dark:bg-gray-900 w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <Table className="w-full" data-calendar-table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableHead className="w-24 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm py-4 px-3 text-center">
                  Time
                </TableHead>
                {days.map((day) => (
                  <TableHead
                    key={day}
                    className="text-center bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm py-4 px-3 min-w-[140px]"
                  >
                    {day}
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
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-600 dark:text-gray-300 text-sm py-4 px-3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 text-center">
                      {getTimeDisplay(time, use24Hour)}
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
                            scheduleBlock ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
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
                              className={`absolute inset-1 rounded-lg border-l-4 flex flex-col justify-center p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                                colorCodes[
                                  scheduleBlock.course.catNo.split(' ')[0]
                                ] || 'bg-gray-500/20 border-gray-500/30'
                              }`}
                              style={{
                                minHeight: `${Math.max(80, scheduleBlock.rowspan * 20)}px`
                              }}
                            >
                              <div className="space-y-2 text-center">
                                <div className={`font-semibold text-gray-900 dark:text-white leading-tight ${
                                  Object.values(settings).filter(Boolean).length <= 2 ? 'text-base' : 'text-sm'
                                }`}>
                                  {scheduleBlock.course.catNo}
                                  {settings.showSection && ` - ${scheduleBlock.course.section}`}
                                </div>
                                {settings.showTime && (
                                  <div className={`text-gray-600 dark:text-gray-200 font-medium ${
                                    Object.values(settings).filter(Boolean).length <= 2 ? 'text-sm' : 'text-xs'
                                  }`}>
                                    {scheduleBlock.course.time}
                                  </div>
                                )}
                                {settings.showInstructor && (
                                  <div className={`text-gray-500 dark:text-gray-300 truncate ${
                                    Object.values(settings).filter(Boolean).length <= 2 ? 'text-sm' : 'text-xs'
                                  }`}>
                                    {scheduleBlock.course.instructor}
                                  </div>
                                )}
                                {settings.showRoom && (
                                  <div className={`text-gray-500 dark:text-gray-300 font-medium ${
                                    Object.values(settings).filter(Boolean).length <= 2 ? 'text-sm' : 'text-xs'
                                  }`}>
                                    {scheduleBlock.course.room}
                                  </div>
                                )}
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
    </div>
  );
}
