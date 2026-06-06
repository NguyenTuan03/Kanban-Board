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
    colorClass: "border-border-muted bg-background",
    badgeColor: "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-border-muted",
    dotColor: "bg-zinc-400 dark:bg-zinc-500",
  },
  {
    colorClass: "border-border-muted bg-background",
    badgeColor: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/30 dark:border-amber-950/20",
    dotColor: "bg-amber-500",
  },
  {
    colorClass: "border-border-muted bg-background",
    badgeColor: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-950/20",
    dotColor: "bg-indigo-500",
  },
  {
    colorClass: "border-border-muted bg-background",
    badgeColor: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-950/20",
    dotColor: "bg-emerald-500",
  },
  {
    colorClass: "border-border-muted bg-background",
    badgeColor: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200/30 dark:border-rose-950/20",
    dotColor: "bg-rose-500",
  },
  {
    colorClass: "border-border-muted bg-background",
    badgeColor: "bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-200/30 dark:border-violet-950/20",
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
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.LOW);
  const [newColumnId, setNewColumnId] = useState<string>("");
 
  // Form states cho Column
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
 
  // Add & Delete task handlers
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
 
    const activeColumnId = newColumnId || (cols[0]?.id || "");
    if (!activeColumnId) return;
 
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
 
  // Create Column handler
  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
 
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
    setIsModalOpen(true);
  };
 
  return (
    <div className="flex flex-col flex-1">
      {/* Kanban Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-10 pb-6 border-b border-border-muted">
        <div>
          <h2 className="text-3xl font-normal font-serif tracking-tight leading-none italic">Bảng tiến độ công việc</h2>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-550 block mt-2.5">
            DRAG AND DROP TASKS TO CHANGE STATUS
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsColModalOpen(true)}
            className="flex-1 sm:flex-initial h-9 flex items-center justify-center gap-2 rounded-lg border border-border-muted hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 text-zinc-600 dark:text-zinc-350 font-semibold text-xs px-4 transition-all duration-200 active:scale-[0.98] cursor-pointer bg-background"
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
      <div className="flex overflow-x-auto pb-6 gap-6 items-start -mx-4 px-4 md:mx-0 md:px-0 flex-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-850 scrollbar-track-transparent">
        {cols.map((column, index) => {
          const style = columnStyles[index % columnStyles.length];
          const columnTasks = tasks.filter((t) => t.column_id === column.id);
 
          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col w-[290px] sm:w-[320px] shrink-0 border rounded-xl p-4 min-h-[500px] transition-all duration-300 ${style.colorClass}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-muted">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
                  <span className="font-bold text-zinc-700 dark:text-zinc-200 text-xs tracking-wide truncate max-w-[180px]">
                    {column.title}
                  </span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${style.badgeColor}`}>
                  {columnTasks.length}
                </span>
              </div>
 
              {/* Cards Container */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[600px] pr-1 scrollbar-none">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="group bg-background hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 border border-border-muted hover:border-zinc-450 dark:hover:border-zinc-700 rounded-xl p-4 shadow-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 cursor-grab active:cursor-grabbing relative"
                  >
                    {/* Priority Badge */}
                    <div className="mb-3 flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-600 dark:text-zinc-550 dark:hover:text-rose-400 p-1 rounded transition-opacity duration-200 cursor-pointer"
                        title="Xóa công việc"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
                    <div className="flex items-center justify-between pt-2 border-t border-border-muted text-[8px] text-zinc-400 dark:text-zinc-550 font-mono">
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
                  <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-zinc-400 dark:text-zinc-650 border border-dashed border-border-muted rounded-xl">
                    <svg className="w-6 h-6 mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 3h6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-[9px] font-mono uppercase tracking-wider">Kéo thả vào đây</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {cols.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 w-full text-center text-zinc-400 dark:text-zinc-600 bg-background border border-dashed border-border-muted rounded-xl">
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
              <h3 className="text-sm font-bold text-foreground">Thêm công việc mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <form onSubmit={handleAddTask} className="space-y-4">
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
                  Tạo công việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {/* Modal - Create Column */}
      {isColModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-background border border-border-muted rounded-xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">Thêm cột mới</h3>
              <button
                onClick={() => setIsColModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <form onSubmit={handleCreateColumn} className="space-y-4">
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
                  Tạo cột
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
