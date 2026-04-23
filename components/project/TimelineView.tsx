"use client";


import { STAGE_META, PRIORITY_COLOR, Project } from "@/utilities/constants";
import { calcProgress } from "@/utilities/functions";
import { useState } from "react";

// ── Timeline View ─────────────────────────────────────
export default function TimelineView({ projects }: { projects: Project[] }) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const today = new Date();
  const todayCol =
    today.getFullYear() === viewYear ? (today.getMonth() / 12) * 100 : -1;

  // Projects that have at least one date
  const withDates = projects.filter(
    (p) => p.startDate || p.endDate || p.tasks.length > 0,
  );

  function getBar(p: Project) {
    // Use project dates or infer from tasks
    let start = p.startDate ? new Date(p.startDate) : null;
    let end = p.endDate ? new Date(p.endDate) : null;

    if (!start && p.tasks.length > 0) {
      const dates = p.tasks.map((t) => new Date(t.dueDate));
      start = new Date(Math.min(...dates.map((d) => d.getTime())));
    }
    if (!end && p.tasks.length > 0) {
      const dates = p.tasks.map((t) => new Date(t.dueDate));
      end = new Date(Math.max(...dates.map((d) => d.getTime())));
    }
    if (!start) start = new Date(p.createdAt);
    if (!end) end = start;

    const yearStart = new Date(viewYear, 0, 1).getTime();
    const yearEnd = new Date(viewYear, 11, 31).getTime();
    const yearSpan = yearEnd - yearStart;

    const s = Math.max(
      0,
      Math.min(100, ((start.getTime() - yearStart) / yearSpan) * 100),
    );
    const e = Math.max(
      0,
      Math.min(100, ((end.getTime() - yearStart) / yearSpan) * 100),
    );
    const w = Math.max(1, e - s);
    return { left: s, width: w, start, end };
  }

  return (
    <div className="bg-[#16181d] rounded-2xl border border-[#2a2d35] overflow-hidden">
      {/* Year controls */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2d35]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewYear((y) => y - 1)}
            className="w-7 h-7 rounded-lg border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer flex items-center justify-center hover:text-[#9ca3af] transition-colors"
          >
            ‹
          </button>
          <span className="font-mono text-[14px] text-[#e8e3d5] font-semibold tracking-widest">
            {viewYear}
          </span>
          <button
            onClick={() => setViewYear((y) => y + 1)}
            className="w-7 h-7 rounded-lg border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer flex items-center justify-center hover:text-[#9ca3af] transition-colors"
          >
            ›
          </button>
        </div>
        <button
          onClick={() => setViewYear(new Date().getFullYear())}
          className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer hover:text-[#9ca3af] tracking-widest transition-colors"
        >
          TODAY
        </button>
      </div>

      {/* Month headers */}
      <div className="px-4">
        <div className="flex border-b border-[#1e2128] pb-2 pt-3 ml-40">
          {MONTHS.map((m, i) => (
            <div
              key={m}
              className="flex-1 text-center font-mono text-[9px] tracking-widest relative"
              style={{
                color:
                  today.getMonth() === i && today.getFullYear() === viewYear
                    ? "#60a5fa"
                    : "#374151",
              }}
            >
              {m.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Rows */}
        {withDates.length === 0 ? (
          <div className="py-12 text-center font-mono text-xs text-[#2a2d35]">
            No projects with dates to show. Add start/end dates to projects.
          </div>
        ) : (
          <div className="pb-4">
            {withDates.map((p) => {
              const bar = getBar(p);
              const sm = STAGE_META[p.stage];
              const pct = calcProgress(p.tasks);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-0 py-2 border-b border-[#111214] last:border-0 group"
                >
                  {/* Project name column */}
                  <div className="w-40 shrink-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: p.color }}
                      />
                      <span className="font-mono text-[11px] text-[#9ca3af] truncate">
                        {p.name}
                      </span>
                    </div>
                    <span
                      className="font-mono text-[9px] ml-3.5"
                      style={{ color: sm.color }}
                    >
                      {sm.label}
                    </span>
                  </div>

                  {/* Timeline bar area */}
                  <div className="flex-1 relative h-9">
                    {/* Month grid lines */}
                    {MONTHS.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-[#1a1d24]"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}

                    {/* Today line */}
                    {todayCol >= 0 && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-[#60a5fa66] z-10"
                        style={{ left: `${todayCol}%` }}
                      />
                    )}

                    {/* Project bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-6 rounded-full overflow-hidden group/bar"
                      title={`${p.name} · ${pct}% complete`}
                      style={{
                        left: `${bar.left}%`,
                        width: `max(${bar.width}%, 24px)`,
                        background: p.color + "33",
                        border: `1px solid ${p.color}88`,
                      }}
                    >
                      {/* Fill based on progress */}
                      <div
                        className="absolute inset-0 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: p.color + "88" }}
                      />
                      {/* Label */}
                      <div className="absolute inset-0 flex items-center px-2.5">
                        <span
                          className="font-mono text-[9px] text-white font-semibold truncate"
                          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Task dots */}
                    {p.tasks.slice(0, 12).map((t) => {
                      const td = new Date(t.dueDate);
                      const yearStart = new Date(viewYear, 0, 1).getTime();
                      const yearSpan =
                        new Date(viewYear, 11, 31).getTime() - yearStart;
                      const pos = ((td.getTime() - yearStart) / yearSpan) * 100;
                      if (pos < 0 || pos > 100) return null;
                      return (
                        <div
                          key={t.id}
                          title={`${t.title} · due ${t.dueDate.slice(0, 10)}`}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#111214] z-20"
                          style={{
                            left: `calc(${pos}% - 4px)`,
                            background: t.done
                              ? "#2a2d35"
                              : PRIORITY_COLOR[t.priority],
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Task count */}
                  <div className="w-12 shrink-0 text-right">
                    <span className="font-mono text-[9px] text-[#374151]">
                      {p.tasks.length}t
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-5 py-3 border-t border-[#1e2128] flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-px h-4 bg-[#60a5fa66]" />
          <span className="font-mono text-[9px] text-[#374151]">Today</span>
        </div>
        {[
          ["#f87171", "High"],
          ["#fbbf24", "Medium"],
          ["#6ee7b7", "Low"],
        ].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="font-mono text-[9px] text-[#374151]">
              {l} task
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#2a2d35]" />
          <span className="font-mono text-[9px] text-[#374151]">Done task</span>
        </div>
      </div>
    </div>
  );
}
