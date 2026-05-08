"use client";

import { Skill, Level, LEVEL_META, SKILL_META } from "@/utilities/constants";
import { ProgressTracker } from "@/utilities/elements";
import { useState } from "react";
import SkillPanel from "../english/SkillPanel";

// ── Main Page ─────────────────────────────────────────
export default function EnglishPage() {
  const [activeSkill, setActiveSkill] = useState<Skill>("listening");
  const [level,       setLevel]       = useState<Level>("intermediate");
  const [sessions,    setSessions]    = useState<Record<Skill, number>>({
    listening: 0, reading: 0, speaking: 0, writing: 0,
  });
  const [skillKey, setSkillKey] = useState(0); // force remount on skill change

  const skills: Skill[] = ["listening", "reading", "speaking", "writing"];

  function switchSkill(s: Skill) {
    setActiveSkill(s);
    setSessions(prev => ({ ...prev, [s]: prev[s] + 1 }));
    setSkillKey(k => k + 1);
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .panel-in { animation: fadeUp 0.3s ease; }
      `}</style>

      <div className="min-h-screen bg-[#111214] px-4 py-6 sm:px-7 sm:py-8 mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">WORKSPACE</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#e8e3d5] leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}>Learn English</h1>
            <p className="font-mono text-[11px] text-[#4b5563] mt-1.5">
              AI mentor · 4 skills · listening, reading, speaking & writing
            </p>
          </div>

          {/* Level selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-[#374151] tracking-widest">LEVEL:</span>
            <div className="flex gap-1 bg-[#16181d] rounded-xl p-1 border border-[#1e2128]">
              {(Object.entries(LEVEL_META) as [Level, typeof LEVEL_META[Level]][]).map(([k, m]) => (
                <button key={k} onClick={() => setLevel(k)}
                  className="font-mono text-[9px] sm:text-[10px] px-2 sm:px-3 py-1.5 rounded-lg border-none cursor-pointer tracking-wide transition-all"
                  style={{ background: level === k ? m.color : "transparent", color: level === k ? "#111" : "#4b5563" }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session counter */}
        <div className="mb-5">
          <ProgressTracker sessions={sessions} />
        </div>

        {/* Skill tabs */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {skills.map(s => {
            const m = SKILL_META[s];
            const active = activeSkill === s;
            return (
              <button key={s} onClick={() => switchSkill(s)}
                className="relative py-3 rounded-xl border-none cursor-pointer transition-all duration-200 flex flex-col items-center gap-1.5 overflow-hidden"
                style={{
                  background: active ? m.color + "22" : "#16181d",
                  outline:    active ? `1.5px solid ${m.color}88` : "1px solid #1e2128",
                }}>
                {active && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: m.color }} />}
                <span className="text-xl">{m.icon}</span>
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold"
                  style={{ color: active ? m.color : "#4b5563" }}>
                  {m.label.toUpperCase()}
                </span>
                <span className="font-mono text-[8px] text-[#374151] hidden sm:block px-2 text-center leading-tight">{m.desc.slice(0, 35)}…</span>
              </button>
            );
          })}
        </div>

        {/* Active skill description */}
        <div className="mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{SKILL_META[activeSkill].icon}</span>
            <span className="font-mono text-[11px] text-[#6b7280]">{SKILL_META[activeSkill].desc}</span>
            <div className="h-px flex-1 bg-[#1e2128]" />
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: LEVEL_META[level].color + "22", color: LEVEL_META[level].color }}>
              {LEVEL_META[level].label} · {LEVEL_META[level].cefr}
            </span>
          </div>
        </div>

        {/* Skill panel */}
        <div className="bg-[#16181d] rounded-2xl p-5 sm:p-6 border panel-in"
          style={{ borderColor: SKILL_META[activeSkill].color + "33", minHeight: "500px" }}
          key={`${activeSkill}-${skillKey}`}>
          <SkillPanel skill={activeSkill} level={level} />
        </div>

        {/* Footer tips */}
        <div className="mt-5 flex items-center gap-4 flex-wrap px-1">
          <span className="font-mono text-[9px] text-[#2a2d35] tracking-widest">TIPS</span>
          <span className="font-mono text-[10px] text-[#374151]">Practice at least 15 min/day</span>
          <span className="font-mono text-[10px] text-[#374151]">·</span>
          <span className="font-mono text-[10px] text-[#374151]">Speaking: type as if speaking naturally</span>
          <span className="font-mono text-[10px] text-[#374151]">·</span>
          <span className="font-mono text-[10px] text-[#374151]">Ask the mentor to explain any feedback</span>
        </div>
      </div>
    </>
  );
}