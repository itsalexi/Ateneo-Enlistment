"use client";

import { useMemo, useState } from "react";

export default function OfferingsTable({
  sections,
  favoriteSectionIds,
  onToggleFavorite,
  scheduledSectionIds,
  departmentLabel,
  semesterLabel,
  lastUpdated,
  page = 1,
  pageCount = 1,
  totalCount,
  onPageChange = () => {},
}) {
  const favoriteSet = useMemo(
    () => new Set(favoriteSectionIds || []),
    [favoriteSectionIds]
  );
  const scheduledSet = useMemo(
    () => new Set(scheduledSectionIds || []),
    [scheduledSectionIds]
  );
  const [showColumns, setShowColumns] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    catNo: true,
    section: true,
    courseTitle: true,
    time: true,
    instructor: true,
    room: true,
    remarks: true,
  });

  const columns = [
    { key: "catNo", label: "Course No" },
    { key: "section", label: "Section" },
    { key: "courseTitle", label: "Course Title" },
    { key: "time", label: "Time" },
    { key: "instructor", label: "Instructor" },
    { key: "room", label: "Room" },
    { key: "remarks", label: "Remarks" },
  ];

  const visibleColumns = columns.filter(
    (column) => columnVisibility[column.key]
  );

  const formattedUpdated = useMemo(() => {
    if (!lastUpdated) return "";
    const date = new Date(lastUpdated);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [lastUpdated]);

  const renderCell = (section, columnKey, isScheduled) => {
    if (columnKey === "catNo") {
      return <span className="font-semibold">{section.catNo}</span>;
    }
    if (columnKey === "section") {
      return section.section;
    }
    if (columnKey === "courseTitle") {
      return (
        <div className="flex flex-col">
          <span>{section.courseTitle || "Untitled course"}</span>
          {isScheduled && (
            <span className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
              Scheduled
            </span>
          )}
        </div>
      );
    }
    if (columnKey === "time") {
      return section.time || "No scheduled time";
    }
    if (columnKey === "instructor") {
      return section.instructor || "Instructor TBD";
    }
    if (columnKey === "room") {
      return section.room || "Room TBD";
    }
    if (columnKey === "remarks") {
      return section.remarks || "-";
    }
    return section[columnKey] || "-";
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-4 bg-[color:var(--panel)]/35 px-3 pb-3 pt-4 sm:p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[color:var(--accent-2)]">
            Course offerings
          </p>
          <h2 className="font-display text-xl">Offerings</h2>
          <p className="text-xs text-[color:var(--muted)]">
            {departmentLabel || "All departments"}
          </p>
          {semesterLabel && (
            <p className="text-xs text-[color:var(--muted)]">
              {semesterLabel}
            </p>
          )}
          {formattedUpdated && (
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Last updated {formattedUpdated}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[color:var(--line)] px-2 py-1 text-xs text-[color:var(--muted)]">
            {totalCount ?? sections.length} sections
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumns((prev) => !prev)}
              className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel)]/70 px-3 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              Columns
            </button>
            {showColumns && (
              <div
                className="absolute right-0 top-full z-10 mt-2 w-48 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/95 p-2 text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
                onMouseDown={(event) => event.preventDefault()}
              >
                <div className="flex flex-col gap-2">
                  {columns.map((column) => (
                    <label
                      key={column.key}
                      className="flex items-center justify-between gap-2"
                    >
                      <span>{column.label}</span>
                      <input
                        type="checkbox"
                        checked={columnVisibility[column.key]}
                        onChange={() =>
                          setColumnVisibility((prev) => ({
                            ...prev,
                            [column.key]: !prev[column.key],
                          }))
                        }
                        className="h-3 w-3 accent-[color:var(--accent)]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[color:var(--line)] py-2 text-xs text-[color:var(--muted)] lg:hidden">
          <span>
            Page {page} of {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] transition disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(pageCount, page + 1))}
              disabled={page >= pageCount}
              className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="hidden min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2 lg:block">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[color:var(--panel)]/95 text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
            <tr className="border-b border-[color:var(--line)]">
              {visibleColumns.map((column) => (
                <th key={column.key} className="px-3 py-2">
                  {column.label}
                </th>
              ))}
              <th className="px-3 py-2 text-right">Save</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => {
              const isFavorite = favoriteSet.has(section.id);
              const isScheduled = scheduledSet.has(section.id);
              return (
                <tr
                  key={section.id}
                  className={`border-b border-[color:var(--line)]/70 text-[color:var(--ink)] transition-colors ${
                    isFavorite ? "bg-[color:var(--panel-muted)]/70" : ""
                  }`}
                >
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-3 py-2">
                      {renderCell(section, column.key, isScheduled)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      aria-pressed={isFavorite}
                      onClick={() => onToggleFavorite(section.id)}
                      className={`rounded-full border px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] transition ${
                        isFavorite
                          ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                          : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                      }`}
                    >
                      {isFavorite ? "Saved" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--panel)]/70 p-3 text-xs text-[color:var(--muted)]">
            No sections match your filters yet.
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 lg:hidden">
        {sections.map((section) => {
          const isFavorite = favoriteSet.has(section.id);
          const isScheduled = scheduledSet.has(section.id);
          return (
            <div
              key={section.id}
              className={`rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)]/80 p-3 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.5)] ${
                isFavorite ? "border-[color:var(--accent)]/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {section.catNo} {section.section}
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">
                    {section.courseTitle || "Untitled course"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-pressed={isFavorite}
                  onClick={() => onToggleFavorite(section.id)}
                  className={`rounded-full border px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] transition ${
                    isFavorite
                      ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                      : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  }`}
                >
                  {isFavorite ? "Saved" : "Save"}
                </button>
              </div>
              <div className="mt-3 text-xs text-[color:var(--muted)]">
                {columnVisibility.time && (
                  <p>{section.time || "No scheduled time"}</p>
                )}
                {columnVisibility.room && (
                  <p>{section.room || "Room TBD"}</p>
                )}
                {columnVisibility.instructor && (
                  <p>{section.instructor || "Instructor TBD"}</p>
                )}
                {columnVisibility.remarks && (
                  <p>{section.remarks || "-"}</p>
                )}
              </div>
              {isScheduled && (
                <span className="mt-3 inline-flex rounded-full border border-[color:var(--accent-2)]/40 px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
                  Scheduled
                </span>
              )}
            </div>
          );
        })}
        {sections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--panel)]/70 p-3 text-xs text-[color:var(--muted)]">
            No sections match your filters yet.
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className="hidden flex-wrap items-center justify-between gap-3 border-y border-[color:var(--line)] py-2 text-xs text-[color:var(--muted)] lg:flex">
          <span>
            Page {page} of {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] transition disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(pageCount, page + 1))}
              disabled={page >= pageCount}
              className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
