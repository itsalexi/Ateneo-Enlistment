"use client";

import { useEffect, useMemo, useState } from "react";
import { DAYS, sortTimeslots } from "@/lib/time";
import { findConflicts } from "@/lib/course-data";
import FilterMultiSelect from "@/components/FilterMultiSelect";

function SectionCard({
  section,
  scheduledSections,
  onAddSection,
  onRemoveSection,
  favoriteActive,
  onToggleFavorite,
}) {
  const conflicts = findConflicts(section, scheduledSections);
  const isScheduled = scheduledSections.some((item) => item.id === section.id);
  const isNoTime = section.noTime;
  const unitValue =
    section.units === undefined || section.units === null || section.units === ""
      ? "?"
      : String(section.units);
  const unitSuffix = unitValue === "1" ? "" : "s";

  let status = "Add to schedule";
  if (isNoTime) {
    status = "No scheduled time";
  } else if (isScheduled) {
    status = "Remove";
  } else if (conflicts.length) {
    status = "Replace conflicts";
  }
  const canAdd = !isScheduled && !isNoTime;

  return (
    <div className="rounded-2xl border border-[color:var(--line)] bg-white/80 p-3 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.5)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[color:var(--ink)]">
            {section.catNo} {section.section}
          </p>
          <p className="text-xs text-[color:var(--muted)]">
            {section.courseTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(section.id)}
              className={`rounded-full border px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] transition ${
                favoriteActive
                  ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                  : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              }`}
            >
              {favoriteActive ? "Saved" : "Save"}
            </button>
          )}
          <span className="whitespace-nowrap rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
            {unitValue} unit{unitSuffix}
          </span>
        </div>
      </div>
      <div className="mt-3 text-xs text-[color:var(--muted)]">
        <p>{section.time || "No scheduled time"}</p>
        <p>{section.room || "Room TBD"}</p>
        <p>{section.instructor || "Instructor TBD"}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {status}
        </span>
        {isScheduled ? (
          <button
            type="button"
            onClick={() => onRemoveSection?.(section.id)}
            className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              onAddSection(section, { replace: conflicts.length > 0 })
            }
            disabled={!canAdd}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              !canAdd
                ? "border-transparent bg-[color:var(--line)] text-[color:var(--muted)]"
                : "border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-white"
            }`}
          >
            {!canAdd
              ? "Unavailable"
              : conflicts.length > 0
                ? "Replace"
                : "Add"}
          </button>
        )}
      </div>
      {conflicts.length > 0 && (
        <p className="mt-2 text-xs text-rose-600">
          Conflicts with{" "}
          {conflicts
            .map((item) => `${item.catNo} ${item.section}`)
            .join(", ")}
          .
        </p>
      )}
    </div>
  );
}

function PanelContent({
  selectedCourse,
  selectedScheduledSection,
  scheduledCourseSections,
  slotSections,
  scheduledSections,
  onAddSection,
  onRemoveSection,
  conflictMessage,
  showCatalogSearch,
  catalogSearchTerm,
  onCatalogSearchTermChange,
  catalogSearchResults,
  onCatalogCourseSelect,
  catalogOverrideCourse,
  onClearCatalogOverride,
  favoriteSections,
  favoriteSectionIds,
  onToggleFavorite,
}) {
  const focusCourse = selectedScheduledSection || selectedCourse;
  const hasCourseContext = Boolean(focusCourse);
  const slotLabel = "Sections";
  const scheduledFocusSections = selectedScheduledSection
    ? [selectedScheduledSection]
    : scheduledCourseSections || [];
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [activeTab, setActiveTab] = useState("sections");
  const favoritesList = Array.isArray(favoriteSections)
    ? favoriteSections
    : [];
  const favoriteSet = useMemo(
    () => new Set(favoriteSectionIds || []),
    [favoriteSectionIds]
  );
  const showFavoritesTab = typeof onToggleFavorite === "function";
  const isFavoritesTab = showFavoritesTab && activeTab === "favorites";

  useEffect(() => {
    if (!showFavoritesTab && activeTab !== "sections") {
      setActiveTab("sections");
    }
  }, [activeTab, showFavoritesTab]);

  const hasFilters =
    selectedInstructors.length > 0 ||
    selectedDays.length > 0 ||
    selectedTimes.length > 0;

  const instructorOptions = useMemo(() => {
    const unique = new Set();
    for (const section of slotSections) {
      const label = section.instructor || "Instructor TBD";
      unique.add(label);
    }
    return Array.from(unique)
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ value: label, label }));
  }, [slotSections]);

  const dayOptions = useMemo(() => {
    const unique = new Set();
    for (const section of slotSections) {
      for (const block of section.meetingBlocks || []) {
        unique.add(block.day);
      }
    }
    return Array.from(unique)
      .sort((a, b) => a - b)
      .map((dayIndex) => {
        const day = DAYS.find((entry) => entry.index === dayIndex);
        return {
          value: String(dayIndex),
          label: day ? day.full : `Day ${dayIndex}`,
        };
      });
  }, [slotSections]);

  const timeOptions = useMemo(() => {
    const unique = new Set();
    for (const section of slotSections) {
      unique.add(section.time || "No scheduled time");
    }
    return sortTimeslots(Array.from(unique)).map((label) => ({
      value: label,
      label,
    }));
  }, [slotSections]);

  const filteredSections = useMemo(() => {
    let next = slotSections;
    if (selectedInstructors.length) {
      const set = new Set(selectedInstructors.map((item) => item.value));
      next = next.filter((section) =>
        set.has(section.instructor || "Instructor TBD")
      );
    }
    if (selectedDays.length) {
      const set = new Set(
        selectedDays.map((item) => Number(item.value))
      );
      next = next.filter((section) =>
        section.meetingBlocks.some((block) => set.has(block.day))
      );
    }
    if (selectedTimes.length) {
      const set = new Set(selectedTimes.map((item) => item.value));
      next = next.filter((section) =>
        set.has(section.time || "No scheduled time")
      );
    }
    return next;
  }, [selectedDays, selectedInstructors, selectedTimes, slotSections]);

  const orderedSections = useMemo(() => {
    const ranked = filteredSections.map((section, index) => {
      const hasConflict = findConflicts(section, scheduledSections).length > 0;
      const rank = section.noTime ? 2 : hasConflict ? 1 : 0;
      return { section, rank, index };
    });
    ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
    return ranked.map((item) => item.section);
  }, [filteredSections, scheduledSections]);

  const orderFavoriteSections = (sections) => {
    const ranked = sections.map((section, index) => {
      const hasConflict = findConflicts(section, scheduledSections).length > 0;
      const rank = section.noTime ? 2 : hasConflict ? 1 : 0;
      return { section, rank, index };
    });
    ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
    return ranked.map((item) => item.section);
  };

  const searchResults = Array.isArray(catalogSearchResults)
    ? catalogSearchResults
    : [];
  const searchTerm = catalogSearchTerm || "";
  const handleCatalogSelect = (course) => {
    onCatalogSearchTermChange(course.catNo);
    onCatalogCourseSelect(course.key);
  };

  const headerTitle = isFavoritesTab
    ? "Favorites"
    : focusCourse
      ? focusCourse.catNo
      : "Pick a course";
  const headerSubtitle = isFavoritesTab
    ? "Saved sections ready to add to your schedule."
    : focusCourse
      ? focusCourse.courseTitle || "Untitled course"
      : "Select a course or click a scheduled block.";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
            Details
          </p>
          <h2 className="font-display text-xl">{headerTitle}</h2>
          <p className="text-xs text-[color:var(--muted)]">{headerSubtitle}</p>
        </div>
      </div>

      {showFavoritesTab && (
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/70 p-1 text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`rounded-full px-3 py-1 transition ${
              !isFavoritesTab
                ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)] shadow"
                : "hover:text-[color:var(--ink)]"
            }`}
          >
            Sections
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("favorites")}
            className={`rounded-full px-3 py-1 transition ${
              isFavoritesTab
                ? "bg-[color:var(--panel-muted)] text-[color:var(--ink)] shadow"
                : "hover:text-[color:var(--ink)]"
            }`}
          >
            Favorites
          </button>
        </div>
      )}
      {hasCourseContext && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-white/80 p-3 text-xs text-[color:var(--muted)]">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Currently scheduled
          </p>
          {scheduledFocusSections.length ? (
            <div className="mt-2 space-y-2">
              {scheduledFocusSections.map((section) => (
                <div key={section.id} className="text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--ink)]">
                        {section.catNo} {section.section}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {section.time || "No scheduled time"}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {section.instructor || "Instructor TBD"}
                      </p>
                    </div>
                    {onRemoveSection && (
                      <button
                        type="button"
                        onClick={() => onRemoveSection(section.id)}
                        className="self-start rounded-full border border-rose-300 px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-rose-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              No section scheduled yet.
            </p>
          )}
        </div>
      )}

      {conflictMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-100/70 p-3 text-xs text-rose-700">
          {conflictMessage}
        </div>
      )}

      {showCatalogSearch && !isFavoritesTab && hasCourseContext && (
        <div className="rounded-2xl border border-dashed border-[color:var(--line)] bg-white/70 p-3 text-xs text-[color:var(--muted)]">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Find a matching course
          </p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            This IPS item has no exact offerings. Search the catalog to view
            available sections.
          </p>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onCatalogSearchTermChange(event.target.value)}
            placeholder="Search all courses"
            className="mt-3 w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2 text-xs text-[color:var(--ink)]"
          />
          {catalogOverrideCourse && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--line)] bg-white/80 px-3 py-2 text-xs text-[color:var(--muted)]">
              <span>
                Viewing: {catalogOverrideCourse.catNo}{" "}
                {catalogOverrideCourse.courseTitle
                  ? `- ${catalogOverrideCourse.courseTitle}`
                  : ""}
              </span>
              <button
                type="button"
                onClick={onClearCatalogOverride}
                className="rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)]"
              >
                Clear
              </button>
            </div>
          )}
          {searchTerm.trim().length < 2 ? (
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              Type at least 2 characters to search.
            </p>
          ) : searchResults.length ? (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[color:var(--line)] bg-white/90 p-1">
              {searchResults.map((course) => (
                <button
                  key={course.key}
                  type="button"
                  onClick={() => handleCatalogSelect(course)}
                  className="flex w-full flex-col rounded-lg px-2 py-1 text-left text-xs text-[color:var(--ink)] transition hover:bg-[color:var(--panel-muted)]"
                >
                  <span className="font-semibold">{course.catNo}</span>
                  <span className="text-[0.65rem] text-[color:var(--muted)]">
                    {course.courseTitle || "Untitled course"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              No matches found. Try another keyword.
            </p>
          )}
        </div>
      )}

      {!isFavoritesTab && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
              {slotLabel}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {slotSections.length > 0 && (
                <span className="rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  {slotSections.length} total
                </span>
              )}
            </div>
          </div>
          {hasCourseContext ? (
            <>
              <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--line)] bg-white/70 p-2 text-xs text-[color:var(--muted)]">
                <FilterMultiSelect
                  label="Instructor"
                  options={instructorOptions}
                  values={selectedInstructors}
                  onChange={setSelectedInstructors}
                  placeholder="Type an instructor"
                />
                <FilterMultiSelect
                  label="Day"
                  options={dayOptions}
                  values={selectedDays}
                  onChange={setSelectedDays}
                  placeholder="Type a day"
                />
                <FilterMultiSelect
                  label="Time"
                  options={timeOptions}
                  values={selectedTimes}
                  onChange={setSelectedTimes}
                  placeholder="Type a time"
                />
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInstructors([]);
                      setSelectedDays([]);
                      setSelectedTimes([]);
                    }}
                    className="self-start rounded-full border border-[color:var(--line)] px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)]"
                  >
                    Clear
                  </button>
                )}
              </div>
              {slotSections.length ? (
                orderedSections.length ? (
                  <div className="max-h-[60vh] overflow-y-auto pr-2 sm:max-h-[65vh]">
                    <div className="space-y-3">
                      {orderedSections.map((section) => (
                        <SectionCard
                          key={section.id}
                          section={section}
                          scheduledSections={scheduledSections}
                          onAddSection={onAddSection}
                          onRemoveSection={onRemoveSection}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[color:var(--muted)]">
                    No sections match your filters.
                  </p>
                )
              ) : (
                <p className="text-xs text-[color:var(--muted)]">
                  No sections available yet.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-xs text-[color:var(--muted)]">
              Pick a course from the left list to see slots on the calendar.
            </div>
          )}
        </div>
      )}

      {isFavoritesTab && (
        <div className="flex flex-col gap-3">
          {favoritesList.length ? (
            <div className="max-h-[60vh] overflow-y-auto pr-2 sm:max-h-[65vh]">
              <div className="space-y-3">
                {orderFavoriteSections(favoritesList).map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    scheduledSections={scheduledSections}
                    onAddSection={onAddSection}
                    onRemoveSection={onRemoveSection}
                    favoriteActive={favoriteSet.has(section.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[color:var(--muted)]">
              No favorite sections yet. Save a section in the offerings list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DetailsPanel({
  mode,
  open,
  selectedCourse,
  selectedScheduledSection,
  scheduledCourseSections,
  slotSections,
  scheduledSections,
  onAddSection,
  onRemoveSection,
  conflictMessage,
  onClose,
  showCatalogSearch,
  catalogSearchTerm,
  onCatalogSearchTermChange,
  catalogSearchResults,
  onCatalogCourseSelect,
  catalogOverrideCourse,
  onClearCatalogOverride,
  favoriteSections,
  favoriteSectionIds,
  onToggleFavorite,
}) {
  if (mode === "modal") {
    if (!open) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Schedule details"
      >
        <div className="max-h-[85vh] w-full overflow-y-auto rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]"
            >
              Close
            </button>
          </div>
          <PanelContent
            selectedCourse={selectedCourse}
            selectedScheduledSection={selectedScheduledSection}
            scheduledCourseSections={scheduledCourseSections}
            slotSections={slotSections}
            scheduledSections={scheduledSections}
            onAddSection={onAddSection}
            onRemoveSection={onRemoveSection}
            conflictMessage={conflictMessage}
            showCatalogSearch={showCatalogSearch}
            catalogSearchTerm={catalogSearchTerm}
            onCatalogSearchTermChange={onCatalogSearchTermChange}
            catalogSearchResults={catalogSearchResults}
            onCatalogCourseSelect={onCatalogCourseSelect}
            catalogOverrideCourse={catalogOverrideCourse}
            onClearCatalogOverride={onClearCatalogOverride}
            favoriteSections={favoriteSections}
            favoriteSectionIds={favoriteSectionIds}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </div>
    );
  }

  if (mode === "stack") {
    if (!open) return null;
    return (
      <section className="w-full">
        <div className="h-full rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)]/85 p-4 shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur">
          <PanelContent
            selectedCourse={selectedCourse}
            selectedScheduledSection={selectedScheduledSection}
            scheduledCourseSections={scheduledCourseSections}
            slotSections={slotSections}
            scheduledSections={scheduledSections}
            onAddSection={onAddSection}
            onRemoveSection={onRemoveSection}
            conflictMessage={conflictMessage}
            showCatalogSearch={showCatalogSearch}
            catalogSearchTerm={catalogSearchTerm}
            onCatalogSearchTermChange={onCatalogSearchTermChange}
            catalogSearchResults={catalogSearchResults}
            onCatalogCourseSelect={onCatalogCourseSelect}
            catalogOverrideCourse={catalogOverrideCourse}
            onClearCatalogOverride={onClearCatalogOverride}
            favoriteSections={favoriteSections}
            favoriteSectionIds={favoriteSectionIds}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </section>
    );
  }

  return (
    <aside className="hidden w-full xl:block xl:w-[360px]">
      <div className="h-full rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)]/85 p-4 shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur">
        <PanelContent
          selectedCourse={selectedCourse}
          selectedScheduledSection={selectedScheduledSection}
          scheduledCourseSections={scheduledCourseSections}
          slotSections={slotSections}
          scheduledSections={scheduledSections}
          onAddSection={onAddSection}
          onRemoveSection={onRemoveSection}
          conflictMessage={conflictMessage}
          showCatalogSearch={showCatalogSearch}
          catalogSearchTerm={catalogSearchTerm}
          onCatalogSearchTermChange={onCatalogSearchTermChange}
          catalogSearchResults={catalogSearchResults}
          onCatalogCourseSelect={onCatalogCourseSelect}
          catalogOverrideCourse={catalogOverrideCourse}
          onClearCatalogOverride={onClearCatalogOverride}
          favoriteSections={favoriteSections}
          favoriteSectionIds={favoriteSectionIds}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </aside>
  );
}
