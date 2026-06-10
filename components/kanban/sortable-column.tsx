"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "@/types/kanban";

interface SortableColumnProps {
  column: Column;
  children: React.ReactNode;
  styleObj: { colorClass: string; badgeColor: string; dotColor: string };
}

export function SortableColumn({ column, children, styleObj }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex flex-col w-[290px] sm:w-[320px] shrink-0 border-2 border-accent/50 rounded-xl min-h-[500px] opacity-40 bg-background`}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/col flex flex-col w-[290px] sm:w-[320px] shrink-0 border rounded-xl p-4 min-h-[500px] transition-colors duration-300 ${styleObj.colorClass}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/5 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${styleObj.dotColor}`} />
          <span className="font-bold text-zinc-700 dark:text-zinc-200 text-xs tracking-wide truncate max-w-[180px]">
            {column.title}
          </span>
        </div>
        {/* Nút tác vụ (Sửa/Xóa cột) được truyền từ component cha sẽ hiển thị ở đây */}
        {/* Để tránh lỗi khi click vào nút bị tính là kéo thả, chúng ta nên tách riêng handler hoặc xử lý onPointerDown. Ở đây ta coi cả header là tay cầm kéo, và các nút bên trong cần e.stopPropagation() */}
      </div>

      {children}
    </div>
  );
}
