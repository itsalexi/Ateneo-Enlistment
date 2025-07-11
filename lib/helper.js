export function isTimeInRange(time, startTime, endTime) {
  const [hours, minutes] = time.split(":").map(Number);
  const currentTime = hours * 100 + minutes;

  return currentTime >= startTime && currentTime < endTime;
}

export function parseTimeRange(timeString) {
  const shortDays = ["M", "T", "W", "TH", "F", "SAT", "SU"];

  const segments = timeString.split(";").map((segment) => segment.trim());

  const parsedSegments = segments.map((segment) => {
    const [dayRange, timeRange] = segment.split(" ");

    if (!dayRange || !timeRange) {
      return null;
    }

    const [startTime, endTime] = timeRange.split("-");
    if (!startTime || !endTime) {
      return null;
    }

    let dayIndices = [];

    if (dayRange === "M-TH") {
      dayIndices = [0, 3];
    } else if (dayRange === "T-F") {
      dayIndices = [1, 4];
    } else if (dayRange === "D") {
      dayIndices = [0, 1, 2, 3, 4];
    } else {
      dayIndices = dayRange.split(/,|-/).map((day) => shortDays.indexOf(day));
      if (dayIndices.includes(-1)) {
        return null;
      }
    }

    const parseTime = (time) => {
      const match = time.match(/^(\d{1,2})(\d{2})$/);
      if (!match) {
        return null;
      }
      const [_, hour, minute] = match;
      return parseInt(hour, 10) * 100 + parseInt(minute, 10);
    };

    const parsedStartTime = parseTime(startTime);
    const parsedEndTime = parseTime(endTime);

    if (
      parsedStartTime === null ||
      parsedEndTime === null ||
      parsedStartTime >= parsedEndTime
    ) {
      return null;
    }

    return {
      days: dayIndices,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
    };
  });

  return parsedSegments.filter(Boolean);
}

export function sortTimeslots(timeslots) {
  const rangeDayOrder = {
    "M-TH": 1,
    "T-F": 2,
    D: 3,
  };

  const singleDayOrder = {
    M: 4,
    T: 5,
    W: 6,
    TH: 7,
    F: 8,
    SAT: 9,
    SU: 10,
  };

  function getSortKey(slot) {
    if (!slot) return [Infinity, "", ""];

    if (slot.includes("TUTORIAL") || slot.includes("TBA")) {
      return [Infinity, "", slot];
    }

    const parts = slot.split(" ");
    const dayPart = parts[0];
    const timePart = parts[1] || "";

    let primaryKey;
    if (singleDayOrder.hasOwnProperty(dayPart)) {
      primaryKey = singleDayOrder[dayPart];
    } else if (rangeDayOrder.hasOwnProperty(dayPart)) {
      primaryKey = rangeDayOrder[dayPart];
    } else {
      primaryKey = Infinity;
    }

    const startTime = timePart.includes("-") ? timePart.split("-")[0] : "9999";

    return [primaryKey, startTime, slot];
  }

  return [...timeslots].sort((a, b) => {
    const keyA = getSortKey(a);
    const keyB = getSortKey(b);

    if (keyA[0] !== keyB[0]) {
      return keyA[0] - keyB[0];
    }

    if (keyA[1] !== keyB[1]) {
      return keyA[1].localeCompare(keyB[1]);
    }

    return keyA[2].localeCompare(keyB[2]);
  });
}

export function hasTimeConflict(course1, course2) {
  // If either course has no valid time, no conflict
  const time1 = parseTimeRange(course1.time);
  const time2 = parseTimeRange(course2.time);

  if (!time1 || !time2) {
    return false;
  }

  for (const segment1 of time1) {
    for (const segment2 of time2) {
      const dayOverlap = segment1.days.some((day) =>
        segment2.days.includes(day)
      );

      if (dayOverlap) {
        const timeOverlap = !(
          segment1.endTime <= segment2.startTime ||
          segment2.endTime <= segment1.startTime
        );

        if (timeOverlap) {
          return true;
        }
      }
    }
  }

  return false;
}

export function findConflictingCourses(course, courseList) {
  return courseList.filter(
    (existingCourse) =>
      existingCourse.id !== course.id && hasTimeConflict(course, existingCourse)
  );
}
