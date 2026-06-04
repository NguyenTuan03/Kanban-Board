import React from "react";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import KanbanBoard from "@/components/kanban/board";
import { Column, Task, TaskPriority } from "@/types/kanban";

interface WorkspacePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
}

interface TaskData {
  id: string;
  column_id: string;
  workspace_id: string;
  title: string;
  description: string;
  position: number;
  assignee_id: string | null;
  created_by: string;
  priority: string;
  created_at: string;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let workspace: WorkspaceData | null = null;
  let columnsList: Column[] = [];
  let tasksList: Task[] = [];
  let hasAccess = false; // Mặc định là false để đảm bảo an toàn bảo mật
 
  try {
    // 1. Lấy thông tin chi tiết Workspace dựa theo slug
    const { data: wsData, error: wsError } = await supabase
      .from("workspaces")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();
 
    if (!wsError && wsData) {
      workspace = wsData as WorkspaceData;
 
      // 2. Kiểm tra xem người dùng hiện tại có quyền truy cập không
      const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .select("role_id")
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .single();
 
      // Chỉ cho phép truy cập khi tìm thấy bản ghi thành viên hợp lệ và không có lỗi
      if (!memberError && member) {
        hasAccess = true;
 
        // 3. Lấy danh sách cột của Workspace
        const { data: colsData, error: colsError } = await supabase
          .from("columns")
          .select("*")
          .eq("workspace_id", workspace.id)
          .order("position", { ascending: true });
 
        if (!colsError && colsData) {
          columnsList = colsData as unknown as Column[];
        }
 
        // 4. Lấy danh sách tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("workspace_id", workspace.id)
          .order("position", { ascending: true });
 
        if (!tasksError && tasksData) {
          const rawTasks = tasksData as unknown as TaskData[];
          tasksList = rawTasks.map((t) => ({
            id: t.id,
            column_id: t.column_id,
            workspace_id: t.workspace_id,
            title: t.title,
            description: t.description,
            position: t.position,
            assignee_id: t.assignee_id,
            created_by: t.created_by,
            priority: t.priority as TaskPriority,
            created_at: t.created_at,
          }));
        }
      }
    }
  } catch (err) {
    console.error("Lỗi khi kết nối database:", err);
  }

  // Nếu không tìm thấy dự án trong database, trả về 404
  if (!workspace) {
    return notFound();
  }

  // Từ chối truy cập nếu user không phải thành viên
  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-slate-900 border border-rose-500/20 text-rose-400 rounded-2xl text-center shadow-lg">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-rose-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="font-bold text-lg text-slate-100 mb-2">Từ chối truy cập</h3>
        <p className="text-sm">Bạn không có quyền tham gia vào không gian làm việc này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 space-y-6">
      {/* Workspace Header Info */}
      <div className="pb-4 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
            Không gian làm việc
          </span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            {workspace.name}
          </h2>
        </div>
      </div>

      {/* Render Kanban Board kéo thả */}
      <div className="flex-1 flex flex-col">
        <KanbanBoard 
          columns={columnsList} 
          initialTasks={tasksList} 
          workspaceId={workspace.id} 
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
