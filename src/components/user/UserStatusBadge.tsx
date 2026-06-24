"use client";

import { UserStatus } from "@/types";

const STATUS_STYLES: Record<UserStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  inactive: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  suspended: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.inactive}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500 animate-pulse" : status === "suspended" ? "bg-rose-500" : "bg-slate-400"}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
