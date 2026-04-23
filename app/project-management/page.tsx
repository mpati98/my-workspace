import { prisma } from "@/prisma/prisma";
import ProjectManagementPage from "@/pages/ProjectManagementPage";

export const dynamic = "force-dynamic";

export default async function Projects() {
  const [projects, allTasks] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" } as any,
      include: { tasks: { orderBy: { dueDate: "asc" } } },
    }),
    prisma.task.findMany({ orderBy: { dueDate: "asc" } }),
  ]);

  function serTask(t: any) {
    return {
      ...t,
      dueDate: t.dueDate.toISOString(),
      doneAt: t.doneAt?.toISOString().slice(0, 10) ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  function serProject(p: any) {
    return {
      ...p,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      tasks: p.tasks.map(serTask),
    };
  }

  return (
    <ProjectManagementPage
      initialProjects={projects.map(serProject)}
      allTasks={allTasks.map(serTask)}
    />
  );
}
