import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/(auth)/login/action";

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceMemberResponse {
  workspaces: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kiểm tra bảo mật: Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!user) {
    redirect("/login");
  }

  // Lấy danh sách Workspace người dùng đang tham gia
  let userWorkspaces: WorkspaceItem[] = [];

  try {
    const { data, error } = await supabase
      .from("workspace_members")
      .select(`
        workspaces (
          id,
          name,
          slug
        )
      `)
      .eq("user_id", user.id);

    if (!error && data) {
      // Ép kiểu dữ liệu an toàn để tránh dùng 'any'
      const rawData = data as unknown as WorkspaceMemberResponse[];
      userWorkspaces = rawData
        .map((item) => item.workspaces)
        .filter((ws): ws is WorkspaceItem => ws !== null);
    }
  } catch (err) {
    console.error("Lỗi khi truy vấn danh sách Workspaces:", err);
  }



  const avatarLetter = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar bên trái */}
      <aside className="w-64 bg-slate-950 border-r border-white/5 flex flex-col shrink-0">
        {/* Logo Area */}
        <div className="h-18 flex items-center gap-3 px-6 border-b border-white/5">
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
          <span className="font-extrabold text-sm tracking-widest bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">
            Kanban Flow
          </span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
          {/* Main Menu */}
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Tổng quan
            </Link>
          </div>

          {/* Workspaces List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4">
              Không gian làm việc
            </span>
            <div className="space-y-1">
              {userWorkspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/workspace/${ws.slug}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-200"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-950 text-indigo-400 text-xs font-bold font-mono border border-indigo-500/10">
                    {ws.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{ws.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Cột nội dung bên phải */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-18 border-b border-white/5 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          {/* Dashboard Context Title */}
          <div className="text-sm font-semibold text-slate-300">
            Dự án & Không gian làm việc
          </div>

          {/* Profile Area */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-2xl border border-white/5">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm font-mono">
                {avatarLetter}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-300">
                {user.email}
              </span>
            </div>

            {/* Logout Action */}
            <form action={signOut}>
              <button
                type="submit"
                className="flex h-9 items-center justify-center rounded-xl bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 border border-white/5 text-slate-300 font-semibold text-xs px-4 transition-all duration-200 cursor-pointer"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-8 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
