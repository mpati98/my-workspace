import { prisma } from "@/prisma/prisma";
import CollectionPage from "@/pages/CollectionPage"

export const dynamic = "force-dynamic";

export default async function Collection() {
  const topics = await (prisma as any).topic.findMany({
    orderBy: { createdAt: "desc" },
    include: { subCards: { orderBy: { createdAt: "asc" } } },
  });
  const serialized = topics.map((t: any) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subCards: t.subCards.map((s: any) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  }));
  return <CollectionPage initialTopics={serialized} />;
}
