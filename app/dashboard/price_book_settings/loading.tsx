import { LoadingState } from "@/components/shared/loading-state";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-80 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <LoadingState variant="table" count={4} />
      <LoadingState variant="table" count={4} />
      <LoadingState variant="table" count={4} />
    </div>
  );
}
