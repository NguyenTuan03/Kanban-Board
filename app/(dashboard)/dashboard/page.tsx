import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import CreateWorkspaceDialog from "@/components/dashboard/create-workspace-dialog";
 
interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}
 
interface WorkspaceMemberResponse {
  workspaces: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
 
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  if (!user) {
    return null;
  }
 
  // Lấy danh sách Workspace từ Database
  let workspaces: WorkspaceItem[] = [];
 
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
      const rawData = data as unknown as WorkspaceMemberResponse[];
      workspaces = rawData
        .map((item) => item.workspaces)
        .filter((ws): ws is WorkspaceItem => ws !== null)
        .map((ws) => ({
          ...ws,
          description: "Không gian quản lý tiến độ công việc Kanban của dự án.",
        }));
    }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách workspaces:", err);
  }
 
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/5">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            Các không gian làm việc của bạn
          </h3>
          <p className="text-xs text-slate-500">
            Danh sách các dự án bạn đang tham gia quản lý
          </p>
        </div>
        <CreateWorkspaceDialog />
      </div>
 
      {/* Grid of Workspaces */}
      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspace/${ws.slug}`}
              className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden flex flex-col justify-between"
            >
              {/* Hover Decorator line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
 
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold font-mono border border-indigo-100 dark:border-indigo-500/10">
                    {ws.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                      {ws.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      slug: {ws.slug}
                    </span>
                  </div>
                </div>
 
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[48px]">
                  {ws.description}
                </p>
              </div>
 
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                <span>Truy cập bảng công việc</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-white/5 text-slate-500">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-40 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A9 9 0 0012 3v0a9 9 0 009 9v.75m-.5 3.5a6 6 0 01-5.5 5.5H9a6 6 0 01-5.5-5.5h13z"
            />
          </svg>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Không tìm thấy không gian làm việc nào
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng tạo mới hoặc liên hệ quản trị viên để tham gia dự án.
          </p>
        </div>
      )}
    </div>
  );
}
