"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { LeaveRequestTable } from "@/components/leave/LeaveRequestTable";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { useEmployees } from "@/hooks/use-employees";
import { useToast } from "@/components/shared/Toast";
import { DEPARTMENTS } from "@/constants";
import { Filter, CalendarDays, Inbox, Search } from "lucide-react";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Requests" },
  { value: "PENDING_MANAGER", label: "Pending (Manager)" },
  { value: "PENDING_HR", label: "Pending (HR)" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

type StatusFilter = "ALL" | "PENDING_MANAGER" | "PENDING_HR" | "APPROVED" | "REJECTED";

export default function LeaveRequestsPage() {
  const { leaveRequests, loading, updateLeaveRequestStatus } = useLeaveRequests();
  const { employees } = useEmployees();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleApprove = (id: string) => {
    updateLeaveRequestStatus(id, "APPROVED");
    showToast("Leave request approved successfully");
  };

  const handleReject = (id: string) => {
    updateLeaveRequestStatus(id, "REJECTED");
    showToast("Leave request rejected successfully");
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Employee", "Department", "Type", "Start Date", "End Date", "Status", "Reason"];
    const rows = finalRequests.map((req) => {
      const emp = employees.find((e) => e.id === req.employeeId);
      return [
        req.id,
        emp?.name || "Unknown",
        emp?.department || "Unknown",
        req.leaveType || "Other",
        req.startDate,
        req.endDate,
        req.status,
        `"${(req.reason || "").replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "leave-requests.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully");
  };

  // Resolve additional page filters
  const finalRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      // Status filter
      if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
      const emp = employees.find((e) => e.id === req.employeeId);
      if (selectedEmployee && req.employeeId !== selectedEmployee) return false;
      if (selectedDept && emp?.department !== selectedDept) return false;
      if (searchQuery) {
        const empName = emp?.name || "";
        if (!empName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [leaveRequests, statusFilter, employees, selectedEmployee, selectedDept, searchQuery]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Leave Requests"
          description="Review, filter, and approve employee absence requests"
        />
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={handleExportCSV}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-all cursor-pointer"
          >
            Export CSV
          </button>
          <a
            href="/leave/new"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            New Request
          </a>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
        {STATUS_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`relative rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Filters: Search, Employee and Department selectors */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-start rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mr-2 shrink-0">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Search by employee name */}
        <div className="relative w-full sm:w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="flex h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Employee Filter */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="flex h-10 rounded-xl border border-input bg-background px-3.5 pr-8 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-[220px]"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="flex h-10 rounded-xl border border-input bg-background px-3.5 pr-8 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-[200px]"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Results Table */}
      {finalRequests.length === 0 ? (
        <EmptyState
          title={selectedEmployee || selectedDept || searchQuery ? "No leaves match filters" : "No leave requests found"}
          description={
            selectedEmployee || selectedDept || searchQuery
              ? "Try resetting your search filters"
              : "No requests submitted in this status category yet"
          }
          actionLabel={selectedEmployee || selectedDept || searchQuery ? undefined : "Submit Leave Request"}
          actionHref={selectedEmployee || selectedDept || searchQuery ? undefined : "/leave/new"}
          icon={
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Inbox className="h-8 w-8" />
            </div>
          }
        />
      ) : (
        <LeaveRequestTable
          requests={finalRequests}
          employees={employees}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
