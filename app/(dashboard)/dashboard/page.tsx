import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import CreateWorkspaceDialog from "@/components/dashboard/create-workspace-dialog";
import WorkspaceCard from "@/components/dashboard/workspace-card";
 
interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  isAdmin?: boolean;
}
 
interface WorkspaceMemberResponse {
  role: {
    name: string;
  } | null;
  workspaces: {
    id: string;
    name: string;
    slug: string;
    created_by: string;
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
        role:roles (
          name
        ),
        workspaces (
          id,
          name,
          slug,
          created_by
        )
      `)
      .eq("user_id", user.id);
 
    if (error) {
      console.error("Lỗi khi lấy danh sách workspaces:", error);
    }
 
    if (!error && data) {
      const rawData = data as unknown as WorkspaceMemberResponse[];
      workspaces = rawData
        .filter((item): item is WorkspaceMemberResponse & { workspaces: NonNullable<WorkspaceMemberResponse["workspaces"]> } => 
          item.workspaces !== null
        )
        .map((item) => {
          const ws = item.workspaces;
          const roleName = item.role?.name?.toUpperCase();
          const isAdmin = roleName === "ADMIN" || ws.created_by === user.id;
          return {
            id: ws.id,
            name: ws.name,
            slug: ws.slug,
            description: "Không gian quản lý tiến độ công việc Kanban của dự án.",
            isAdmin,
          };
        });
    }
  } catch (err) {
    console.error("Exception khi lấy danh sách workspaces:", err);
  }
 
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      {/* Dashboard Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
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
              <WorkspaceCard key={ws.id} ws={ws} isFeatured={isFeatured} />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-xl text-zinc-400 dark:text-zinc-600 max-w-md mx-auto mt-8">
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
