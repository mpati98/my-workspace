import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: { subCards: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(topics.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subCards: t.subCards.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  })));
}

export async function POST(req: Request) {
  const body = await req.json();
  const topic = await prisma.topic.create({
    data: {
      title:       body.title,
      category:    body.category,
      description: body.description,
      coverColor:  body.coverColor ?? "#4a6fa5",
    },
    include: { subCards: true },
  });
  return NextResponse.json({
    ...topic,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    subCards: [],
  });
}
