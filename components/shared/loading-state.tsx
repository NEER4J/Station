import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "cards" | "table" | "page";
  count?: number;
  columns?: number;
  className?: string;
}

export function LoadingState({
  variant = "cards",
  count = 4,
  columns = 6,
  className,
}: LoadingStateProps) {
  if (variant === "table") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton className="h-4 w-56 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        {/* Filter bar skeleton */}
        <div className="rounded-xl bg-white shadow-sm p-3 flex items-center gap-3">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-[140px] rounded-lg" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-6 bg-gray-50 px-4 py-3">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-3 rounded"
                style={{ width: `${60 + Math.random() * 40}px` }}
              />
            ))}
          </div>
          {/* Body rows */}
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-6 px-4 py-3.5",
                i % 2 === 1 && "bg-gray-50/50",
              )}
            >
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton
                  key={j}
                  className="h-4 rounded"
                  style={{ width: `${50 + Math.random() * 60}px` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Page header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        {/* Table skeleton below cards */}
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-6 bg-gray-50 px-4 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20 rounded" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-6 px-4 py-3.5",
                i % 2 === 1 && "bg-gray-50/50",
              )}
            >
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-20 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: cards
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
