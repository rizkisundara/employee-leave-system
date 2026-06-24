export type LeaveStatus = "PENDING_MANAGER" | "PENDING_HR" | "APPROVED" | "REJECTED";
export type LeaveType = "Annual" | "Sick" | "Personal" | "Unpaid" | "Other";
export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  reviewNote?: string;
  daysCount?: number;
};
