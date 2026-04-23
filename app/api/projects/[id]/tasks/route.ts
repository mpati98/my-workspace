import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma/prisma";

// PATCH /api/projects/[id]/tasks — assign or unassign a task
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { taskId, assign } = await req.json();
  const task = await prisma.task.update({
    where: { id: taskId },
    data:  { projectId: assign ? id : null },
  });
  return NextResponse.json({
    ...task,
    dueDate: task.dueDate.toISOString(),
    doneAt:  task.doneAt?.toISOString().slice(0, 10) ?? null,
  });
}
