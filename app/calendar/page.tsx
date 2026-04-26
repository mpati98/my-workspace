import { prisma } from "@/prisma/prisma";
import CalendarPage from "@/components/pages/CalendarPage";

export const dynamic = "force-dynamic";

export default async function Calendar() {
  const raw = await prisma.task.findMany({ orderBy: { dueDate: "asc" } });
  const serialized = raw.map((t: any) => ({
    ...t,
    dueDate:   t.dueDate.toISOString(),
    doneAt:    t.doneAt ? t.doneAt.toISOString().slice(0,10) : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
  return <CalendarPage initialTasks={serialized} />;
}
