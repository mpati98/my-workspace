"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Project, Task } from "@/utilities/constants";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, tasksRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/tasks"),
        ]);
        const projData = await projRes.json();
        const tasksData = await tasksRes.json();
        setProjects(projData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.stage === "running").length;
  const completedProjects = projects.filter((p) => p.stage === "completed").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.done).length;
  const upcomingTasks = tasks.filter(
    (t) =>
      !t.done &&
      new Date(t.dueDate) > new Date() &&
      new Date(t.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  const recentProjects = projects.slice(0, 3);

  const features = [
    {
      href: "/calendar",
      label: "§ CALENDAR",
      color: "#60a5fa",
      icon: "📅",
      desc: "Manage your schedule",
    },
    {
      href: "/project-management",
      label: "§ PROJECTS",
      color: "#a3c47a",
      icon: "📊",
      desc: "Track your work",
    },
    {
      href: "/library",
      label: "§ LIBRARY",
      color: "#c9a96e",
      icon: "📚",
      desc: "Resource collection",
    },
    {
      href: "/search",
      label: "§ SEARCH",
      color: "#f472b6",
      icon: "🔍",
      desc: "Find anything fast",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 mb-4">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full border-2 border-[#1a1d24]" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: "#EDD69C",
                  borderRightColor: "#EDD69C33",
                }}
              />
            </div>
          </div>
          <p className="text-[#8a8a8a]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-bright">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-16 sm:py-24">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #EDD69C07 1px, transparent 1px), linear-gradient(45deg, #60a5fa07 1px, transparent 1px)',
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-linear-to-r from-[#EDD69C] to-[#60a5fa] bg-clip-text text-transparent">
            Welcome to Your Workspace
          </h1>
          <p className="text-[#a0a0a0] text-lg sm:text-xl mb-8">
            Organize your projects, manage your time, and track your progress all in one place.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Projects"
            value={totalProjects}
            color="#a3c47a"
          />
          <StatCard label="Active" value={activeProjects} color="#60a5fa" />
          <StatCard label="Completed" value={completedProjects} color="#EDD69C" />
          <StatCard
            label="Tasks Done"
            value={`${completedTasks}/${totalTasks}`}
            color="#f472b6"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-bright">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <div
                className="group relative p-6 rounded-2xl border border-[#2a2d35] hover:border-opacity-100 transition-all duration-300 cursor-pointer h-full"
                style={{
                  borderColor: `${feature.color}33`,
                  background: `linear-gradient(135deg, ${feature.color}05 0%, transparent 100%)`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: `inset 0 0 30px ${feature.color}15`,
                  }}
                />
                <div className="relative">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-mono text-sm font-semibold mb-1 tracking-wider">
                    {feature.label}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] group-hover:text-[#b0b0b0] transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <section className="px-6 py-12 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-bright">Recent Projects</h2>
            <Link
              href="/project-management"
              className="text-sm text-[#60a5fa] hover:text-[#80b5ff] transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => {
              const taskCount = project.tasks?.length ?? 0;
              const completedCount = project.tasks?.filter((t) => t.done).length ?? 0;
              const progress =
                taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

              return (
                <Link key={project.id} href={`/project-management/${project.id}`}>
                  <div
                    className="group p-5 rounded-xl border border-[#2a2d35] hover:border-opacity-100 transition-all duration-300 cursor-pointer"
                    style={{
                      borderColor: `${project.color}33`,
                      background: `linear-gradient(90deg, ${project.color}05 0%, transparent 100%)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-bright group-hover:opacity-80 transition-opacity mb-1">
                          {project.name}
                        </h3>
                        <p className="text-xs text-[#8a8a8a] truncate">
                          {project.description || "No description"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className="inline-block font-mono text-xs px-2 py-1 rounded-full"
                          style={{
                            background: `${project.color}20`,
                            color: project.color,
                            border: `1px solid ${project.color}44`,
                          }}
                        >
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-[#1a1d24] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks > 0 && (
        <section className="px-6 py-12 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-bright">
            {upcomingTasks} Task{upcomingTasks !== 1 ? "s" : ""} Due This Week
          </h2>
          <Link
            href="/search"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            style={{
              background: "#f472b6",
              color: "#ffffff",
            }}
          >
            Review Tasks →
          </Link>
        </section>
      )}

      {/* Empty State */}
      {totalProjects === 0 && (
        <section className="px-6 py-24 max-w-6xl mx-auto text-center">
          <p className="text-[#8a8a8a] text-lg mb-8">
            No projects yet. Start by creating your first project!
          </p>
          <Link
            href="/project-management"
            className="inline-block px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            style={{
              background: "#a3c47a",
              color: "#ffffff",
            }}
          >
            Create Project →
          </Link>
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="p-4 sm:p-6 rounded-xl border border-[#2a2d35] transition-all duration-300 hover:border-opacity-100"
      style={{
        borderColor: `${color}33`,
        background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
      }}
    >
      <div
        className="text-2xl sm:text-3xl font-bold mb-1"
        style={{ color }}
      >
        {value}
      </div>
      <p className="text-xs sm:text-sm text-[#8a8a8a]">{label}</p>
    </div>
  );
}
