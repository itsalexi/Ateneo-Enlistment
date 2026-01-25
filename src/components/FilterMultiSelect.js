"use client";

import { useMemo, useState } from "react";

export default function FilterMultiSelect({
  label,
  options,
  values,
  onChange,
  placeholder,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const queryTerm = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    const selectedValues = new Set(values.map((item) => item.value));
    return options
      .filter((option) =>
        queryTerm
          ? option.label.toLowerCase().includes(queryTerm)
          : true
      )
      .filter((option) => !selectedValues.has(option.value))
      .slice(0, 8);
  }, [options, queryTerm, values]);

  const handleSelect = (option) => {
    onChange([...values, option]);
    setQuery("");
  };

  const handleRemove = (value) => {
    onChange(values.filter((item) => item.value !== value));
  };

  return (
    <div className="relative flex flex-col gap-1">
      <span className="text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)]">
        {label}
      </span>
      <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] px-2 py-1">
        <div className="flex flex-wrap items-center gap-1">
          {values.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleRemove(item.value)}
              className="flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--panel-muted)] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-[color:var(--muted)]"
            >
              <span className="max-w-[140px] truncate">{item.label}</span>
              <span className="text-[0.6rem]">x</span>
            </button>
          ))}
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filteredOptions.length) {
                event.preventDefault();
                handleSelect(filteredOptions[0]);
              }
              if (event.key === "Backspace" && !query && values.length) {
                handleRemove(values[values.length - 1].value);
              }
            }}
            placeholder={values.length ? "" : placeholder}
            className="min-w-[110px] flex-1 bg-transparent text-xs text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:outline-none"
          />
        </div>
      </div>
      {open && filteredOptions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)]/95 p-1 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]"
          onMouseDown={(event) => event.preventDefault()}
        >
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full rounded-lg px-2 py-1 text-left text-xs text-[color:var(--ink)] transition hover:bg-[color:var(--panel-muted)]"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
