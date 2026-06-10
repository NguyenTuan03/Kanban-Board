"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority } from "@/types/kanban";

interface SortableTaskProps {
  task: Task;
  children?: React.ReactNode;
}

export function SortableTask({ task, children }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group bg-background dark:bg-zinc-900/50 border-2 border-accent/50 rounded-xl p-4 min-h-[120px] opacity-30 relative"
      />
    );
  }

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group bg-background dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing relative"
    >
      {/* Priority Badge & Actions */}
      <div className="mb-3 flex items-center justify-between">
        {getPriorityBadge(task.priority)}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-200">
          {children}
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
  );
}
