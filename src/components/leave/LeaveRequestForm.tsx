"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { leaveRequestSchema, LeaveRequestFormData } from "@/validators/leave-validator";
import { useEmployees } from "@/hooks/use-employees";
import { LEAVE_TYPES } from "@/constants";
import { api } from "@/lib/api-client";
import { QuotaCard } from "./QuotaCard";
import { AlertTriangle, ShieldAlert, CalendarOff, Info } from "lucide-react";
import Link from "next/link";

/** Calculate working days between two date strings (exclude weekends) */
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

interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestFormData) => void;
}

export function LeaveRequestForm({ onSubmit }: LeaveRequestFormProps) {
  const router = useRouter();
  const { employees, loading } = useEmployees();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { employeeId: "", leaveType: "", startDate: "", endDate: "", reason: "" },
  });

  const employeeId = watch("employeeId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // Calculate working days (excluding weekends only, for display)
  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calcWorkingDays(startDate, endDate);
  }, [startDate, endDate]);

  // Use workingDays as the main calculation (holidays handled server-side)
  const workingDaysExclHolidays = workingDays;

  // Simple weekend validation
  const [dateValidation, setDateValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

  useEffect(() => {
    if (!startDate || !endDate) {
      setDateValidation({ valid: true, errors: [] });
      return;
    }
    // Basic validation: check if all days are weekends
    if (workingDays === 0) {
      setDateValidation({ valid: false, errors: ["All selected dates fall on weekends"] });
    } else {
      setDateValidation({ valid: true, errors: [] });
    }
  }, [startDate, endDate, workingDays]);

  // Check leave quota for selected employee from API
  const [quotaInfo, setQuotaInfo] = useState<{ totalQuota: number; usedQuota: number; pendingQuota: number } | null>(null);

  useEffect(() => {
    if (!employeeId) { setQuotaInfo(null); return; }
    const fetchQuota = async () => {
      try {
        const quotas = await api.getLeaveQuotas(employeeId);
        const currentYear = new Date().getFullYear();
        const quota = quotas.find((q: any) => q.year === currentYear);
        if (quota) setQuotaInfo({ totalQuota: quota.totalQuota, usedQuota: quota.usedQuota, pendingQuota: quota.pendingQuota });
        else setQuotaInfo(null);
      } catch { setQuotaInfo(null); }
    };
    fetchQuota();
  }, [employeeId]);

  // Check if can apply leave
  const canApplyInfo = useMemo(() => {
    if (!employeeId || workingDaysExclHolidays <= 0 || !quotaInfo) return null;
    const remaining = quotaInfo.totalQuota - quotaInfo.usedQuota - quotaInfo.pendingQuota;
    if (workingDaysExclHolidays > remaining) {
      return { allowed: false, reason: `Only ${remaining} days remaining`, remaining };
    }
    return { allowed: true, reason: "", remaining };
  }, [employeeId, workingDaysExclHolidays, quotaInfo]);

  const handleFormSubmit = (data: LeaveRequestFormData) => {
    // Block if dates include holidays
    if (!dateValidation.valid) {
      setError("startDate", { message: "Selected dates include holidays or weekends. Please choose valid business days." });
      return;
    }

    // Block if insufficient quota
    if (canApplyInfo && !canApplyInfo.allowed) {
      setError("startDate", { message: canApplyInfo.reason || "Insufficient leave balance" });
      return;
    }

    onSubmit(data);
  };

  if (loading) {
    return <div className="py-10 text-center"><span className="animate-pulse">Loading employees...</span></div>;
  }

  if (employees.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border/50 bg-card p-8 text-center shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
        <h3 className="text-lg font-semibold">No Employees Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">You need to add employees before creating leave requests.</p>
        <Link href="/employees/new" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Add Employee First
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="mx-auto max-w-lg space-y-6">
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm space-y-5">
        {/* Employee */}
        <div className="space-y-2">
          <label htmlFor="employeeId" className="text-sm font-medium">
            Employee <span className="text-red-500">*</span>
          </label>
          <select
            id="employeeId"
            {...register("employeeId")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} — {emp.department}
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <p className="text-sm text-red-500">{errors.employeeId.message}</p>
          )}
        </div>

        {/* Leave Quota for selected employee */}
        {quotaInfo && employeeId && (
          <QuotaCard
            totalQuota={quotaInfo.totalQuota}
            usedQuota={quotaInfo.usedQuota}
            pendingQuota={quotaInfo.pendingQuota}
            compact
          />
        )}

        {/* Leave Type */}
        <div className="space-y-2">
          <label htmlFor="leaveType" className="text-sm font-medium">
            Leave Type <span className="text-red-500">*</span>
          </label>
          <select
            id="leaveType"
            {...register("leaveType")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select leave type</option>
            {LEAVE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.leaveType && (
            <p className="text-sm text-red-500">{errors.leaveType.message}</p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            {...register("startDate")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label htmlFor="endDate" className="text-sm font-medium">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            id="endDate"
            type="date"
            {...register("endDate")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate.message}</p>
          )}
        </div>

        {/* Duration Badge */}
        {startDate && endDate && workingDaysExclHolidays > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {workingDaysExclHolidays} working day{workingDaysExclHolidays !== 1 ? "s" : ""}
              </span>
              {workingDays !== workingDaysExclHolidays && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Info className="h-3 w-3" />
                  {workingDays - workingDaysExclHolidays} holiday{workingDays - workingDaysExclHolidays !== 1 ? "s" : ""} excluded
                </span>
              )}
            </div>
            {workingDaysExclHolidays > 14 && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>This leave request exceeds 14 working days. Additional approval may be required.</span>
              </div>
            )}
          </div>
        )}

        {/* Holiday/Weekend Validation Errors */}
        {!dateValidation.valid && dateValidation.errors.length > 0 && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
              <CalendarOff className="h-4 w-4" />
              <span>Tanggal tidak valid untuk pengajuan cuti</span>
            </div>
            <ul className="space-y-1 pl-6">
              {dateValidation.errors.slice(0, 5).map((err, i) => (
                <li key={i} className="text-xs text-rose-600/80 dark:text-rose-400/80 list-disc">{err}</li>
              ))}
              {dateValidation.errors.length > 5 && (
                <li className="text-xs text-rose-600/60 dark:text-rose-400/60 italic">
                  ...dan {dateValidation.errors.length - 5} masalah lainnya
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Quota Warning */}
        {canApplyInfo && !canApplyInfo.allowed && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Kuota cuti tidak mencukupi</p>
              <p className="mt-0.5 opacity-80">{canApplyInfo.reason} (Sisa: {canApplyInfo.remaining} hari)</p>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            rows={4}
            {...register("reason")}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            placeholder="Enter reason for leave request (min 10 characters)"
          />
          {errors.reason && (
            <p className="text-sm text-red-500">{errors.reason.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/leave")}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !dateValidation.valid || (canApplyInfo !== null && !canApplyInfo.allowed)}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Leave Request"}
        </button>
      </div>
    </form>
  );
}
