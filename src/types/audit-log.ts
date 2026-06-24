export type AuditAction =
  | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_LOGIN" | "USER_LOGOUT"
  | "EMPLOYEE_CREATED" | "EMPLOYEE_UPDATED" | "EMPLOYEE_DELETED"
  | "LEAVE_REQUESTED" | "LEAVE_APPROVED" | "LEAVE_REJECTED"
  | "HOLIDAY_CREATED" | "HOLIDAY_DELETED"
  | "QUOTA_UPDATED" | "DATA_RESET" | "DATA_EXPORTED" | "DATA_IMPORTED";

export type AuditLog = {
  id: string;
  action: AuditAction;
  performedBy: string;
  targetId?: string;
  targetType?: string;
  details: string;
  timestamp: string;
};
