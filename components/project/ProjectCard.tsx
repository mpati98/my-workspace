"use client";
import Link from "next/link";

import { Project, ProjectStage, STAGE_META, TAG_COLOR } from "@/utilities/constants";
import { ProgressBar } from "@/utilities/elements";
import { calcProgress, fmtDate } from "@/utilities/functions";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectCard(
  { project,   
    onEdit,
    onDelete,
    onAddTask, onStageChange}: { project: Project;  onEdit: () => void;
    onDelete: () => void;
    onAddTask: () => void;
  onStageChange: (id: string, stage: ProjectStage) => void;
  })
  {
    const router = useRouter();
  const pct = calcProgress(project.tasks);
  const sm = STAGE_META[project.stage];
  const highPriority = project.tasks.filter(
    (t) => !t.done && t.priority === "High",
  );
  const [hov, setHov] = useState(false);
    const [selected,  setSelected]  = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    // Auto-promote to completed when 100%
  useEffect(() => {
    if (pct === 100 && project.stage !== "completed" && project.tasks.length > 0) {
      fetch(`/api/projects/${project.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "completed" }),
      }).then(r => r.ok && onStageChange(project.id, "completed"));
    }
  }, [pct]);
    function handleClick(e: React.MouseEvent) {
    // Ignore clicks on buttons/links inside the card
    if ((e.target as HTMLElement).closest("button,a")) return;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      setSelected(s => !s);
    }, 220);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("button,a")) return;
    clearTimeout(clickTimer.current);
    router.push(`/project-management/${project.id}`);
  }
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="bg-[#16181d] rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer select-none"
      style={{
        borderColor: selected ? project.color : hov ? project.color + "66" : "#2a2d35",
        boxShadow:   selected
          ? `0 0 0 2px ${project.color}, 0 8px 30px ${project.color}33`
          : hov ? `0 8px 30px ${project.color}18` : "none",
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}>
      {/* Top color strip — thicker when selected */}
      <div className="transition-all duration-200" style={{ height: selected ? "3px" : "4px", background: project.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full tracking-widest"
                style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}44` }}>
                {sm.icon} {sm.label.toUpperCase()}
              </span>
              {project.category && (
                <span className="font-mono text-[9px] text-[#374151] bg-[#1a1d24] px-2 py-0.5 rounded-full border border-[#2a2d35]">
                  {project.category}
                </span>
              )}
              {pct === 100 && project.stage !== "completed" && (
                <span className="font-mono text-[9px] text-[#a3c47a] animate-pulse">→ completing…</span>
              )}
            </div>
            <h3 className="text-lg font-bold text-[#e8e3d5] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              <Link href={`/project-management/${project.id}`}
                className="hover:text-[#60a5fa] transition-colors"
                style={{ color: "inherit", textDecoration: "none" }}>
                {project.name}
              </Link>
            </h3>
          </div>

          {/* Action buttons — visible on hover OR selected */}
          <div className={`flex gap-1 transition-opacity ${hov || selected ? "opacity-100" : "opacity-0"}`}>
            <button onClick={(e) => { e.stopPropagation(); onAddTask(); }}
              title="Add task"
              className="h-7 px-2 rounded-lg bg-transparent border border-[#2a2d35] cursor-pointer font-mono text-[10px] text-[#6b7280] hover:text-[#e8e3d5] hover:border-[#374151] transition-all flex items-center gap-1">
              <span>+</span><span className="hidden sm:inline">Task</span>
            </button>
            <Link href={`/project-management/${project.id}`}
              title="View detail"
              onClick={e => e.stopPropagation()}
              className="w-7 h-7 rounded-lg bg-transparent border border-[#2a2d35] cursor-pointer font-mono text-xs text-[#6b7280] hover:text-[#60a5fa] hover:border-[#60a5fa] transition-all flex items-center justify-center no-underline">
              ↗
            </Link>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-7 h-7 rounded-lg bg-transparent border border-[#2a2d35] cursor-pointer font-mono text-xs text-[#6b7280] hover:text-[#e8e3d5] hover:border-[#374151] transition-all flex items-center justify-center">✎</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-7 h-7 rounded-lg bg-transparent border border-[#2a2d35] cursor-pointer font-mono text-xs text-[#6b7280] hover:text-[#f87171] hover:border-[#f87171] transition-all flex items-center justify-center">✕</button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="font-mono text-[11px] text-[#6b7280] leading-relaxed mb-3 line-clamp-2">{project.description}</p>
        )}

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] text-[#374151] tracking-widest">PROGRESS</span>
            <span className="font-mono text-[11px] font-semibold" style={{ color: project.color }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} color={project.color} />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-[#2a2d35]">{project.tasks.filter(t => t.done).length} done</span>
            <span className="font-mono text-[9px] text-[#2a2d35]">{project.tasks.length} total</span>
          </div>
        </div>

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-[#1e2128]" />
            <span className="font-mono text-[9px] text-[#374151]">
              {project.startDate ? fmtDate(project.startDate) : "—"}{" → "}{project.endDate ? fmtDate(project.endDate) : "ongoing"}
            </span>
            <div className="h-px flex-1 bg-[#1e2128]" />
          </div>
        )}

        {/* High priority tasks */}
        {highPriority.length > 0 && (
          <div>
            <p className="font-mono text-[9px] text-[#f87171] tracking-widest mb-1.5">⚡ HIGH PRIORITY</p>
            <div className="flex flex-col gap-1">
              {highPriority.slice(0, 3).map(t => {
                const tag = TAG_COLOR[t.tag] ?? { bg: "#ffffff10", text: "#9ca3af" };
                return (
                  <div key={t.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111214] border border-[#1e2128]">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#f87171]" style={{ boxShadow: "0 0 6px #f87171" }} />
                    <span className="flex-1 font-mono text-[11px] text-[#c9c4b8] truncate">{t.title}</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: tag.bg, color: tag.text }}>{t.tag}</span>
                    <span className="font-mono text-[9px] text-[#374151] shrink-0">{t.dueDate.slice(5, 10).replace("-", "/")}</span>
                  </div>
                );
              })}
              {highPriority.length > 3 && <p className="font-mono text-[9px] text-[#374151] pl-2">+{highPriority.length - 3} more</p>}
            </div>
          </div>
        )}

        {project.tasks.length === 0 && (
          <p className="font-mono text-[10px] text-[#2a2d35]">No tasks yet. Double-click to open.</p>
        )}

        {/* Single-click hint */}
        {selected && (
          <p className="font-mono text-[9px] mt-3 text-center" style={{ color: project.color + "88" }}>
            Double-click to open detail ↗
          </p>
        )}
      </div>
    </div>
  );
}