import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/main/NavBar";
import ChatWidget from "@/components/main/Chatbot";

export const metadata: Metadata = {
  title: "My Workspace",
  description: "This is a workspace for my projects, learning, and experimentation. It is built with Next.js, Tailwind CSS, and Prisma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-bg text-bright min-h-screen">
        <NavBar />
        <ChatWidget />
        {children}
      </body>
    </html>
  );
}
