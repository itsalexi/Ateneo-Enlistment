"use client";

import { useEffect, useMemo, useState } from "react";
import FilterMultiSelect from "@/components/FilterMultiSelect";

export default function OfferingsFilters({
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

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)]/85 p-3 shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pr-1">
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
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-sm text-[color:var(--ink)] transition focus:border-[color:var(--accent)]"
              />
              {departmentOpen && filteredDepartments.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-white/95 p-1 text-xs text-[color:var(--ink)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
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
                className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-sm text-[color:var(--ink)] transition focus:border-[color:var(--accent)]"
              />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--line)] bg-white/70 p-3 text-xs text-[color:var(--muted)]">
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
    </aside>
  );
}
