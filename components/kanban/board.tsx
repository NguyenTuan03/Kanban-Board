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
    colorClass: "border-slate-500/20 bg-slate-950/10 text-slate-400",
    badgeColor: "bg-slate-500/10 text-slate-400",
    dotColor: "bg-slate-400",
  },
  {
    colorClass: "border-amber-500/20 bg-amber-950/10 text-amber-400",
    badgeColor: "bg-amber-500/10 text-amber-400",
    dotColor: "bg-amber-500",
  },
  {
    colorClass: "border-indigo-500/20 bg-indigo-950/10 text-indigo-400",
    badgeColor: "bg-indigo-500/10 text-indigo-400",
    dotColor: "bg-indigo-500",
  },
  {
    colorClass: "border-emerald-500/20 bg-emerald-950/10 text-emerald-400",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  {
    colorClass: "border-rose-500/20 bg-rose-950/10 text-rose-400",
    badgeColor: "bg-rose-500/10 text-rose-400",
    dotColor: "bg-rose-500",
  },
  {
    colorClass: "border-purple-500/20 bg-purple-950/10 text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-400",
    dotColor: "bg-purple-500",
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
          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Quan trọng
          </span>
        );
      case TaskPriority.MEDIUM:
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Trung bình
          </span>
        );
      case TaskPriority.LOW:
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Bảng tiến độ công việc</h2>
          <p className="text-sm text-slate-400 mt-1">Kéo thả các công việc để thay đổi trạng thái</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsColModalOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 hover:bg-white/5 text-slate-100 font-semibold text-sm px-5 transition-all duration-200 active:scale-98 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Thêm cột
          </button>
          <button
            onClick={openModal}
            disabled={cols.length === 0}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 transition-all duration-200 active:scale-98 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Thêm công việc
          </button>
        </div>
      </div>
 
      {/* Grid Columns */}
      <div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-fr gap-6 flex-1 items-start">
        {cols.map((column, index) => {
          const style = columnStyles[index % columnStyles.length];
          const columnTasks = tasks.filter((t) => t.column_id === column.id);
 
          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="flex flex-col bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 min-h-[500px] transition-colors duration-200"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${style.dotColor}`} />
                  <span className="font-bold text-slate-200 text-sm tracking-wide">
                    {column.title}
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.badgeColor}`}>
                  {columnTasks.length}
                </span>
              </div>
 
              {/* Cards Container */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="group bg-slate-950/60 hover:bg-slate-950 border border-white/5 hover:border-slate-700/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative"
                  >
                    {/* Priority Badge */}
                    <div className="mb-2.5 flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded-md transition-opacity duration-200 cursor-pointer"
                        title="Xóa công việc"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
 
                    {/* Card Title */}
                    <h3 className="font-bold text-sm text-slate-200 mb-1 leading-snug group-hover:text-white transition-colors">
                      {task.title}
                    </h3>
 
                    {/* Card Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                      {task.description}
                    </p>
 
                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                      <span className="truncate max-w-[100px]">{task.id}</span>
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
                  <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-slate-600 border border-dashed border-white/5 rounded-xl">
                    <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 3h6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-[11px]">Kéo công việc vào đây</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {cols.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl">
            <svg className="w-12 h-12 mb-4 opacity-20 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            <p className="font-medium text-slate-400 text-sm">Chưa có cột công việc nào được tạo.</p>
            <p className="text-xs text-slate-500 mt-1">Vui lòng tạo cột trước khi thêm công việc.</p>
          </div>
        )}
      </div>
 
      {/* Modal - Create Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-100">Thêm công việc mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề công việc..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-white/10 focus:border-indigo-500 rounded-xl px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                />
              </div>
 
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mô tả chi tiết
                </label>
                <textarea
                  placeholder="Nhập mô tả công việc..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500 rounded-xl p-4 text-sm text-slate-100 focus:outline-none transition-colors resize-none"
                />
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Độ ưu tiên
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full h-11 bg-slate-950 border border-white/10 focus:border-indigo-500 rounded-xl px-3 text-sm text-slate-200 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value={TaskPriority.LOW}>Bình thường</option>
                    <option value={TaskPriority.MEDIUM}>Trung bình</option>
                    <option value={TaskPriority.HIGH}>Quan trọng</option>
                  </select>
                </div>
 
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cột công việc
                  </label>
                  <select
                    value={newColumnId}
                    onChange={(e) => setNewColumnId(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-white/10 focus:border-indigo-500 rounded-xl px-3 text-sm text-slate-200 focus:outline-none transition-colors cursor-pointer"
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
                  className="flex-1 h-11 border border-white/10 rounded-xl text-slate-300 font-semibold text-sm hover:bg-white/5 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-100">Thêm cột mới</h3>
              <button
                onClick={() => setIsColModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <form onSubmit={handleCreateColumn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tên cột
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên cột (ví dụ: Đang tiến hành, Đã hoàn thành...)"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-white/10 focus:border-indigo-500 rounded-xl px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                />
              </div>
 
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsColModalOpen(false)}
                  className="flex-1 h-11 border border-white/10 rounded-xl text-slate-300 font-semibold text-sm hover:bg-white/5 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 transition-colors"
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
