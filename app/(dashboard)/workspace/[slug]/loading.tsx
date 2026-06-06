import React from "react";
 
export default function WorkspaceLoading() {
  return (
    <div className="flex flex-col flex-1 space-y-6">
      {/* Skeleton Workspace Header */}
      <div className="pb-4 border-b border-border-muted flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-pulse">
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-zinc-200/60 dark:bg-zinc-800/60 rounded"></div>
          <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
 
      <div className="flex flex-col flex-1">
        {/* Skeleton Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-10 pb-6 border-b border-border-muted animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-52 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-2.5 w-64 bg-zinc-200/65 dark:bg-zinc-805 rounded"></div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-1 sm:flex-initial"></div>
            <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-1 sm:flex-initial"></div>
          </div>
        </div>
 
        {/* Skeleton Columns Container */}
        <div className="flex overflow-x-auto pb-6 gap-6 items-start -mx-4 px-4 md:mx-0 md:px-0 flex-1">
          {[
            { titleWidth: "w-20", cardsCount: 2 },
            { titleWidth: "w-28", cardsCount: 1 },
            { titleWidth: "w-24", cardsCount: 3 },
          ].map((col, idx) => (
            <div
              key={idx}
              className="flex flex-col w-[290px] sm:w-[320px] shrink-0 border border-border-muted rounded-xl p-4 min-h-[450px] bg-background animate-pulse"
            >
              {/* Column Header Skeleton */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-muted">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className={`h-3 ${col.titleWidth} bg-zinc-200 dark:bg-zinc-800 rounded`} />
                </div>
                <div className="h-4 w-6 bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
              </div>
 
              {/* Cards Container Skeleton */}
              <div className="flex flex-col gap-3 flex-1">
                {Array.from({ length: col.cardsCount }).map((_, cIdx) => (
                  <div
                    key={cIdx}
                    className="bg-background border border-border-muted rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div className="h-3 w-16 bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
                    <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full bg-zinc-200/70 dark:bg-zinc-800/70 rounded" />
                      <div className="h-2.5 w-5/6 bg-zinc-200/70 dark:bg-zinc-800/70 rounded" />
                    </div>
                    <div className="pt-2 border-t border-border-muted flex justify-between">
                      <div className="h-2 w-12 bg-zinc-200/50 dark:bg-zinc-850 rounded" />
                      <div className="h-2 w-8 bg-zinc-200/50 dark:bg-zinc-850 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
