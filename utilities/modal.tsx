import { useState } from "react";
import { COLOR_PRESETS, PRIORITY_COLOR, PRIORITY_LIST, Project, ProjectStage, Props, STAGE_META, STAGES, STATUS_META, TAG_COLOR, TAG_LIST, Task, TaskForm, TaskStatus, INP } from "./constants";
import { ColorPicker, StatusBadge } from "./elements";
import { fmtDate, fmtDateTime, toInput, toInputDate } from "./functions";


// ── Project form modal ────────────────────────────────
export function ProjectModal({
  project,
  onClose,
  onSave,
}: {
  project?: Project | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
    category: project?.category ?? "General",
    stage: (project?.stage ?? "planning") as ProjectStage,
    color: project?.color ?? COLOR_PRESETS[0],
    startDate: toInput(project?.startDate),
    endDate: toInput(project?.endDate),
  });
  const [saving, setSaving] = useState(false);

  const inp =
    "w-full bg-[#1a1d24] border border-[#2a2d35] rounded-lg px-3 py-2 text-[#e8e3d5] font-mono text-xs outline-none focus:border-[#60a5fa] transition-colors placeholder:text-[#374151]";

  async function submit() {
    if (!form.name) return;
    setSaving(true);
    await onSave({ ...form });
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#16181d] rounded-2xl w-full max-w-lg my-auto border border-[#2a2d35] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1" style={{ background: form.color }} />
        <div className="p-6 sm:p-7">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-mono text-[11px] tracking-widest text-[#60a5fa]">
              {isEdit ? "EDIT PROJECT" : "NEW PROJECT"}
            </h2>
            <button
              onClick={onClose}
              className="bg-transparent border-none text-[#4b5563] cursor-pointer text-xl hover:text-[#9ca3af]"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[65vh] overflow-y-auto pr-1">
            {/* Name */}
            <div>
              <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                PROJECT NAME *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="My project…"
                className={inp}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                CATEGORY
              </label>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="e.g. Product, Marketing, Engineering…"
                className={inp}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                DESCRIPTION
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="What is this project about?"
                rows={3}
                className={inp + " resize-none leading-relaxed"}
              />
            </div>

            {/* Stage */}
            <div>
              <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                STAGE
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {STAGES.map((s) => {
                  const m = STAGE_META[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setForm((p) => ({ ...p, stage: s }))}
                      className="py-2 rounded-lg border-none cursor-pointer font-mono text-[9px] tracking-widest transition-all"
                      style={{
                        background:
                          form.stage === s ? m.color + "33" : "#1a1d24",
                        color: form.stage === s ? m.color : "#4b5563",
                        outline:
                          form.stage === s
                            ? `1.5px solid ${m.color}88`
                            : "1px solid #2a2d35",
                      }}
                    >
                      {m.icon} {m.label.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                  START DATE
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className={inp}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                  END DATE
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                  className={inp}
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                COLOR
              </label>
              <ColorPicker
                value={form.color}
                onChange={(c) => setForm((p) => ({ ...p, color: c }))}
              />
            </div>

            {/* Existing tasks summary (read-only in modal) */}
            {project && project.tasks.length > 0 && (
              <div>
                <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-2">
                  TASKS{" "}
                  <span className="text-[#374151]">
                    ({project.tasks.length})
                  </span>
                </label>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                  {project.tasks.map((t) => {
                    const tag = TAG_COLOR[t.tag] ?? {
                      bg: "#ffffff10",
                      text: "#9ca3af",
                    };
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111214] border border-[#1e2128]"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: t.done
                              ? "#2a2d35"
                              : PRIORITY_COLOR[t.priority],
                          }}
                        />
                        <span
                          className="flex-1 font-mono text-[11px] truncate"
                          style={{
                            color: t.done ? "#374151" : "#9ca3af",
                            textDecoration: t.done ? "line-through" : "none",
                          }}
                        >
                          {t.title}
                        </span>
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ background: tag.bg, color: tag.text }}
                        >
                          {t.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 mt-6">
            <button
              onClick={onClose}
              className="py-2.5 rounded-xl border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer font-mono text-[10px] tracking-widest hover:border-[#374151] transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="py-2.5 rounded-xl border-none cursor-pointer font-mono text-[10px] tracking-widest font-semibold text-[#111] hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ background: form.color }}
            >
              {saving ? "SAVING…" : isEdit ? "SAVE CHANGES" : "CREATE PROJECT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── Confirm delete ────────────────────────────────────
export function ConfirmDelete({
  name,
  color,
  onConfirm,
  onCancel,
}: {
  name: string;
  color: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#16181d] rounded-2xl w-full max-w-sm border border-[#2a2d35] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 rounded-sm mb-5" style={{ background: color }} />
        <p className="font-mono text-[11px] text-[#f87171] tracking-widest mb-2">
          DELETE PROJECT
        </p>
        <p className="text-[#e8e3d5] text-sm font-semibold mb-1">{name}</p>
        <p className="font-mono text-[10px] text-[#4b5563] mb-5 leading-relaxed">
          Tasks will be detached but not deleted. This cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onCancel}
            className="py-2.5 rounded-xl border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer font-mono text-[10px] tracking-widest"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 rounded-xl border-none bg-[#f87171] text-white cursor-pointer font-mono text-[10px] tracking-widest font-semibold"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Task Edit Modal ───────────────────────────────────
export function TaskModal({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, updated: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState({
    title: task.title,
    tag: task.tag,
    priority: task.priority,
    dueDate: task.dueDate.slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inpCls =
    "w-full bg-[#1a1d24] border border-[#2a2d35] rounded-lg px-3 py-2 text-[#e8e3d5] font-mono text-xs outline-none focus:border-[#a3c47a] transition-colors";

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          tag: form.tag,
          priority: form.priority,
          dueDate: form.dueDate,
        }),
      });
      if (res.ok) {
        const updated: Task = await res.json();
        onUpdate(task.id, updated);
        onClose();
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        setError(errorData.error || `Update failed (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
      console.error("Task update error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    setToggling(true);
    setError(null);
    try {
      const newDone = !task.done;
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: newDone }),
      });
      if (res.ok) {
        const updated: Task = await res.json();
        onUpdate(task.id, updated);
        onClose();
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        setError(errorData.error || `Status update failed (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      console.error("Toggle status error:", err);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDelete(task.id);
    onClose();
  }

  const tag = TAG_COLOR[task.tag];
  const priorityColor = PRIORITY_COLOR[task.priority];

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#16181d] rounded-2xl w-full max-w-md border border-[#2a2d35] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color top bar based on priority */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${priorityColor}, ${priorityColor}66)`,
          }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: tag.bg, color: tag.text }}
                >
                  {task.tag}
                </span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: priorityColor }}
                  />
                  <span className="font-mono text-[10px] text-[#6b7280]">
                    {task.priority}
                  </span>
                </div>
                {/* Status badge */}
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                    task.done
                      ? "bg-[#a3c47a18] border-[#a3c47a44] text-[#a3c47a]"
                      : "bg-[#fbbf2418] border-[#fbbf2444] text-[#fbbf24]"
                  }`}
                >
                  {task.done ? "✓ DONE" : "● PENDING"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-transparent border-none text-[#4b5563] cursor-pointer text-xl leading-none hover:text-[#9ca3af] transition-colors shrink-0"
            >
              ×
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-[#f87171]/10 border border-[#f87171] rounded-lg px-3 py-2 mb-5">
              <p className="font-mono text-[10px] text-[#f87171]">{error}</p>
            </div>
          )}

          {/* Form fields */}
          <div className="flex flex-col gap-3 mb-5">
            <div>
              <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                TITLE
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className={inpCls}
                placeholder="Task title…"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                  TAG
                </label>
                <select
                  value={form.tag}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      tag: e.target.value as Task["tag"],
                    }))
                  }
                  className={inpCls}
                >
                  {TAG_LIST.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                  PRIORITY
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      priority: e.target.value as Task["priority"],
                    }))
                  }
                  className={inpCls}
                >
                  {PRIORITY_LIST.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                DUE DATE
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                className={inpCls}
              />
            </div>
          </div>

          {/* Time info */}
          <div className="bg-[#111214] rounded-xl p-3.5 mb-5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-[#374151] tracking-widest">
                DUE
              </span>
              <span className="font-mono text-[11px] text-[#9ca3af]">
                {fmtDate(task.dueDate)}
              </span>
            </div>
            <div className="h-px bg-[#1e2128]" />
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-[#374151] tracking-widest">
                COMPLETED
              </span>
              {task.done && task.doneAt ? (
                <span className="font-mono text-[11px] text-[#a3c47a]">
                  {fmtDateTime(task.doneAt)}
                </span>
              ) : (
                <span className="font-mono text-[11px] text-[#2a2d35]">—</span>
              )}
            </div>
          </div>

          {/* Toggle status button */}
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className="w-full py-3 rounded-xl font-mono text-[11px] font-semibold tracking-widest border-none cursor-pointer transition-all duration-200 mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background: task.done ? "#fbbf2418" : "#a3c47a",
              color: task.done ? "#fbbf24" : "#111",
              border: task.done ? "1px solid #fbbf2444" : "none",
            }}
          >
            {toggling ? (
              "UPDATING…"
            ) : task.done ? (
              <>
                <span>↩</span> MARK AS PENDING
              </>
            ) : (
              <>
                <span>✓</span> MARK AS DONE
              </>
            )}
          </button>

          {/* Save + Delete row */}
          <div className="grid grid-cols-2 gap-2.5">
            {!confirmDelete ? (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="py-2.5 rounded-xl bg-transparent border border-[#2a2d35] text-[#f87171] cursor-pointer font-mono text-[10px] tracking-widest hover:border-[#f87171] hover:bg-[#f8717118] transition-all"
                >
                  DELETE
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="py-2.5 rounded-xl border-none bg-[#2a2d35] text-[#e8e3d5] cursor-pointer font-mono text-[10px] tracking-widest hover:bg-[#374151] transition-colors disabled:opacity-60"
                >
                  {saving ? "SAVING…" : "SAVE CHANGES"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-2.5 rounded-xl bg-transparent border border-[#2a2d35] text-[#6b7280] cursor-pointer font-mono text-[10px] tracking-widest hover:border-[#374151] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDelete}
                  className="py-2.5 rounded-xl border-none bg-[#f87171] text-white cursor-pointer font-mono text-[10px] tracking-widest font-semibold hover:opacity-90 transition-opacity"
                >
                  CONFIRM DELETE
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Status Modal ──────────────────────────────────────
export function StatusModal({
  task,
  onClose,
  onUpdate,
}: {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
}) {
  const today = toInputDate(new Date().toISOString());
  const [doneAt, setDoneAt] = useState<string>(
    task.doneAt ? toInputDate(task.doneAt) : today,
  );
  const [notes, setNotes] = useState<string>(task.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  function previewStatus(): TaskStatus {
    const doneD = new Date(doneAt + "T00:00:00Z");
    const dueD = new Date(task.dueDate);
    dueD.setHours(0, 0, 0, 0);
    return doneD <= dueD ? "on_time" : "over_due";
  }

  async function saveNotes() {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      const u: Task = await res.json();
      onUpdate(task.id, u);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 1800);
    }
  }

  async function markDone() {
    setSaving(true);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true, doneAt, notes }),
    });
    if (res.ok) {
      const u: Task = await res.json();
      onUpdate(task.id, u);
    }
    setSaving(false);
    onClose();
  }

  async function markPending() {
    setSaving(true);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: false, notes }),
    });
    if (res.ok) {
      const u: Task = await res.json();
      onUpdate(task.id, u);
    }
    setSaving(false);
    onClose();
  }

  const sm = STATUS_META[task.status];
  const preview = previewStatus();
  const inpCls =
    "w-full bg-[#1a1d24] border border-[#2a2d35] rounded-lg px-3 py-2 text-[#e8e3d5] font-mono text-xs outline-none focus:border-[#a3c47a] transition-colors";

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#16181d] rounded-2xl w-full max-w-sm border border-[#2a2d35] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg,${sm.color},${sm.color}55)`,
          }}
        />
        <div className="p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
          {/* Task info */}
          <div>
            <p className="font-mono text-[10px] text-[#4b5563] tracking-widest mb-1">
              TASK STATUS
            </p>
            <p
              className="text-[#e8e3d5] text-sm font-medium leading-snug mb-2"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: TAG_COLOR[task.tag].bg,
                  color: TAG_COLOR[task.tag].text,
                }}
              >
                {task.tag}
              </span>
              <div className="flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: PRIORITY_COLOR[task.priority] }}
                />
                <span className="font-mono text-[10px] text-[#6b7280]">
                  {task.priority}
                </span>
              </div>
              <StatusBadge status={task.status} />
            </div>
          </div>

          {/* Info panel */}
          <div className="bg-[#111214] rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-[#374151] tracking-widest">
                DUE DATE
              </span>
              <span className="font-mono text-[11px] text-[#9ca3af]">
                {fmtDate(task.dueDate)}
              </span>
            </div>
            <div className="h-px bg-[#1e2128]" />
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-[#374151] tracking-widest">
                STATUS
              </span>
              <StatusBadge status={task.status} />
            </div>
            {task.done && task.doneAt && (
              <>
                <div className="h-px bg-[#1e2128]" />
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-[#374151] tracking-widest">
                    COMPLETED
                  </span>
                  <span className="font-mono text-[11px] text-[#a3c47a]">
                    {fmtDate(task.doneAt)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Notes field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[10px] text-[#4b5563] tracking-widest">
                NOTES
              </label>
              {notes !== (task.notes ?? "") && (
                <button
                  onClick={saveNotes}
                  className="font-mono text-[9px] px-2 py-0.5 rounded-full border-none cursor-pointer transition-colors"
                  style={{
                    background: notesSaved ? "#a3c47a22" : "#2a2d35",
                    color: notesSaved ? "#a3c47a" : "#9ca3af",
                  }}
                >
                  {notesSaved ? "✓ SAVED" : "SAVE NOTES"}
                </button>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes, links, context…"
              rows={4}
              className={inpCls + " resize-y leading-relaxed"}
            />
          </div>

          {/* Action */}
          {!task.done ? (
            <>
              <div>
                <label className="block font-mono text-[10px] text-[#4b5563] tracking-widest mb-1.5">
                  DATE COMPLETED
                </label>
                <input
                  type="date"
                  value={doneAt}
                  max={today}
                  onChange={(e) => setDoneAt(e.target.value)}
                  className={inpCls}
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[9px] text-[#4b5563]">
                    Will become →
                  </span>
                  <StatusBadge status={preview} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={onClose}
                  className="py-2.5 rounded-xl border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer font-mono text-[10px] tracking-widest hover:border-[#374151] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={markDone}
                  disabled={saving}
                  className="py-2.5 rounded-xl border-none bg-[#a3c47a] text-[#111] cursor-pointer font-mono text-[10px] font-semibold tracking-widest hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    "SAVING…"
                  ) : (
                    <>
                      <span>✓</span> MARK DONE
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onClose}
                className="py-2.5 rounded-xl border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer font-mono text-[10px] tracking-widest"
              >
                CLOSE
              </button>
              <button
                onClick={markPending}
                disabled={saving}
                className="py-2.5 rounded-xl border border-[#fbbf2444] bg-[#fbbf2418] text-[#fbbf24] cursor-pointer font-mono text-[10px] tracking-widest hover:bg-[#fbbf2428] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  "SAVING…"
                ) : (
                  <>
                    <span>↩</span> REOPEN
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AddTaskModal ──────────────────────────────────────
export function AddTaskModal({
  onClose,
  onAdd,
  projectId,
  accentColor = "#a3c47a",
  projectName,
}: Props) {
  const [form, setForm] = useState<TaskForm>({
    title: "",
    tag: "Adhoc",
    priority: "Medium",
    dueDate: "",
    notes: "",
    projectId: projectId ?? null,
  });
  const [loading, setLoading] = useState(false);

  const focusCls = `focus:border-[${accentColor}]`;
  const inp = `${INP} focus:border-[${accentColor}]`;

  async function submit() {
    if (!form.title || !form.dueDate) return;
    setLoading(true);
    await onAdd(form);
    setLoading(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#16181d] rounded-2xl w-full max-w-sm border border-[#2a2d35] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div className="h-1" style={{ background: accentColor }} />

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div
                className="font-mono text-[11px] tracking-widest"
                style={{ color: accentColor }}
              >
                NEW TASK
              </div>
              {projectName && (
                <div className="font-mono text-[10px] text-[#4b5563] mt-0.5">
                  in {projectName}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="bg-transparent border-none text-[#4b5563] cursor-pointer text-xl leading-none hover:text-[#9ca3af] transition-colors"
            >
              ×
            </button>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3">
            <input
              placeholder="Task title…"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className={INP}
              style={{ borderColor: form.title ? "#2a2d35" : undefined }}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={form.tag}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tag: e.target.value }))
                }
                className={INP}
              >
                {TAG_LIST.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priority: e.target.value }))
                }
                className={INP}
              >
                {["High", "Medium", "Low"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, dueDate: e.target.value }))
              }
              className={INP}
            />

            <textarea
              placeholder="Notes (optional)…"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              rows={3}
              className={`${INP} resize-none leading-relaxed`}
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button
              onClick={onClose}
              className="py-2.5 rounded-xl border border-[#2a2d35] bg-transparent text-[#6b7280] cursor-pointer font-mono text-[11px] tracking-wide hover:border-[#374151] transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={submit}
              disabled={loading || !form.title || !form.dueDate}
              className="py-2.5 rounded-xl border-none cursor-pointer font-mono text-[11px] font-semibold text-[#111] hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: accentColor }}
            >
              {loading ? "SAVING…" : "ADD TASK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}