"use client";
import { useState } from "react";
import { SubCard, Topic } from "@/utilities/constants";
import { fmtDate } from "@/utilities/functions";
import { ColorPicker } from "@/utilities/elements";

// ── Sub Card ──────────────────────────────────────────
export function SubCardItem({ sub, color, onEdit, onDelete }: {
  sub: SubCard; color: string;
  onEdit: (s: SubCard) => void; onDelete: (s: SubCard) => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative rounded-xl p-4 border transition-all duration-200"
      style={{
        background: hov ? "#1e2128" : "#16181d",
        borderColor: hov ? color + "55" : "#2a2d35",
        boxShadow: hov ? `0 4px 20px ${color}18` : "none",
      }}
    >
      {/* Left accent */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
        style={{ background: color + "88" }} />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h4 className="font-mono text-[13px] text-[#e8e3d5] font-semibold leading-tight flex-1">{sub.title}</h4>
          {/* Actions */}
          <div className={`flex gap-1 transition-opacity duration-150 ${hov ? "opacity-100" : "opacity-0"}`}>
            <button onClick={() => onEdit(sub)}
              className="w-6 h-6 rounded-md flex items-center justify-center bg-transparent border border-[#2a2d35] cursor-pointer text-[#6b7280] hover:text-[#e8e3d5] hover:border-[#374151] transition-all text-xs">
              ✎
            </button>
            <button onClick={() => onDelete(sub)}
              className="w-6 h-6 rounded-md flex items-center justify-center bg-transparent border border-[#2a2d35] cursor-pointer text-[#6b7280] hover:text-[#f87171] hover:border-[#f87171] transition-all text-xs">
              ✕
            </button>
          </div>
        </div>
        <p className="font-mono text-[11px] text-[#6b7280] leading-relaxed mb-2.5 whitespace-pre-wrap">{sub.description}</p>
        <span className="font-mono text-[9px] text-[#374151] tracking-widest">{fmtDate(sub.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Topic Card ────────────────────────────────────────
export function TopicCard({ topic, onEditTopic, onDeleteTopic, onAddSub, onEditSub, onDeleteSub }: {
  topic: Topic;
  onEditTopic: (t: Topic) => void;
  onDeleteTopic: (t: Topic) => void;
  onAddSub: (topicId: string) => void;
  onEditSub: (s: SubCard) => void;
  onDeleteSub: (s: SubCard) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden border border-[#2a2d35] shadow-lg">
      {/* Topic header */}
      <div className="relative p-5 sm:p-6" style={{ background: topic.coverColor + "22" }}>
        {/* Top color bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: topic.coverColor }} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Category badge */}
            <span className="inline-block font-mono text-[9px] tracking-widest px-2.5 py-1 rounded-full mb-2.5 border"
              style={{ color: topic.coverColor, borderColor: topic.coverColor + "66", background: topic.coverColor + "18" }}>
              {topic.category.toUpperCase()}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e8e3d5] leading-tight mb-1.5"
              style={{ fontFamily: "'Playfair Display', serif" }}>{topic.title}</h2>
            <p className="font-mono text-[11px] text-[#6b7280] leading-relaxed mb-3 line-clamp-2">{topic.description}</p>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: topic.coverColor }} />
                <span className="font-mono text-[10px] text-[#4b5563]">{fmtDate(topic.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-[#4b5563]">
                  {topic.subCards.length} {topic.subCards.length === 1 ? "card" : "cards"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-1.5 shrink-0 items-end">
            <div className="flex gap-1">
              <button onClick={() => onEditTopic(topic)}
                className="font-mono text-[9px] px-2.5 py-1.5 rounded-lg border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer hover:border-[#a78bfa] hover:text-[#a78bfa] transition-all tracking-widest">
                EDIT
              </button>
              <button onClick={() => onDeleteTopic(topic)}
                className="font-mono text-[9px] px-2.5 py-1.5 rounded-lg border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer hover:border-[#f87171] hover:text-[#f87171] transition-all tracking-widest">
                DEL
              </button>
            </div>
            <button onClick={() => setExpanded(e => !e)}
              className="font-mono text-[9px] px-2.5 py-1.5 rounded-lg border border-[#2a2d35] bg-transparent text-[#4b5563] cursor-pointer hover:text-[#9ca3af] transition-colors tracking-widest">
              {expanded ? "COLLAPSE ↑" : "EXPAND ↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Sub cards area */}
      {expanded && (
        <div className="bg-[#111214] p-4 sm:p-5">
          {topic.subCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
              {topic.subCards.map(sub => (
                <SubCardItem
                  key={sub.id} sub={sub} color={topic.coverColor}
                  onEdit={onEditSub} onDelete={onDeleteSub}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 mb-4">
              <p className="font-mono text-[11px] text-[#2a2d35]">No cards yet — add one below.</p>
            </div>
          )}
          <button
            onClick={() => onAddSub(topic.id)}
            className="flex items-center gap-2 font-mono text-[10px] tracking-widest px-3 py-2 rounded-lg border border-dashed cursor-pointer transition-all"
            style={{ borderColor: topic.coverColor + "55", color: topic.coverColor + "cc" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = topic.coverColor + "18";
              (e.currentTarget as HTMLButtonElement).style.borderColor = topic.coverColor;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = topic.coverColor + "55";
            }}
          >
            <span>+</span> ADD CARD
          </button>
        </div>
      )}
    </div>
  );
}