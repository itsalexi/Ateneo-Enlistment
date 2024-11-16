const shortDays = ['M', 'T', 'W', 'TH', 'F', 'SAT'];

export function isTimeInRange(time, startTime, endTime) {
  const [hours, minutes] = time.split(':').map(Number);
  const currentTime = hours * 100 + minutes;

  return currentTime >= startTime && currentTime < endTime;
}

export function parseTimeRange(timeString) {
  const [dayRange, timeRange] = timeString.split(' ');
  const [startTime, endTime] = timeRange.split('-');
  let dayIndices = [];

  if (dayRange === 'M-TH') {
    dayIndices = [0, 3];
  } else if (dayRange === 'T-F') {
    dayIndices = [1, 4];
  } else if (dayRange === 'W') {
    dayIndices = [2];
  } else {
    dayIndices = dayRange.split('-').map((day) => shortDays.indexOf(day));
  }

  return {
    days: dayIndices,
    startTime: parseInt(startTime),
    endTime: parseInt(endTime),
  };
}
