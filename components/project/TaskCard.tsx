import { PRIORITY_COLOR, TAG_COLOR, Task } from "@/utilities/constants";
import { useState } from "react";

// ── Task Card (calendar cell) ─────────────────────────
export default function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const tag = TAG_COLOR[task.tag];
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${task.title} · ${task.tag} · ${task.priority}\nClick to edit`}
      className="flex items-center gap-1 px-1.5 py-1 rounded-md cursor-pointer transition-all duration-150 mb-0.5 overflow-hidden"
      style={{
        background: hov ? "#1e2128" : "#16181d",
        border: `1px solid ${hov ? tag.text+"55" : "#1e2128"}`,
        transform: hov ? "translateX(2px)" : "none",
        boxShadow: hov ? `0 2px 10px ${tag.text}18` : "none",
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: task.done ? "#2a2d35" : PRIORITY_COLOR[task.priority],
          boxShadow: !task.done && task.priority === "High" ? `0 0 5px ${PRIORITY_COLOR.High}` : "none",
        }} />
      <span className="flex-1 font-sans text-[11px] truncate leading-snug min-w-0"
        style={{
          color: task.done ? "#2a2d35" : "#c9c4b8",
          textDecoration: task.done ? "line-through" : "none",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>{task.title}</span>
      <span className="font-mono text-[9px] px-1 py-px rounded-full shrink-0 hidden sm:inline"
        style={{ background: task.done ? "#1a1d24" : tag.bg, color: task.done ? "#2a2d35" : tag.text }}>
        {task.tag}
      </span>
    </div>
  );
}