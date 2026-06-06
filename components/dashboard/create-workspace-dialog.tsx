"use client";

import { createNewWorkspace } from "@/app/(dashboard)/dashboard/actions";
import React, { useState } from "react";

export default function CreateWorkspaceDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createNewWorkspace(name);
      if (res.success) {
        // Reset form và đóng modal khi thành công
        setName("");
        setIsOpen(false);
      } else {
        setErrorMsg(res.message || "Đã xảy ra lỗi không xác định.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Nút kích hoạt mở Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs px-4 transition-all duration-200 active:scale-[0.98] cursor-pointer"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Tạo workspace
      </button>

      {/* Modal Overlay & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-background border border-border-muted rounded-xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">
                Tạo không gian làm việc mới
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                disabled={isSubmitting}
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-450 rounded-lg text-[11px] font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
                  Tên không gian (Dự án)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Dự án Thiết kế Web..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-9 bg-background border border-border-muted focus:border-accent rounded-lg px-3 text-xs text-foreground focus:outline-none transition-colors focus:ring-2 focus:ring-accent/10"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-9 border border-border-muted rounded-lg text-zinc-500 font-semibold text-xs hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 disabled:opacity-50 cursor-pointer transition-colors bg-background"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-9 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 font-semibold text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-background border-t-transparent"></div>
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo không gian"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
