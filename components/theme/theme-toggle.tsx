"use client";

import React, { useEffect, useState } from "react";
import { Theme } from "@/types/kanban";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sử dụng setTimeout(..., 0) để dời cập nhật state sang macro-task tiếp theo, tránh cascading renders đồng bộ và đảm bảo chạy ổn định
    const timer = setTimeout(() => {
      setMounted(true);
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? Theme.DARK : Theme.LIGHT);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(nextTheme);

    if (nextTheme === Theme.DARK) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", Theme.DARK);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", Theme.LIGHT);
    }
  };

  // Tránh Hydration mismatch bằng cách không render icon cho đến khi mounted ở client
  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 animate-pulse" />;
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 transition-all duration-200 cursor-pointer active:scale-95"
      title={theme === Theme.DARK ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {theme === Theme.DARK ? (
        // Icon Mặt trời (Sun)
        <svg
          className="h-4.5 w-4.5 animate-in spin-in-45 duration-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
      ) : (
        // Icon Mặt trăng (Moon)
        <svg
          className="h-4.5 w-4.5 animate-in spin-in-45 duration-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </button>
  );
}
