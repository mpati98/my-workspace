import { notFound }        from "next/navigation";
import { prisma }          from "@/prisma/prisma";
import ProjectDetailPage   from "@/pages/ProjectDetailPage";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where:   { id },
    include: { tasks: { orderBy: { dueDate: "asc" } } },
  });

  if (!project) notFound();

  const allProjects = await prisma.project.findMany({
    select: { id: true, name: true, color: true },
  });

  function serTask(t: any) {
    return {
      ...t,
      dueDate:   t.dueDate.toISOString(),
      doneAt:    t.doneAt?.toISOString().slice(0, 10) ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  return (
    <ProjectDetailPage
      project={{
        ...project,
        startDate: project.startDate?.toISOString() ?? null,
        endDate:   project.endDate?.toISOString()   ?? null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        tasks:     project.tasks.map(serTask),
      }}
      allProjects={allProjects.map(p => ({ id: p.id, name: p.name, color: p.color }))}
    />
  );
}
