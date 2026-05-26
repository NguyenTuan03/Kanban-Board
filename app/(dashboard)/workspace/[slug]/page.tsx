import React from "react";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import KanbanBoard from "@/components/kanban/board";
import { Task, TaskPriority, TaskStatus } from "@/types/kanban";

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

interface ColumnData {
  id: string;
  title: string;
  position: number;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  status: string;
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
  let tasksList: Task[] = [];
  let hasAccess = true;

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
      const { data: member } = await supabase
        .from("workspace_members")
        .select("role_id")
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .single();

      if (!member) {
        hasAccess = false;
      } else {
        // 3. Lấy danh sách tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("workspace_id", workspace.id)
          .order("position", { ascending: true });

        if (!tasksError && tasksData) {
          const rawTasks = tasksData as TaskData[];
          tasksList = rawTasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status as TaskStatus,
            priority: t.priority as TaskPriority,
            created_at: t.created_at,
            user_id: user.id,
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
      <div className="pb-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
            Không gian làm việc
          </span>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            {workspace.name}
          </h2>
        </div>
      </div>

      {/* Render Kanban Board kéo thả */}
      <div className="flex-1 flex flex-col">
        <KanbanBoard initialTasks={tasksList} />
      </div>
    </div>
  );
}
