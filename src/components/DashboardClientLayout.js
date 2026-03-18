"use client";

import { useSidebar } from "./SidebarProvider";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export default function DashboardClientLayout({ children, sessionUser }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div 
        className={twMerge(
          "flex-1 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
