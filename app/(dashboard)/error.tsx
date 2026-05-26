"use client"
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {

  return (
    <main className="min-h-screen bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-lg font-medium text-slate-300">Đang tải...</p>
      </div>

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
  )
}
