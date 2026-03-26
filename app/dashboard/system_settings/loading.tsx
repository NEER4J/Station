import { LoadingState } from "@/components/shared/loading-state";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
      </div>
      <LoadingState variant="table" count={4} />
    </div>
  );
}
