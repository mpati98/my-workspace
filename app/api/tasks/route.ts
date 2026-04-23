import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { Priority, TaskStatus, TaskTag } from "@prisma/client";

function todayMidnight() {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d;
}

function escalatedPriority(current: Priority, dueDate: Date): Priority {
  const today = todayMidnight();
  const due   = new Date(dueDate); due.setHours(0,0,0,0);
  const diff  = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diff <= 0) return "High";  // today or past
  if (diff === 1) {              // tomorrow → bump up one level
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const tasks  = await prisma.task.findMany({
      where: filter === "Done" ? { done: true } : filter === "Pending" ? { done: false } : undefined,
      orderBy: { dueDate: "asc" },
    });

    // Auto-escalate priority for pending tasks based on due date
    const updates: Promise<any>[] = [];
    for (const t of tasks) {
      if (t.done) continue;
      const newPriority = escalatedPriority(t.priority, t.dueDate);
      const newStatus   = computeStatus(false, null, t.dueDate);
      if (newPriority !== t.priority || newStatus !== t.status) {
        t.priority = newPriority;
        t.status   = newStatus;
        updates.push(
          prisma.task.update({
            where: { id: t.id },
            data:  { priority: newPriority, status: newStatus },
          })
        );
      }
    }
    if (updates.length) await Promise.all(updates);

    return NextResponse.json(tasks.map(serialize));
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, tag, priority, dueDate, notes, projectId } = body;
    if (!title || !tag || !priority || !dueDate)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const dueDateObj  = new Date(dueDate);
    const initPrio    = escalatedPriority(priority as Priority, dueDateObj);
    const initStatus  = computeStatus(false, null, dueDateObj);

    const task = await prisma.task.create({
      data: {
        title, tag: tag as TaskTag,
        priority: initPrio,
        status:   initStatus,
        dueDate:  dueDateObj,
        ...(notes     ? { notes }                : {}),
        ...(projectId ? { projectId }            : {}),
      },
    });
    return NextResponse.json(serialize(task), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
