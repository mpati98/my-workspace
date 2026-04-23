import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma/prisma";
import { Priority, TaskStatus, TaskTag } from "@/generated/prisma";

function todayMidnight() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}
function escalatedPriority(current: Priority, dueDate: Date): Priority {
  const today = todayMidnight();
  const due   = new Date(dueDate); due.setHours(0,0,0,0);
  const diff  = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return "High";
  if (diff === 1) {
    if (current === "Low")    return "Medium";
    if (current === "Medium") return "High";
    return "High";
  }
  return current;
}
function computeStatus(done: boolean, doneAt: Date | null, dueDate: Date): TaskStatus {
  if (done && doneAt) {
    const doneMid = new Date(doneAt); doneMid.setHours(0,0,0,0);
    const dueMid  = new Date(dueDate); dueMid.setHours(0,0,0,0);
    return doneMid <= dueMid ? "on_time" : "over_due";
  }
  const today = todayMidnight();
  const due   = new Date(dueDate); due.setHours(0,0,0,0);
  return due <= today ? "processing" : "waiting";
}
function serialize(t: any) {
  return {
    ...t,
    dueDate:   t.dueDate.toISOString(),
    doneAt:    t.doneAt ? t.doneAt.toISOString().slice(0,10) : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function PATCH(req: NextRequest, context: any) {
  const params = await context.params;
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: Record<string, unknown> = {};

    if (body.title    !== undefined) data.title    = body.title;
    if (body.tag      !== undefined) data.tag      = body.tag as TaskTag;
    if (body.dueDate  !== undefined) data.dueDate  = new Date(body.dueDate);
    if (body.notes    !== undefined) data.notes    = body.notes;

    // Priority: allow explicit override, then re-escalate
    const basePriority = (body.priority ?? task.priority) as Priority;
    const dueDateFinal = data.dueDate ? (data.dueDate as Date) : task.dueDate;

    if (body.done !== undefined) {
      const nowDone = body.done as boolean;
      const doneAtDate = nowDone
        ? (body.doneAt
            ? new Date(body.doneAt + "T00:00:00Z")
            : new Date(new Date().toISOString().slice(0,10) + "T00:00:00Z"))
        : null;

      data.done   = nowDone;
      data.doneAt = doneAtDate;
      data.status = computeStatus(nowDone, doneAtDate, dueDateFinal);
      // Only escalate priority for pending tasks
      data.priority = nowDone ? basePriority : escalatedPriority(basePriority, dueDateFinal);
    } else if (Object.keys(body).length === 0) {
      // Simple toggle
      const nowDone  = !task.done;
      const doneAtD  = nowDone ? new Date(new Date().toISOString().slice(0,10) + "T00:00:00Z") : null;
      data.done      = nowDone;
      data.doneAt    = doneAtD;
      data.status    = computeStatus(nowDone, doneAtD, dueDateFinal);
      data.priority  = nowDone ? task.priority : escalatedPriority(task.priority, dueDateFinal);
    } else {
      // Non-done update — recompute escalation
      data.priority = task.done ? basePriority : escalatedPriority(basePriority, dueDateFinal);
      if (!task.done) {
        data.status = computeStatus(false, null, dueDateFinal);
      }
    }

    const updated = await prisma.task.update({ where: { id: params.id }, data });
    return NextResponse.json(serialize(updated));
  } catch (e) {
    console.error("Task PATCH error:", e);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
