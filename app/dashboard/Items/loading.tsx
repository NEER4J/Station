import { LoadingState } from "@/components/shared/loading-state";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-48 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <LoadingState variant="table" count={10} />
    </div>
  );
}
