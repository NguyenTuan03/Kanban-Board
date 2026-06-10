"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import EditWorkspaceDialog from "./edit-workspace-dialog";
import DeleteWorkspaceDialog from "./delete-workspace-dialog";

interface WorkspaceCardProps {
  ws: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isAdmin?: boolean;
  };
  isFeatured?: boolean;
}

export default function WorkspaceCard({ ws, isFeatured }: WorkspaceCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleCardClick = () => {
    router.push(`/workspace/${ws.slug}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`group bg-zinc-50/50 dark:bg-zinc-900/20 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all duration-300 text-left flex flex-col justify-between cursor-pointer relative ${
          isFeatured 
            ? "md:col-span-2 min-h-[190px] bg-zinc-100/50 dark:bg-zinc-800/20" 
            : "min-h-[170px]"
        }`}
      >
        {/* Action Buttons for Admin */}
        {ws.isAdmin && (
          <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditOpen(true);
              }}
              className="p-1.5 text-zinc-400 hover:text-accent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Sửa tên"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.13a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteOpen(true);
              }}
              className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Xóa workspace"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3.5 pr-16">
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
      </div>

      {/* Render Dialogs */}
      {ws.isAdmin && (
        <>
          <EditWorkspaceDialog
            workspaceId={ws.id}
            currentName={ws.name}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          />
          <DeleteWorkspaceDialog
            workspaceId={ws.id}
            workspaceName={ws.name}
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
          />
        </>
      )}
    </>
  );
}
