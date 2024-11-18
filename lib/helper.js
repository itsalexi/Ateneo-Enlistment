const shortDays = ['M', 'T', 'W', 'TH', 'F', 'SAT'];

export function isTimeInRange(time, startTime, endTime) {
  const [hours, minutes] = time.split(':').map(Number);
  const currentTime = hours * 100 + minutes;

  return currentTime >= startTime && currentTime < endTime;
}

export function parseTimeRange(timeString) {
  const [dayRange, timeRange] = timeString.split(' ');

  if (!dayRange || !timeRange) {
    return null;
  }

  const [startTime, endTime] = timeRange.split('-');

  if (!startTime || !endTime) {
    return null;
  }

  let dayIndices = [];

  if (dayRange === 'M-TH') {
    dayIndices = [0, 3];
  } else if (dayRange === 'T-F') {
    dayIndices = [1, 4];
  } else if (dayRange === 'W') {
    dayIndices = [2];
  } else {
    dayIndices = dayRange.split('-').map((day) => shortDays.indexOf(day));
    if (dayIndices.includes(-1)) {
      return null;
    }
  }

  return {
    days: dayIndices,
    startTime: parseInt(startTime),
    endTime: parseInt(endTime),
  };
}

export function sortTimeslots(timeslots) {
  const rangeDayOrder = {
    'M-TH': 1,
    'T-F': 2,
  };

  const singleDayOrder = {
    M: 3,
    T: 4,
    W: 5,
    TH: 6,
    F: 7,
    SAT: 8,
  };

  function getSortKey(slot) {
    if (!slot) return [Infinity, '', ''];

    if (slot.includes('TUTORIAL') || slot.includes('TBA')) {
      return [Infinity, '', slot];
    }

    const parts = slot.split(' ');
    const dayPart = parts[0];
    const timePart = parts[1] || '';

    let primaryKey;
    if (singleDayOrder.hasOwnProperty(dayPart)) {
      primaryKey = singleDayOrder[dayPart];
    } else if (rangeDayOrder.hasOwnProperty(dayPart)) {
      primaryKey = rangeDayOrder[dayPart];
    } else {
      primaryKey = Infinity;
    }

    const startTime = timePart.includes('-') ? timePart.split('-')[0] : '9999';

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
