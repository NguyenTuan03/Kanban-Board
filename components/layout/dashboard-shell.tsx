"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import ThemeToggle from "@/components/theme/theme-toggle";

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}

interface DashboardShellProps {
  user: User;
  userWorkspaces: WorkspaceItem[];
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

export default function DashboardShell({
  user,
  userWorkspaces,
  signOutAction,
  children,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Tự động đóng sidebar trên mobile khi chuyển trang
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const avatarLetter = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-300">
      {/* Backdrop mờ trên Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Sidebar bên trái */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-background border-r border-black/5 dark:border-white/5 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground text-background font-bold shadow-none text-xs">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                />
              </svg>
            </div>
            <span className="font-bold text-[10px] tracking-widest text-foreground uppercase font-mono">
              Kanban Flow
            </span>
          </div>

          {/* Nút đóng Sidebar trên mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 space-y-6 overflow-y-auto">
          {/* Main Menu */}
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 py-2 transition-all duration-200 text-xs font-semibold border-l-2 ${
                pathname === "/dashboard"
                  ? "text-foreground border-accent pl-5 bg-zinc-150/10 dark:bg-zinc-900/20"
                  : "text-zinc-500 hover:text-foreground border-transparent pl-5 hover:bg-zinc-150/5 dark:hover:bg-zinc-900/10"
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Tổng quan
            </Link>
          </div>

          {/* Workspaces List */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block px-6 font-mono">
              Không gian làm việc
            </span>
            <div className="space-y-1">
              {userWorkspaces.map((ws) => {
                const isActive = pathname === `/workspace/${ws.slug}`;
                return (
                  <Link
                    key={ws.id}
                    href={`/workspace/${ws.slug}`}
                    className={`flex items-center gap-3 py-2 transition-all duration-200 text-xs font-semibold border-l-2 ${
                      isActive
                        ? "text-foreground border-accent pl-5 bg-zinc-150/10 dark:bg-zinc-900/20"
                        : "text-zinc-500 hover:text-foreground border-transparent pl-5 hover:bg-zinc-150/5 dark:hover:bg-zinc-900/10"
                    }`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold font-mono border transition-colors ${
                      isActive
                        ? "bg-foreground text-background border-transparent"
                        : "bg-background text-zinc-500 border-black/5 dark:border-white/5"
                    }`}>
                      {ws.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{ws.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* Cột nội dung bên phải */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-black/5 dark:border-white/5 bg-background flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-all duration-300">
          <div className="flex items-center">
            {/* Nút Hamburger Menu trên Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer mr-3"
              aria-label="Mở menu"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Breadcrumb style text */}
            <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
              Dự án / Workspace
            </div>
          </div>

          {/* Profile Area */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Nút chuyển đổi Theme */}
            <ThemeToggle />

            <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 bg-background rounded-lg border border-black/5 dark:border-white/5 max-w-[180px] sm:max-w-none">
              <div className="h-5 w-5 rounded bg-foreground flex items-center justify-center text-[9px] font-bold text-background font-mono shrink-0">
                {avatarLetter}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[100px] sm:max-w-none">
                {user.email}
              </span>
            </div>

            {/* Logout Action */}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex h-7 items-center justify-center rounded border border-black/5 dark:border-white/5 hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-400 text-zinc-500 dark:text-zinc-400 font-semibold text-xs px-2.5 transition-all duration-200 cursor-pointer active:scale-95"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden relative bg-background text-foreground transition-colors duration-300 min-w-0 w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
