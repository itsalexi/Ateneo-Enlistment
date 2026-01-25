"use client";

import { useEffect, useMemo, useState } from "react";

export default function ProgramSidebar({
  activeView,
  onActiveViewChange,
  theme,
  onThemeChange,
  onSupportOpen,
  ipsMode,
  onIpsModeChange,
  programOptions,
  selectedProgramId,
  onProgramChange,
  yearOptions,
  selectedYearIndex,
  onYearChange,
  semesterOptions,
  selectedSemesterIndex,
  onSemesterChange,
  ipsCourses,
  visibleCourses,
  selectedCourseKey,
  onSelectCourse,
  onClearSelection,
  onAddCustomCourse,
  onRemoveCustomCourse,
  scheduledCountByCourse,
}) {
  const [customCatNo, setCustomCatNo] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [showProgramSettings, setShowProgramSettings] = useState(true);
  const [programQuery, setProgramQuery] = useState("");
  const [programOpen, setProgramOpen] = useState(false);
  const [yearQuery, setYearQuery] = useState("");
  const [yearOpen, setYearOpen] = useState(false);
  const [semesterQuery, setSemesterQuery] = useState("");
  const [semesterOpen, setSemesterOpen] = useState(false);
  const scheduledCounts =
    scheduledCountByCourse instanceof Map ? scheduledCountByCourse : new Map();
  const selectedProgram = programOptions.find(
    (program) => program.id === selectedProgramId
  );

  useEffect(() => {
    if (selectedProgram) {
      setProgramQuery(selectedProgram.label);
    } else {
      setProgramQuery("");
    }
  }, [selectedProgram, selectedProgramId]);

  useEffect(() => {
    if (selectedYearIndex === null || yearOptions.length === 0) {
      setYearQuery("");
      return;
    }
    const selectedYear = yearOptions.find(
      (year) => year.index === selectedYearIndex
    );
    setYearQuery(selectedYear ? selectedYear.label : "");
  }, [selectedYearIndex, yearOptions]);

  useEffect(() => {
    if (selectedSemesterIndex === null || semesterOptions.length === 0) {
      setSemesterQuery("");
      return;
    }
    const selectedSemester = semesterOptions.find(
      (semester) => semester.index === selectedSemesterIndex
    );
    setSemesterQuery(selectedSemester ? selectedSemester.label : "");
  }, [selectedSemesterIndex, semesterOptions]);

  useEffect(() => {
    if (ipsMode !== "custom") {
      setCustomModalOpen(false);
    }
  }, [ipsMode]);

  const handleAddCustom = () => {
    if (!customCatNo.trim()) return;
    onAddCustomCourse({
      catNo: customCatNo.trim(),
      courseTitle: customTitle.trim(),
    });
    setCustomCatNo("");
    setCustomTitle("");
    setCustomModalOpen(false);
  };

  const handleProgramInputChange = (event) => {
    const nextValue = event.target.value;
    setProgramQuery(nextValue);
    if (!nextValue.trim()) {
      onProgramChange("");
    }
  };

  const filteredPrograms = useMemo(() => {
    const term = programQuery.trim().toLowerCase();
    if (!term) {
      return programOptions.slice(0, 8);
    }
    return programOptions
      .filter((program) => {
        const label = program.label.toLowerCase();
        const meta = String(program.meta || "").toLowerCase();
        return label.includes(term) || meta.includes(term);
      })
      .slice(0, 8);
  }, [programOptions, programQuery]);

  const filteredYears = useMemo(() => {
    const term = yearQuery.trim().toLowerCase();
    if (!term) return yearOptions;
    return yearOptions
      .filter((year) => year.label.toLowerCase().includes(term))
      .slice(0, 8);
  }, [yearOptions, yearQuery]);

  const filteredSemesters = useMemo(() => {
    const term = semesterQuery.trim().toLowerCase();
    if (!term) return semesterOptions;
    return semesterOptions
      .filter((semester) => semester.label.toLowerCase().includes(term))
      .slice(0, 8);
  }, [semesterOptions, semesterQuery]);

  const handleProgramSelect = (program) => {
    setProgramQuery(program.label);
    onProgramChange(program.id);
    setProgramOpen(false);
  };

  const handleYearSelect = (year) => {
    setYearQuery(year.label);
    onYearChange(year.index);
    setYearOpen(false);
  };

  const handleSemesterSelect = (semester) => {
    setSemesterQuery(semester.label);
    onSemesterChange(semester.index);
    setSemesterOpen(false);
  };

  const handleYearInputChange = (event) => {
    const nextValue = event.target.value;
    setYearQuery(nextValue);
    if (!nextValue.trim()) {
      onYearChange(null);
      onSemesterChange(null);
    }
  };

  const handleSemesterInputChange = (event) => {
    const nextValue = event.target.value;
    setSemesterQuery(nextValue);
    if (!nextValue.trim()) {
      onSemesterChange(null);
    }
  };
  const handleThemeToggle = (nextTheme) => {
    if (!onThemeChange) return;
    onThemeChange(nextTheme);
  };

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col gap-4 bg-[color:var(--panel)]/35 p-3 transition-all duration-300 ease-out sm:p-4">
      {onActiveViewChange && (
        <div className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-3">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
              Ateneo enlistment
            </p>
            <h1 className="font-display text-2xl">Schedule Studio</h1>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-1 text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <button
                type="button"
                onClick={() => onActiveViewChange("schedule")}
                aria-pressed={activeView === "schedule"}
                className={`rounded-full px-3 py-1 transition ${
                  activeView !== "offerings"
                    ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)]"
                    : "hover:text-[color:var(--ink)]"
                }`}
              >
                Schedule
              </button>
              <button
                type="button"
                onClick={() => onActiveViewChange("offerings")}
                aria-pressed={activeView === "offerings"}
                className={`rounded-full px-3 py-1 transition ${
                  activeView === "offerings"
                    ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)]"
                    : "hover:text-[color:var(--ink)]"
                }`}
              >
                Offerings
              </button>
            </div>
            {onThemeChange && (
              <div className="flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-1">
                <button
                  type="button"
                  onClick={() => handleThemeToggle("light")}
                  aria-pressed={theme === "light"}
                  aria-label="Light mode"
                  title="Light mode"
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--muted)] transition ${
                    theme === "light"
                      ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)]"
                      : "hover:text-[color:var(--ink)]"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeToggle("dark")}
                  aria-pressed={theme === "dark"}
                  aria-label="Dark mode"
                  title="Dark mode"
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--muted)] transition ${
                    theme === "dark"
                      ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)]"
                      : "hover:text-[color:var(--ink)]"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="M20 14.5A7.5 7.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
              IPS selector
            </p>
            <h2 className="font-display text-xl">Program Builder</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[color:var(--line)] px-2 py-1 text-xs text-[color:var(--muted)]">
              {ipsCourses.length} courses
            </span>
          </div>
        </div>

        <div className="flex rounded-full border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-1 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          <button
            type="button"
            onClick={() => onIpsModeChange("program")}
            className={`flex-1 rounded-full px-3 py-1 ${
              ipsMode === "program"
                ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)] shadow"
                : ""
            }`}
          >
            Program
          </button>
          <button
            type="button"
            onClick={() => onIpsModeChange("custom")}
            className={`flex-1 rounded-full px-3 py-1 ${
              ipsMode === "custom"
                ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)] shadow"
                : ""
            }`}
          >
            Custom
          </button>
        </div>

        {ipsMode === "program" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Program settings
              </p>
              <button
                type="button"
                onClick={() => setShowProgramSettings((prev) => !prev)}
                className="rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)]"
              >
                {showProgramSettings ? "Hide" : "Show"}
              </button>
            </div>
            {showProgramSettings && (
              <>
                <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Program
                  <div className="relative mt-2">
                    <input
                      value={programQuery}
                      onChange={handleProgramInputChange}
                      onFocus={() => setProgramOpen(true)}
                      onBlur={() => setProgramOpen(false)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && filteredPrograms.length) {
                          event.preventDefault();
                          handleProgramSelect(filteredPrograms[0]);
                        }
                      }}
                      placeholder="Select a program"
                      title={programQuery}
                      className="w-full truncate rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                    />
                    {programOpen && filteredPrograms.length > 0 && (
                      <div
                        className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/95 p-1 text-xs text-[color:var(--ink)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {filteredPrograms.map((program) => (
                          <button
                            key={program.id}
                            type="button"
                            onClick={() => handleProgramSelect(program)}
                            className="flex w-full min-w-0 flex-col gap-1 rounded-xl px-2 py-1 text-left transition hover:bg-[color:var(--panel-muted)]"
                          >
                            <span className="truncate text-xs font-semibold">
                              {program.label}
                            </span>
                            {program.meta && (
                              <span className="truncate text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                                {program.meta}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedProgram?.meta && (
                    <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      {selectedProgram.meta}
                    </p>
                  )}
                </label>

                <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Year
                  <div className="relative mt-2">
                    <input
                      value={yearQuery}
                      onChange={handleYearInputChange}
                      onFocus={() => setYearOpen(true)}
                      onBlur={() => setYearOpen(false)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && filteredYears.length) {
                          event.preventDefault();
                          handleYearSelect(filteredYears[0]);
                        }
                      }}
                      placeholder="Select a year"
                      className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                      disabled={!selectedProgramId}
                    />
                    {yearOpen && filteredYears.length > 0 && (
                      <div
                        className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/95 p-1 text-xs text-[color:var(--ink)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {filteredYears.map((year) => (
                          <button
                            key={year.index}
                            type="button"
                            onClick={() => handleYearSelect(year)}
                            className="flex w-full rounded-xl px-2 py-1 text-left text-xs font-semibold transition hover:bg-[color:var(--panel-muted)]"
                          >
                            {year.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </label>

                <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Semester
                  <div className="relative mt-2">
                    <input
                      value={semesterQuery}
                      onChange={handleSemesterInputChange}
                      onFocus={() => setSemesterOpen(true)}
                      onBlur={() => setSemesterOpen(false)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && filteredSemesters.length) {
                          event.preventDefault();
                          handleSemesterSelect(filteredSemesters[0]);
                        }
                      }}
                      placeholder="Select a semester"
                      className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                      disabled={selectedYearIndex === null}
                    />
                    {semesterOpen && filteredSemesters.length > 0 && (
                      <div
                        className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/95 p-1 text-xs text-[color:var(--ink)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {filteredSemesters.map((semester) => (
                          <button
                            key={semester.index}
                            type="button"
                            onClick={() => handleSemesterSelect(semester)}
                            className="flex w-full rounded-xl px-2 py-1 text-left text-xs font-semibold transition hover:bg-[color:var(--panel-muted)]"
                          >
                            {semester.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setCustomModalOpen(true)}
              className="w-full rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]"
            >
              Add custom course
            </button>
            <p className="text-xs text-[color:var(--muted)]">
              Build your IPS by adding course codes and optional titles.
            </p>
          </div>
        )}

      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full divide-y divide-[color:var(--line)] overflow-y-auto pr-2">
          {visibleCourses.map((course) => {
            const isActive = course.normalizedCatNo === selectedCourseKey;
            const scheduledCount =
              scheduledCounts.get(course.normalizedCatNo) || 0;
            return (
              <div
                key={course.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => onSelectCourse(course)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectCourse(course);
                  }
                }}
                className={`group flex cursor-pointer items-start justify-between gap-3 px-2 py-3 transition ${
                  isActive
                    ? "bg-[color:var(--panel-muted)]"
                    : "hover:bg-[color:var(--panel)]/50"
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                  <span className="text-sm font-semibold tracking-tight text-[color:var(--ink)]">
                    {course.catNo}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">
                    {course.courseTitle || "Untitled course"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {scheduledCount > 0 && (
                    <span className="whitespace-nowrap rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                      {scheduledCount} selected
                    </span>
                  )}
                  {ipsMode === "custom" && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveCustomCourse(course.id);
                      }}
                      className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)] opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {visibleCourses.length === 0 && (
            <div className="py-3 text-xs text-[color:var(--muted)]">
              {ipsCourses.length === 0
                ? ipsMode === "program"
                  ? "Pick a program, year, and semester to load your IPS."
                  : "Start adding courses to build your custom IPS."
                : "No courses match your search."}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[color:var(--line)] pt-3 text-[0.65rem] text-[color:var(--muted)]">
        <div className="flex items-center justify-between gap-3">
          <span>Made with &lt;3 by Alexi</span>
          {onSupportOpen && (
            <button
              type="button"
              onClick={onSupportOpen}
              className="rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            >
              Support
            </button>
          )}
        </div>
      </div>

      {customModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-10 backdrop-blur-sm sm:pt-16"
          role="dialog"
          aria-modal="true"
          aria-label="Add custom course"
          onClick={() => setCustomModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
                  Custom IPS
                </p>
                <h3 className="font-display text-xl">Add a course</h3>
              </div>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Course code
                <input
                  value={customCatNo}
                  onChange={(event) => setCustomCatNo(event.target.value)}
                  placeholder="e.g. CSCI 20"
                  className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Course title
                <input
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder="Optional title"
                  className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="rounded-full border border-[color:var(--line)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!customCatNo.trim()}
                  className="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--accent)] disabled:opacity-50"
                >
                  Add to IPS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
