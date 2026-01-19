const NO_TIME_RE = /(TBA|TUTORIAL|ARR|TBD)/i;

const DAY_INDEX = {
  M: 0,
  T: 1,
  W: 2,
  TH: 3,
  F: 4,
  SAT: 5,
  SU: 6,
};

export const DAYS = [
  { label: "Mon", full: "Monday", index: 0 },
  { label: "Tue", full: "Tuesday", index: 1 },
  { label: "Wed", full: "Wednesday", index: 2 },
  { label: "Thu", full: "Thursday", index: 3 },
  { label: "Fri", full: "Friday", index: 4 },
  { label: "Sat", full: "Saturday", index: 5 },
];

export const DEFAULT_TIME_RANGE = {
  start: 7 * 60,
  end: 21 * 60,
  step: 30,
};

export function normalizeText(value) {
  return value ? String(value).trim() : "";
}

function parseTimePart(value) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return null;
  const hours = digits.length === 3 ? digits.slice(0, 1) : digits.slice(0, 2);
  const minutes = digits.length === 3 ? digits.slice(1) : digits.slice(2);
  const hourNumber = Number(hours);
  const minuteNumber = Number(minutes);
  if (Number.isNaN(hourNumber) || Number.isNaN(minuteNumber)) return null;
  if (minuteNumber < 0 || minuteNumber > 59) return null;
  return hourNumber * 60 + minuteNumber;
}

function expandDayToken(token) {
  if (token === "D") return [0, 1, 2, 3, 4];
  if (token === "M-TH") return [0, 3];
  if (token === "T-F") return [1, 4];

  if (token.includes(",")) {
    const list = token
      .split(",")
      .map((part) => part.trim())
      .map((part) => DAY_INDEX[part])
      .filter((value) => value !== undefined);
    return list.length ? list : null;
  }

  if (token.includes("-")) {
    const [startToken, endToken] = token.split("-");
    const startIndex = DAY_INDEX[startToken];
    const endIndex = DAY_INDEX[endToken];
    if (startIndex === undefined || endIndex === undefined) return null;
    if (startIndex > endIndex) return null;
    return Array.from(
      { length: endIndex - startIndex + 1 },
      (_, index) => startIndex + index
    );
  }

  if (DAY_INDEX[token] !== undefined) {
    return [DAY_INDEX[token]];
  }

  return null;
}

export function parseTimeString(rawTime) {
  const time = normalizeText(rawTime);
  if (!time) {
    return { meetings: [], noTime: true, reason: "Missing time" };
  }

  if (NO_TIME_RE.test(time)) {
    return { meetings: [], noTime: true, reason: "No scheduled time" };
  }

  const cleaned = time.replace(/\(\)/g, "").replace(/\s+/g, " ").trim();
  const segments = cleaned
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const meetings = [];

  for (const segment of segments) {
    const match = segment.match(/^([A-Z-]+)\s+(\d{3,4})-(\d{3,4})$/);
    if (!match) continue;

    const [, dayToken, startValue, endValue] = match;
    const days = expandDayToken(dayToken);
    const start = parseTimePart(startValue);
    const end = parseTimePart(endValue);

    if (!days || start === null || end === null || start >= end) continue;

    meetings.push({ days, start, end });
  }

  if (!meetings.length) {
    return { meetings: [], noTime: true, reason: "Unparsed time" };
  }

  return { meetings, noTime: false, reason: "" };
}

export function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const adjusted = hours % 12 || 12;
  return `${adjusted}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatRange(start, end) {
  return `${formatMinutes(start)} - ${formatMinutes(end)}`;
}

export function getTimeSlots({ start, end, step }) {
  const slots = [];
  for (let minutes = start; minutes < end; minutes += step) {
    slots.push(minutes);
  }
  return slots;
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

    const upper = slot.toUpperCase();
    if (upper.includes("TUTORIAL") || upper.includes("TBA")) {
      return [Infinity, "", upper];
    }

    const parts = slot.split(" ");
    const dayPart = parts[0];
    const timePart = parts[1] || "";

    let primaryKey = Infinity;
    if (Object.prototype.hasOwnProperty.call(singleDayOrder, dayPart)) {
      primaryKey = singleDayOrder[dayPart];
    } else if (Object.prototype.hasOwnProperty.call(rangeDayOrder, dayPart)) {
      primaryKey = rangeDayOrder[dayPart];
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

export function isTimeOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}
