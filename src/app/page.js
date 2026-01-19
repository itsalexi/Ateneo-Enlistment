"use client";

import { useMemo, useState, useEffect, useDeferredValue } from "react";
import coursesData from "@/data/courses.json";
import programsData from "@/data/programs.json";
import semesterInfo from "@/data/semester-info.json";
import ProgramSidebar from "@/components/ProgramSidebar";
import OfferingsFilters from "@/components/OfferingsFilters";
import OfferingsTable from "@/components/OfferingsTable";
import CalendarGrid from "@/components/CalendarGrid";
import DetailsPanel from "@/components/DetailsPanel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  buildCourseCatalog,
  buildCourseSlots,
  expandScheduleBlocks,
  findConflicts,
  getCatalogMatches,
  mergeOverlappingSlots,
  normalizeCatNo,
} from "@/lib/course-data";
import {
  DAYS,
  DEFAULT_TIME_RANGE,
  getTimeSlots,
  sortTimeslots,
} from "@/lib/time";
import { DEPARTMENT_OPTIONS } from "@/lib/departments";

const STORAGE_KEY = "rewrite-schedule-state";
const LEGACY_CUSTOM_KEY = "ateneo-enlistment-custom-courses";
const LEGACY_PROGRAM_KEY = "ateneo-enlistment-selected-program";
const LEGACY_SCHEDULES_KEY = "schedules";
const LEGACY_ACTIVE_SCHEDULE_KEY = "activeScheduleId";
const LEGACY_SELECTED_COURSES_KEY = "selectedCourses";
const FAVORITES_KEY = "rewrite-favorite-sections";
const LEGACY_FAVORITES_KEY = "favoriteCourses";
const OFFERINGS_PAGE_SIZE = 60;

function safeParseJSON(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Failed to parse stored JSON.", error);
    return null;
  }
}

function normalizeIpsCourses(courses) {
  if (!Array.isArray(courses)) return [];
  return courses
    .map((course, index) => {
      const catNo = course?.catNo || "";
      const normalizedCatNo = normalizeCatNo(catNo);
      if (!normalizedCatNo) return null;
      return {
        id: course?.id || `${normalizedCatNo}-${index}`,
        catNo,
        courseTitle: course?.courseTitle || "",
        normalizedCatNo,
      };
    })
    .filter(Boolean);
}

function toLegacyCourseList(courses) {
  if (!Array.isArray(courses)) return [];
  return courses.map((course) => ({
    id: course.id,
    catNo: course.catNo,
    courseTitle: course.courseTitle,
  }));
}

function normalizeLegacyValue(value) {
  return String(value || "")
    .replace(/\(\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function buildLegacyKey({ catNo, section, time }) {
  return `${normalizeLegacyValue(catNo)}|${normalizeLegacyValue(
    section
  )}|${normalizeLegacyValue(time)}`;
}

function buildCatSectionKey({ catNo, section }) {
  return `${normalizeLegacyValue(catNo)}|${normalizeLegacyValue(section)}`;
}

function normalizeSchedules(rawSchedules, resolveCourse) {
  if (!Array.isArray(rawSchedules) || rawSchedules.length === 0) return [];
  return rawSchedules.map((schedule, index) => {
    const id = schedule?.id || `schedule-${index + 1}`;
    const name = schedule?.name || `Schedule ${index + 1}`;
    const sourceCourses = Array.isArray(schedule?.selectedCourses)
      ? schedule.selectedCourses
      : Array.isArray(schedule?.courses)
        ? schedule.courses
        : [];
    const selectedCourses = sourceCourses
      .map((course) => resolveCourse(course))
      .filter(Boolean);
    return { id, name, selectedCourses };
  });
}

export default function Home() {
  const [ipsMode, setIpsMode] = useState("program");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeView, setActiveView] = useState("schedule");
  const [searchTerm, setSearchTerm] = useState("");
  const [offeringsSearchTerm, setOfferingsSearchTerm] = useState("");
  const [offeringsDepartment, setOfferingsDepartment] = useState("");
  const [offeringsInstructors, setOfferingsInstructors] = useState([]);
  const [offeringsCatNos, setOfferingsCatNos] = useState([]);
  const [offeringsTitles, setOfferingsTitles] = useState([]);
  const [offeringsTimes, setOfferingsTimes] = useState([]);
  const [offeringsIpsFilters, setOfferingsIpsFilters] = useState([]);
  const [offeringsPage, setOfferingsPage] = useState(1);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState("");
  const [selectedCourseKey, setSelectedCourseKey] = useState("");
  const [selectedIpsCourse, setSelectedIpsCourse] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [hasSetDefaultProgram, setHasSetDefaultProgram] = useState(false);
  const [selectedYearIndex, setSelectedYearIndex] = useState(null);
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(null);
  const [customIpsCourses, setCustomIpsCourses] = useState([]);
  const [favoriteSectionIds, setFavoriteSectionIds] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedScheduledSection, setSelectedScheduledSection] = useState(null);
  const [selectedSlotOverride, setSelectedSlotOverride] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [activeScheduleId, setActiveScheduleId] = useState("");
  const [conflictMessage, setConflictMessage] = useState("");
  const [offeringsOverrideKey, setOfferingsOverrideKey] = useState("");

  const isMobile = useMediaQuery("(max-width: 1279px)");
  const { catalog, courseList } = useMemo(
    () => buildCourseCatalog(coursesData),
    []
  );
  const sectionIndex = useMemo(() => {
    const byId = new Map();
    const byLegacyKey = new Map();
    const byCatSection = new Map();
    for (const entry of catalog.values()) {
      for (const section of entry.sections) {
        byId.set(section.id, section);
        const legacyKey = buildLegacyKey(section);
        if (!byLegacyKey.has(legacyKey)) {
          byLegacyKey.set(legacyKey, section);
        }
        const catSectionKey = buildCatSectionKey(section);
        if (!byCatSection.has(catSectionKey)) {
          byCatSection.set(catSectionKey, section);
        }
      }
    }
    return { byId, byLegacyKey, byCatSection };
  }, [catalog]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const resolved = {
      ipsMode: "program",
      selectedProgramId: "",
      selectedYearIndex: null,
      selectedSemesterIndex: null,
      customIpsCourses: [],
      selectedCourseKey: "",
      schedules: [],
      activeScheduleId: "",
    };

    const resolveLegacyCourse = (course) => {
      if (!course) return null;
      if (course.id && sectionIndex.byId.has(course.id)) {
        return sectionIndex.byId.get(course.id);
      }
      const legacyKey = buildLegacyKey(course);
      if (sectionIndex.byLegacyKey.has(legacyKey)) {
        return sectionIndex.byLegacyKey.get(legacyKey);
      }
      const catSectionKey = buildCatSectionKey(course);
      if (sectionIndex.byCatSection.has(catSectionKey)) {
        return sectionIndex.byCatSection.get(catSectionKey);
      }
      return null;
    };

    const parsed = safeParseJSON(window.localStorage.getItem(STORAGE_KEY));
    if (parsed) {
      if (parsed.ipsMode === "custom" || parsed.ipsMode === "program") {
        resolved.ipsMode = parsed.ipsMode;
      }
      if (typeof parsed.selectedProgramId === "string") {
        resolved.selectedProgramId = parsed.selectedProgramId;
      }
      if (Number.isFinite(parsed.selectedYearIndex)) {
        resolved.selectedYearIndex = parsed.selectedYearIndex;
      }
      if (Number.isFinite(parsed.selectedSemesterIndex)) {
        resolved.selectedSemesterIndex = parsed.selectedSemesterIndex;
      }
      if (Array.isArray(parsed.customIpsCourses)) {
        resolved.customIpsCourses = normalizeIpsCourses(parsed.customIpsCourses);
      }
      if (typeof parsed.selectedCourseKey === "string") {
        resolved.selectedCourseKey = parsed.selectedCourseKey;
      }
      if (Array.isArray(parsed.schedules)) {
        resolved.schedules = normalizeSchedules(
          parsed.schedules,
          resolveLegacyCourse
        );
      }
      if (typeof parsed.activeScheduleId === "string") {
        resolved.activeScheduleId = parsed.activeScheduleId;
      }
      if (
        resolved.schedules.length === 0 &&
        Array.isArray(parsed.scheduledSectionIds)
      ) {
        const selectedCourses = parsed.scheduledSectionIds
          .map((id) => sectionIndex.byId.get(id))
          .filter(Boolean);
        if (selectedCourses.length) {
          resolved.schedules = [
            {
              id: "schedule-1",
              name: "Schedule 1",
              selectedCourses,
            },
          ];
        }
      }
    }

    const legacyCustom = safeParseJSON(
      window.localStorage.getItem(LEGACY_CUSTOM_KEY)
    );
    const legacyProgram = safeParseJSON(
      window.localStorage.getItem(LEGACY_PROGRAM_KEY)
    );
    const legacyCoursesSource = Array.isArray(legacyProgram?.courses)
      ? legacyProgram.courses
      : legacyCustom;

    if (legacyCoursesSource && resolved.customIpsCourses.length === 0) {
      const legacyNormalized = normalizeIpsCourses(legacyCoursesSource);
      if (legacyNormalized.length > 0) {
        resolved.customIpsCourses = legacyNormalized;
        if (!parsed) {
          resolved.ipsMode = "custom";
        }
      }
    }

    const parsedHasSelections = resolved.schedules.some(
      (schedule) => schedule.selectedCourses.length > 0
    );

    let legacySchedulesResolved = [];
    let legacyActiveScheduleId = "";
    const legacySchedules = safeParseJSON(
      window.localStorage.getItem(LEGACY_SCHEDULES_KEY)
    );
    if (Array.isArray(legacySchedules) && legacySchedules.length > 0) {
      legacySchedulesResolved = normalizeSchedules(
        legacySchedules,
        resolveLegacyCourse
      );
      const legacyActive = window.localStorage.getItem(
        LEGACY_ACTIVE_SCHEDULE_KEY
      );
      if (typeof legacyActive === "string") {
        legacyActiveScheduleId = legacyActive;
      }
    }

    if (legacySchedulesResolved.length === 0) {
      const legacySelectedCourses = safeParseJSON(
        window.localStorage.getItem(LEGACY_SELECTED_COURSES_KEY)
      );
      if (Array.isArray(legacySelectedCourses) && legacySelectedCourses.length) {
        const selectedCourses = legacySelectedCourses
          .map((course) => resolveLegacyCourse(course))
          .filter(Boolean);
        if (selectedCourses.length) {
          legacySchedulesResolved = [
            {
              id: "schedule-1",
              name: "Schedule 1",
              selectedCourses,
            },
          ];
        }
      }
    }

    const legacyHasSelections = legacySchedulesResolved.some(
      (schedule) => schedule.selectedCourses.length > 0
    );
    if (
      (resolved.schedules.length === 0 || !parsedHasSelections) &&
      legacyHasSelections
    ) {
      resolved.schedules = legacySchedulesResolved;
      resolved.activeScheduleId =
        legacyActiveScheduleId || legacySchedulesResolved[0]?.id || "";
    }

    if (resolved.schedules.length === 0) {
      resolved.schedules = [
        {
          id: "schedule-1",
          name: "Schedule 1",
          selectedCourses: [],
        },
      ];
    }

    if (
      !resolved.activeScheduleId ||
      !resolved.schedules.some(
        (schedule) => schedule.id === resolved.activeScheduleId
      )
    ) {
      resolved.activeScheduleId = resolved.schedules[0]?.id || "";
    }

    setIpsMode(resolved.ipsMode);
    setSelectedProgramId(resolved.selectedProgramId);
    setSelectedYearIndex(resolved.selectedYearIndex);
    setSelectedSemesterIndex(resolved.selectedSemesterIndex);
    setCustomIpsCourses(resolved.customIpsCourses);
    setSelectedCourseKey(resolved.selectedCourseKey);
    setSchedules(resolved.schedules);
    setActiveScheduleId(resolved.activeScheduleId);
    setHasHydrated(true);
  }, [sectionIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParseJSON(window.localStorage.getItem(FAVORITES_KEY));
    const legacy = safeParseJSON(
      window.localStorage.getItem(LEGACY_FAVORITES_KEY)
    );
    const next = new Set();

    const addFavorite = (value) => {
      if (!value) return;
      if (typeof value === "string") {
        next.add(value);
        return;
      }
      if (typeof value === "object") {
        if (typeof value.id === "string") {
          next.add(value.id);
        }
      }
    };

    if (Array.isArray(stored)) {
      stored.forEach(addFavorite);
    } else if (Array.isArray(legacy)) {
      legacy.forEach(addFavorite);
    }

    const filtered = Array.from(next).filter((id) => sectionIndex.byId.has(id));
    setFavoriteSectionIds(filtered);
  }, [sectionIndex]);

  const programOptions = useMemo(() => {
    return Object.entries(programsData)
      .map(([id, entries]) => {
        const programInfo = entries?.[0]?.program_info || "Unknown Program";
        const [titleLine, metaLine] = programInfo
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        return {
          id,
          label: titleLine || programInfo,
          meta: metaLine || "",
          years: entries?.[0]?.years || [],
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const selectedProgram = programOptions.find(
    (program) => program.id === selectedProgramId
  );

  const yearOptions = useMemo(() => {
    if (!selectedProgram) return [];
    return selectedProgram.years.map((year, index) => ({
      ...year,
      index,
      label: `${year.year} Year`,
    }));
  }, [selectedProgram]);

  const selectedYear = yearOptions.find(
    (year) => year.index === selectedYearIndex
  );

  const semesterOptions = useMemo(() => {
    if (!selectedYear) return [];
    return selectedYear.semesters.map((semester, index) => ({
      ...semester,
      index,
      label: semester.name,
    }));
  }, [selectedYear]);

  const selectedSemester = semesterOptions.find(
    (semester) => semester.index === selectedSemesterIndex
  );

  const ipsCourses = useMemo(() => {
    if (ipsMode === "custom") {
      return customIpsCourses;
    }
    const courses = selectedSemester?.courses || [];
    return courses.map((course, index) => ({
      id: course.id || `${normalizeCatNo(course.catNo)}-${index}`,
      catNo: course.catNo,
      courseTitle: course.courseTitle,
      normalizedCatNo: normalizeCatNo(course.catNo),
    }));
  }, [customIpsCourses, ipsMode, selectedSemester]);

  const offeringsIpsOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    for (const course of ipsCourses) {
      if (!course.normalizedCatNo || seen.has(course.normalizedCatNo)) continue;
      seen.add(course.normalizedCatNo);
      const label = `${course.catNo}${
        course.courseTitle ? ` - ${course.courseTitle}` : ""
      }`;
      options.push({ value: course.normalizedCatNo, label });
    }
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [ipsCourses]);

  const activeSchedule =
    schedules.find((schedule) => schedule.id === activeScheduleId) ||
    schedules[0] ||
    null;
  const scheduledSections = activeSchedule?.selectedCourses || [];
  const scheduledSectionIds = useMemo(
    () => scheduledSections.map((section) => section.id),
    [scheduledSections]
  );

  const filteredIpsCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ipsCourses;
    return ipsCourses.filter(
      (course) =>
        course.catNo.toLowerCase().includes(term) ||
        course.courseTitle.toLowerCase().includes(term)
    );
  }, [ipsCourses, searchTerm]);

  const ipsCourseRank = useMemo(() => {
    const rankMap = new Map();
    for (const course of ipsCourses) {
      const matches = getCatalogMatches(catalog, course.catNo);
      if (matches.length === 0) {
        rankMap.set(course.normalizedCatNo, 2);
        continue;
      }
      let hasTimed = false;
      let hasAvailable = false;
      for (const entry of matches) {
        for (const section of entry.sections) {
          if (section.noTime) continue;
          hasTimed = true;
          if (findConflicts(section, scheduledSections).length === 0) {
            hasAvailable = true;
            break;
          }
        }
        if (hasAvailable) break;
      }
      if (hasAvailable) {
        rankMap.set(course.normalizedCatNo, 0);
      } else if (hasTimed) {
        rankMap.set(course.normalizedCatNo, 1);
      } else {
        rankMap.set(course.normalizedCatNo, 1);
      }
    }
    return rankMap;
  }, [catalog, ipsCourses, scheduledSections]);

  const rankedIpsCourses = useMemo(() => {
    const list = [...filteredIpsCourses];
    list.sort((a, b) => {
      const rankA = ipsCourseRank.get(a.normalizedCatNo) ?? 1;
      const rankB = ipsCourseRank.get(b.normalizedCatNo) ?? 1;
      if (rankA !== rankB) return rankA - rankB;
      return a.catNo.localeCompare(b.catNo);
    });
    return list;
  }, [filteredIpsCourses, ipsCourseRank]);

  const deferredCatalogSearch = useDeferredValue(catalogSearchTerm);
  const catalogSearchIndex = useMemo(() => {
    return courseList.map((course) => ({
      key: course.key,
      catNo: course.catNo,
      courseTitle: course.courseTitle,
      searchText: `${course.catNo} ${course.courseTitle}`.toLowerCase(),
    }));
  }, [courseList]);

  const catalogSearchResults = useMemo(() => {
    const term = deferredCatalogSearch.trim().toLowerCase();
    if (term.length < 2) return [];
    const results = [];
    for (const course of catalogSearchIndex) {
      if (course.searchText.includes(term)) {
        results.push(course);
      }
      if (results.length >= 40) break;
    }
    return results;
  }, [catalogSearchIndex, deferredCatalogSearch]);

  const favoriteSet = useMemo(
    () => new Set(favoriteSectionIds),
    [favoriteSectionIds]
  );

  const favoriteSections = useMemo(() => {
    return favoriteSectionIds
      .map((id) => sectionIndex.byId.get(id))
      .filter(Boolean);
  }, [favoriteSectionIds, sectionIndex]);

  const deferredOfferingsSearch = useDeferredValue(offeringsSearchTerm);
  const allSections = useMemo(() => {
    const sections = [];
    for (const entry of catalog.values()) {
      sections.push(...entry.sections);
    }
    return sections;
  }, [catalog]);

  const offeringsDepartmentOptions = useMemo(() => {
    const known = new Map(
      DEPARTMENT_OPTIONS.map((option) => [option.id, option])
    );
    const extras = [];
    for (const section of allSections) {
      const dept = section.deptCode;
      if (!dept || known.has(dept)) continue;
      const option = { id: dept, label: dept };
      known.set(dept, option);
      extras.push(option);
    }
    extras.sort((a, b) => a.label.localeCompare(b.label));
    return [...DEPARTMENT_OPTIONS, ...extras];
  }, [allSections]);

  const selectedDepartmentLabel = useMemo(() => {
    const selected = offeringsDepartmentOptions.find(
      (option) => option.id === offeringsDepartment
    );
    if (selected) return selected.label;
    return offeringsDepartment || "All departments";
  }, [offeringsDepartment, offeringsDepartmentOptions]);

  const offeringsBaseSections = useMemo(() => {
    if (!offeringsDepartment) return allSections;
    return allSections.filter(
      (section) => section.deptCode === offeringsDepartment
    );
  }, [allSections, offeringsDepartment]);

  const offeringsInstructorOptions = useMemo(() => {
    const unique = new Set();
    for (const section of offeringsBaseSections) {
      unique.add(section.instructor || "Instructor TBD");
    }
    return Array.from(unique)
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ value: label, label }));
  }, [offeringsBaseSections]);

  const offeringsCatNoOptions = useMemo(() => {
    const unique = new Set();
    for (const section of offeringsBaseSections) {
      if (section.catNo) unique.add(section.catNo);
    }
    return Array.from(unique)
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ value: label, label }));
  }, [offeringsBaseSections]);

  const offeringsTitleOptions = useMemo(() => {
    const unique = new Set();
    for (const section of offeringsBaseSections) {
      if (section.courseTitle) unique.add(section.courseTitle);
    }
    return Array.from(unique)
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ value: label, label }));
  }, [offeringsBaseSections]);

  const offeringsTimeOptions = useMemo(() => {
    const unique = new Set();
    for (const section of offeringsBaseSections) {
      unique.add(section.time || "No scheduled time");
    }
    return sortTimeslots(Array.from(unique)).map((label) => ({
      value: label,
      label,
    }));
  }, [offeringsBaseSections]);

  const filteredOfferingsSections = useMemo(() => {
    let next = offeringsBaseSections;
    if (offeringsIpsFilters.length) {
      const set = new Set(offeringsIpsFilters.map((item) => item.value));
      next = next.filter((section) =>
        set.has(section.normalizedCatNo)
      );
    }
    if (offeringsInstructors.length) {
      const set = new Set(offeringsInstructors.map((item) => item.value));
      next = next.filter((section) =>
        set.has(section.instructor || "Instructor TBD")
      );
    }
    if (offeringsCatNos.length) {
      const set = new Set(offeringsCatNos.map((item) => item.value));
      next = next.filter((section) => set.has(section.catNo));
    }
    if (offeringsTitles.length) {
      const set = new Set(offeringsTitles.map((item) => item.value));
      next = next.filter((section) => set.has(section.courseTitle));
    }
    if (offeringsTimes.length) {
      const set = new Set(offeringsTimes.map((item) => item.value));
      next = next.filter((section) =>
        set.has(section.time || "No scheduled time")
      );
    }
    const term = deferredOfferingsSearch.trim().toLowerCase();
    if (term) {
      next = next.filter((section) => {
        const base = section.searchText || "";
        const extra = `${section.section || ""} ${
          section.instructor || ""
        }`.toLowerCase();
        return base.includes(term) || extra.includes(term);
      });
    }
    return next;
  }, [
    deferredOfferingsSearch,
    offeringsBaseSections,
    offeringsCatNos,
    offeringsInstructors,
    offeringsIpsFilters,
    offeringsTimes,
    offeringsTitles,
  ]);

  const offeringsSections = useMemo(() => {
    const list = [...filteredOfferingsSections];
    list.sort((a, b) => {
      const favA = favoriteSet.has(a.id) ? 0 : 1;
      const favB = favoriteSet.has(b.id) ? 0 : 1;
      if (favA !== favB) return favA - favB;
      const catCompare = a.catNo.localeCompare(b.catNo);
      if (catCompare !== 0) return catCompare;
      return (a.section || "").localeCompare(b.section || "");
    });
    return list;
  }, [filteredOfferingsSections, favoriteSet]);

  const offeringsPageCount = useMemo(
    () =>
      Math.max(1, Math.ceil(offeringsSections.length / OFFERINGS_PAGE_SIZE)),
    [offeringsSections.length]
  );

  const pagedOfferingsSections = useMemo(() => {
    const start = (offeringsPage - 1) * OFFERINGS_PAGE_SIZE;
    return offeringsSections.slice(start, start + OFFERINGS_PAGE_SIZE);
  }, [offeringsPage, offeringsSections]);

  const selectedCourseMatches = useMemo(() => {
    if (offeringsOverrideKey) {
      const override = catalog.get(offeringsOverrideKey);
      return override ? [override] : [];
    }
    const targetCatNo = selectedIpsCourse?.catNo || selectedCourseKey;
    return getCatalogMatches(catalog, targetCatNo);
  }, [catalog, offeringsOverrideKey, selectedIpsCourse, selectedCourseKey]);

  const selectedCourseEntry = selectedCourseMatches[0] || null;

  const selectedCourseSections = useMemo(() => {
    const sections = [];
    const seen = new Set();
    for (const entry of selectedCourseMatches) {
      for (const section of entry.sections || []) {
        if (seen.has(section.id)) continue;
        seen.add(section.id);
        sections.push(section);
      }
    }
    return sections;
  }, [selectedCourseMatches]);

  const selectedCourseMeta = selectedIpsCourse
    ? {
        ...selectedIpsCourse,
        catNo: selectedIpsCourse.catNo,
        courseTitle: selectedIpsCourse.courseTitle,
      }
    : selectedCourseEntry;

  const timeSlots = useMemo(
    () => getTimeSlots(DEFAULT_TIME_RANGE),
    []
  );

  const { slots } = useMemo(
    () => buildCourseSlots(selectedCourseSections),
    [selectedCourseSections]
  );

  const mergedSlots = useMemo(() => mergeOverlappingSlots(slots), [slots]);

  const scheduledBlocks = useMemo(
    () => expandScheduleBlocks(scheduledSections),
    [scheduledSections]
  );

  const scheduledCountByCatalogKey = useMemo(() => {
    const map = new Map();
    for (const section of scheduledSections) {
      const key = section.normalizedCatNo;
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [scheduledSections]);

  const scheduledCountByIpsKey = useMemo(() => {
    const map = new Map();
    for (const course of ipsCourses) {
      const matches = getCatalogMatches(catalog, course.catNo);
      const seen = new Set();
      let count = 0;
      for (const entry of matches) {
        if (seen.has(entry.key)) continue;
        seen.add(entry.key);
        count += scheduledCountByCatalogKey.get(entry.key) || 0;
      }
      if (matches.length === 0) {
        count += scheduledCountByCatalogKey.get(course.normalizedCatNo) || 0;
      }
      map.set(course.normalizedCatNo, count);
    }
    return map;
  }, [catalog, ipsCourses, scheduledCountByCatalogKey]);

  const dayLookup = useMemo(
    () => new Map(DAYS.map((day) => [day.index, day.full])),
    []
  );

  const slotsWithStatus = useMemo(() => {
    return mergedSlots.map((slot) => ({
      ...slot,
      dayLabel: dayLookup.get(slot.day),
      isConflict:
        slot.sections.length > 0 &&
        slot.sections.every(
          (section) => findConflicts(section, scheduledSections).length > 0
        ),
    }));
  }, [dayLookup, mergedSlots, scheduledSections]);

  const visibleSlots = useMemo(
    () => slotsWithStatus.filter((slot) => !slot.isConflict),
    [slotsWithStatus]
  );

  const slotStatusMap = useMemo(() => {
    return new Map(visibleSlots.map((slot) => [slot.id, slot]));
  }, [visibleSlots]);

  const availableSlotsByDay = useMemo(() => {
    const byDay = {};
    for (const slot of visibleSlots) {
      if (!byDay[slot.day]) byDay[slot.day] = [];
      byDay[slot.day].push(slot);
    }
    for (const day of DAYS) {
      if (!byDay[day.index]) byDay[day.index] = [];
      byDay[day.index].sort((a, b) => a.start - b.start);
    }
    return byDay;
  }, [visibleSlots]);

  const scheduledBlocksByDay = useMemo(() => {
    const byDay = {};
    for (const block of scheduledBlocks) {
      if (!byDay[block.day]) byDay[block.day] = [];
      byDay[block.day].push(block);
    }
    for (const day of DAYS) {
      if (!byDay[day.index]) byDay[day.index] = [];
      byDay[day.index].sort((a, b) => a.start - b.start);
    }
    return byDay;
  }, [scheduledBlocks]);

  const selectedSlot =
    selectedSlotOverride ||
    (selectedSlotId ? slotStatusMap.get(selectedSlotId) : null);

  const replacementSections = useMemo(() => {
    if (!selectedSlotOverride || selectedSlotOverride.type !== "scheduled") {
      return [];
    }
    const courseKey = selectedScheduledSection?.normalizedCatNo;
    if (!courseKey) return [];
    const entry = catalog.get(courseKey);
    if (!entry) return [];
    return entry.sections.filter(
      (section) => section.id !== selectedScheduledSection?.id
    );
  }, [catalog, selectedScheduledSection, selectedSlotOverride]);

  const scheduledForSelectedCourse = useMemo(() => {
    const courseKey = offeringsOverrideKey || selectedCourseKey;
    if (!courseKey) return [];
    const matches = getCatalogMatches(catalog, courseKey);
    if (matches.length === 0) {
      return scheduledSections.filter(
        (section) => section.normalizedCatNo === courseKey
      );
    }
    const matchKeys = new Set(matches.map((entry) => entry.key));
    return scheduledSections.filter((section) =>
      matchKeys.has(section.normalizedCatNo)
    );
  }, [catalog, offeringsOverrideKey, scheduledSections, selectedCourseKey]);

  const noTimeSections = selectedCourseSections.filter(
    (section) => section.noTime
  );

  const slotSections = useMemo(() => {
    if (selectedSlotOverride) return replacementSections;
    if (selectedSlot) {
      const merged = [...selectedSlot.sections];
      const seen = new Set(merged.map((section) => section.id));
      for (const section of noTimeSections) {
        if (!seen.has(section.id)) {
          seen.add(section.id);
          merged.push(section);
        }
      }
      return merged;
    }
    if (selectedCourseSections.length) return selectedCourseSections;
    return [];
  }, [
    noTimeSections,
    replacementSections,
    selectedCourseSections,
    selectedSlot,
    selectedSlotOverride,
  ]);

  const noOfferings =
    selectedIpsCourse &&
    selectedCourseKey &&
    selectedCourseSections.length === 0 &&
    ipsCourses.some((course) => course.normalizedCatNo === selectedCourseKey);

  const clearSelectedCourse = () => {
    setSelectedCourseKey("");
    setSelectedIpsCourse(null);
    setSelectedSlotId("");
    setCatalogSearchTerm("");
    setOfferingsOverrideKey("");
    setConflictMessage("");
  };

  const handleSelectCourse = (course) => {
    if (selectedCourseKey === course.normalizedCatNo) {
      clearSelectedCourse();
      return;
    }
    setSelectedCourseKey(course.normalizedCatNo);
    setSelectedIpsCourse(course);
    setSelectedSlotOverride(null);
    setSelectedScheduledSection(null);
    setCatalogSearchTerm("");
    setOfferingsOverrideKey("");
    setConflictMessage("");
  };

  const handleSlotClick = (slot) => {
    setSelectedSlotId(slot.id);
    setSelectedSlotOverride(null);
    setSelectedScheduledSection(null);
    setConflictMessage("");
  };

  const handleScheduledClick = (block) => {
    setSelectedCourseKey("");
    setSelectedIpsCourse(null);
    setSelectedSlotId("");
    setCatalogSearchTerm("");
    setOfferingsOverrideKey("");
    setSelectedSlotOverride({
      type: "scheduled",
      id: `scheduled-${block.section.id}-${block.day}-${block.start}-${block.end}`,
      day: block.day,
      dayLabel: dayLookup.get(block.day),
      start: block.start,
      end: block.end,
    });
    setSelectedScheduledSection(block.section);
    setConflictMessage("");
  };

  const handleAddSection = (section, options = {}) => {
    setConflictMessage("");
    const conflicts = findConflicts(section, scheduledSections);
    if (conflicts.length > 0 && !options.replace) {
      const list = conflicts
        .map((item) => `${item.catNo} ${item.section}`)
        .join(", ");
      setConflictMessage(
        `Blocked: ${section.catNo} ${section.section} overlaps with ${list}.`
      );
      return;
    }
    setSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.id !== activeScheduleId) return schedule;
        const existing = schedule.selectedCourses || [];
        const conflictIds = new Set(conflicts.map((item) => item.id));
        let nextCourses = existing;
        if (options.replace && conflicts.length > 0) {
          nextCourses = existing.filter((item) => !conflictIds.has(item.id));
        }
        if (!nextCourses.some((item) => item.id === section.id)) {
          nextCourses = [...nextCourses, section];
        }
        return { ...schedule, selectedCourses: nextCourses };
      })
    );
  };

  const handleRemoveSection = (sectionId) => {
    setSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.id !== activeScheduleId) return schedule;
        return {
          ...schedule,
          selectedCourses: schedule.selectedCourses.filter(
            (section) => section.id !== sectionId
          ),
        };
      })
    );
  };

  const handleCatalogCourseSelect = (courseKey) => {
    setOfferingsOverrideKey(courseKey);
    setConflictMessage("");
  };

  const handleClearCatalogOverride = () => {
    setOfferingsOverrideKey("");
  };

  const handleToggleFavoriteSection = (sectionId) => {
    if (!sectionId) return;
    setFavoriteSectionIds((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId);
      }
      return [...prev, sectionId];
    });
  };

  const handleAddCustomCourse = (course) => {
    const normalized = normalizeCatNo(course.catNo);
    if (!normalized) return;
    setCustomIpsCourses((prev) => {
      if (prev.some((item) => item.normalizedCatNo === normalized)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: course.id || `${normalized}-${Date.now()}`,
          catNo: course.catNo,
          courseTitle: course.courseTitle || "",
          normalizedCatNo: normalized,
        },
      ];
    });
  };

  const handleRemoveCustomCourse = (courseId) => {
    setCustomIpsCourses((prev) => prev.filter((course) => course.id !== courseId));
  };

  const handleCreateSchedule = () => {
    const nextIndex = schedules.length + 1;
    const id = `schedule-${Date.now()}`;
    const name = `Schedule ${nextIndex}`;
    setSchedules((prev) => [...prev, { id, name, selectedCourses: [] }]);
    setActiveScheduleId(id);
  };

  const handleDeleteSchedule = () => {
    if (schedules.length <= 1) return;
    const filtered = schedules.filter(
      (schedule) => schedule.id !== activeScheduleId
    );
    if (!filtered.length) return;
    setSchedules(filtered);
    setActiveScheduleId(filtered[0].id);
  };

  const handleRenameSchedule = () => {
    const active = schedules.find((schedule) => schedule.id === activeScheduleId);
    if (!active) return;
    const nextName = window.prompt("Rename schedule", active.name);
    if (!nextName) return;
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === activeScheduleId
          ? { ...schedule, name: nextName.trim() || schedule.name }
          : schedule
      )
    );
  };

  useEffect(() => {
    if (!hasHydrated) return;
    if (hasSetDefaultProgram) return;
    if (selectedProgramId) {
      setHasSetDefaultProgram(true);
      return;
    }
    if (programOptions.length) {
      setSelectedProgramId(programOptions[0].id);
      setHasSetDefaultProgram(true);
    }
  }, [hasHydrated, hasSetDefaultProgram, programOptions, selectedProgramId]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!selectedProgramId || yearOptions.length === 0) {
      setSelectedYearIndex(null);
      setSelectedSemesterIndex(null);
      return;
    }

    if (
      selectedYearIndex === null ||
      !yearOptions.some((year) => year.index === selectedYearIndex)
    ) {
      setSelectedYearIndex(yearOptions[0].index);
      setSelectedSemesterIndex(null);
    }
  }, [hasHydrated, selectedProgramId, selectedYearIndex, yearOptions]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (selectedYearIndex === null || semesterOptions.length === 0) {
      setSelectedSemesterIndex(null);
      return;
    }

    if (
      selectedSemesterIndex === null ||
      !semesterOptions.some(
        (semester) => semester.index === selectedSemesterIndex
      )
    ) {
      setSelectedSemesterIndex(semesterOptions[0].index);
    }
  }, [hasHydrated, selectedYearIndex, selectedSemesterIndex, semesterOptions]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (
      selectedCourseKey &&
      !ipsCourses.some((course) => course.normalizedCatNo === selectedCourseKey)
    ) {
      setSelectedCourseKey("");
      setSelectedIpsCourse(null);
      setSelectedSlotId("");
      setCatalogSearchTerm("");
      setOfferingsOverrideKey("");
    }
  }, [hasHydrated, ipsCourses, selectedCourseKey]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!selectedCourseKey) return;
    const match = ipsCourses.find(
      (course) => course.normalizedCatNo === selectedCourseKey
    );
    if (match) {
      setSelectedIpsCourse(match);
    }
  }, [hasHydrated, ipsCourses, selectedCourseKey]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (schedules.length === 0) return;
    if (
      !activeScheduleId ||
      !schedules.some((schedule) => schedule.id === activeScheduleId)
    ) {
      setActiveScheduleId(schedules[0].id);
    }
  }, [hasHydrated, schedules, activeScheduleId]);

  useEffect(() => {
    setConflictMessage("");
  }, [activeScheduleId]);

  useEffect(() => {
    if (!offeringsIpsOptions.length) {
      setOfferingsIpsFilters([]);
      return;
    }
    const allowed = new Set(offeringsIpsOptions.map((option) => option.value));
    setOfferingsIpsFilters((prev) =>
      prev.filter((option) => allowed.has(option.value))
    );
  }, [offeringsIpsOptions]);

  useEffect(() => {
    setOfferingsPage(1);
  }, [
    offeringsDepartment,
    offeringsSearchTerm,
    offeringsInstructors,
    offeringsCatNos,
    offeringsTitles,
    offeringsTimes,
    offeringsIpsFilters,
  ]);

  useEffect(() => {
    if (offeringsPage > offeringsPageCount) {
      setOfferingsPage(offeringsPageCount);
    }
  }, [offeringsPage, offeringsPageCount]);

  useEffect(() => {
    if (!selectedSlotId) return;
    if (!visibleSlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId("");
    }
  }, [selectedSlotId, visibleSlots]);

  useEffect(() => {
    if (!selectedScheduledSection) return;
    const stillScheduled = scheduledSections.some(
      (section) => section.id === selectedScheduledSection.id
    );
    if (!stillScheduled) {
      setSelectedScheduledSection(null);
      setSelectedSlotOverride(null);
    }
  }, [scheduledSections, selectedScheduledSection]);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    const payload = {
      ipsMode,
      selectedProgramId,
      selectedYearIndex,
      selectedSemesterIndex,
      customIpsCourses,
      selectedCourseKey,
      schedules,
      activeScheduleId,
      scheduledSectionIds: scheduledSections.map((section) => section.id),
    };
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(payload)
    );

    const legacyCourseList =
      ipsMode === "custom"
        ? customIpsCourses
        : selectedSemester?.courses || [];
    const legacyCoursesPayload = toLegacyCourseList(legacyCourseList);

    window.localStorage.setItem(
      LEGACY_CUSTOM_KEY,
      JSON.stringify(legacyCoursesPayload)
    );

    let legacyProgramPayload = null;
    if (ipsMode === "program" && selectedSemester) {
      legacyProgramPayload = {
        ...selectedSemester,
        courses: legacyCoursesPayload,
      };
    } else if (ipsMode === "custom" && legacyCoursesPayload.length > 0) {
      legacyProgramPayload = {
        id: "phantom",
        name: "Custom Program",
        label: "Custom Program",
        program_info: "Custom Program",
        courses: legacyCoursesPayload,
      };
    }

    if (legacyProgramPayload) {
      window.localStorage.setItem(
        LEGACY_PROGRAM_KEY,
        JSON.stringify(legacyProgramPayload)
      );
    }

    if (schedules.length > 0) {
      window.localStorage.setItem(
        LEGACY_SCHEDULES_KEY,
        JSON.stringify(schedules)
      );
      if (activeScheduleId) {
        window.localStorage.setItem(
          LEGACY_ACTIVE_SCHEDULE_KEY,
          activeScheduleId
        );
      }
    }

    window.localStorage.setItem(
      LEGACY_SELECTED_COURSES_KEY,
      JSON.stringify(scheduledSections)
    );
  }, [
    hasHydrated,
    ipsMode,
    selectedProgramId,
    selectedYearIndex,
    selectedSemesterIndex,
    customIpsCourses,
    selectedCourseKey,
    schedules,
    activeScheduleId,
    scheduledSections,
  ]);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    if (favoriteSectionIds.length > 0) {
      window.localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favoriteSectionIds)
      );
    } else {
      window.localStorage.removeItem(FAVORITES_KEY);
    }
  }, [favoriteSectionIds, hasHydrated]);

  const isOfferingsView = activeView === "offerings";
  const scheduleGridClass =
    "grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_360px]";
  const offeringsGridClass =
    "grid min-h-0 gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-stretch lg:h-[calc(100vh-220px)] lg:overflow-hidden";
  const calendarRowHeight = isMobile ? 30 : 36;
  const showEmptyOverlay =
    !selectedCourseMeta && scheduledSections.length === 0;
  const showCatalogSearch =
    Boolean(selectedCourseMeta && selectedCourseKey) &&
    (selectedCourseSections.length === 0 || Boolean(offeringsOverrideKey));
  const catalogOverrideCourse = offeringsOverrideKey
    ? catalog.get(offeringsOverrideKey)
    : null;

  return (
    <div className="min-h-screen px-3 pb-4 pt-16 sm:px-4 sm:pb-6 sm:pt-20 lg:px-8 xl:px-10">
      <nav className="fixed left-1/2 top-3 z-40 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)]/90 px-2 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur">
          <button
            type="button"
            onClick={() => setActiveView("schedule")}
            aria-pressed={!isOfferingsView}
            className={`rounded-full px-3 py-1 transition ${
              !isOfferingsView
                ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)] shadow"
                : "hover:text-[color:var(--ink)]"
            }`}
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveView("offerings")}
            aria-pressed={isOfferingsView}
            className={`rounded-full px-3 py-1 transition ${
              isOfferingsView
                ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)] shadow"
                : "hover:text-[color:var(--ink)]"
            }`}
          >
            Offerings
          </button>
        </div>
      </nav>
      <header className="fade-up mx-auto mb-6 flex w-full max-w-[1400px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[color:var(--accent-2)]">
            Ateneo enlistment
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">
            Schedule Studio
          </h1>
        </div>
      </header>

      {isOfferingsView ? (
        <main
          className={`${offeringsGridClass} fade-up mx-auto w-full max-w-[1400px]`}
          style={{ animationDelay: "0.1s" }}
        >
          <OfferingsFilters
            departmentOptions={offeringsDepartmentOptions}
            selectedDepartment={offeringsDepartment}
            onDepartmentChange={setOfferingsDepartment}
            searchTerm={offeringsSearchTerm}
            onSearchTermChange={setOfferingsSearchTerm}
            ipsOptions={offeringsIpsOptions}
            selectedIpsCourses={offeringsIpsFilters}
            onIpsCoursesChange={setOfferingsIpsFilters}
            instructorOptions={offeringsInstructorOptions}
            selectedInstructors={offeringsInstructors}
            onInstructorsChange={setOfferingsInstructors}
            catNoOptions={offeringsCatNoOptions}
            selectedCatNos={offeringsCatNos}
            onCatNosChange={setOfferingsCatNos}
            titleOptions={offeringsTitleOptions}
            selectedTitles={offeringsTitles}
            onTitlesChange={setOfferingsTitles}
            timeOptions={offeringsTimeOptions}
            selectedTimes={offeringsTimes}
            onTimesChange={setOfferingsTimes}
            resultCount={offeringsSections.length}
            onClearFilters={() => {
              setOfferingsDepartment("");
              setOfferingsSearchTerm("");
              setOfferingsInstructors([]);
              setOfferingsCatNos([]);
              setOfferingsTitles([]);
              setOfferingsTimes([]);
              setOfferingsIpsFilters([]);
            }}
          />
          <OfferingsTable
            sections={pagedOfferingsSections}
            favoriteSectionIds={favoriteSectionIds}
            onToggleFavorite={handleToggleFavoriteSection}
            scheduledSectionIds={scheduledSectionIds}
            departmentLabel={selectedDepartmentLabel}
            semesterLabel={semesterInfo?.semesterString}
            lastUpdated={semesterInfo?.lastUpdated}
            totalCount={offeringsSections.length}
            page={offeringsPage}
            pageCount={offeringsPageCount}
            onPageChange={setOfferingsPage}
          />
        </main>
      ) : (
        <main
          className={`${scheduleGridClass} fade-up mx-auto w-full max-w-[1400px]`}
          style={{ animationDelay: "0.1s" }}
        >
          <ProgramSidebar
            ipsMode={ipsMode}
            onIpsModeChange={setIpsMode}
            programOptions={programOptions}
            selectedProgramId={selectedProgramId}
            onProgramChange={setSelectedProgramId}
            yearOptions={yearOptions}
            selectedYearIndex={selectedYearIndex}
            onYearChange={setSelectedYearIndex}
            semesterOptions={semesterOptions}
            selectedSemesterIndex={selectedSemesterIndex}
            onSemesterChange={setSelectedSemesterIndex}
            ipsCourses={ipsCourses}
            visibleCourses={rankedIpsCourses}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedCourseKey={selectedCourseKey}
            onSelectCourse={handleSelectCourse}
            onClearSelection={clearSelectedCourse}
            onAddCustomCourse={handleAddCustomCourse}
            onRemoveCustomCourse={handleRemoveCustomCourse}
            scheduledCountByCourse={scheduledCountByIpsKey}
          />

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)]/85 p-4 shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                    Weekly canvas
                  </p>
                  <h2 className="font-display text-xl">
                    {activeSchedule?.name || "Schedule"}
                  </h2>
                  <p className="text-xs text-[color:var(--muted)]">
                    {selectedCourseMeta
                      ? `${selectedCourseMeta.catNo} - ${
                          selectedCourseMeta.courseTitle || "Untitled course"
                        }`
                      : "Select a course to reveal slots or click a scheduled block."}
                  </p>
                  {catalogOverrideCourse && (
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      Viewing offerings: {catalogOverrideCourse.catNo}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-xs text-[color:var(--muted)]">
                    <span className="uppercase tracking-[0.3em]">Schedule</span>
                    <select
                      value={activeScheduleId}
                      onChange={(event) => setActiveScheduleId(event.target.value)}
                      className="bg-transparent text-xs font-semibold text-[color:var(--ink)] outline-none"
                    >
                      {schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCreateSchedule}
                      className="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)]/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]"
                    >
                      New
                    </button>
                    <button
                      type="button"
                      onClick={handleRenameSchedule}
                      className="rounded-full border border-[color:var(--line)] bg-white/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSchedule}
                      disabled={schedules.length <= 1}
                      className="rounded-full border border-[color:var(--line)] bg-white/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2" />
                </div>
              </div>

              <div className="relative mt-4">
                <div className="overflow-x-auto pb-2">
                  <div className="min-w-0">
                    <CalendarGrid
                      days={DAYS}
                      timeSlots={timeSlots}
                      rowHeight={calendarRowHeight}
                      startMinutes={DEFAULT_TIME_RANGE.start}
                      timeColumnWidth={isMobile ? 60 : 84}
                      availableSlotsByDay={availableSlotsByDay}
                      scheduledBlocksByDay={scheduledBlocksByDay}
                      selectedSlotId={selectedSlotId}
                      selectedScheduledSlotId={selectedSlotOverride?.id}
                      dimScheduled={Boolean(selectedCourseKey)}
                      onSlotClick={handleSlotClick}
                      onScheduledClick={handleScheduledClick}
                    />
                  </div>
                </div>

                {showEmptyOverlay && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl border border-dashed border-[color:var(--line)] bg-white/60 text-sm text-[color:var(--muted)]">
                    Pick a course to reveal available slots.
                  </div>
                )}
              </div>

              {selectedCourseMeta && slotsWithStatus.length === 0 && !noOfferings && (
                <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--line)] bg-white/70 p-3 text-xs text-[color:var(--muted)]">
                  This course has no scheduled meeting times. Sections without a
                  time appear in the list but cannot be added.
                </div>
              )}

              {selectedCourseMeta &&
                slotsWithStatus.length > 0 &&
                visibleSlots.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--line)] bg-white/70 p-3 text-xs text-[color:var(--muted)]">
                    All visible slots overlap with your current schedule.
                  </div>
                )}

              {noOfferings && (
                <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--line)] bg-white/70 p-3 text-xs text-[color:var(--muted)]">
                  No offerings found for this IPS course in the current schedule
                  data. Use the catalog search in the details panel to find a
                  matching course.
                </div>
              )}
            </div>
          </section>

          {!isMobile && (
            <DetailsPanel
              mode="panel"
              open
              selectedCourse={selectedCourseMeta}
              selectedScheduledSection={selectedScheduledSection}
              scheduledCourseSections={scheduledForSelectedCourse}
              slotSections={slotSections}
              scheduledSections={scheduledSections}
              onAddSection={handleAddSection}
              onRemoveSection={handleRemoveSection}
              conflictMessage={conflictMessage}
              showCatalogSearch={showCatalogSearch}
              catalogSearchTerm={catalogSearchTerm}
              onCatalogSearchTermChange={setCatalogSearchTerm}
              catalogSearchResults={catalogSearchResults}
              onCatalogCourseSelect={handleCatalogCourseSelect}
              catalogOverrideCourse={catalogOverrideCourse}
              onClearCatalogOverride={handleClearCatalogOverride}
              favoriteSections={favoriteSections}
              favoriteSectionIds={favoriteSectionIds}
              onToggleFavorite={handleToggleFavoriteSection}
            />
          )}
          {isMobile && (
            <DetailsPanel
              mode="stack"
              open
              selectedCourse={selectedCourseMeta}
              selectedScheduledSection={selectedScheduledSection}
              scheduledCourseSections={scheduledForSelectedCourse}
              slotSections={slotSections}
              scheduledSections={scheduledSections}
              onAddSection={handleAddSection}
              onRemoveSection={handleRemoveSection}
              conflictMessage={conflictMessage}
              showCatalogSearch={showCatalogSearch}
              catalogSearchTerm={catalogSearchTerm}
              onCatalogSearchTermChange={setCatalogSearchTerm}
              catalogSearchResults={catalogSearchResults}
              onCatalogCourseSelect={handleCatalogCourseSelect}
              catalogOverrideCourse={catalogOverrideCourse}
              onClearCatalogOverride={handleClearCatalogOverride}
              favoriteSections={favoriteSections}
              favoriteSectionIds={favoriteSectionIds}
              onToggleFavorite={handleToggleFavoriteSection}
            />
          )}
        </main>
      )}
    </div>
  );
}
