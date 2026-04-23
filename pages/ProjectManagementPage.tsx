"use client";

import ProjectCard from "@/components/project/ProjectCard";
import { AddTaskModal, ConfirmDelete, ProjectModal } from "@/utilities/modal";
import { Project, ProjectStage, STAGE_META, STAGES, Task } from "@/utilities/constants";
import { useState } from "react";
import TimelineView from "@/components/project/TimelineView";

// ── Main Page ─────────────────────────────────────────
export default function ProjectsPage({
  initialProjects = [],
  allTasks = [],
}: {
  initialProjects?: Project[];
  allTasks?: Task[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [showNew, setShowNew] = useState(false);
  const [editProj, setEditProj] = useState<Project | null>(null);
  const [delProj, setDelProj] = useState<Project | null>(null);
  const [addTaskProject, setAddTaskProject] = useState<Project | null>(null);
  const [view, setView] = useState<"cards" | "timeline">("cards");
  const [stageFilter, setStageFilter] = useState<ProjectStage | "All">("All");

  const visible = projects.filter(
    (p) => stageFilter === "All" || p.stage === stageFilter,
  );

  // Stats
  const total = projects.length;
  const running = projects.filter((p) => p.stage === "running").length;
  const completed = projects.filter((p) => p.stage === "completed").length;
  const planning = projects.filter(
    (p) => p.stage === "planning" || p.stage === "doing",
  ).length;

  async function handleAddTask(data: {
    title: string;
    tag: string;
    priority: string;
    dueDate: string;
    notes?: string;
    projectId?: string | null;
  }) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Refresh projects so the new task appears on the card
    const updated = await fetch("/api/projects").then((r) => r.json());
    setProjects(updated);
    const updatedTasks = await fetch("/api/tasks").then((r) => r.json());
    setTasks(updatedTasks);
  }

  async function handleCreate(data: any) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated = await fetch("/api/projects").then((r) => r.json());
    setProjects(updated);
    const updatedTasks = await fetch("/api/tasks").then((r) => r.json());
    setTasks(updatedTasks);
  }

  async function handleUpdate(data: any) {
    if (!editProj) return;
    await fetch(`/api/projects/${editProj.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await fetch("/api/projects").then((r) => r.json());
    setProjects(updated);
    const updatedTasks = await fetch("/api/tasks").then((r) => r.json());
    setTasks(updatedTasks);
  }

  async function handleDelete() {
    if (!delProj) return;
    await fetch(`/api/projects/${delProj.id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== delProj.id));
    setDelProj(null);
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .proj-item { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div className="min-h-screen bg-[#111214] px-4 py-6 sm:px-7 sm:py-8 mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <div className="font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
              WORKSPACE
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-[#e8e3d5] leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Projects
            </h1>
            <p className="font-mono text-[11px] text-[#4b5563] mt-1.5">
              {total} project{total !== 1 ? "s" : ""} · {running} running ·{" "}
              {completed} completed
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowNew(true)}
              className="bg-[#60a5fa] text-[#111] border-none cursor-pointer font-mono text-[11px] font-semibold px-4 py-2 rounded-full tracking-widest hover:opacity-90 transition-opacity"
            >
              + NEW PROJECT
            </button>
          </div>
        </div>

        {/* § 01 OVERVIEW (cards view) */}
        {view === "cards" && (
          <>
            {/* Stat strip */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {[
                { label: "TOTAL", val: total, color: "#6b7280" },
                { label: "PLANNING", val: planning, color: "#7dd3fc" },
                { label: "RUNNING", val: running, color: "#a3c47a" },
                { label: "COMPLETED", val: completed, color: "#6ee7b7" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-[#16181d] rounded-xl border border-[#1e2128] shrink-0"
                >
                  <span
                    className="font-mono text-xl font-bold"
                    style={{ color: s.color }}
                  >
                    {s.val}
                  </span>
                  <span className="font-mono text-[9px] text-[#374151] tracking-widest">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Stage filter */}
            <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
              {(["All", ...STAGES] as const).map((s) => {
                const m = s === "All" ? null : STAGE_META[s as ProjectStage];
                return (
                  <button
                    key={s}
                    onClick={() => setStageFilter(s as any)}
                    className="font-mono text-[10px] px-3.5 py-2 rounded-full border-none cursor-pointer tracking-widest whitespace-nowrap transition-all duration-150 shrink-0"
                    style={{
                      background:
                        stageFilter === s
                          ? (m?.color ?? "#60a5fa") + "33"
                          : "#16181d",
                      color:
                        stageFilter === s ? (m?.color ?? "#60a5fa") : "#4b5563",
                      outline:
                        stageFilter === s
                          ? `1px solid ${m?.color ?? "#60a5fa"}66`
                          : "1px solid #1e2128",
                    }}
                  >
                    {m ? `${m.icon} ${m.label}` : "All"}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] text-[#60a5fa] tracking-widest">
                § 01
              </span>
              <span className="font-mono text-[11px] text-[#374151] tracking-widest">
                RUNNING PROJECTS
              </span>
              <div className="flex-1 h-px bg-[#1e2128]" />
            </div>

            {visible.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visible.map((p, i) => (
                  <div
                    key={p.id}
                    className="proj-item"
                    style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
                  >
                    <ProjectCard
                      project={p}
                      onEdit={() => setEditProj(p)}
                      onDelete={() => setDelProj(p)}
                      onAddTask={() => setAddTaskProject(p)} 
                      onStageChange={function (id: string, stage: ProjectStage): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="font-mono text-4xl text-[#2a2d35] mb-3">◈</div>
                <p className="font-mono text-[12px] text-[#374151]">
                  No projects yet.
                </p>
                <button
                  onClick={() => setShowNew(true)}
                  className="mt-4 bg-[#60a5fa] text-[#111] border-none cursor-pointer font-mono text-[11px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  + CREATE YOUR FIRST PROJECT
                </button>
              </div>
            )}

            {/* § 02 TIMELINE */}
            <div className="mt-9">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] text-[#60a5fa] tracking-widest">
                  § 02
                </span>
                <span className="font-mono text-[11px] text-[#374151] tracking-widest">
                  TIMELINE
                </span>
                <div className="flex-1 h-px bg-[#1e2128]" />
              </div>
              <TimelineView projects={projects} />
            </div>
          </>
        )}

        {/* Timeline-only view */}
        {view === "timeline" && <TimelineView projects={projects} />}
      </div>

      {showNew && (
        <ProjectModal onClose={() => setShowNew(false)} onSave={handleCreate} />
      )}
      {editProj && (
        <ProjectModal
          project={editProj}
          onClose={() => setEditProj(null)}
          onSave={handleUpdate}
        />
      )}
      {delProj && (
        <ConfirmDelete
          name={delProj.name}
          color={delProj.color}
          onConfirm={handleDelete}
          onCancel={() => setDelProj(null)}
        />
      )}
      {addTaskProject && (
        <AddTaskModal
          onClose={() => setAddTaskProject(null)}
          onAdd={handleAddTask}
          projectId={addTaskProject.id}
          projectName={addTaskProject.name}
          accentColor={addTaskProject.color}
        />
      )}
    </>
  );
}
