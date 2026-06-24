"use client";

import { useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/shared/Toast";
import { useEmployees } from "@/hooks/use-employees";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { formatDate } from "@/lib/utils";

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
import {
  ArrowLeft,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
} from "lucide-react";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { employees, loading: empLoading } = useEmployees();
  const { leaveRequests, loading: reqLoading } = useLeaveRequests();

  const employeeId = params.id as string;

  const employee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
  );

  const employeeLeaves = useMemo(
    () => leaveRequests.filter((r) => r.employeeId === employeeId),
    [leaveRequests, employeeId]
  );

  const stats = useMemo(() => {
    const total = employeeLeaves.length;
    const approved = employeeLeaves.filter((r) => r.status === "APPROVED").length;
    const pending = employeeLeaves.filter(
      (r) => r.status === "PENDING_MANAGER" || r.status === "PENDING_HR"
    ).length;
    return { total, approved, pending };
  }, [employeeLeaves]);

  // Redirect if employee not found after loading
  useEffect(() => {
    if (!empLoading && !employee) {
      showToast("Employee not found", "error");
      router.push("/employees");
    }
  }, [empLoading, employee, router, showToast]);

  if (empLoading || reqLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!employee) return null;

  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusConfig: Record<string, { label: string; className: string }> = {
    APPROVED: {
      label: "Approved",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    PENDING_MANAGER: {
      label: "Pending Manager",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    PENDING_HR: {
      label: "Pending HR",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>
        <Link
          href={`/employees/edit/${employee.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/95 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Edit2 className="h-4 w-4" />
          Edit Employee
        </Link>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
            {initials}
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {employee.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-500 border border-indigo-500/20">
                <Briefcase className="h-3 w-3" />
                {employee.department}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground/80 border border-border/30">
                {employee.position}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Mini-Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <FileText className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Leaves</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved</p>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border/40">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-indigo-500" />
            Leave History
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            All leave requests submitted by {employee.name}
          </p>
        </div>

        {employeeLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No leave requests found</p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              This employee hasn&apos;t submitted any leave requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/20">
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Days
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {employeeLeaves.map((leave) => {
                  const days = calcWorkingDays(leave.startDate, leave.endDate);
                  const config = statusConfig[leave.status] || statusConfig.PENDING_MANAGER;

                  return (
                    <tr
                      key={leave.id}
                      className="transition-all hover:bg-secondary/25 group"
                    >
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-500 border border-indigo-500/20">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="text-sm font-medium text-foreground">
                          {formatDate(leave.startDate)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          to {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 hidden sm:table-cell">
                        <span className="text-sm font-bold text-foreground">
                          {days}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {days === 1 ? "day" : "days"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[240px]">
                          {leave.reason}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
