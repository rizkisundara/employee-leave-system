import { LeaveStatus } from "@/types";

interface StatusBadgeProps {
  status: LeaveStatus;
}

const STATUS_CONFIG: Record<LeaveStatus, { label: string; className: string }> = {
  PENDING_MANAGER: {
    label: "Pending (Manager)",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  PENDING_HR: {
    label: "Pending (HR)",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  // Normalize legacy status or fallback if status is missing/unexpected
  const normalizedStatus = status === ("PENDING" as any) ? "PENDING_MANAGER" : status;
  const config = STATUS_CONFIG[normalizedStatus] || {
    label: String(status || "Unknown"),
    className: "bg-secondary text-muted-foreground border-border/40",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
