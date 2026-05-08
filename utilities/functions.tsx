import { useState } from "react";
import { Task, TODAY } from "./constants";
// ── Progress calculation ──────────────────────────────
export function calcProgress(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);
}
// ── Date formatting ─────────────────────────────────
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toInput(iso?: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

export function toInputDate(iso: string) {
  return iso.slice(0, 10);
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dueDateDiff(iso: string) {
  const due = new Date(iso); due.setHours(0,0,0,0);
  return Math.round((due.getTime()-TODAY.getTime())/86400000);
}
export function toYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
export function isoToYMD(iso: string): string { return toYMD(new Date(iso)); }

// ── Markdown-lite renderer ────────────────────────────
export function MentorText({ text, color }: { text: string; color: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith("### ")) return <p key={i} className="font-mono text-[13px] font-bold text-[#e8e3d5] mt-3">{line.slice(4)}</p>;
        if (line.startsWith("## "))  return <p key={i} className="font-mono text-[14px] font-bold text-[#e8e3d5] mt-3">{line.slice(3)}</p>;
        if (line.startsWith("# "))   return <p key={i} className="font-mono text-[15px] font-bold text-[#e8e3d5] mt-3" style={{ color }}>{line.slice(2)}</p>;
        if (line.startsWith("---"))  return <div key={i} className="h-px bg-[#1e2128] my-2" />;
        if (line.match(/^\d+\./))    return <div key={i} className="flex gap-2 items-start"><span className="font-mono text-[10px] mt-0.5 shrink-0" style={{ color }}>{line.split(".")[0]}.</span><p className="font-mono text-xs text-[#9ca3af] leading-relaxed flex-1">{renderInline(line.split(".").slice(1).join(".").trim(), color)}</p></div>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} className="flex gap-2 items-start"><span style={{ color }} className="shrink-0 text-xs mt-0.5">▸</span><p className="font-mono text-xs text-[#9ca3af] leading-relaxed flex-1">{renderInline(line.slice(2), color)}</p></div>;
        return <p key={i} className="font-mono text-xs text-[#9ca3af] leading-relaxed">{renderInline(line, color)}</p>;
      })}
    </div>
  );
}

export function renderInline(text: string, color: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold" style={{ color }}>{p.slice(2,-2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))   return <code key={i} className="bg-[#1a1d24] px-1.5 py-0.5 rounded text-[10px]" style={{ color }}>{p.slice(1,-1)}</code>;
    return p;
  });
}

// ── Typing dots ───────────────────────────────────────
export function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0,1,2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: color, animationDelay: `${i*0.15}s` }} />
      ))}
    </div>
  );
}

// ── Voice / TTS ───────────────────────────────────────
export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US"; utt.rate = 0.85; utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }
  function stop() { window.speechSynthesis.cancel(); setSpeaking(false); }
  return { speak, stop, speaking };
}