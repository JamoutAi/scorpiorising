"use client";

import { useState } from "react";

interface EntryCardProps {
  createdAt: string;
  body: string;
  reading: string | null;
  onDelete?: () => void | Promise<void>;
}

// A compact, collapsible journal entry. Shows a bar with the date and a short
// preview; expands to reveal the full entry + reflection.
export function EntryCard({ createdAt, body, reading, onDelete }: EntryCardProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const date = new Date(createdAt);
  const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const preview = body.length > 110 ? body.slice(0, 110).trimEnd() + "…" : body;

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "rgba(23,37,31,0.08)", background: "#fffdf8" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/[0.02]"
      >
        <span className="shrink-0 text-xs font-medium uppercase tracking-[0.1em]" style={{ color: "#1aa37c" }}>
          {dateLabel}
        </span>
        <span className="hidden shrink-0 text-xs sm:block" style={{ color: "#9a948b" }}>{timeLabel}</span>
        <span className="flex-1 truncate text-sm" style={{ color: "#3a4a43" }}>{preview}</span>
        {reading && (
          <span
            className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] sm:inline"
            style={{ background: "rgba(31,200,150,0.12)", color: "#1aa37c" }}
          >
            Reflection
          </span>
        )}
        <span
          className="shrink-0 text-lg leading-none transition-transform duration-200"
          style={{ color: "#1aa37c", transform: open ? "rotate(45deg)" : "none", fontFamily: "var(--font-sans), sans-serif" }}
          aria-hidden
        >
          +
        </span>
      </button>

      {open && (
        <div className="border-t px-4 py-4" style={{ borderColor: "rgba(23,37,31,0.08)" }}>
          <p className="whitespace-pre-wrap text-sm" style={{ color: "#17251f" }}>{body}</p>
          {reading && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(23,37,31,0.08)" }}>
              <p className="mb-2 text-xs uppercase tracking-[0.16em]" style={{ color: "#9a948b" }}>Your reflection</p>
              <p className="whitespace-pre-wrap text-sm" style={{ color: "#3a4a43", lineHeight: 1.7 }}>{reading}</p>
            </div>
          )}
          {onDelete && (
            <div className="mt-4 flex items-center justify-end gap-3 text-xs uppercase tracking-[0.1em]">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="transition hover:text-red-500"
                  style={{ color: "#b0a99f" }}
                >
                  Delete entry
                </button>
              ) : (
                <>
                  <span style={{ color: "#7a756e" }}>Delete this entry?</span>
                  <button onClick={() => onDelete()} className="font-semibold text-red-500 transition hover:text-red-600">
                    Yes, delete
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="transition hover:text-black" style={{ color: "#b0a99f" }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
