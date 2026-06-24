"use client";

import { useState, useMemo } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChevronLeft, ChevronRight, CalendarDays, List, Info, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const { employees, loading: empLoading } = useEmployees();
  const { leaveRequests, loading: reqLoading } = useLeaveRequests();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedRequest(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedRequest(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedRequest(null);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: Array<{
      dayNum: number;
      isCurrentMonth: boolean;
      dateString: string;
    }> = [];

    // Prefix days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      days.push({ dayNum: dNum, isCurrentMonth: false, dateString: dateStr });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ dayNum: i, isCurrentMonth: true, dateString: dateStr });
    }

    // Suffix days for next month to fill grid (usually 42 total cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ dayNum: i, isCurrentMonth: false, dateString: dateStr });
    }

    return days;
  }, [year, month]);

  // Map requests to calendar days
  const getRequestsForDate = (dateString: string) => {
    return leaveRequests.filter((req) => {
      return dateString >= req.startDate && dateString <= req.endDate;
    });
  };

  // Format leave labels
  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.name || "Unknown Employee";
  };

  // Active leaves in current selected month
  const activeMonthRequests = useMemo(() => {
    const monthStartStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const monthEndStr = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    return leaveRequests
      .filter((req) => {
        return (
          (req.startDate >= monthStartStr && req.startDate <= monthEndStr) ||
          (req.endDate >= monthStartStr && req.endDate <= monthEndStr) ||
          (req.startDate <= monthStartStr && req.endDate >= monthEndStr)
        );
      })
      .map((req) => {
        const emp = employees.find((e) => e.id === req.employeeId);
        return {
          ...req,
          employeeName: emp?.name || "Unknown Employee",
          department: emp?.department || "Operations",
          position: emp?.position || "Staff",
        };
      });
  }, [leaveRequests, employees, year, month]);

  const loading = empLoading || reqLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Team Leave Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize team leaves and attendance schedules.</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-secondary p-1 border border-border/40 self-start">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Timeline List
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Next Month"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
          <h2 className="text-lg font-bold ml-2">
            {MONTHS[month]} {year}
          </h2>
        </div>

        <button
          onClick={handleToday}
          className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary transition-all"
        >
          Today
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Grid Layout Calendar */}
          <div className="lg:col-span-3 rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
            
            {/* Weekdays row */}
            <div className="grid grid-cols-7 border-b border-border/40 bg-secondary/30">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Monthly Calendar Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border/40">
              {calendarDays.map((cell, idx) => {
                const dateRequests = getRequestsForDate(cell.dateString);
                const isToday = cell.dateString === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 flex flex-col justify-between transition-all ${
                      cell.isCurrentMonth ? "bg-card" : "bg-secondary/10 text-muted-foreground/50"
                    } ${isToday ? "ring-2 ring-primary/40 ring-inset" : ""}`}
                  >
                    {/* Day number */}
                    <span className={`text-xs font-bold self-end rounded-md p-1 ${
                      isToday ? "bg-primary text-primary-foreground h-6 w-6 flex items-center justify-center rounded-lg shadow-sm" : ""
                    }`}>
                      {cell.dayNum}
                    </span>

                    {/* Active Leaves */}
                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[70px] select-none">
                      {dateRequests.map((req) => {
                        const statusColors = 
                          req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" :
                          req.status === "REJECTED" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20" :
                          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20";
                        
                        return (
                          <div
                            key={req.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest({
                                ...req,
                                employeeName: getEmployeeName(req.employeeId)
                              });
                            }}
                            className={`truncate rounded border px-1.5 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${statusColors}`}
                            title={`${getEmployeeName(req.employeeId)} (${req.status})`}
                          >
                            {getEmployeeName(req.employeeId).split(" ")[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Detail / Selected Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Leave Details
              </h3>

              {selectedRequest ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{selectedRequest.employeeName}</h4>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        selectedRequest.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        selectedRequest.status === "REJECTED" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-4 space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">Duration</span>
                      <p className="text-xs font-semibold mt-0.5">
                        {formatDate(selectedRequest.startDate)} — {formatDate(selectedRequest.endDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">Reason</span>
                      <p className="text-xs text-foreground bg-secondary/35 border border-border/30 rounded-xl p-3 mt-1 italic">
                        "{selectedRequest.reason}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground/80">
                  <Info className="h-6 w-6 mb-2" />
                  <p className="text-xs font-semibold">Select a leave bar on the calendar to view full details.</p>
                </div>
              )}
            </div>

            {/* Quick stats for selected month */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Monthly Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-xs font-medium text-muted-foreground">Active Absences</span>
                  <span className="text-xs font-bold">{activeMonthRequests.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-xs font-medium text-muted-foreground">Approved Leaves</span>
                  <span className="text-xs font-bold text-emerald-500">
                    {activeMonthRequests.filter(r => r.status === "APPROVED").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Pending Action</span>
                  <span className="text-xs font-bold text-amber-500">
                    {activeMonthRequests.filter(r => r.status === "PENDING_MANAGER" || r.status === "PENDING_HR").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Timeline List View */
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="text-base font-bold mb-4">Leave Records for {MONTHS[month]} {year}</h3>
          
          {activeMonthRequests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No leave requests registered for this month.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {activeMonthRequests.map((req) => (
                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 font-bold">
                      {req.employeeName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{req.employeeName}</h4>
                      <p className="text-xs text-muted-foreground">{req.position} • <span className="font-semibold text-indigo-500">{req.department}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5">
                    <span className="text-xs font-semibold text-foreground">
                      {formatDate(req.startDate)} to {formatDate(req.endDate)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        req.status === "REJECTED" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                        (req.status === "PENDING_MANAGER" || req.status === "PENDING_HR") ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30" : ""
                      }`}>
                        {req.status}
                      </span>
                      <p className="text-[10px] text-muted-foreground italic line-clamp-1 max-w-[200px]">
                        "{req.reason}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
