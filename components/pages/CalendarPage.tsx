"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRIORITY_COLOR, Task, TODAY } from "@/utilities/constants";
import { TaskModal } from "@/utilities/modal";
import { isoToYMD, toYMD } from "@/utilities/functions";
import { DayCell } from "@/utilities/elements";

// ── Calendar Page ─────────────────────────────────────
export default function CalendarPage({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [tasks, setTasks]               = useState<Task[]>(initialTasks);
  const [view,  setView]                = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [priorityFilter, setPriorityFilter] = useState<"All"|"High"|"Medium"|"Low">("All");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const yr = view.getFullYear();
  const mo = view.getMonth();

  const filtered = tasks.filter(t => priorityFilter === "All" || t.priority === priorityFilter);

  const tasksByDay = new Map<string, Task[]>();
  filtered.forEach(t => {
    const k = isoToYMD(t.dueDate);
    if (!tasksByDay.has(k)) tasksByDay.set(k, []);
    tasksByDay.get(k)!.push(t);
  });

  const firstDay = new Date(yr, mo, 1).getDay();
  const cells: Date[] = Array.from({ length: 42 }, (_, i) => new Date(yr, mo, 1 - firstDay + i));

  const allMonthTasks = tasks.filter(t => {
    const d = new Date(t.dueDate);
    return d.getFullYear() === yr && d.getMonth() === mo;
  });
  const monthDone    = allMonthTasks.filter(t => t.done).length;
  const monthPending = allMonthTasks.length - monthDone;

  function handleUpdate(id: string, updated: Task) {
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    // Sync selectedTask if still open
    setSelectedTask(prev => prev?.id === id ? updated : prev);
  }

  function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function handleTaskClick(task: Task) {
    // Find latest version from state
    const latest = tasks.find(t => t.id === task.id) ?? task;
    setSelectedTask(latest);
  }

  return (
    <div className="min-h-screen bg-[#111214] px-3 py-5 sm:px-7 sm:py-7"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <div className="font-mono text-[10px] text-[#374151] tracking-widest mb-1.5">CALENDAR</div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#e8e3d5] leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {view.toLocaleString("default", { month: "long" })}
            </h1>
            <span className="font-mono text-xl text-[#2a2d35]">{yr}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Month stats */}
          <div className="flex gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 bg-[#16181d] rounded-xl border border-[#1e2128]">
            {[
              { label: "TOTAL",   val: allMonthTasks.length, color: "#6b7280" },
              { label: "PENDING", val: monthPending,         color: "#fbbf24" },
              { label: "DONE",    val: monthDone,            color: "#a3c47a" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <div className="font-mono text-lg sm:text-2xl font-semibold leading-none" style={{ color }}>{val}</div>
                <div className="font-mono text-[9px] text-[#374151] tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex gap-1 bg-[#16181d] rounded-full p-1">
            {(["All","High","Medium","Low"] as const).map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className="flex items-center gap-1 font-mono text-[10px] px-2.5 sm:px-3 py-1.5 rounded-full border-none cursor-pointer tracking-wide transition-all duration-150"
                style={{
                  background: priorityFilter === p ? (p === "All" ? "#2a2d35" : PRIORITY_COLOR[p]) : "transparent",
                  color: priorityFilter === p ? (p === "All" ? "#e8e3d5" : "#111") : "#4b5563",
                }}>
                {p !== "All" && <span className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: priorityFilter === p ? "#11111166" : PRIORITY_COLOR[p] }} />}
                {p}
              </button>
            ))}
          </div>

          {/* Month nav */}
          <div className="flex gap-1.5">
            <button onClick={() => setView(new Date(yr, mo-1, 1))}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#1e2128] bg-[#16181d] cursor-pointer text-[#6b7280] text-lg flex items-center justify-center hover:text-[#9ca3af] transition-colors">‹</button>
            <button onClick={() => setView(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg border border-[#1e2128] bg-[#16181d] cursor-pointer font-mono text-[10px] text-[#6b7280] hover:text-[#9ca3af] transition-colors">TODAY</button>
            <button onClick={() => setView(new Date(yr, mo+1, 1))}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#1e2128] bg-[#16181d] cursor-pointer text-[#6b7280] text-lg flex items-center justify-center hover:text-[#9ca3af] transition-colors">›</button>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center font-mono text-[8px] sm:text-[9px] text-[#2a2d35] py-1 tracking-widest">
            <span className="hidden sm:inline">{d.toUpperCase()}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((day, i) => (
          <DayCell
            key={i} day={day}
            tasks={tasksByDay.get(toYMD(day)) ?? []}
            isToday={toYMD(day) === toYMD(TODAY)}
            isCurrentMonth={day.getMonth() === mo}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-4 flex-wrap">
          {(["High","Medium","Low"] as const).map(p => (
            <div key={p} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLOR[p], boxShadow: p==="High" ? `0 0 5px ${PRIORITY_COLOR[p]}` : "none" }} />
              <span className="font-mono text-[10px] text-[#374151]">{p}</span>
            </div>
          ))}
        </div>
        <div className="font-mono text-[10px] text-[#2a2d35]">Click any task card to edit</div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}