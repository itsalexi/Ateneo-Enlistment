'use client';

import React, { useMemo, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isTimeInRange, parseTimeRange } from '@/lib/helper';

const timeSlots = Array.from({ length: 29 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function formatTime(time, use24Hour) {
  const [startHours, startMinutes] = time.split(':').map(Number);
  let endHours = startHours;
  let endMinutes = startMinutes + 30;

  if (endMinutes >= 60) {
    endMinutes -= 60;
    endHours += 1;
  }

  const format = (hours, minutes) => {
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const adjustedHours = hours % 12 || 12;
      return `${adjustedHours}:${minutes
        .toString()
        .padStart(2, '0')} ${period}`;
    }
  };

  const startTimeFormatted = format(startHours, startMinutes);
  const endTimeFormatted = format(endHours, endMinutes);

  return `${startTimeFormatted}-${endTimeFormatted}`;
}

export default function Calendar({
  selectedCourses = [],
  use24Hour = false,
  setSelectedSlot = () => {},
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const colorCodes = {
    ACCT: 'bg-green-800',
    ANTH: 'bg-purple-800',
    ARTM: 'bg-red-800',
    ARTS: 'bg-green-700',
    ATMOS: 'bg-amber-800',
    ArtAp: 'bg-red-700',
    BIO: 'bg-teal-800',
    CEPP: 'bg-yellow-700',
    CHEM: 'bg-green-900',
    CHEMED: 'bg-amber-700',
    COMM: 'bg-blue-800',
    CPA: 'bg-indigo-800',
    CRWR: 'bg-pink-800',
    CSCI: 'bg-red-900',
    CSP: 'bg-purple-700',
    DECSC: 'bg-emerald-800',
    DECSCI: 'bg-cyan-800',
    DEV: 'bg-teal-700',
    DIRR: 'bg-blue-700',
    DLQ: 'bg-purple-800',
    ECON: 'bg-violet-800',
    EDUC: 'bg-indigo-700',
    ELM: 'bg-pink-700',
    ENE: 'bg-emerald-700',
    ENGG: 'bg-lime-800',
    ENGL: 'bg-indigo-800',
    ENLIT: 'bg-yellow-800',
    ENVI: 'bg-blue-900',
    EURO: 'bg-fuchsia-800',
    FIL: 'bg-orange-800',
    FILI: 'bg-pink-900',
    FINN: 'bg-violet-900',
    FRE: 'bg-lime-700',
    GDEV: 'bg-green-800',
    GER: 'bg-emerald-900',
    HISTO: 'bg-lime-800',
    HSCI: 'bg-red-800',
    HUMAN: 'bg-rose-800',
    IDES: 'bg-sky-800',
    IDS: 'bg-blue-800',
    INTACT: 'bg-rose-700',
    ISCS: 'bg-slate-700',
    ITA: 'bg-violet-800',
    ITENT: 'bg-lime-800',
    ITMGT: 'bg-rose-900',
    JPN: 'bg-red-800',
    KOR: 'bg-emerald-800',
    KRN: 'bg-cyan-800',
    LAS: 'bg-yellow-800',
    LEAD: 'bg-pink-800',
    LLAW: 'bg-green-800',
    MATH: 'bg-amber-900',
    MATSE: 'bg-blue-900',
    MEM: 'bg-sky-900',
    MKTG: 'bg-red-800',
    MSYS: 'bg-fuchsia-900',
    MTHED: 'bg-red-900',
    NSTP: 'bg-green-900',
    OPMAN: 'bg-blue-900',
    PEPC: 'bg-emerald-800',
    PHILO: 'bg-indigo-900',
    PHYED: 'bg-lime-700',
    PHYS: 'bg-violet-800',
    PHYSE: 'bg-fuchsia-800',
    PNTKN: 'bg-blue-800',
    POLSC: 'bg-emerald-900',
    PORT: 'bg-amber-900',
    PSYC: 'bg-blue-900',
    QUANT: 'bg-emerald-900',
    RE: 'bg-lime-800',
    RELED: 'bg-pink-900',
    RUSS: 'bg-blue-800',
    SCIED: 'bg-slate-800',
    SEAS: 'bg-teal-800',
    SOAN: 'bg-slate-700',
    SOCDV: 'bg-pink-900',
    SOCIO: 'bg-pink-800',
    SOMGT: 'bg-pink-900',
    SPA: 'bg-orange-900',
    STS: 'bg-red-900',
    SocSc: 'bg-yellow-800',
    THEO: 'bg-red-900',
    THTR: 'bg-cyan-900',
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

  const schedule = useMemo(() => {
    const scheduleMap = new Map();

    selectedCourses.forEach((course) => {
      const { days, startTime, endTime } = parseTimeRange(course.time);
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
          const formattedTime = `${String(hour).padStart(2, '0')}:${String(
            minute
          ).padStart(2, '0')}`;

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

    return scheduleMap;
  }, [selectedCourses]);

  return (
    <CardContent className="p-0 bg-gray-900 text-gray-100 w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 bg-gray-800 text-gray-100">
                Time
              </TableHead>
              {days.map((day) => (
                <TableHead
                  key={day}
                  className="text-center bg-gray-800 text-gray-100"
                >
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time} className="h-12">
                <TableCell className="font-medium bg-gray-800 text-gray-100">
                  {formatTime(time, use24Hour)}
                </TableCell>
                {days.map((day, index) => {
                  const scheduleBlock = schedule.get(index)?.get(time);

                  if (scheduleBlock && !scheduleBlock.isStart) {
                    return null;
                  }

                  return (
                    <TableCell
                      key={`${day}-${time}`}
                      className={`p-0 relative cursor-pointer hover:bg-gray-700 transition-colors ${
                        scheduleBlock ? 'bg-gray-600' : ''
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
                          className={`absolute inset-0 border-l-4 border-gray-300 flex flex-col items-center justify-center p-1 ${
                            colorCodes[
                              scheduleBlock.course.catNo.split(' ')[0]
                            ] || ''
                          }`}
                        >
                          <span className="text-xs font-semibold text-gray-100">
                            {scheduleBlock.course.catNo}
                          </span>
                          <span className="text-xs text-gray-300">
                            {scheduleBlock.course.time}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
