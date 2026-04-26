// Navbar
export const LINKS = [
  { 
    href: "/",
    label: "§ HOME",
    color: "#EDD69C",
    page: "Home"
},
  { 
    href: "/calendar",   
    label: "§ CALENDAR",   
    color: "#60a5fa", 
    page: "Calendar"
  },
  { 
    href: "/project-management",         
    label: "§ PROJECT MANAGEMENT",    
    color: "#a3c47a", 
    page: "Project Management"
  },
  { 
    href: "/library",  
    label: "§ LIBRARY",  
    color: "#c9a96e", 
    page: "Library"
  },
  { 
    href: "/search",      
    label: "§ SEARCH",      
    color: "#f472b6", 
    page: "Search"
  },
];
// Task and Project types
export type TaskStatus = "waiting" | "processing" | "on_time" | "over_due";
export type Task = {
  id: string;
  projectId?: string | null;
  title: string;
  tag: "Adhoc" | "Event" | "Data" | "Learning";
  priority: "High" | "Medium" | "Low";
  status: TaskStatus;
  notes: string | null;
  done: boolean;
  dueDate: string;
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export const TAG_LIST      = ["Adhoc", "Event", "Data", "Learning"] as const;
export const TAG_COLOR: Record<string, { bg: string; text: string }> = {
  Adhoc:     { bg: "#c084fc18", text: "#c084fc" },
  Event:        { bg: "#38bdf818", text: "#38bdf8" },
  Data: { bg: "#f472b618", text: "#f472b6" },
  Learning: { bg: "#f472b618", text: "#f472b6" },
};

export const PRIORITY_LIST = ["High", "Medium", "Low"] as const;
export const PRIORITY_COLOR: Record<string, string> = {
  High: "#f87171",
  Medium: "#fbbf24",
  Low: "#6ee7b7",
};
export const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
export type ProjectStage = "planning" | "doing" | "running" | "completed";
export const STAGES: ProjectStage[] = ["planning", "doing", "running", "completed"];
export const STAGE_META: Record<ProjectStage, { label: string; color: string; bg: string; icon: string }> = {
  planning:  { label: "Planning",  color: "#7dd3fc", bg: "#7dd3fc18", icon: "◌" },
  doing:     { label: "Doing",     color: "#fbbf24", bg: "#fbbf2418", icon: "◉" },
  running:   { label: "Running",   color: "#a3c47a", bg: "#a3c47a18", icon: "▶" },
  completed: { label: "Completed", color: "#6ee7b7", bg: "#6ee7b718", icon: "✓" },
};
export type Project = {
  id: string; name: string; description: string; category: string;
  stage: ProjectStage; color: string;
  startDate?: string | null; endDate?: string | null;
  createdAt: string; updatedAt: string;
  tasks: Task[];
};

export const COLOR_PRESETS = [
  "#60a5fa","#a3c47a","#f472b6","#fbbf24","#a78bfa",
  "#34d399","#f87171","#c084fc","#7dd3fc","#fb923c",
  "#e879f9","#4ade80",
];

export const STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  waiting:    { label: "Waiting",    color: "#6b7280", bg: "#6b728018", border: "#6b728044", icon: "◌" },
  processing: { label: "Processing", color: "#7dd3fc", bg: "#7dd3fc18", border: "#7dd3fc44", icon: "◉" },
  on_time:    { label: "On Time",    color: "#a3c47a", bg: "#a3c47a18", border: "#a3c47a44", icon: "✓" },
  over_due:   { label: "Overdue",    color: "#f87171", bg: "#f8717118", border: "#f8717144", icon: "⚠" },
};

export type TaskForm = {
  title: string;
  tag: string;
  priority: string;
  dueDate: string;
  notes: string;
  projectId?: string | null;
};

export type Props = {
  onClose: () => void;
  onAdd: (t: TaskForm) => Promise<void>;
  /** Pre-bind a project — hides the projectId from the UI */
  projectId?: string;
  /** Accent color for the header label (defaults to sage green) */
  accentColor?: string;
  /** Optional label shown above the modal title */
  projectName?: string;
};

// ── Design tokens ───────────────────────────────────
export const CREAM = "#f5f0e8";
export const INK = "#1a1612";
export const SEPIA = "#7a6a56";
export const GOLD  = "#c9a96e";
export const RED = "#c0392b";
export const LIGHT = "#F5E9D8";

// ── Shared input style ────────────────────────────────
export const INP = "w-full bg-[#1e2128] border border-[#1e2128] rounded-sm px-3 py-2.5 text-[#e8e3d5] outline-none font-[Cormorant_Garant,serif] text-[15px] focus:border-[#a3c47a] transition-colors";
export const INP_MONO = "w-full bg-[#1e2128] border border-[#1e2128] rounded-sm px-3 py-2.5 text-[#e8e3d5] outline-none font-[Courier_Prime,monospace] text-xs focus:border-[#a3c47a] transition-colors";
export const TEXTAREA = `w-full bg-[#1a1d24] border border-[#2a2d35] rounded-lg px-3 py-2.5
  text-[#e8e3d5] font-mono text-xs outline-none focus:border-[#a78bfa] transition-colors
  placeholder:text-[#4b5563] resize-y leading-relaxed`;
export const TODAY = new Date(); TODAY.setHours(0,0,0,0);

// Collection Page
export type SubCard = {
  id: string; title: string; description: string;
  createdAt: string; updatedAt: string; topicId: string;
};
export type Topic = {
  id: string; title: string; category: string; description: string;
  coverColor: string; createdAt: string; updatedAt: string;
  subCards: SubCard[];
};

export const COVER_PRESETS = [
  "#4a6fa5","#2d6a4f","#6d3b8e","#b5451b",
  "#1a6b7c","#7a4f2d","#3d5a80","#5c4a72",
  "#2e6b4a","#8e3b5a","#4a5568","#6b5a2e",
];

export const CATEGORIES = ["Research","Design","Development","Strategy","Personal","Other"];

