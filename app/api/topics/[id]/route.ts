import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const topic = await prisma.topic.update({
    where: { id },
    data: {
      ...(body.title       !== undefined && { title:       body.title }),
      ...(body.category    !== undefined && { category:    body.category }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.coverColor  !== undefined && { coverColor:  body.coverColor }),
    },
    include: { subCards: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json({
    ...topic,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    subCards: topic.subCards.map(s => ({
      ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString(),
    })),
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.topic.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
