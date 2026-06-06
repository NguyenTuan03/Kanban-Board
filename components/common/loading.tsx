import React from "react";
 
interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}
 
export default function Loading({
  message = "Đang tải...",
  fullScreen = true,
}: LoadingProps) {
  return (
    <div
      className={`${
        fullScreen ? "min-h-[60vh] w-full" : "w-full py-12"
      } bg-background text-foreground flex items-center justify-center p-6 font-sans transition-colors duration-300`}
    >
      <div className="space-y-4 flex flex-col items-center">
        {/* Tối giản Spinner - Vòng xoay mảnh đơn sắc */}
        <div className="h-6 w-6 border-2 border-zinc-200 dark:border-zinc-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
