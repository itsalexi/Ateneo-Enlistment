import { parseTimeString, isTimeOverlap, normalizeText } from "@/lib/time";

const COURSE_COLORS = [
  "bg-amber-200/80 border-amber-600 text-amber-950",
  "bg-emerald-200/80 border-emerald-600 text-emerald-950",
  "bg-sky-200/80 border-sky-600 text-sky-950",
  "bg-orange-200/80 border-orange-600 text-orange-950",
  "bg-teal-200/80 border-teal-600 text-teal-950",
  "bg-lime-200/80 border-lime-600 text-lime-950",
  "bg-rose-200/80 border-rose-600 text-rose-950",
  "bg-cyan-200/80 border-cyan-600 text-cyan-950",
];

export function normalizeCatNo(value) {
  return normalizeText(value).replace(/\s+/g, " ").toUpperCase();
}

const NATSC_DEPTS = ["CHEM", "ENVI", "BIO", "PHYS"];
const FLC_DEPTS = ["JPN", "KRN", "CSP", "FRE", "GER", "ITA", "RUSS", "SPA"];

function compactText(value) {
  return normalizeText(value).toUpperCase().replace(/\s+/g, "");
}

function splitCatNo(catNo) {
  const [dept = "", num = ""] = normalizeText(catNo).split(/\s+/);
  return { dept: dept.toUpperCase(), num };
}

export function getCatalogMatches(catalog, catNo) {
  if (!catalog || !catNo) return [];
  const raw = normalizeText(catNo);
  if (!raw) return [];
  const normalized = compactText(raw);

  const matches = [];
  for (const entry of catalog.values()) {
    const entryCatNo = entry.catNo || "";
    const { dept, num } = splitCatNo(entryCatNo);
    const entryDeptCode = entry.sections?.[0]?.deptCode || "";
    const entryCompact = compactText(entryCatNo);

    if (/^NATSC\s*/i.test(raw)) {
      const natsciNum = (raw.match(/^natsc\s*(.*)$/i) || [])[1]?.trim();
      if (
        natsciNum &&
        dept &&
        num &&
        NATSC_DEPTS.includes(dept) &&
        compactText(num) === compactText(natsciNum)
      ) {
        matches.push(entry);
      }
      continue;
    }

    if (/^FLC\s*/i.test(raw)) {
      const flcNum = (raw.match(/^flc\s*(.*)$/i) || [])[1]?.trim();
      if (
        flcNum &&
        dept &&
        num &&
        FLC_DEPTS.includes(dept) &&
        compactText(num) === compactText(flcNum)
      ) {
        matches.push(entry);
      }
      continue;
    }

    if (/^NSTP\s*/i.test(raw)) {
      const nstpNum = (raw.match(/^nstp\s*(\d+)/i) || [])[1]?.trim();
      if (nstpNum && entryCatNo.toUpperCase().startsWith(`NSTP ${nstpNum}`)) {
        matches.push(entry);
      }
      continue;
    }

    if (/^PHILO\s*/i.test(raw)) {
      const philoNum = (raw.match(/^philo\s*(\d+)/i) || [])[1]?.trim();
      if (philoNum && entryCatNo.toUpperCase().startsWith(`PHILO ${philoNum}`)) {
        matches.push(entry);
      }
      continue;
    }

    if (/^ISCS\s*30\s*/i.test(raw)) {
      if (dept === "ISCS" && num.startsWith("30")) {
        matches.push(entry);
      }
      continue;
    }

    if (/^IE\s*/i.test(raw)) {
      const ieNum = (raw.match(/^ie\s*(\d+)/i) || [])[1]?.trim();
      if (entryDeptCode === "**IE**") {
        if (ieNum === "1") {
          if (entryCatNo.toUpperCase().startsWith("ENE")) {
            matches.push(entry);
          }
        } else {
          matches.push(entry);
        }
      }
      continue;
    }

    if (/^(PATHFIT|PEPC|PHYED|PE)\s*/i.test(raw)) {
      if (entryDeptCode === "PE") {
        matches.push(entry);
      }
      continue;
    }

    if (entryCompact === normalized) {
      matches.push(entry);
    }
  }

  return matches;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 997;
  }
  return hash;
}

export function getCourseColor(catNo) {
  const key = normalizeCatNo(catNo);
  const index = Math.abs(hashString(key)) % COURSE_COLORS.length;
  return COURSE_COLORS[index];
}

export function buildCourseCatalog(rawCourses) {
  const catalog = new Map();

  for (const raw of rawCourses) {
    const catNo = normalizeText(raw.catNo);
    const courseTitle = normalizeText(raw.courseTitle);
    const time = normalizeText(raw.time);
    const parsed = parseTimeString(time);
    const meetingBlocks = parsed.meetings.flatMap((meeting) =>
      meeting.days.map((day) => ({
        day,
        start: meeting.start,
        end: meeting.end,
      }))
    );

    const section = {
      ...raw,
      catNo,
      courseTitle,
      time,
      meetings: parsed.meetings,
      meetingBlocks,
      noTime: parsed.noTime,
      timeReason: parsed.reason,
      colorClass: getCourseColor(catNo),
      normalizedCatNo: normalizeCatNo(catNo),
      searchText: `${catNo} ${courseTitle}`.toLowerCase(),
    };

    const key = section.normalizedCatNo;
    if (!catalog.has(key)) {
      catalog.set(key, {
        key,
        catNo,
        courseTitle,
        sections: [],
      });
    }

    const entry = catalog.get(key);
    if (!entry.courseTitle && courseTitle) {
      entry.courseTitle = courseTitle;
    }
    entry.sections.push(section);
  }

  const courseList = Array.from(catalog.values()).sort((a, b) =>
    a.catNo.localeCompare(b.catNo)
  );

  return { catalog, courseList };
}

export function buildCourseSlots(sections) {
  const slotMap = new Map();

  for (const section of sections) {
    if (section.noTime) continue;
    for (const block of section.meetingBlocks) {
      const key = `${block.day}-${block.start}-${block.end}`;
      const existing = slotMap.get(key);
      if (existing) {
        existing.sections.push(section);
      } else {
        slotMap.set(key, {
          id: key,
          day: block.day,
          start: block.start,
          end: block.end,
          sections: [section],
        });
      }
    }
  }

  return {
    slotMap,
    slots: Array.from(slotMap.values()),
  };
}

function mergeSectionLists(primary, incoming) {
  const merged = new Map(primary.map((section) => [section.id, section]));
  for (const section of incoming) {
    merged.set(section.id, section);
  }
  return Array.from(merged.values());
}

export function mergeOverlappingSlots(slots) {
  const byDay = new Map();
  for (const slot of slots) {
    if (!byDay.has(slot.day)) {
      byDay.set(slot.day, []);
    }
    byDay.get(slot.day).push(slot);
  }

  const mergedSlots = [];
  for (const [day, daySlots] of byDay.entries()) {
    const sorted = [...daySlots].sort((a, b) => a.start - b.start);
    let current = null;

    for (const slot of sorted) {
      if (!current) {
        current = {
          ...slot,
          sections: [...slot.sections],
        };
        continue;
      }

      if (slot.start < current.end) {
        current.end = Math.max(current.end, slot.end);
        current.sections = mergeSectionLists(current.sections, slot.sections);
      } else {
        mergedSlots.push({
          ...current,
          id: `${day}-${current.start}-${current.end}`,
        });
        current = {
          ...slot,
          sections: [...slot.sections],
        };
      }
    }

    if (current) {
      mergedSlots.push({
        ...current,
        id: `${day}-${current.start}-${current.end}`,
      });
    }
  }

  return mergedSlots;
}

export function expandScheduleBlocks(sections) {
  return sections.flatMap((section) =>
    section.meetingBlocks.map((block) => ({
      ...block,
      section,
    }))
  );
}

export function findConflicts(section, scheduledSections) {
  const conflicts = [];
  if (!section.meetingBlocks.length) return conflicts;

  for (const scheduled of scheduledSections) {
    if (scheduled.id === section.id) continue;
    for (const block of section.meetingBlocks) {
      const overlap = scheduled.meetingBlocks.some(
        (scheduledBlock) =>
          scheduledBlock.day === block.day &&
          isTimeOverlap(
            block.start,
            block.end,
            scheduledBlock.start,
            scheduledBlock.end
          )
      );
      if (overlap) {
        conflicts.push(scheduled);
        break;
      }
    }
  }

  return conflicts;
}
