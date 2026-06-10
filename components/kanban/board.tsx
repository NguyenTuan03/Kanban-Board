"use client";
 
import React, { useState } from "react";
import { Column, Task, TaskPriority } from "@/types/kanban";
import { createClient } from "@/utils/supabase/client";
 
interface KanbanBoardProps {
  columns: Column[];
  initialTasks?: Task[];
  workspaceId: string;
  currentUserId: string;
}
 
const columnStyles = [
  {
    colorClass: "border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20",
    badgeColor: "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 border-transparent",
    dotColor: "bg-zinc-400 dark:bg-zinc-500",
  },
  {
    colorClass: "border-amber-500/10 dark:border-amber-500/5 bg-amber-50/30 dark:bg-amber-950/10",
    badgeColor: "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-transparent",
    dotColor: "bg-amber-500",
  },
  {
    colorClass: "border-indigo-500/10 dark:border-indigo-500/5 bg-indigo-50/30 dark:bg-indigo-950/10",
    badgeColor: "bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-transparent",
    dotColor: "bg-indigo-500",
  },
  {
    colorClass: "border-emerald-500/10 dark:border-emerald-500/5 bg-emerald-50/30 dark:bg-emerald-950/10",
    badgeColor: "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-transparent",
    dotColor: "bg-emerald-500",
  },
  {
    colorClass: "border-rose-500/10 dark:border-rose-500/5 bg-rose-50/30 dark:bg-rose-950/10",
    badgeColor: "bg-rose-100/50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-transparent",
    dotColor: "bg-rose-500",
  },
  {
    colorClass: "border-violet-500/10 dark:border-violet-500/5 bg-violet-50/30 dark:bg-violet-950/10",
    badgeColor: "bg-violet-100/50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-transparent",
    dotColor: "bg-violet-500",
  },
];
 
export default function KanbanBoard({ 
  columns = [], 
  initialTasks = [], 
  workspaceId,
  currentUserId
}: KanbanBoardProps) {
  const supabase = createClient();
  const [cols, setCols] = useState<Column[]>(columns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
 
  // Form states cho Task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.LOW);
  const [newColumnId, setNewColumnId] = useState<string>("");
 
  // Form states cho Column
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
  const [newColTitle, setNewColTitle] = useState("");
 
  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
    e.currentTarget.classList.add("opacity-50");
  };
 
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    e.currentTarget.classList.remove("opacity-50");
  };
 
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
 
  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!id) return;
 
    // Optimistic UI update: Thay đổi state trước để tạo cảm giác phản hồi tức thì
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, column_id: targetColumnId } : task
      )
    );
 
    // Lưu thay đổi vào Supabase
    const { error } = await supabase
      .from("tasks")
      .update({ column_id: targetColumnId })
      .eq("id", id);
 
    if (error) {
      console.error("Lỗi khi chuyển trạng thái nhiệm vụ:", error.message);
      alert(`Lỗi di chuyển công việc: ${error.message}`);
    }
  };
 
  // Add & Edit task handlers
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
 
    const activeColumnId = newColumnId || (cols[0]?.id || "");
    if (!activeColumnId) return;
    if (editingTaskId) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                title: newTitle.trim(),
                description: newDescription.trim(),
                priority: newPriority,
                column_id: activeColumnId,
              }
            : t
        )
      );

      setIsModalOpen(false);
      setEditingTaskId(null);

      const { error } = await supabase
        .from("tasks")
        .update({
          title: newTitle.trim(),
          description: newDescription.trim(),
          priority: newPriority,
          column_id: activeColumnId,
        })
        .eq("id", editingTaskId);

      if (error) {
        console.error("Lỗi khi cập nhật nhiệm vụ:", error.message);
        alert(`Không thể cập nhật nhiệm vụ: ${error.message}`);
      }

      setNewTitle("");
      setNewDescription("");
      setNewPriority(TaskPriority.LOW);
      return;
    }
    const columnTasks = tasks.filter((t) => t.column_id === activeColumnId);
    const maxPosition = columnTasks.reduce((max, t) => t.position > max ? t.position : max, -1);
    const position = maxPosition + 1;
 
    const newTaskId = crypto.randomUUID();
    const { data: newTaskData, error } = await supabase
      .from("tasks")
      .insert({
        id: newTaskId,
        column_id: activeColumnId,
        workspace_id: workspaceId,
        title: newTitle.trim(),
        description: newDescription.trim(),
        position,
        assignee_id: currentUserId,
        created_by: currentUserId,
        priority: newPriority,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
 
    if (error) {
      console.error("Lỗi khi thêm nhiệm vụ:", error.message);
      alert(`Không thể thêm nhiệm vụ: ${error.message}`);
      return;
    }
 
    if (newTaskData) {
      setTasks((prev) => [newTaskData as Task, ...prev]);
      setIsModalOpen(false);
   
      // Reset Form
      setNewTitle("");
      setNewDescription("");
      setNewPriority(TaskPriority.LOW);
    }
  };
 
  // Column handlers
  const handleSubmitColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    if (editingColumnId) {
      setCols((prev) =>
        prev.map((c) =>
          c.id === editingColumnId ? { ...c, title: newColTitle.trim() } : c
        )
      );
      setIsColModalOpen(false);
      setEditingColumnId(null);

      const { error } = await supabase
        .from("columns")
        .update({ title: newColTitle.trim() })
        .eq("id", editingColumnId);

      if (error) {
        console.error("Lỗi khi cập nhật cột:", error.message);
        alert(`Không thể cập nhật cột: ${error.message}`);
      }
      setNewColTitle("");
      return;
    }
    const position = cols.length;
 
    const newColId = crypto.randomUUID();
    const { data: newColData, error } = await supabase
      .from("columns")
      .insert({
        id: newColId,
        title: newColTitle.trim(),
        position,
        workspace_id: workspaceId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
 
    if (error) {
      console.error("Lỗi khi thêm cột:", error.message);
      alert(`Không thể thêm cột: ${error.message}`);
      return;
    }
 
    if (newColData) {
      setCols((prev) => [...prev, newColData as Column]);
      setIsColModalOpen(false);
      setNewColTitle("");
 
      // Nếu đây là cột đầu tiên được tạo, tự động set làm cột mặc định cho form tạo task
      if (!newColumnId) {
        setNewColumnId(newColData.id);
      }
    }
  };
  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;
    
    const id = columnToDelete.id;
    setCols((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.column_id !== id));
    setColumnToDelete(null);

    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Lỗi khi xóa cột:", error.message);
      alert(`Lỗi khi xóa cột: ${error.message}`);
    }
  };
  const handleDeleteTask = async (id: string) => {
    // Optimistic UI update
    setTasks((prev) => prev.filter((task) => task.id !== id));
 
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);
 
    if (error) {
      console.error("Lỗi khi xóa nhiệm vụ:", error.message);
      alert(`Lỗi khi xóa nhiệm vụ: ${error.message}`);
    }
  };
 
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return (
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#FDEBEC] text-[#9F2F2D] dark:bg-rose-950/20 dark:text-rose-400 border border-transparent">
            Quan trọng
          </span>
        );
      case TaskPriority.MEDIUM:
        return (
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#FBF3DB] text-[#956400] dark:bg-amber-950/20 dark:text-amber-400 border border-transparent">
            Trung bình
          </span>
        );
      case TaskPriority.LOW:
        return (
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#E1F3FE] text-[#1F6C9F] dark:bg-sky-950/20 dark:text-sky-400 border border-transparent">
            Bình thường
          </span>
        );
    }
  };
 
  const openModal = () => {
    if (cols.length > 0 && !newColumnId) {
      setNewColumnId(cols[0].id);
    }
    setEditingTaskId(null);
    setNewTitle("");
    setNewDescription("");
    setNewPriority(TaskPriority.LOW);
    setIsModalOpen(true);
  };
 
  const openEditTaskModal = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDescription(task.description || "");
    setNewPriority(task.priority);
    setNewColumnId(task.column_id);
    setIsModalOpen(true);
  };

  const openColModal = () => {
    setEditingColumnId(null);
    setNewColTitle("");
    setIsColModalOpen(true);
  };

  const openEditColModal = (col: Column) => {
    setEditingColumnId(col.id);
    setNewColTitle(col.title);
    setIsColModalOpen(true);
  };
 
  return (
    <div className="flex flex-col flex-1">
      {/* Kanban Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-10 pb-6 border-b border-black/5 dark:border-white/5">
        <div>
          <h2 className="text-3xl font-normal font-serif tracking-tight leading-none italic">Bảng tiến độ công việc</h2>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-550 block mt-2.5">
            DRAG AND DROP TASKS TO CHANGE STATUS
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={openColModal}
            className="flex-1 sm:flex-initial h-9 flex items-center justify-center gap-2 rounded-lg border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-350 font-semibold text-xs px-4 transition-all duration-200 active:scale-[0.98] cursor-pointer bg-background"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="truncate">Thêm cột</span>
          </button>
          <button
            onClick={openModal}
            disabled={cols.length === 0}
            className="flex-1 sm:flex-initial h-9 flex items-center justify-center gap-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs px-4 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="truncate">Thêm công việc</span>
          </button>
        </div>
      </div>
 
      {/* Scrollable Column Container */}
      <div className="flex overflow-x-auto pb-6 gap-6 items-start -mx-4 px-4 md:-mx-8 md:px-8 flex-1">
        {cols.map((column, index) => {
          const style = columnStyles[index % columnStyles.length];
          const columnTasks = tasks.filter((t) => t.column_id === column.id);
 
          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`group/col flex flex-col w-[290px] sm:w-[320px] shrink-0 border rounded-xl p-4 min-h-[500px] transition-all duration-300 ${style.colorClass}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
                  <span className="font-bold text-zinc-700 dark:text-zinc-200 text-xs tracking-wide truncate max-w-[180px]">
                    {column.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${style.badgeColor}`}>
                    {columnTasks.length}
                  </span>
                  <div className="flex opacity-0 group-hover/col:opacity-100 transition-opacity gap-1">
                    <button
                      onClick={() => openEditColModal(column)}
                      className="text-zinc-400 hover:text-accent p-1 rounded-md cursor-pointer"
                      title="Sửa cột"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.13a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setColumnToDelete(column)}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md cursor-pointer"
                      title="Xóa cột"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
 
              {/* Cards Container */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[600px] pr-1 scrollbar-none">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="group bg-background dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing relative"
                  >
                    {/* Priority Badge */}
                    <div className="mb-3 flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-200">
                        <button
                          onClick={() => openEditTaskModal(task)}
                          className="text-zinc-400 hover:text-accent dark:hover:text-accent p-1 rounded cursor-pointer transition-colors"
                          title="Sửa công việc"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.13a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                          title="Xóa công việc"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
 
                    {/* Card Title */}
                    <h3 className="font-bold text-xs text-foreground mb-1 leading-snug group-hover:text-accent transition-colors">
                      {task.title}
                    </h3>
 
                    {/* Card Description */}
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-3">
                      {task.description}
                    </p>
 
                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[8px] text-zinc-400 dark:text-zinc-550 font-mono">
                      <span className="truncate max-w-[80px]">{task.id}</span>
                      <span>
                        {task.created_at ? new Date(task.created_at).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "short",
                        }) : ""}
                      </span>
                    </div>
                  </div>
                ))}
 
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-zinc-450 dark:text-zinc-550 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-250">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Kéo thả vào đây</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {cols.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 w-full text-center text-zinc-400 dark:text-zinc-600 bg-background border border-dashed border-black/10 dark:border-white/10 rounded-xl">
            <svg className="w-10 h-10 mb-4 opacity-20 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            <p className="font-semibold text-zinc-750 dark:text-zinc-400 text-xs">Chưa có cột công việc nào được tạo.</p>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-wider">Vui lòng tạo cột trước khi thêm công việc.</p>
          </div>
        )}
      </div>
 
      {/* Modal - Create Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-background border border-border-muted rounded-xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">
                {editingTaskId ? "Sửa công việc" : "Thêm công việc mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề công việc..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-9 bg-background border border-border-muted focus:border-accent rounded-lg px-3 text-xs text-foreground focus:outline-none transition-colors focus:ring-2 focus:ring-accent/10"
                />
              </div>
 
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                  Mô tả chi tiết
                </label>
                <textarea
                  placeholder="Nhập mô tả công việc..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border-muted focus:border-accent rounded-lg p-3 text-xs text-foreground focus:outline-none transition-colors resize-none focus:ring-2 focus:ring-accent/10"
                />
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                    Độ ưu tiên
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full h-9 bg-background border border-border-muted focus:border-accent rounded-lg px-2 text-xs text-foreground focus:outline-none transition-colors cursor-pointer focus:ring-2 focus:ring-accent/10"
                  >
                    <option value={TaskPriority.LOW}>Bình thường</option>
                    <option value={TaskPriority.MEDIUM}>Trung bình</option>
                    <option value={TaskPriority.HIGH}>Quan trọng</option>
                  </select>
                </div>
 
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                    Cột công việc
                  </label>
                  <select
                    value={newColumnId}
                    onChange={(e) => setNewColumnId(e.target.value)}
                    className="w-full h-9 bg-background border border-border-muted focus:border-accent rounded-lg px-2 text-xs text-foreground focus:outline-none transition-colors cursor-pointer focus:ring-2 focus:ring-accent/10"
                  >
                    {cols.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-9 border border-border-muted rounded-lg text-zinc-500 font-semibold text-xs hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  {editingTaskId ? "Cập nhật" : "Tạo công việc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {/* Modal - Create/Edit Column */}
      {isColModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-background border border-border-muted rounded-xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">
                {editingColumnId ? "Sửa cột" : "Thêm cột mới"}
              </h3>
              <button
                onClick={() => setIsColModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <form onSubmit={handleSubmitColumn} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                  Tên cột
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên cột (ví dụ: Đang tiến hành...)"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  className="w-full h-9 bg-background border border-border-muted focus:border-accent rounded-lg px-3 text-xs text-foreground focus:outline-none transition-colors focus:ring-2 focus:ring-accent/10"
                />
              </div>
 
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsColModalOpen(false)}
                  className="flex-1 h-9 border border-border-muted rounded-lg text-zinc-500 font-semibold text-xs hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  {editingColumnId ? "Cập nhật" : "Tạo cột"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Confirm Delete Column */}
      {columnToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
              <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Xóa cột
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Bạn có chắc chắn muốn xóa cột <span className="font-bold text-slate-800 dark:text-slate-200">&quot;{columnToDelete.title}&quot;</span> không? Toàn bộ công việc trong cột cũng sẽ bị xóa. Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setColumnToDelete(null)}
                className="flex-1 h-11 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors bg-white dark:bg-transparent shadow-sm dark:shadow-none"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteColumn}
                className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-lg shadow-rose-600/20 transition-colors"
              >
                Xóa cột
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
