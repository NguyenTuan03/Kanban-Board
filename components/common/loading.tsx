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
        fullScreen ? "min-h-screen w-full" : "w-full py-12"
      } bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans`}
    >
      <div className="space-y-4 text-center">
        <div className="relative flex items-center justify-center">
          {/* Spinner ngoài xoay xuôi */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          {/* Spinner trong xoay ngược */}
          <div className="absolute rounded-full h-10 w-10 border-r-2 border-l-2 border-purple-500 animate-spin [animation-direction:reverse] duration-75"></div>
        </div>
        <p className="text-lg font-medium text-slate-300 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
