"use client";

import { useState, useMemo } from "react";
import { LeaveRequest, Employee, LeaveType } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, X, Calendar } from "lucide-react";

function calcWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  employees: Employee[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

type ConfirmAction = { type: "approve" | "reject"; request: LeaveRequest } | null;

const LEAVE_TYPE_COLORS: Record<string, string> = {
  Annual: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Sick: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Personal: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Unpaid: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Other: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export function LeaveRequestTable({ requests, employees, onApprove, onReject }: LeaveRequestTableProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getEmployeeDetails = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return {
      name: employee?.name ?? "Unknown Employee",
      department: employee?.department ?? "Operations",
      position: employee?.position ?? "Staff",
    };
  };

  // Safe pagination calculations
  const totalPages = Math.ceil(requests.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated items
  const paginatedRequests = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return requests.slice(startIndex, startIndex + pageSize);
  }, [requests, safeCurrentPage, pageSize]);

  const startIndex = (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, requests.length);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/20">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">#</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Type</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Duration</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Days</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Reason</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedRequests.map((request, index) => {
                const globalIndex = (safeCurrentPage - 1) * pageSize + index + 1;
                const emp = getEmployeeDetails(request.employeeId);
                const days = calcWorkingDays(request.startDate, request.endDate);
                const typeColor = LEAVE_TYPE_COLORS[request.leaveType] || LEAVE_TYPE_COLORS.Other;

                return (
                  <tr key={request.id} className="transition-all hover:bg-secondary/25 group">
                    <td className="px-6 py-4.5 text-sm text-muted-foreground font-semibold">{globalIndex}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 font-bold text-xs">
                          {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
                            {formatDate(request.startDate)} — {formatDate(request.endDate)}
                          </p>
                          <p className="hidden sm:block text-[11px] text-muted-foreground mt-0.5">
                            {emp.position} • <span className="font-medium text-primary">{emp.department}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeColor}`}>
                        {request.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-sm hidden sm:table-cell font-semibold">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-foreground/80">{formatDate(request.startDate)}</span>
                        <span className="text-border">/</span>
                        <span className="text-foreground/80">{formatDate(request.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-sm hidden sm:table-cell">
                      <span className="inline-flex items-center rounded-full bg-secondary/60 border border-border/40 px-2.5 py-0.5 text-xs font-bold text-foreground/80">
                        {days} day{days !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-sm hidden lg:table-cell text-muted-foreground">
                      <span className="line-clamp-2 max-w-[240px] italic">"{request.reason}"</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4.5">
                      {(request.status === "PENDING_MANAGER" || request.status === "PENDING_HR") ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmAction({ type: "approve", request })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all"
                            title="Approve Request"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: "reject", request })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                            title="Reject Request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground text-right block pr-4 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination Footer */}
        {requests.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 bg-secondary/10 px-6 py-4">
            <div className="text-xs font-semibold text-muted-foreground">
              Showing <span className="text-foreground">{startIndex}</span> to <span className="text-foreground">{endIndex}</span> of <span className="text-foreground">{requests.length}</span> requests
            </div>

            <div className="flex items-center gap-1.5">
              {/* Rows per page selector */}
              <div className="flex items-center gap-1.5 mr-4 text-xs font-semibold text-muted-foreground">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-border bg-card px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card text-muted-foreground transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    safeCurrentPage === page
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                      : "border border-border bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card text-muted-foreground transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
        description={`Are you sure you want to ${confirmAction?.type} the leave request from "${confirmAction ? getEmployeeDetails(confirmAction.request.employeeId).name : ""}"?`}
        confirmLabel={confirmAction?.type === "approve" ? "Approve" : "Reject"}
        variant={confirmAction?.type === "reject" ? "destructive" : "default"}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === "approve") onApprove(confirmAction.request.id);
          else onReject(confirmAction.request.id);
        }}
      />
    </>
  );
}
