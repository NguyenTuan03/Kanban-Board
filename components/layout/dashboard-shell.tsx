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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Backdrop mờ trên Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Sidebar bên trái */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Area */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/20">
              <svg
                className="h-4.5 w-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-widest bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent uppercase">
              Kanban Flow
            </span>
          </div>

          {/* Nút đóng Sidebar trên mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
          {/* Main Menu */}
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === "/dashboard"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Tổng quan
            </Link>
          </div>

          {/* Workspaces List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4">
              Không gian làm việc
            </span>
            <div className="space-y-1">
              {userWorkspaces.map((ws) => {
                const isActive = pathname === `/workspace/${ws.slug}`;
                return (
                  <Link
                    key={ws.id}
                    href={`/workspace/${ws.slug}`}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold font-mono border transition-colors ${
                      isActive
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30"
                        : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/10"
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
        <header className="h-18 border-b border-slate-200 dark:border-white/5 bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center">
            {/* Nút Hamburger Menu trên Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer mr-3"
              aria-label="Mở menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Title Context */}
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-none">
              Dự án & Không gian làm việc
            </div>
          </div>

          {/* Profile Area */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Nút chuyển đổi Theme */}
            <ThemeToggle />

            <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 bg-slate-200/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 max-w-[180px] sm:max-w-none">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm font-mono shrink-0">
                {avatarLetter}
              </div>
              <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px] sm:max-w-none">
                {user.email}
              </span>
            </div>

            {/* Logout Action */}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex h-9 items-center justify-center rounded-xl bg-slate-200/50 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3 sm:px-4 transition-all duration-200 cursor-pointer"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
