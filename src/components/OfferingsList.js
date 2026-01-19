"use client";

export default function OfferingsList({
  courses,
  searchTerm,
  onSearchTermChange,
  selectedCourseKey,
  onSelectCourse,
  favoriteSet,
  onToggleFavorite,
}) {
  const favorites = favoriteSet instanceof Set ? favoriteSet : new Set();

  return (
    <aside className="flex min-h-0 flex-col gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)]/85 p-3 shadow-[0_12px_30px_-24px_rgba(16,24,40,0.6)] backdrop-blur sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
              Course offerings
            </p>
            <h2 className="font-display text-xl">Catalog</h2>
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
            const isFavorite = favorites.has(course.key);
            return (
              <div
                key={course.key}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => onSelectCourse(course.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectCourse(course.key);
                  }
                }}
                className={`group relative flex cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-3 pr-20 text-left transition ${
                  isActive
                    ? "border-[color:var(--accent)] bg-[color:var(--panel-muted)] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.4)]"
                    : "border-transparent hover:border-[color:var(--line)] hover:bg-white/70"
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
                <button
                  type="button"
                  aria-pressed={isFavorite}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(course.key);
                  }}
                  className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] transition ${
                    isFavorite
                      ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                      : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  }`}
                >
                  {isFavorite ? "Fav" : "Save"}
                </button>
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-3 text-xs text-[color:var(--muted)]">
              No courses match your search.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
