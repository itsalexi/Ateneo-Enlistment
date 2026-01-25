import { Fragment } from "react";
import { formatMinutes, formatRange } from "@/lib/time";

export default function CalendarGrid({
  days,
  timeSlots,
  rowHeight,
  startMinutes,
  timeColumnWidth = 84,
  availableSlotsByDay,
  scheduledBlocksByDay,
  selectedSlotId,
  selectedScheduledSlotId,
  dimScheduled,
  isExporting,
  displayOptions,
  onSlotClick,
  onScheduledClick,
}) {
  const columnTemplate = `${timeColumnWidth}px repeat(${days.length}, minmax(0, 1fr))`;
  const hasScheduledOverlap = (dayIndex, slot) => {
    const blocks = scheduledBlocksByDay[dayIndex] || [];
    return blocks.some(
      (block) => slot.start < block.end && slot.end > block.start
    );
  };
  const display = {
    showCourse: true,
    showSection: true,
    showTime: true,
    showRoom: false,
    showInstructor: false,
    ...displayOptions,
  };

  const suppressHighlights = Boolean(isExporting);

  return (
    <div className="relative isolate border border-[color:var(--line)] bg-[color:var(--panel)]/70">
      <div
        className="grid border-b border-[color:var(--line)] bg-[color:var(--panel-muted)]/60 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)] sm:text-xs sm:tracking-[0.24em]"
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div className="sticky left-0 z-10 border-r border-[color:var(--grid-line)] bg-[color:var(--panel-muted)]/90 px-2 py-3 sm:px-3">
          Time
        </div>
        {days.map((day) => (
          <div key={day.label} className="px-2 py-3 text-center sm:px-3">
            {day.label}
          </div>
        ))}
      </div>

      <div className="relative">
        <div
          className="grid"
          style={{
            gridTemplateColumns: columnTemplate,
            gridTemplateRows: `repeat(${timeSlots.length}, ${rowHeight}px)`,
          }}
        >
          {timeSlots.map((minutes) => {
            const isHour = minutes % 60 === 0;
            return (
              <Fragment key={`row-${minutes}`}>
                <div
                  className={`sticky left-0 z-10 flex items-center border-b border-r border-[color:var(--grid-line)] px-2 text-[0.7rem] text-[color:var(--muted)] sm:px-3 sm:text-xs ${
                    isHour
                      ? "bg-[color:var(--panel-muted)]/65"
                      : "bg-[color:var(--panel)]/85"
                  }`}
                >
                  <span
                    className={
                      isHour
                        ? "font-semibold leading-none"
                        : "text-[0.6rem] opacity-60"
                    }
                  >
                    {formatMinutes(minutes)}
                  </span>
                </div>
                {days.map((day) => (
                  <div
                    key={`${day.label}-${minutes}`}
                    className={`border-b border-l border-[color:var(--grid-line)] ${
                      isHour ? "bg-[color:var(--panel-muted)]/35" : ""
                    }`}
                  />
                ))}
              </Fragment>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-0 grid"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div />
          {days.map((day) => (
            <div key={day.label} className="relative">
              {availableSlotsByDay[day.index]
                ?.filter((slot) => !hasScheduledOverlap(day.index, slot))
                .map((slot) => {
                const top =
                  ((slot.start - startMinutes) / 30) * rowHeight + 2;
                const height = ((slot.end - slot.start) / 30) * rowHeight - 4;
                const isSelected = slot.id === selectedSlotId;
                const className = slot.isConflict
                  ? "border-rose-500/70 bg-rose-200/70 text-rose-950"
                  : "border-[color:var(--accent)]/70 bg-[color:var(--accent)]/15 text-[color:var(--ink)]";

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSlotClick(slot)}
                    className={`pointer-events-auto absolute left-1 right-1 flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-1.5 py-1 text-center text-[0.65rem] font-semibold shadow-[0_12px_20px_-18px_rgba(15,23,42,0.6)] transition sm:left-2 sm:right-2 sm:px-2 sm:text-[0.75rem] ${className} ${
                      isSelected && !suppressHighlights
                        ? "ring-2 ring-[color:var(--accent)]"
                        : ""
                    }`}
                    style={{ top, height }}
                    aria-label={`Slot ${formatRange(
                      slot.start,
                      slot.end
                    )} on ${day.full}`}
                  >
                    <span className="uppercase leading-tight tracking-[0.12em]">
                      {slot.sections.length} option
                      {slot.sections.length === 1 ? "" : "s"}
                    </span>
                  </button>
                );
              })}

              {scheduledBlocksByDay[day.index]?.map((block) => {
                const top =
                  ((block.start - startMinutes) / 30) * rowHeight + 2;
                const height = ((block.end - block.start) / 30) * rowHeight - 4;
                const blockId = `scheduled-${block.section.id}-${block.day}-${block.start}-${block.end}`;
                const isSelected = blockId === selectedScheduledSlotId;
                const detailLines = [];
                if (display.showCourse) {
                  detailLines.push({
                    key: "course",
                    text: block.section.catNo,
                    className:
                      "uppercase text-[0.65rem] font-semibold tracking-[0.08em]",
                  });
                }
                if (display.showSection) {
                  detailLines.push({
                    key: "section",
                    text: block.section.section,
                    className: "text-[0.6rem] font-medium",
                  });
                }
                if (display.showTime) {
                  detailLines.push({
                    key: "time",
                    text: formatRange(block.start, block.end),
                    className: "text-[0.55rem] font-medium opacity-80",
                  });
                }
                if (display.showRoom) {
                  detailLines.push({
                    key: "room",
                    text: block.section.room || "Room TBD",
                    className: "text-[0.55rem] font-medium opacity-80",
                  });
                }
                if (display.showInstructor) {
                  detailLines.push({
                    key: "instructor",
                    text: block.section.instructor || "Instructor TBD",
                    className: "text-[0.55rem] font-medium opacity-80",
                  });
                }
                return (
                  <button
                    key={blockId}
                    type="button"
                    onClick={() => onScheduledClick(block)}
                    className={`pointer-events-auto absolute left-1 right-1 flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 px-1.5 py-1 text-center text-[0.65rem] font-semibold shadow-[0_10px_20px_-16px_rgba(15,23,42,0.6)] sm:left-2 sm:right-2 sm:px-2 sm:text-[0.75rem] ${block.section.colorClass} ${
                      dimScheduled && !isSelected ? "opacity-60" : ""
                    } ${
                      isSelected && !suppressHighlights
                        ? "ring-2 ring-[color:var(--accent)]"
                        : ""
                    }`}
                    style={{ top, height }}
                    aria-label={`Scheduled ${block.section.catNo} ${block.section.section}`}
                  >
                    {detailLines.map((line, index) => (
                      <span
                        key={`${blockId}-${line.key}-${index}`}
                        className={`w-full truncate leading-tight ${line.className}`}
                      >
                        {line.text}
                      </span>
                    ))}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
