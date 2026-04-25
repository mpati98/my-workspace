import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const sub = await prisma.subCard.update({
    where: { id },
    data: {
      ...(body.title       !== undefined && { title:       body.title }),
      ...(body.description !== undefined && { description: body.description }),
    },
  });
  return NextResponse.json({
    ...sub, createdAt: sub.createdAt.toISOString(), updatedAt: sub.updatedAt.toISOString(),
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.subCard.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
