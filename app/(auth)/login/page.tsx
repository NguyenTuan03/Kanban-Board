import React from "react";
import { signInWithGitHub, signInWithFacebook } from "./action";
import ThemeToggle from "@/components/theme/theme-toggle";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const error = resolvedParams.error;

  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans transition-colors duration-300 overflow-hidden">
      {/* Theme Toggle ở góc trên bên phải */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <main className="relative w-full max-w-sm bg-background border border-border-muted rounded-xl p-8 shadow-none transition-all duration-300">
        {/* Brand/Logo Area */}
        <div className="text-left mb-10">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background mb-6 shadow-none">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
              />
            </svg>
          </div>

          <h1 className="text-4xl tracking-tight leading-none italic font-normal font-serif">
            Kanban Flow
          </h1>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-550 mt-3 block">
            WORKSPACE MANAGEMENT SYSTEM
          </span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed max-w-[28ch]">
            Hệ thống tối giản giúp tổ chức công việc và theo dõi tiến độ dự án của bạn hiệu quả.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400 text-xs">
            <svg
              className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-500"
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
              <p className="font-semibold text-rose-700 dark:text-rose-350">Lỗi xác thực</p>
              <p className="text-zinc-450 dark:text-rose-400/80 mt-1 leading-normal">
                {error === "auth-code-error"
                  ? "Không thể xác thực mã từ dịch vụ."
                  : "Có lỗi xảy ra trong quá trình kết nối với GitHub."}
              </p>
            </div>
          </div>
        )}

        {/* Login Button Area */}
        <form action={signInWithGitHub} className="space-y-4 mb-2">
          <button
            type="submit"
            className="w-full flex h-10 items-center justify-center gap-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-none"
          >
            {/* GitHub SVG Icon */}
            <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
              />
            </svg>
            Tiếp tục với GitHub
          </button>
        </form>

        {/* Facebook Login Button */}
        <form action={signInWithFacebook} className="space-y-4 mt-2">
          <button
            type="submit"
            className="w-full flex h-10 items-center justify-center gap-2.5 rounded-lg bg-[#1877F2] text-white hover:bg-[#1877F2]/90 font-semibold text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-none"
          >
            {/* Facebook SVG Icon */}
            <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Tiếp tục với Facebook
          </button>
        </form>

        {/* Footer Area */}
        <footer className="mt-10 text-left text-[9px] text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-[34ch] font-mono">
          Bằng việc tiếp tục, bạn đồng ý với các điều khoản dịch vụ và chính sách bảo mật của chúng tôi.
        </footer>
      </main>
    </div>
  );
}
