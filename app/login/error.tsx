"use client";

import Link from "next/link";
import React, { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log lỗi ra console để lập trình viên dễ theo dõi khi debug
    console.error("Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <main className="relative w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl text-center">
        {/* Warning Icon */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-6 animate-pulse">
          <svg
            className="h-8 w-8"
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
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-2">
          Đã xảy ra lỗi hệ thống
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Ứng dụng gặp sự cố không mong muốn trong quá trình xử lý yêu cầu của bạn.
        </p>

        {/* Technical details (digest) */}
        {error.digest && (
          <div className="mb-6 p-3.5 bg-slate-950/40 rounded-xl border border-white/5 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Mã lỗi hệ thống (Error Digest)
            </span>
            <code className="text-xs text-rose-400 font-mono select-all">
              {error.digest}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex h-12 items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 active:scale-98 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Thử lại trang này
          </button>
          <Link
            href="/"
            className="w-full flex h-12 items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all duration-200 border border-white/5 cursor-pointer"
          >
            Quay về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}
