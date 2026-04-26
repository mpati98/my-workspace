"use client";
import { useState, useEffect, useTransition } from "react";
import { Project, STAGE_META, Task, TODAY } from "@/utilities/constants";
import { useRouter }      from "next/navigation";
import Link               from "next/link";
import { AddTaskModal, StatusModal } from "@/utilities/modal";
import { fmtDate } from "@/utilities/functions";
import { MiniCalendar, ProgressBar, StatusStrip, TaskRow } from "@/utilities/elements";

// ── Main Project Detail Page ──────────────────────────
export default function ProjectDetailPage({ project: initialProject, allProjects }: {
  project: Project & { tasks: Task[] };
  allProjects: { id: string; name: string; color: string }[];
}) {
  // Guard against undefined project during build/prerender
  if (!initialProject) {
    return <div>Loading...</div>;
  }

  const router = useRouter();
  const [tasks,        setTasks]        = useState<Task[]>(initialProject.tasks);
  const [project,      setProject]      = useState(initialProject);
  const [statusFilter, setStatusFilter] = useState<"All"|"Pending"|"Done">("All");
  const [selectedKey,  setSelectedKey]  = useState<string|null>(null);
  const [selectedLbl,  setSelectedLbl]  = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [showDateRange,setShowDateRange]= useState(false);
  const [showAdd,      setShowAdd]      = useState(false);
  const [statusTask,   setStatusTask]   = useState<Task|null>(null);
  const [, startTransition] = useTransition();

  const sm = STAGE_META[project.stage];
  const pct = tasks.length > 0 ? Math.round(tasks.filter(t=>t.done).length/tasks.length*100) : 0;
  const doneCount = tasks.filter(t=>t.done).length;
  const pendingCount = tasks.length - doneCount;
  const overdue = tasks.filter(t=>{
    if (t.done) return false;
    const due=new Date(t.dueDate); due.setHours(0,0,0,0); return due<TODAY;
  }).length;

  function dateKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
  function isoToKey(iso: string) { return dateKey(new Date(iso)); }

  const visible = tasks.filter(t => {
    if (statusFilter==="Done"    && !t.done) return false;
    if (statusFilter==="Pending" &&  t.done) return false;
    if (selectedKey && isoToKey(t.dueDate)!==selectedKey) return false;
    if (dateFrom) { const due=new Date(t.dueDate); due.setHours(0,0,0,0); if(due<new Date(dateFrom+"T00:00:00")) return false; }
    if (dateTo)   { const due=new Date(t.dueDate); due.setHours(0,0,0,0); if(due>new Date(dateTo+"T23:59:59")) return false; }
    return true;
  });

  function handleStatusUpdate(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id===id ? {...t,...patch} : t));
  }

  async function handleDelete(id: string) {
    setTasks(prev => prev.filter(t=>t.id!==id));
    try { await fetch("/api/tasks/"+id, { method:"DELETE" }); }
    catch { startTransition(()=>router.refresh()); }
  }

  async function handleAdd(data: any) {
    const res = await fetch("/api/tasks", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...data, projectId:project.id}) });
    if (res.ok) {
      const t: Task = await res.json();
      setTasks(prev => [...prev,t].sort((a,b)=>new Date(a.dueDate).getTime()-new Date(b.dueDate).getTime()));
    }
  }

  return (
    <div className="min-h-screen bg-[#111214] px-4 py-6 sm:px-7 sm:py-8 mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 font-mono text-[10px]">
        <Link href="/projects" className="text-[#4b5563] hover:text-[#60a5fa] transition-colors no-underline">§ PROJECTS</Link>
        <span className="text-[#2a2d35]">›</span>
        <span style={{ color: project.color }}>{project.name}</span>
      </div>

      {/* Project header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <div className="w-3 h-3 rounded-full" style={{ background: project.color, boxShadow:`0 0 8px ${project.color}88` }} />
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full border"
              style={{ color:sm.color, background:sm.color+"22", borderColor:sm.color+"44" }}>
              {sm.icon} {sm.label.toUpperCase()}
            </span>
            {project.category && (
              <span className="font-mono text-[9px] text-[#374151] bg-[#1a1d24] px-2 py-0.5 rounded-full border border-[#2a2d35]">{project.category}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e8e3d5] leading-tight mb-1.5"
            style={{ fontFamily:"'Playfair Display',serif" }}>{project.name}</h1>
          {project.description && (
            <p className="font-mono text-[11px] text-[#6b7280] leading-relaxed mb-2.5 max-w-xl">{project.description}</p>
          )}
          {(project.startDate||project.endDate) && (
            <p className="font-mono text-[10px] text-[#374151]">
              {project.startDate ? fmtDate(project.startDate) : "—"} → {project.endDate ? fmtDate(project.endDate) : "ongoing"}
            </p>
          )}
        </div>

        <button onClick={() => setShowAdd(true)}
          className="self-start border-none cursor-pointer font-mono text-[11px] font-semibold px-4 py-2 rounded-full tracking-widest hover:opacity-90 transition-opacity text-[#111]"
          style={{ background: project.color }}>
          + ADD TASK
        </button>
      </div>

      {/* Progress + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Left: stats + progress */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {[
              { label:"TOTAL",   val:tasks.length, color:"#e8e3d5" },
              { label:"PENDING", val:pendingCount,  color:"#fbbf24" },
              { label:"DONE",    val:doneCount,     color:"#a3c47a" },
              ...(overdue>0 ? [{ label:"OVERDUE", val:overdue, color:"#f87171" }] : []),
            ].map(s => (
              <div key={s.label} className="flex-1 bg-[#16181d] rounded-2xl p-3.5 border border-[#1e2128]">
                <div className="font-mono text-[9px] text-[#4b5563] tracking-widest mb-1">{s.label}</div>
                <div className="font-mono text-2xl sm:text-3xl font-bold leading-none" style={{ color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#16181d] rounded-2xl p-4 border border-[#1e2128]">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] text-[#6b7280] tracking-widest">COMPLETION</span>
              <span className="font-mono text-[12px] font-semibold" style={{ color:project.color }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} color={project.color} />
            <div className="mt-3"><StatusStrip tasks={tasks} /></div>
          </div>
        </div>

        {/* Right: mini calendar */}
        <MiniCalendar tasks={tasks} selectedKey={selectedKey}
          onSelectDate={(k,l)=>{ setSelectedKey(k); setSelectedLbl(l); }} />
      </div>

      {/* Task List */}
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="font-mono text-[10px] tracking-widest" style={{ color:project.color }}>§</span>
          <span className="font-mono text-[11px] text-[#374151] tracking-widest">TASK LIST</span>
          <div className="flex-1 h-px bg-[#1e2128]" />

          {selectedKey && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 border"
              style={{ background:project.color+"18", borderColor:project.color+"44" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:project.color }} />
              <span className="font-mono text-[10px] tracking-wide" style={{ color:project.color }}>DUE {selectedLbl.toUpperCase()}</span>
              <button onClick={()=>{ setSelectedKey(null); setSelectedLbl(""); }}
                className="bg-transparent border-none cursor-pointer text-sm leading-none pl-0.5 hover:opacity-70"
                style={{ color:project.color }}>×</button>
            </div>
          )}

          {(dateFrom||dateTo) && (
            <div className="flex items-center gap-1.5 bg-[#60a5fa18] border border-[#60a5fa44] rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]" />
              <span className="font-mono text-[10px] text-[#60a5fa] tracking-wide">{dateFrom?dateFrom.slice(5):"—"} → {dateTo?dateTo.slice(5):"—"}</span>
              <button onClick={()=>{ setDateFrom(""); setDateTo(""); }} className="bg-transparent border-none text-[#60a5fa] cursor-pointer text-sm leading-none pl-0.5 hover:opacity-70">×</button>
            </div>
          )}

          <button onClick={()=>setShowDateRange(s=>!s)}
            className="font-mono text-[10px] px-3 py-1.5 rounded-full border cursor-pointer tracking-wide transition-all"
            style={{ background:showDateRange?"#60a5fa22":"#1a1d24", borderColor:showDateRange?"#60a5fa66":"#2a2d35", color:showDateRange?"#60a5fa":"#4b5563" }}>
            ⊞ DATE RANGE
          </button>

          <div className="flex gap-1">
            {(["All","Pending","Done"] as const).map(f=>(
              <button key={f} onClick={()=>setStatusFilter(f)}
                className="font-mono text-[10px] px-3 py-1.5 rounded-full border-none cursor-pointer tracking-wide transition-all"
                style={{ background:statusFilter===f?project.color:"#1a1d24", color:statusFilter===f?"#111":"#4b5563" }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Date range panel */}
        {showDateRange && (
          <div className="flex items-center gap-2.5 mb-3 p-3 bg-[#16181d] rounded-xl border border-[#2a2d35] flex-wrap">
            <span className="font-mono text-[10px] text-[#4b5563] tracking-widest shrink-0">DUE DATE RANGE</span>
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-45">
                <span className="font-mono text-[10px] text-[#374151] shrink-0">FROM</span>
                <input type="date" value={dateFrom} max={dateTo||undefined} onChange={e=>setDateFrom(e.target.value)}
                  className="flex-1 bg-[#1a1d24] border border-[#2a2d35] rounded-lg px-3 py-1.5 text-[#e8e3d5] font-mono text-xs outline-none focus:border-[#60a5fa] transition-colors" />
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-45">
                <span className="font-mono text-[10px] text-[#374151] shrink-0">TO</span>
                <input type="date" value={dateTo} min={dateFrom||undefined} onChange={e=>setDateTo(e.target.value)}
                  className="flex-1 bg-[#1a1d24] border border-[#2a2d35] rounded-lg px-3 py-1.5 text-[#e8e3d5] font-mono text-xs outline-none focus:border-[#60a5fa] transition-colors" />
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { label:"Today",     f:()=>new Date().toISOString().slice(0,10), t:()=>new Date().toISOString().slice(0,10) },
                { label:"This week", f:()=>{ const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().slice(0,10); }, t:()=>{ const d=new Date(); d.setDate(d.getDate()+(6-d.getDay())); return d.toISOString().slice(0,10); } },
                { label:"Next 7d",   f:()=>new Date().toISOString().slice(0,10), t:()=>{ const d=new Date(); d.setDate(d.getDate()+7); return d.toISOString().slice(0,10); } },
              ].map(p=>(
                <button key={p.label} onClick={()=>{ setDateFrom(p.f()); setDateTo(p.t()); }}
                  className="font-mono text-[9px] px-2 py-1 rounded-lg border border-[#2a2d35] bg-transparent text-[#4b5563] cursor-pointer hover:border-[#60a5fa] hover:text-[#60a5fa] transition-all">
                  {p.label}
                </button>
              ))}
              {(dateFrom||dateTo) && (
                <button onClick={()=>{ setDateFrom(""); setDateTo(""); }}
                  className="font-mono text-[9px] px-2 py-1 rounded-lg border border-[#f8717133] bg-[#f8717118] text-[#f87171] cursor-pointer">
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-[#16181d] rounded-2xl overflow-hidden border border-[#1e2128]">
          <div className="hidden sm:flex gap-2.5 px-4 py-2.5 border-b border-[#1e2128]">
            <span className="font-mono text-[10px] text-[#374151] tracking-widest w-20.5">STATUS</span>
            <span className="font-mono text-[10px] text-[#374151] tracking-widest flex-1">TASK</span>
            <span className="font-mono text-[10px] text-[#374151] tracking-widest w-32">DATE</span>
            <span className="font-mono text-[10px] text-[#374151] tracking-widest w-20">TAG</span>
            <span className="w-2" />
          </div>
          {visible.length > 0
            ? visible.map(task => (
                <TaskRow key={task.id} task={task}
                  onOpenStatus={t=>setStatusTask(t)} onDelete={handleDelete} />
              ))
            : (
              <div className="py-12 text-center font-mono text-xs text-[#374151]">
                {selectedKey ? `No tasks due on ${selectedLbl}.` : (dateFrom||dateTo) ? "No tasks in that date range." : tasks.length===0 ? "No tasks yet — add one above." : "No tasks match."}
              </div>
            )
          }
        </div>
      </div>

      {showAdd && (
        <AddTaskModal onClose={()=>setShowAdd(false)} onAdd={handleAdd}
          projectId={project.id} projectName={project.name} accentColor={project.color} />
      )}
      {statusTask && (
        <StatusModal task={statusTask} onClose={()=>setStatusTask(null)} onUpdate={handleStatusUpdate} />
      )}
    </div>
  );
}
