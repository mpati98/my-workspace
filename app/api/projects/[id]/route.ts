import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma/prisma";
import { ProjectStage } from "@/utilities/constants";

function ser(p: any) {
  return {
    ...p,
    startDate: p.startDate?.toISOString() ?? null,
    endDate:   p.endDate?.toISOString()   ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    tasks: (p.tasks ?? []).map((t: any) => ({
      ...t,
      dueDate:   t.dueDate.toISOString(),
      doneAt:    t.doneAt?.toISOString().slice(0, 10) ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(body.name        !== undefined && { name:        body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category    !== undefined && { category:    body.category }),
      ...(body.stage       !== undefined && { stage:       body.stage as ProjectStage }),
      ...(body.color       !== undefined && { color:       body.color }),
      ...(body.startDate   !== undefined && { startDate:   body.startDate ? new Date(body.startDate) : null }),
      ...(body.endDate     !== undefined && { endDate:     body.endDate   ? new Date(body.endDate)   : null }),
    },
    include: { tasks: { orderBy: { dueDate: "asc" } } },
  });
  return NextResponse.json(ser(project));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Detach tasks then delete
  await prisma.task.updateMany({ where: { projectId: id }, data: { projectId: null } });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
