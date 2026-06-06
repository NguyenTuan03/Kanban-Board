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
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      {/* Dashboard Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-border-muted">
        <div>
          <h3 className="text-3xl font-normal font-serif tracking-tight leading-none italic">
            Không gian làm việc
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-550 block mt-2.5">
            YOUR ACTIVE WORKSPACES
          </span>
        </div>
        <CreateWorkspaceDialog />
      </div>
  
      {/* Asymmetric Bento Grid of Workspaces */}
      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws, index) => {
            const isFeatured = index === 0;
            return (
              <Link
                key={ws.id}
                href={`/workspace/${ws.slug}`}
                className={`group bg-background border border-border-muted hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-6 shadow-none transition-all duration-250 text-left flex flex-col justify-between ${
                  isFeatured 
                    ? "md:col-span-2 min-h-[190px] bg-zinc-50/50 dark:bg-zinc-900/10 border-accent/20 hover:border-accent/40" 
                    : "min-h-[170px]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-background text-foreground text-xs font-bold font-mono border border-border-muted">
                      {ws.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground group-hover:text-accent transition-colors truncate">
                        {ws.name}
                      </h4>
                      <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 block mt-0.5 truncate">
                        slug: {ws.slug}
                      </span>
                    </div>
                  </div>
  
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 max-w-[50ch]">
                    {ws.description}
                  </p>
                </div>
  
                <div className="mt-4 pt-3 border-t border-border-muted flex items-center justify-between text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-accent transition-colors">
                  <span className="font-mono uppercase tracking-wider">Mở bảng công việc</span>
                  <svg
                    className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
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
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border-muted rounded-xl text-zinc-400 dark:text-zinc-600 max-w-md mx-auto mt-8">
          <svg
            className="w-8 h-8 mx-auto mb-4 opacity-40 text-zinc-400"
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
          <p className="text-xs font-semibold text-foreground">
            Chưa có dự án nào
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 max-w-[28ch] mx-auto leading-relaxed font-mono uppercase tracking-wider">
            Vui lòng tạo mới một không gian làm việc.
          </p>
        </div>
      )}
    </div>
  );
}
