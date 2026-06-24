"use client";

import { UserRole } from "@/types";

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  manager: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  employee: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[role] || ROLE_STYLES.employee}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
