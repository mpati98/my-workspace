import { useState, useEffect } from "react";
import { COLOR_PRESETS, PRIORITY_COLOR, PRIORITY_ORDER, Skill, SKILL_META, STATUS_META, TAG_COLOR, Task, TaskStatus, TODAY } from "./constants";
import { dueDateDiff, fmtDate } from "./functions";
import TaskCard from "@/components/project/TaskCard";


// ── AnimatedBar ───────────────────────────────────────
export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="bg-[#1e2128] rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: w + "%",
          background: color,
          boxShadow: `0 0 8px ${color}55`,
        }}
      />
    </div>
  );
}

// ── Color picker ──────────────────────────────────────
export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {COLOR_PRESETS.map((c) => (
        <div
          key={c}
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-md cursor-pointer transition-all"
          style={{
            background: c,
            outline:
              value === c ? "2.5px solid #e8e3d5" : "2px solid transparent",
            outlineOffset: 2,
          }}
        />
      ))}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────
export function StatusBadge({ status }: { status: TaskStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}
    >
      <span>{m.icon}</span>
      {m.label.toUpperCase()}
    </span>
  );
}
// ── Status strip ──────────────────────────────────────
export function StatusStrip({ tasks }: { tasks: Task[] }) {
  const counts: Record<TaskStatus,number> = { waiting:0, processing:0, on_time:0, over_due:0 };
  tasks.forEach(t => { counts[t.status]=(counts[t.status]??0)+1; });
  return (
    <div className="flex gap-2 flex-wrap">
      {(["over_due","processing","waiting","on_time"] as TaskStatus[]).map(s=>{
        const m=STATUS_META[s];
        return (
          <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ background:m.bg, borderColor:m.border }}>
            <span className="font-mono text-[10px]" style={{ color:m.color }}>{m.icon}</span>
            <span className="font-mono text-[10px] font-semibold" style={{ color:m.color }}>{counts[s]}</span>
            <span className="font-mono text-[9px] text-[#4b5563]">{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Mini Calendar ─────────────────────────────────────
export function MiniCalendar({ tasks, selectedKey, onSelectDate }: {
  tasks: Task[]; selectedKey: string | null;
  onSelectDate: (k: string | null, l: string) => void;
}) {
  function dateKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
  const [view, setView] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const yr = view.getFullYear(); const mo = view.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const dim = new Date(yr, mo+1, 0).getDate();

  const pending = new Map<string, number>(); const done = new Map<string, number>();
  tasks.forEach(t => {
    const d = new Date(t.dueDate); if (d.getFullYear()!==yr||d.getMonth()!==mo) return;
    const k = dateKey(d);
    if (t.done) done.set(k,(done.get(k)??0)+1); else pending.set(k,(pending.get(k)??0)+1);
  });

  const cells = [...Array(firstDay).fill(null),...Array.from({length:dim},(_,i)=>i+1)];
  return (
    <div className="bg-[#16181d] rounded-2xl p-4 h-full border border-[#1e2128]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={()=>setView(new Date(yr,mo-1,1))} className="bg-transparent border-none text-[#6b7280] cursor-pointer text-lg px-2 hover:text-[#9ca3af]">‹</button>
        <span className="font-mono text-[12px] text-[#e8e3d5] tracking-widest">{view.toLocaleString("default",{month:"long"}).toUpperCase()} {yr}</span>
        <button onClick={()=>setView(new Date(yr,mo+1,1))} className="bg-transparent border-none text-[#6b7280] cursor-pointer text-lg px-2 hover:text-[#9ca3af]">›</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} className="text-center font-mono text-[9px] text-[#4b5563] pb-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d,i)=>{
          if (d===null) return <div key={i}/>;
          const k=`${yr}-${mo}-${d}`;
          const hasPending=pending.has(k); const hasDone=done.has(k); const hasAny=hasPending||hasDone;
          const isToday=d===TODAY.getDate()&&mo===TODAY.getMonth()&&yr===TODAY.getFullYear();
          const isSel=selectedKey===k;
          return (
            <div key={i} onClick={()=>{ if (!hasAny) return; if(isSel){onSelectDate(null,"");return;} const lbl=new Date(yr,mo,d).toLocaleDateString("en-US",{month:"short",day:"numeric"}); onSelectDate(k,lbl); }}
              className="text-center py-1.5 rounded-lg transition-colors duration-150"
              style={{ cursor:hasAny?"pointer":"default", background:isSel?"#a3c47a":isToday?"#a3c47a1a":hasAny?"#ffffff08":"transparent" }}>
              <span className="block font-mono text-xs leading-none" style={{ color:isSel?"#111":isToday?"#a3c47a":hasAny?"#e8e3d5":"#4b5563", fontWeight:isSel||isToday?600:400 }}>{d}</span>
              {hasAny&&!isSel&&(<div className="flex justify-center gap-0.5 mt-0.5">{hasPending&&<div className="w-1 h-1 rounded-full bg-[#fbbf24]"/>}{hasDone&&<div className="w-1 h-1 rounded-full bg-[#6ee7b7]"/>}</div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Task Row ──────────────────────────────────────────
export function TaskRow({ task, onOpenStatus, onDelete }: {
  task: Task; onOpenStatus: (t: Task) => void; onDelete: (id: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const tag  = TAG_COLOR[task.tag] ?? { bg:"#ffffff10", text:"#9ca3af" };
  const sm   = STATUS_META[task.status];
  const diff = dueDateDiff(task.dueDate);

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-colors duration-150 border-b border-[#1a1d2480] last:border-0"
      style={{ background:hov?"#1a1d24":"transparent" }}>

      <button onClick={()=>onOpenStatus(task)} title="Click to update status"
        className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer font-mono text-[9px] tracking-wide min-w-18 justify-center transition-all"
        style={{ background:sm.bg, borderColor:sm.border, color:sm.color }}>
        <span>{sm.icon}</span>{sm.label.toUpperCase()}
      </button>

      <span className="flex-1 text-sm min-w-0 truncate"
        style={{ color:task.done?"#4b5563":"#c9c4b8", textDecoration:task.done?"line-through":"none", fontFamily:"'IBM Plex Sans',sans-serif" }}>
        {task.title}
      </span>

      {/* Due date / done date */}
      {task.done && task.doneAt ? (
        <span className="font-mono text-[10px] text-[#a3c47a] shrink-0 hidden sm:block">✓ {fmtDate(task.doneAt)}</span>
      ) : (
        <span className="font-mono text-[10px] shrink-0 hidden sm:block"
          style={{ color:diff<=0?"#f87171":diff===1?"#fbbf24":"#374151" }}>
          {diff<0?`${Math.abs(diff)}d overdue`:diff===0?"Due today":diff===1?"Due tomorrow":`Due ${fmtDate(task.dueDate)}`}
        </span>
      )}

      <span className="hidden sm:inline font-mono text-[10px] px-2.5 py-0.5 rounded-full shrink-0"
        style={{ background:tag.bg, color:tag.text }}>{task.tag}</span>
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background:PRIORITY_COLOR[task.priority] }} />
      {task.notes && <span title={task.notes} className="font-mono text-[9px] text-[#4b5563] bg-[#1a1d24] border border-[#2a2d35] px-1.5 py-0.5 rounded-full shrink-0 hidden sm:block cursor-default">✎</span>}

      {hov && (
        <button onClick={()=>onDelete(task.id)} className="bg-transparent border-none text-[#f87171] cursor-pointer text-sm px-0.5 shrink-0 opacity-70 hover:opacity-100 transition-opacity">✕</button>
      )}
    </div>
  );
}

// ── Day Cell ──────────────────────────────────────────
export function DayCell({ day, tasks, isToday, isCurrentMonth, onTaskClick }: {
  day: Date; tasks: Task[]; isToday: boolean;
  isCurrentMonth: boolean; onTaskClick: (task: Task) => void;
}) {
  const sorted = [...tasks].sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const maxVisible = 2;
  const overflow = sorted.length - maxVisible;

  return (
    <div className="flex flex-col rounded-lg p-1.5 sm:p-2.5 min-h-20 sm:min-h-27.5 relative overflow-hidden transition-colors"
      style={{
        background: isToday ? "#15181f" : "#111214",
        border: isToday ? "1px solid #a3c47a44" : "1px solid #1a1d24",
        opacity: isCurrentMonth ? 1 : 0.3,
      }}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
          style={{ background: isToday ? "#a3c47a" : "transparent" }}>
          <span className="font-mono text-[10px] sm:text-[11px] leading-none"
            style={{ color: isToday ? "#111" : isCurrentMonth ? "#9ca3af" : "#2a2d35", fontWeight: isToday ? 700 : 400 }}>
            {day.getDate()}
          </span>
        </div>
        {sorted.length > 0 && (
          <span className="font-mono text-[8px] text-[#2a2d35] bg-[#1a1d24] px-1 py-px rounded-full hidden sm:block">
            {sorted.length}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {sorted.slice(0, maxVisible).map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {overflow > 0 && (
          <div className="font-mono text-[9px] text-[#374151] pl-2 mt-0.5">+{overflow} more</div>
        )}
      </div>

      {isToday && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-t bg-[#a3c47a]"
          style={{ boxShadow: "0 0 8px #a3c47a99" }} />
      )}
    </div>
  );
}

// ── Progress Tracker ──────────────────────────────────
export function ProgressTracker({ sessions }: { sessions: Record<Skill, number> }) {
  const skills: Skill[] = ["listening", "reading", "speaking", "writing"];
  return (
    <div className="grid grid-cols-4 gap-2">
      {skills.map(s => {
        const m = SKILL_META[s];
        const count = sessions[s] ?? 0;
        return (
          <div key={s} className="bg-[#16181d] rounded-xl p-3 border border-[#1e2128] text-center">
            <div className="text-xl mb-1">{m.icon}</div>
            <div className="font-mono text-lg font-bold" style={{ color: m.color }}>{count}</div>
            <div className="font-mono text-[9px] text-[#374151] tracking-widest">{m.label.toUpperCase()}</div>
          </div>
        );
      })}
    </div>
  );
}