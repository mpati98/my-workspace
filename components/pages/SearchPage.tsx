"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Task,
  Project,
  PRIORITY_COLOR,
  TAG_COLOR,
  STATUS_META,
  STAGE_META,
  PRIORITY_LIST,
  TAG_LIST,
} from "@/utilities/constants";
import { fmtDate, dueDateDiff } from "@/utilities/functions";

type SearchResult = {
  type: "task" | "project";
  data: Task | Project;
  matchScore: number;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"all" | "tasks" | "projects">("all");

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, tasksRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/tasks"),
        ]);
        const projData = await projRes.json();
        const tasksData = await tasksRes.json();
        setProjects(projData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Search and filter logic
  const results = useMemo(() => {
    let filtered: SearchResult[] = [];

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
      // Priority filter
      if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
        return false;
      }
      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
        return false;
      }
      // Tag filter
      if (tagFilter.length > 0 && !tagFilter.includes(task.tag)) {
        return false;
      }
      return true;
    });

    // Filter projects
    const filteredProjects = projects.filter((proj) => {
      // Stage filter
      if (stageFilter.length > 0 && !stageFilter.includes(proj.stage)) {
        return false;
      }
      return true;
    });

    // Search tasks
    if (view === "all" || view === "tasks") {
      filteredTasks.forEach((task) => {
        let score = 0;
        const queryLower = query.toLowerCase();

        if (task.title.toLowerCase().includes(queryLower)) {
          score += 10;
          if (task.title.toLowerCase().startsWith(queryLower)) score += 5;
        }
        if (task.notes?.toLowerCase().includes(queryLower)) {
          score += 3;
        }

        if (score > 0 || query === "") {
          filtered.push({ type: "task", data: task, matchScore: score });
        }
      });
    }

    // Search projects
    if (view === "all" || view === "projects") {
      filteredProjects.forEach((proj) => {
        let score = 0;
        const queryLower = query.toLowerCase();

        if (proj.name.toLowerCase().includes(queryLower)) {
          score += 10;
          if (proj.name.toLowerCase().startsWith(queryLower)) score += 5;
        }
        if (proj.description?.toLowerCase().includes(queryLower)) {
          score += 3;
        }
        if (proj.category?.toLowerCase().includes(queryLower)) {
          score += 2;
        }

        if (score > 0 || query === "") {
          filtered.push({ type: "project", data: proj, matchScore: score });
        }
      });
    }

    // Sort by match score descending
    filtered.sort((a, b) => b.matchScore - a.matchScore);
    return filtered;
  }, [query, projects, tasks, priorityFilter, statusFilter, tagFilter, stageFilter, view]);

  const toggleFilter = (filter: string, setState: any, state: string[]) => {
    setState(state.includes(filter) ? state.filter((f) => f !== filter) : [...state, filter]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 mb-4">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full border-2 border-[#1a1d24]" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: "#f472b6",
                  borderRightColor: "#f472b633",
                }}
              />
            </div>
          </div>
          <p className="text-[#8a8a8a]">Loading search index...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-bright">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-bright">Search</h1>
          <p className="text-[#8a8a8a]">Find projects and tasks across your workspace</p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by name, description, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#2a2d35] bg-[#16181d] text-bright placeholder-[#6b7280] focus:outline-none focus:border-[#f472b6] transition-colors"
          />
        </div>

        {/* View Tabs */}
        <div className="flex gap-3 mb-8 border-b border-[#2a2d35]  pb-4">
          {(["all", "tasks", "projects"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm font-semibold  transition-colors capitalize ${
                view === v
                  ? "text-[#f472b6] border-b-2 border-[#f472b6] cursor-pointer"
                  : "text-[#8a8a8a] hover:text-bright cursor-pointer"
              }`}
            >
              {v === "all" ? "All Results" : v}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-bright mb-3 flex items-center justify-between">
                  Filters
                  {(priorityFilter.length > 0 ||
                    statusFilter.length > 0 ||
                    tagFilter.length > 0 ||
                    stageFilter.length > 0) && (
                    <button
                      onClick={() => {
                        setPriorityFilter([]);
                        setStatusFilter([]);
                        setTagFilter([]);
                        setStageFilter([]);
                      }}
                      className="text-xs text-[#f472b6] hover:text-[#f8a0d4] transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </h3>
              </div>

              {/* Priority Filter */}
              {(view === "all" || view === "tasks") && (
                <div>
                  <h4 className="text-xs font-mono text-[#8a8a8a] mb-2 tracking-widest">
                    PRIORITY
                  </h4>
                  <div className="space-y-2">
                    {PRIORITY_LIST.map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={priorityFilter.includes(p)}
                          onChange={() =>
                            toggleFilter(p, setPriorityFilter, priorityFilter)
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: PRIORITY_COLOR[p] + "20",
                            color: PRIORITY_COLOR[p],
                          }}
                        >
                          {p}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Filter */}
              {(view === "all" || view === "tasks") && (
                <div>
                  <h4 className="text-xs font-mono text-[#8a8a8a] mb-2 tracking-widest">
                    STATUS
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(STATUS_META).map(([status, meta]) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={statusFilter.includes(status)}
                          onChange={() =>
                            toggleFilter(status, setStatusFilter, statusFilter)
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Filter */}
              {(view === "all" || view === "tasks") && (
                <div>
                  <h4 className="text-xs font-mono text-[#8a8a8a] mb-2 tracking-widest">
                    TAG
                  </h4>
                  <div className="space-y-2">
                    {TAG_LIST.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tagFilter.includes(tag)}
                          onChange={() =>
                            toggleFilter(tag, setTagFilter, tagFilter)
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: TAG_COLOR[tag].bg,
                            color: TAG_COLOR[tag].text,
                          }}
                        >
                          {tag}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Filter */}
              {(view === "all" || view === "projects") && (
                <div>
                  <h4 className="text-xs font-mono text-[#8a8a8a] mb-2 tracking-widest">
                    STAGE
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(STAGE_META).map(([stage, meta]) => (
                      <label key={stage} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stageFilter.includes(stage)}
                          onChange={() =>
                            toggleFilter(stage, setStageFilter, stageFilter)
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#8a8a8a] text-lg mb-4">
                  {query ? "No results found" : "Start searching or browse all items"}
                </p>
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-sm text-[#f472b6] hover:text-[#f8a0d4] transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[#8a8a8a] mb-4">
                  Found {results.length} result{results.length !== 1 ? "s" : ""}
                </p>

                {results.map((result, idx) => (
                  <div key={`${result.type}-${result.data.id}`}>
                    {result.type === "task" ? (
                      <TaskSearchResult task={result.data as Task} />
                    ) : (
                      <ProjectSearchResult project={result.data as Project} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function TaskSearchResult({ task }: { task: Task }) {
  const status = STATUS_META[task.status];
  const priority = PRIORITY_COLOR[task.priority];
  const tag = TAG_COLOR[task.tag];
  const daysUntilDue = dueDateDiff(task.dueDate);
  const isOverdue = daysUntilDue < 0 && !task.done;

  return (
    <Link href={task.projectId ? `/project-management/${task.projectId}` : "#"}>
      <div
        className="p-4 rounded-lg border border-[#2a2d35] hover:border-opacity-100 transition-all duration-300 cursor-pointer"
        style={{
          background: `linear-gradient(90deg, ${status.color}05 0%, transparent 100%)`,
          borderColor: `${status.color}33`,
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <input
                type="checkbox"
                checked={task.done}
                readOnly
                className="w-4 h-4 rounded cursor-pointer"
              />
              <h3
                className={`font-semibold transition-all ${
                  task.done
                    ? "line-through text-[#6b7280]"
                    : "text-bright"
                }`}
              >
                {task.title}
              </h3>
            </div>
            {task.notes && (
              <p className="text-xs text-[#8a8a8a] mb-2 truncate">{task.notes}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: status.bg,
                  color: status.color,
                  border: `1px solid ${status.border}`,
                }}
              >
                {status.icon} {status.label}
              </span>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: tag.bg,
                  color: tag.text,
                }}
              >
                {task.tag}
              </span>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: priority + "20",
                  color: priority,
                }}
              >
                {task.priority} Priority
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className={`text-sm font-semibold px-3 py-1 rounded ${
                isOverdue ? "bg-[#f87171]/20 text-[#f87171]" : "text-[#8a8a8a]"
              }`}
            >
              {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : fmtDate(task.dueDate)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProjectSearchResult({ project }: { project: Project }) {
  const stage = STAGE_META[project.stage];
  const taskCount = project.tasks?.length ?? 0;
  const completedCount = project.tasks?.filter((t) => t.done).length ?? 0;
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <Link href={`/project-management/${project.id}`}>
      <div
        className="p-5 rounded-lg border border-[#2a2d35] hover:border-opacity-100 transition-all duration-300 cursor-pointer"
        style={{
          background: `linear-gradient(90deg, ${project.color}05 0%, transparent 100%)`,
          borderColor: `${project.color}33`,
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-bright mb-1">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-[#8a8a8a] mb-2 truncate">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs px-2 py-1 rounded font-mono tracking-widest"
                style={{
                  background: stage.bg,
                  color: stage.color,
                  border: `1px solid ${stage.color}44`,
                }}
              >
                {stage.icon} {stage.label.toUpperCase()}
              </span>
              {project.category && (
                <span className="text-xs px-2 py-1 rounded bg-[#1a1d24] text-[#8a8a8a] border border-[#2a2d35]">
                  {project.category}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-xl font-bold mb-1"
              style={{ color: project.color }}
            >
              {progress}%
            </div>
            <div className="text-xs text-[#8a8a8a]">
              {completedCount}/{taskCount} tasks
            </div>
          </div>
        </div>
        <div className="w-full bg-[#1a1d24] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: project.color,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
