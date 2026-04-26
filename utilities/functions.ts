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