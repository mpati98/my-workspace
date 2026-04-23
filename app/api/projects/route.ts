import { NextResponse } from "next/server";
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

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { tasks: { orderBy: { dueDate: "asc" } } },
  });
  return NextResponse.json(projects.map(ser));
}

export async function POST(req: Request) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name:        body.name,
      description: body.description ?? "",
      category:    body.category    ?? "General",
      stage:       (body.stage as ProjectStage) ?? "planning",
      color:       body.color       ?? "#a3c47a",
      startDate:   body.startDate   ? new Date(body.startDate) : null,
      endDate:     body.endDate     ? new Date(body.endDate)   : null,
    },
    include: { tasks: true },
  });
  return NextResponse.json(ser(project), { status: 201 });
}
