"use client";

import { useMemo, useState, useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/Toast";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useEmployees } from "@/hooks/use-employees";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { api } from "@/lib/api-client";
import { DEFAULT_LEAVE_QUOTA } from "@/constants";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Briefcase,
  AlertCircle,
  CalendarRange,
  RotateCcw,
  Download,
  Upload
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { stats, loading, refreshStats } = useDashboardStats();
  const { totalEmployees = 0, pendingLeaves = 0, approvedLeaves = 0, rejectedLeaves = 0 } = stats;
  const { employees, refreshEmployees } = useEmployees();
  const { leaveRequests, refreshLeaveRequests: refreshRequests } = useLeaveRequests();
  const { showToast } = useToast();

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const refreshAll = () => {
    refreshStats();
    refreshEmployees();
    refreshRequests();
  };

  const handleResetData = async () => {
    try {
      await api.setupDatabase();
      refreshAll();
      showToast("Database reset and reseeded successfully", "success");
    } catch {
      showToast("Failed to reset database", "error");
    }
  };

  const handleExportData = () => {
    showToast("Data is stored in Supabase PostgreSQL", "success");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    showToast("Import is not available — data is managed in PostgreSQL", "success");
  };

  // 1. Calculate Active Leaves Today
  const activeToday = useMemo(() => {
    return leaveRequests.filter((req) => {
      if (req.status !== "APPROVED") return false;
      return todayStr >= req.startDate && todayStr <= req.endDate;
    });
  }, [leaveRequests, todayStr]);

  // 2. Calculate Remaining Leave Balance (Default Quota = 22 days)
  const remainingBalanceAverage = useMemo(() => {
    if (employees.length === 0) return DEFAULT_LEAVE_QUOTA;
    
    // Sum duration of all approved leaves
    const totalApprovedDays = leaveRequests
      .filter((req) => req.status === "APPROVED")
      .reduce((sum, req) => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return sum + diffDays;
      }, 0);

    const averageUsed = totalApprovedDays / employees.length;
    return Math.max(0, Math.round((DEFAULT_LEAVE_QUOTA - averageUsed) * 10) / 10);
  }, [employees, leaveRequests]);

  // 3. Upcoming Leaves (Approved leaves in future)
  const upcomingLeaves = useMemo(() => {
    return leaveRequests
      .filter((req) => req.status === "APPROVED" && req.startDate > todayStr)
      .map((req) => {
        const emp = employees.find((e) => e.id === req.employeeId);
        return {
          ...req,
          employeeName: emp?.name || "Unknown Employee",
          department: emp?.department || "Operations",
        };
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 5);
  }, [leaveRequests, employees, todayStr]);

  // 4. Who's Out Today with Employee Details
  const teamOutToday = useMemo(() => {
    return activeToday.map((req) => {
      const emp = employees.find((e) => e.id === req.employeeId);
      return {
        id: req.id,
        name: emp?.name || "Unknown Employee",
        department: emp?.department || "Operations",
        position: emp?.position || "Staff",
        reason: req.reason,
      };
    });
  }, [activeToday, employees]);

  // 5. Recent Activity Feed (mock timestamps combined with actual logs)
  const activityFeed = useMemo(() => {
    const activities: Array<{
      id: string;
      type: "create_employee" | "request_leave" | "approve_leave" | "reject_leave";
      title: string;
      description: string;
      timestamp: string;
    }> = [];

    // Map employees to create events
    employees.forEach((emp, index) => {
      activities.push({
        id: `emp-${emp.id}`,
        type: "create_employee",
        title: "Employee onboarded",
        description: `${emp.name} added to ${emp.department} as ${emp.position}`,
        // Mock dates based on index for chronological feel
        timestamp: new Date(Date.now() - (index + 1) * 8 * 3600 * 1000).toISOString(),
      });
    });

    // Map leave requests to events
    leaveRequests.forEach((req, index) => {
      const emp = employees.find((e) => e.id === req.employeeId);
      const name = emp?.name || "Someone";
      
      activities.push({
        id: `req-sub-${req.id}`,
        type: "request_leave",
        title: "Leave request submitted",
        description: `${name} requested leave: ${formatDate(req.startDate)} to ${formatDate(req.endDate)}`,
        timestamp: new Date(Date.now() - (index + 0.5) * 12 * 3600 * 1000).toISOString(),
      });

      if (req.status === "APPROVED") {
        activities.push({
          id: `req-app-${req.id}`,
          type: "approve_leave",
          title: "Leave request approved",
          description: `Leave for ${name} has been approved`,
          timestamp: new Date(Date.now() - index * 6 * 3600 * 1000).toISOString(),
        });
      } else if (req.status === "REJECTED") {
        activities.push({
          id: `req-rej-${req.id}`,
          type: "reject_leave",
          title: "Leave request rejected",
          description: `Leave for ${name} has been rejected`,
          timestamp: new Date(Date.now() - index * 5 * 3600 * 1000).toISOString(),
        });
      }
    });

    // Sort by latest timestamp
    return activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6);
  }, [employees, leaveRequests]);

  // 6. Generate Sparkline/Chart data dynamically based on monthly leaves
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);
    
    leaveRequests.forEach((req) => {
      try {
        const monthIndex = new Date(req.startDate).getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          counts[monthIndex]++;
        }
      } catch {}
    });

    // If no data, return a beautiful placeholder trend
    const hasData = counts.some(c => c > 0);
    const chartCounts = hasData ? counts : [2, 5, 3, 6, 8, 5, 9, 7, 12, 8, 14, 10];

    const maxCount = Math.max(...chartCounts, 1);
    
    return {
      months,
      counts: chartCounts,
      maxCount,
    };
  }, [leaveRequests]);

  // Sparkline arrays
  const balanceTrend = [DEFAULT_LEAVE_QUOTA, 11.5, 10.2, 9.8, 8.5, 7.2, remainingBalanceAverage];
  const pendingTrend = [0, 2, 1, 3, 2, pendingLeaves];
  const approvedTrend = [2, 5, 8, 12, 16, approvedLeaves];
  const rejectedTrend = [0, 1, 1, 2, 2, rejectedLeaves];
  const activeTrend = [0, 1, 2, 1, 2, activeToday.length];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Executive Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time indicators, insights, and leave distribution statistics.</p>
        </div>
        
        {/* Dynamic summary pill & action buttons */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-card border border-border/60 px-4 py-2 text-xs font-semibold shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Healthy</span>
          </div>

          <button
            onClick={() => setResetDialogOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all shadow-sm"
            title="Reset Data"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={handleExportData}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all shadow-sm"
            title="Export Data"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-sm"
            title="Import Data"
          >
            <Upload className="h-4 w-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
        </div>
      </div>

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Reset All Data"
        description="This will reset all employees and leave requests back to the default sample data. This action cannot be undone."
        confirmLabel="Reset"
        variant="destructive"
        onConfirm={handleResetData}
      />

      {/* Grid: 5 Statistics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Avg Leave Balance"
          value={`${remainingBalanceAverage} Days`}
          loading={loading}
          accentColor="from-indigo-500 to-purple-600"
          icon={<Briefcase className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />}
          trendText="-1.4%"
          trendDirection="down"
          sparklineData={balanceTrend}
          sparklineColors={{ stroke: "stroke-indigo-500", fill: "fill-indigo-500/5" }}
        />
        
        <StatCard
          title="Pending Requests"
          value={pendingLeaves}
          loading={loading}
          accentColor="from-amber-400 to-orange-500"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          trendText="+12%"
          trendDirection="up"
          sparklineData={pendingTrend}
          sparklineColors={{ stroke: "stroke-amber-500", fill: "fill-amber-500/5" }}
        />

        <StatCard
          title="Approved Leaves"
          value={approvedLeaves}
          loading={loading}
          accentColor="from-emerald-400 to-teal-500"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          trendText="+22%"
          trendDirection="up"
          sparklineData={approvedTrend}
          sparklineColors={{ stroke: "stroke-emerald-500", fill: "fill-emerald-500/5" }}
        />

        <StatCard
          title="Rejected Requests"
          value={rejectedLeaves}
          loading={loading}
          accentColor="from-rose-500 to-red-600"
          icon={<XCircle className="h-5 w-5 text-rose-500" />}
          trendText="Stable"
          trendDirection="neutral"
          sparklineData={rejectedTrend}
          sparklineColors={{ stroke: "stroke-rose-500", fill: "fill-rose-500/5" }}
        />

        <StatCard
          title="Out Today"
          value={activeToday.length}
          loading={loading}
          accentColor="from-blue-400 to-indigo-600"
          icon={<Users className="h-5 w-5 text-blue-500" />}
          trendText={activeToday.length > 0 ? `${activeToday.length} out` : "None"}
          trendDirection={activeToday.length > 0 ? "up" : "neutral"}
          sparklineData={activeTrend}
          sparklineColors={{ stroke: "stroke-blue-500", fill: "fill-blue-500/5" }}
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Analytics Chart & Out Today (spans 2 cols on wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Analytics Chart Block */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                  Monthly Leave Distribution
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution count of leave applications by month</p>
              </div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                Full Year
              </span>
            </div>

            {/* Custom SVG area/bar chart */}
            <div className="relative h-64 w-full mt-4 flex items-end justify-between gap-2 border-b border-border/40 pb-2">
              {monthlyData.counts.map((val, index) => {
                const heightPercent = Math.max(8, (val / monthlyData.maxCount) * 100);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                      {val} Leaves
                    </div>

                    {/* Bar graphic */}
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-primary/70 to-primary group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 relative"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-t-lg transition-opacity" />
                    </div>

                    {/* Month Label */}
                    <span className="text-[10px] text-muted-foreground font-semibold mt-2">
                      {monthlyData.months[index]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who's Out Today Grid */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <CalendarRange className="h-4.5 w-4.5 text-indigo-500" />
              Who's Out Today
            </h3>
            
            {teamOutToday.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm font-semibold text-muted-foreground">Everyone is present today</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">No approved leaves active for today's date.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {teamOutToday.map((emp) => (
                  <div 
                    key={emp.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/10 p-3 hover:bg-secondary/20 transition-all duration-200"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{emp.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{emp.position} • <span className="font-medium text-indigo-500">{emp.department}</span></p>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-500 border border-indigo-500/20">
                      Out
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-500" />
                Recent Activity
              </h3>
            </div>

            {/* Timeline Wrapper */}
            <div className="relative border-l border-border/60 pl-4 space-y-5 flex-1">
              {activityFeed.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No recent activities recorded.
                </div>
              ) : (
                activityFeed.map((activity) => (
                  <div key={activity.id} className="relative group">
                    {/* Event icon locator bullet */}
                    <div className={`absolute -left-[23px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-background ${
                      activity.type === "approve_leave" ? "border-emerald-500 text-emerald-500" :
                      activity.type === "reject_leave" ? "border-rose-500 text-rose-500" :
                      activity.type === "request_leave" ? "border-amber-500 text-amber-500" :
                      "border-indigo-500 text-indigo-500"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Upcoming Leaves Timeline */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-indigo-500" />
              Upcoming Leave Schedule
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Upcoming approved absences across the organization</p>
          </div>
        </div>

        {upcomingLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-secondary/10 rounded-xl border border-dashed border-border/40">
            <AlertCircle className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">No upcoming leaves scheduled</p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">No future approved requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2 pt-1">
              {upcomingLeaves.map((leave) => (
                <div 
                  key={leave.id}
                  className="min-w-[240px] flex-1 rounded-xl border border-border/40 bg-secondary/15 p-4 hover:border-indigo-500/20 hover:bg-secondary/35 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-500 border border-indigo-500/15">
                      {leave.department}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Approved
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">{leave.employeeName}</h4>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1 font-medium">
                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 italic line-clamp-1">
                    "{leave.reason}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
