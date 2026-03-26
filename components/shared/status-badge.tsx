import { cn } from "@/lib/utils";

type BadgeStatus = "active" | "inactive" | "pending" | "warning" | "success";

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  active: "bg-green-500 text-white",
  success: "bg-green-500 text-white",
  pending: "bg-orange-500 text-white",
  warning: "bg-orange-500 text-white",
  inactive: "bg-gray-200 text-gray-600",
};

const defaultLabels: Record<BadgeStatus, string> = {
  active: "Active",
  success: "Success",
  pending: "Pending",
  warning: "Warning",
  inactive: "Inactive",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        statusStyles[status],
        className,
      )}
    >
      {label ?? defaultLabels[status]}
    </span>
  );
}
