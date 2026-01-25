export default function CourseSidebar({
  courses,
  searchTerm,
  onSearchTermChange,
  selectedCourseKey,
  onSelectCourse,
  scheduledSections,
  onRemoveSection,
}) {
  return (
    <aside className="flex h-full flex-col gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)]/85 p-4 shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
              Catalog
            </p>
            <h2 className="font-display text-xl">Course Finder</h2>
          </div>
          <span className="rounded-full border border-[color:var(--line)] px-2 py-1 text-xs text-[color:var(--muted)]">
            {courses.length} courses
          </span>
        </div>
        <label className="relative">
          <span className="sr-only">Search courses</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search by code or title"
            className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] px-4 py-2 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none"
          />
        </label>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full space-y-2 overflow-y-auto pr-2">
          {courses.map((course) => {
            const isActive = course.key === selectedCourseKey;
            return (
              <button
                key={course.key}
                type="button"
                onClick={() => onSelectCourse(course.key)}
                aria-pressed={isActive}
                className={`flex w-full flex-col gap-1 rounded-2xl border px-3 py-2 text-left transition ${
                  isActive
                    ? "border-[color:var(--accent)] bg-[color:var(--panel-muted)] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.4)]"
                    : "border-transparent hover:border-[color:var(--line)] hover:bg-[color:var(--panel)]/70"
                }`}
              >
                <span className="text-sm font-semibold tracking-tight text-[color:var(--ink)]">
                  {course.catNo}
                </span>
                <span className="text-xs text-[color:var(--muted)]">
                  {course.courseTitle || "Untitled course"}
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--accent-2)]">
                  {course.sections.length} sections
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/70 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[color:var(--ink)]">
            Scheduled
          </p>
          <span className="text-xs text-[color:var(--muted)]">
            {scheduledSections.length} total
          </span>
        </div>
        {scheduledSections.length === 0 ? (
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            No sections added yet.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {scheduledSections.map((section) => (
              <div
                key={section.id}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${section.colorClass}`}
              >
                <span className="font-semibold">
                  {section.catNo} {section.section}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveSection(section.id)}
                  className="rounded-full border border-current px-1 text-[0.6rem]"
                  aria-label={`Remove ${section.catNo} ${section.section}`}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
