"use client";

import { useEffect, useMemo, useState } from "react";
import FilterMultiSelect from "@/components/FilterMultiSelect";

export default function OfferingsFilters({
  activeView,
  onActiveViewChange,
  theme,
  onThemeChange,
  onSupportOpen,
  departmentOptions,
  selectedDepartment,
  onDepartmentChange,
  searchTerm,
  onSearchTermChange,
  ipsOptions,
  selectedIpsCourses = [],
  onIpsCoursesChange,
  instructorOptions,
  selectedInstructors,
  onInstructorsChange,
  catNoOptions,
  selectedCatNos,
  onCatNosChange,
  titleOptions,
  selectedTitles,
  onTitlesChange,
  timeOptions,
  selectedTimes,
  onTimesChange,
  onClearFilters,
  resultCount,
}) {
  const [departmentQuery, setDepartmentQuery] = useState("");
  const [departmentOpen, setDepartmentOpen] = useState(false);

  useEffect(() => {
    if (!selectedDepartment) {
      setDepartmentQuery("");
      return;
    }
    const selected = departmentOptions.find(
      (option) => option.id === selectedDepartment
    );
    setDepartmentQuery(selected ? selected.label : "");
  }, [departmentOptions, selectedDepartment]);

  const filteredDepartments = useMemo(() => {
    const term = departmentQuery.trim().toLowerCase();
    if (!term) return departmentOptions;
    return departmentOptions
      .filter((option) => {
        const label = option.label.toLowerCase();
        const id = option.id.toLowerCase();
        return label.includes(term) || id.includes(term);
      })
      .slice(0, 8);
  }, [departmentOptions, departmentQuery]);

  const handleDepartmentSelect = (option) => {
    setDepartmentQuery(option.label);
    onDepartmentChange(option.id);
    setDepartmentOpen(false);
  };

  const handleDepartmentInput = (event) => {
    const nextValue = event.target.value;
    setDepartmentQuery(nextValue);
    if (!nextValue.trim()) {
      onDepartmentChange("");
    }
  };

  const hasFilters =
    Boolean(searchTerm) ||
    selectedDepartment ||
    selectedIpsCourses.length > 0 ||
    selectedInstructors.length > 0 ||
    selectedCatNos.length > 0 ||
    selectedTitles.length > 0 ||
    selectedTimes.length > 0;
  const handleThemeToggle = (nextTheme) => {
    if (!onThemeChange) return;
    onThemeChange(nextTheme);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[color:var(--panel)]/35 p-3 sm:p-4">
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
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pr-1 pt-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
                Course offerings
              </p>
              <h2 className="font-display text-xl">Filters</h2>
            </div>
            {typeof resultCount === "number" && (
              <span className="rounded-full border border-[color:var(--line)] px-2 py-1 text-xs text-[color:var(--muted)]">
                {resultCount} sections
              </span>
            )}
          </div>

          <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Selected Department
            <div className="relative mt-2">
              <input
                value={departmentQuery}
                onChange={handleDepartmentInput}
                onFocus={() => setDepartmentOpen(true)}
                onBlur={() => setDepartmentOpen(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredDepartments.length) {
                    event.preventDefault();
                    handleDepartmentSelect(filteredDepartments[0]);
                  }
                }}
                placeholder="All departments"
                className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-2 text-sm text-[color:var(--ink)] transition focus:border-[color:var(--accent)]"
              />
              {departmentOpen && filteredDepartments.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/95 p-1 text-xs text-[color:var(--ink)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {filteredDepartments.map((option) => (
                    <button
                      key={option.id || option.label}
                      type="button"
                      onClick={() => handleDepartmentSelect(option)}
                      className="flex w-full flex-col rounded-xl px-2 py-1 text-left transition hover:bg-[color:var(--panel-muted)]"
                    >
                      <span className="text-xs font-semibold">
                        {option.label}
                      </span>
                      {option.id && (
                        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                          {option.id}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>

          {onSearchTermChange && (
            <label className="block text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Search
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder="Search code, title, instructor"
                className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-2 text-sm text-[color:var(--ink)] transition focus:border-[color:var(--accent)]"
              />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-3 text-xs text-[color:var(--muted)]">
          {ipsOptions?.length > 0 && (
            <FilterMultiSelect
              label="Your IPS"
              options={ipsOptions}
              values={selectedIpsCourses}
              onChange={onIpsCoursesChange}
              placeholder="Filter by IPS courses"
            />
          )}
          <FilterMultiSelect
            label="Instructor"
            options={instructorOptions}
            values={selectedInstructors}
            onChange={onInstructorsChange}
            placeholder="Type an instructor"
          />
          <FilterMultiSelect
            label="Course Number"
            options={catNoOptions}
            values={selectedCatNos}
            onChange={onCatNosChange}
            placeholder="Type a course number"
          />
          <FilterMultiSelect
            label="Course Title"
            options={titleOptions}
            values={selectedTitles}
            onChange={onTitlesChange}
            placeholder="Type a course title"
          />
          <FilterMultiSelect
            label="Time"
            options={timeOptions}
            values={selectedTimes}
            onChange={onTimesChange}
            placeholder="Type a time"
          />
          {hasFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="self-start rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              Clear filters
            </button>
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
    </aside>
  );
}
