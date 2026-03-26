import { Radio } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function RealtimeFeedPlaceholder() {
  return (
    <EmptyState
      icon={Radio}
      title="Real-Time Feed"
      description="Live transaction and event feed will appear here. This feature is coming in a future update."
    />
  );
}
