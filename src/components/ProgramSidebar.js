"use client";

import { useEffect, useMemo, useState } from "react";

export default function ProgramSidebar({
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
  searchTerm,
  onSearchTermChange,
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
  const [programQuery, setProgramQuery] = useState("");
  const [programOpen, setProgramOpen] = useState(false);
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

  const handleProgramSelect = (program) => {
    setProgramQuery(program.label);
    onProgramChange(program.id);
    setProgramOpen(false);
  };

  return (
    <aside className="flex min-h-0 flex-col gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)]/85 p-3 shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur sm:p-4">
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

        <div className="flex rounded-full border border-[color:var(--line)] bg-white/70 p-1 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
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
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                />
                {programOpen && filteredPrograms.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-white/95 p-1 text-xs text-[color:var(--ink)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    {filteredPrograms.map((program) => (
                      <button
                        key={program.id}
                        type="button"
                        onClick={() => handleProgramSelect(program)}
                        className="flex w-full flex-col gap-1 rounded-xl px-2 py-1 text-left transition hover:bg-[color:var(--panel-muted)]"
                      >
                        <span className="text-xs font-semibold">
                          {program.label}
                        </span>
                        {program.meta && (
                          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
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
              <select
                value={selectedYearIndex ?? ""}
                onChange={(event) =>
                  onYearChange(
                    event.target.value === ""
                      ? null
                      : Number(event.target.value)
                  )
                }
                className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                disabled={!selectedProgramId}
              >
                <option value="">Select a year</option>
                {yearOptions.map((year) => (
                  <option key={year.index} value={year.index}>
                    {year.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Semester
              <select
                value={selectedSemesterIndex ?? ""}
                onChange={(event) =>
                  onSemesterChange(
                    event.target.value === ""
                      ? null
                      : Number(event.target.value)
                  )
                }
                className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                disabled={selectedYearIndex === null}
              >
                <option value="">Select a semester</option>
                {semesterOptions.map((semester) => (
                  <option key={semester.index} value={semester.index}>
                    {semester.label}
                  </option>
                ))}
              </select>
            </label>
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

        <label className="relative">
          <span className="sr-only">Search IPS courses</span>
          <input
            type="search"
            list="ips-course-options"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search within IPS"
            className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] px-4 py-2 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none"
          />
          <datalist id="ips-course-options">
            {ipsCourses.map((course) => (
              <option key={course.id} value={course.catNo} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full space-y-2 overflow-y-auto pr-2">
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
                className={`group relative flex cursor-pointer items-start justify-between gap-2 rounded-2xl border px-3 py-2 pr-10 transition ${
                  isActive
                    ? "border-[color:var(--accent)] bg-[color:var(--panel-muted)] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.4)]"
                    : "border-transparent hover:border-[color:var(--line)] hover:bg-white/70"
                }`}
              >
                <div className="flex flex-1 flex-col gap-1 text-left">
                  <span className="text-sm font-semibold tracking-tight text-[color:var(--ink)]">
                    {course.catNo}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">
                    {course.courseTitle || "Untitled course"}
                  </span>
                </div>
                <div
                  className={`flex flex-col items-end gap-2 ${
                    scheduledCount > 0 ? "pt-5" : ""
                  }`}
                >
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
                {scheduledCount > 0 && (
                  <span className="absolute right-3 top-3 whitespace-nowrap rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                    {scheduledCount} selected
                  </span>
                )}
              </div>
            );
          })}
          {visibleCourses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-3 text-xs text-[color:var(--muted)]">
              {ipsCourses.length === 0
                ? ipsMode === "program"
                  ? "Pick a program, year, and semester to load your IPS."
                  : "Start adding courses to build your custom IPS."
                : "No courses match your search."}
            </div>
          )}
        </div>
      </div>

      {customModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
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
                  className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-sm text-[color:var(--ink)]"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Course title
                <input
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder="Optional title"
                  className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-sm text-[color:var(--ink)]"
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
