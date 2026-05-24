import React from "react";
import { signInWithGitHub } from "./action";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const error = resolvedParams.error;

  return (
    <div className="min-h-screen bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative w-full max-w-md bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl transition-all duration-300 hover:border-indigo-500/30">
        {/* Brand/Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 text-white mb-4">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Kanban Board
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Đăng nhập để quản lý công việc và dự án của bạn
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
            <svg
              className="h-5 w-5 shrink-0 mt-0.5"
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
            <div>
              <p className="font-semibold text-rose-300">Đăng nhập thất bại</p>
              <p className="text-xs text-rose-400/80 mt-1">
                {error === "auth-code-error"
                  ? "Không thể xác thực mã code từ nhà cung cấp dịch vụ."
                  : "Có lỗi xảy ra trong quá trình đăng nhập qua GitHub."}
              </p>
            </div>
          </div>
        )}

        {/* Login Button Area */}
        <form action={signInWithGitHub} className="space-y-4">
          <button
            type="submit"
            className="w-full flex h-13 items-center justify-center gap-3 rounded-2xl bg-white text-slate-900 font-semibold text-base transition-all duration-300 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/10 active:scale-98 cursor-pointer"
          >
            {/* GitHub SVG Icon */}
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
              />
            </svg>
            Tiếp tục với GitHub
          </button>
        </form>

        {/* Footer Area */}
        <footer className="mt-8 text-center text-xs text-slate-500">
          Bằng việc tiếp tục, bạn đồng ý với các điều khoản dịch vụ và chính sách bảo mật của chúng tôi.
        </footer>
      </main>
    </div>
  );
}
