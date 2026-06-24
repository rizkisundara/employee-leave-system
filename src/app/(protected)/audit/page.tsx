"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { Search, ScrollText, ChevronLeft, ChevronRight, Activity, Users, UserCheck, FileText, TreePalm, Database } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  USER_UPDATED: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  USER_DELETED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  USER_LOGIN: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  USER_LOGOUT: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  EMPLOYEE_CREATED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  EMPLOYEE_UPDATED: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  EMPLOYEE_DELETED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  LEAVE_REQUESTED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  LEAVE_APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  LEAVE_REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  HOLIDAY_CREATED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  HOLIDAY_DELETED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  QUOTA_UPDATED: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  DATA_RESET: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  DATA_EXPORTED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  DATA_IMPORTED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

const CATEGORY_TABS: { value: string; label: string; icon: any }[] = [
  { value: "ALL", label: "All", icon: Activity },
  { value: "USER", label: "Users", icon: Users },
  { value: "EMPLOYEE", label: "Employees", icon: UserCheck },
  { value: "LEAVE", label: "Leave", icon: FileText },
  { value: "HOLIDAY", label: "Holidays", icon: TreePalm },
  { value: "DATA", label: "System", icon: Database },
];

function formatTimestamp(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return ts;
  }
}

function getRelativeTime(ts: string) {
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

export default function AuditPage() {
  const { auditLogs, loading } = useAuditLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    return auditLogs
      .filter((log) => {
        if (category !== "ALL" && !log.action.startsWith(category)) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!log.details.toLowerCase().includes(q) && !log.performedBy.toLowerCase().includes(q) && !log.action.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, category, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="animate-slide-down">
        <PageHeader title="Audit Trail" description="Complete activity log across the system" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.value === "ALL" ? auditLogs.length : auditLogs.filter(l => l.action.startsWith(tab.value)).length;
          return (
            <button key={tab.value} onClick={() => { setCategory(tab.value); setCurrentPage(1); }}
              className={`group inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition-all duration-200 ${category === tab.value
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                : "bg-card border border-border/40 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border"}`}>
              <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${category === tab.value ? "" : "group-hover:scale-110"}`} />
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${category === tab.value ? "bg-primary-foreground/20" : "bg-secondary"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by action, details, or user..."
            className="flex h-10 w-full rounded-xl border border-input bg-card/50 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200" />
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
        {filtered.length === 0 ? (
          <EmptyState title="No audit logs found" description="Activity logs will appear here as users interact with the system"
            icon={<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"><ScrollText className="h-8 w-8" /></div>} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/20">
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">User</th>
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {paginatedLogs.map((log) => {
                    const actionColor = ACTION_COLORS[log.action] || "bg-slate-500/10 text-slate-600 border-slate-500/20";
                    return (
                      <tr key={log.id} className="transition-all duration-200 hover:bg-secondary/25 group">
                        <td className="px-4 sm:px-6 py-3.5">
                          <div>
                            <p className="text-xs font-medium text-foreground/70 whitespace-nowrap">{formatTimestamp(log.timestamp)}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{getRelativeTime(log.timestamp)}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2 sm:px-2.5 py-0.5 text-[10px] font-bold transition-transform duration-200 group-hover:scale-105 ${actionColor}`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-sm hidden sm:table-cell">
                          <span className="font-semibold text-foreground/80">{log.performedBy}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-xs text-muted-foreground hidden lg:table-cell max-w-xs">
                          <p className="truncate">{log.details}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 bg-secondary/10 px-4 sm:px-6 py-3 sm:py-4">
              <div className="text-xs font-semibold text-muted-foreground">
                <span className="text-foreground">{(safeCurrentPage - 1) * pageSize + 1}</span>–<span className="text-foreground">{Math.min(safeCurrentPage * pageSize, filtered.length)}</span> of <span className="text-foreground">{filtered.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={safeCurrentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 text-muted-foreground transition-all duration-200 active:scale-95"><ChevronLeft className="h-4 w-4" /></button>
                <span className="px-3 text-xs font-bold text-muted-foreground">{safeCurrentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={safeCurrentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 text-muted-foreground transition-all duration-200 active:scale-95"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
