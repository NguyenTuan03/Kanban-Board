import React from "react";
 
export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      {/* Skeleton Dashboard Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-border-muted animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-3 w-32 bg-zinc-200/60 dark:bg-zinc-800/60 rounded"></div>
        </div>
        <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
      </div>
  
      {/* Skeleton Grid of Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Featured Card Skeleton */}
        <div className="md:col-span-2 min-h-[190px] bg-zinc-50/50 dark:bg-zinc-900/10 border border-border-muted rounded-xl p-6 flex flex-col justify-between animate-pulse">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-850 rounded"></div>
              <div className="space-y-1.5 flex-1 max-w-[200px]">
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-2.5 w-1/2 bg-zinc-200/60 dark:bg-zinc-805 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-3/4 bg-zinc-200/70 dark:bg-zinc-800/70 rounded"></div>
              <div className="h-3 w-1/2 bg-zinc-200/70 dark:bg-zinc-800/70 rounded"></div>
            </div>
          </div>
          <div className="pt-3 border-t border-border-muted flex justify-between">
            <div className="h-3 w-28 bg-zinc-200/60 dark:bg-zinc-800/60 rounded"></div>
            <div className="h-3.5 w-3.5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full"></div>
          </div>
        </div>

        {/* Regular Card Skeletons */}
        {[1, 2].map((i) => (
          <div key={i} className="min-h-[170px] bg-background border border-border-muted rounded-xl p-6 flex flex-col justify-between animate-pulse">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-850 rounded"></div>
                <div className="space-y-1.5 flex-1 max-w-[120px]">
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-2.5 w-2/3 bg-zinc-200/60 dark:bg-zinc-805 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-200/70 dark:bg-zinc-800/70 rounded"></div>
                <div className="h-3 w-5/6 bg-zinc-200/70 dark:bg-zinc-800/70 rounded"></div>
              </div>
            </div>
            <div className="pt-3 border-t border-border-muted flex justify-between">
              <div className="h-3 w-28 bg-zinc-200/60 dark:bg-zinc-800/60 rounded"></div>
              <div className="h-3.5 w-3.5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
