import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const sub = await prisma.subCard.create({
    data: { title: body.title, description: body.description, topicId: body.topicId },
  });
  return NextResponse.json({
    ...sub, createdAt: sub.createdAt.toISOString(), updatedAt: sub.updatedAt.toISOString(),
  });
}
