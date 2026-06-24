import { Employee, LeaveRequest, LeaveStatus, LeaveType, AuthSession, User, Holiday, LeaveQuota, AuditLog, AuditAction } from "@/types";
import { STORAGE_KEYS, DEFAULT_LEAVE_QUOTA, INDONESIAN_HOLIDAYS } from "@/constants";

function formatDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

const today = new Date();
function relativeDate(offset: number): string {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return formatDateString(d);
}

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Alice Johnson", department: "Engineering", position: "Senior Developer" },
  { id: "emp-2", name: "Bob Smith", department: "Human Resources", position: "HR Manager" },
  { id: "emp-3", name: "Charlie Brown", department: "Finance", position: "Accountant" },
  { id: "emp-4", name: "Diana Prince", department: "Marketing", position: "PR Specialist" },
  { id: "emp-5", name: "Evan Williams", department: "IT Support", position: "System Administrator" },
];

const DEFAULT_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "req-1", employeeId: "emp-1", leaveType: "Annual",
    startDate: relativeDate(-1), endDate: relativeDate(1),
    reason: "Family vacation and rest period", status: "APPROVED",
  },
  {
    id: "req-2", employeeId: "emp-2", leaveType: "Sick",
    startDate: relativeDate(4), endDate: relativeDate(6),
    reason: "Routine health checkup and follow-up",  status: "PENDING_HR",
  },
  {
    id: "req-3", employeeId: "emp-3", leaveType: "Sick",
    startDate: relativeDate(-10), endDate: relativeDate(-8),
    reason: "Medical leave due to flu symptoms", status: "APPROVED",
  },
  {
    id: "req-4", employeeId: "emp-4", leaveType: "Personal",
    startDate: relativeDate(9), endDate: relativeDate(11),
    reason: "Home relocation assistance needed", status: "PENDING_MANAGER",
  },
  {
    id: "req-5", employeeId: "emp-5", leaveType: "Annual",
    startDate: relativeDate(14), endDate: relativeDate(18),
    reason: "Year-end holiday travel plans", status: "PENDING_MANAGER",
  },
  {
    id: "req-6", employeeId: "emp-1", leaveType: "Unpaid",
    startDate: relativeDate(-30), endDate: relativeDate(-28),
    reason: "Extended personal matters to attend", status: "REJECTED",
  },
];

const DEFAULT_USERS: User[] = [
  { id: "user-admin", username: "admin", password: "admin123", name: "System Administrator", email: "admin@leaveflow.com", role: "admin", employeeId: null, status: "active", createdAt: new Date().toISOString() },
  { id: "user-manager", username: "manager", password: "manager123", name: "HR Manager", email: "manager@leaveflow.com", role: "manager", employeeId: "emp-2", status: "active", createdAt: new Date().toISOString() },
  { id: "user-emp1", username: "alice", password: "user123", name: "Alice Johnson", email: "alice@leaveflow.com", role: "employee", employeeId: "emp-1", status: "active", createdAt: new Date().toISOString() },
];

/** Calculate working days between two date strings (exclude weekends) */
export function calcWorkingDays(startDate: string, endDate: string): number {
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

export const localStorageService = {
  // ── Employees ──
  getEmployees(): Employee[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    try { return JSON.parse(stored); }
    catch { return DEFAULT_EMPLOYEES; }
  },

  saveEmployees(employees: Employee[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  createEmployee(data: Omit<Employee, "id">): Employee {
    const employees = this.getEmployees();
    const newEmployee: Employee = { ...data, id: `emp-${Math.random().toString(36).substring(2, 11)}` };
    employees.push(newEmployee);
    this.saveEmployees(employees);
    this.addAuditLog("EMPLOYEE_CREATED", "system", newEmployee.id, "employee", `Created employee: ${newEmployee.name}`);
    return newEmployee;
  },

  updateEmployee(id: string, data: Partial<Omit<Employee, "id">>): Employee {
    const employees = this.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Employee not found");
    const updated = { ...employees[index], ...data };
    employees[index] = updated;
    this.saveEmployees(employees);
    return updated;
  },

  deleteEmployee(id: string): void {
    const employee = this.getEmployees().find((e) => e.id === id);
    const employees = this.getEmployees().filter((e) => e.id !== id);
    this.saveEmployees(employees);
    const requests = this.getLeaveRequests().filter((r) => r.employeeId !== id);
    this.saveLeaveRequests(requests);
    this.addAuditLog("EMPLOYEE_DELETED", "system", id, "employee", `Deleted employee: ${employee?.name || id}`);
  },

  getLeaveCountByEmployee(employeeId: string): number {
    return this.getLeaveRequests().filter((r) => r.employeeId === employeeId).length;
  },

  // ── Leave Requests ──
  getLeaveRequests(): LeaveRequest[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(DEFAULT_LEAVE_REQUESTS));
      return DEFAULT_LEAVE_REQUESTS;
    }
    try {
      const parsed: LeaveRequest[] = JSON.parse(stored);
      return parsed.map((req) => ({
        ...req,
        leaveType: req.leaveType || "Other",
        status: req.status === ("PENDING" as any) ? "PENDING_MANAGER" : req.status,
      }));
    } catch { return DEFAULT_LEAVE_REQUESTS; }
  },

  saveLeaveRequests(requests: LeaveRequest[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
  },

  createLeaveRequest(data: Omit<LeaveRequest, "id" | "status">): LeaveRequest {
    const requests = this.getLeaveRequests();
    const daysCount = calcWorkingDays(data.startDate, data.endDate);
    const newRequest: LeaveRequest = {
      ...data,
      id: `req-${Math.random().toString(36).substring(2, 11)}`,
      status: "PENDING_MANAGER",
      daysCount,
    };
    requests.push(newRequest);
    this.saveLeaveRequests(requests);
    this.addAuditLog("LEAVE_REQUESTED", data.employeeId, newRequest.id, "leave_request", `Leave request created: ${data.leaveType} from ${data.startDate} to ${data.endDate} (${daysCount} working days)`);
    this.recalculateQuota(data.employeeId, new Date(data.startDate).getFullYear());
    return newRequest;
  },

  updateLeaveRequestStatus(id: string, status: LeaveStatus, approvedBy?: string, reviewNote?: string): LeaveRequest {
    const requests = this.getLeaveRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Leave request not found");
    const updated: LeaveRequest = {
      ...requests[index],
      status,
      ...(approvedBy !== undefined ? { approvedBy } : {}),
      ...(reviewNote !== undefined ? { reviewNote } : {}),
    };
    requests[index] = updated;
    this.saveLeaveRequests(requests);

    const auditAction: AuditAction = status === "APPROVED" ? "LEAVE_APPROVED" : status === "REJECTED" ? "LEAVE_REJECTED" : "LEAVE_REQUESTED";
    this.addAuditLog(auditAction, approvedBy || "system", id, "leave_request", `Leave request ${status.toLowerCase()}: ${updated.leaveType} for employee ${updated.employeeId}${reviewNote ? ` - Note: ${reviewNote}` : ""}`);
    this.recalculateQuota(updated.employeeId, new Date(updated.startDate).getFullYear());
    return updated;
  },

  // ── Dashboard Stats ──
  getDashboardStats() {
    const employees = this.getEmployees();
    const requests = this.getLeaveRequests();
    const users = this.getUsers();
    const quotas = this.getLeaveQuotas();

    const totalQuota = quotas.reduce((sum, q) => sum + q.totalQuota, 0);
    const usedQuota = quotas.reduce((sum, q) => sum + q.usedQuota, 0);

    return {
      totalEmployees: employees.length,
      pendingLeaves: requests.filter((r) => r.status === "PENDING_MANAGER" || r.status === "PENDING_HR").length,
      approvedLeaves: requests.filter((r) => r.status === "APPROVED").length,
      rejectedLeaves: requests.filter((r) => r.status === "REJECTED").length,
      totalUsers: users.length,
      quotaUtilization: totalQuota > 0 ? Math.round((usedQuota / totalQuota) * 100) : 0,
    };
  },

  // ── Auth Session ──
  getAuthSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  },

  login(username: string, password: string): boolean {
    if (typeof window === "undefined") return false;
    const users = this.getUsers();
    const user = users.find((u) => u.username === username && u.password === password);
    if (user && user.status === "active") {
      const session: AuthSession = {
        username: user.username,
        isLoggedIn: true,
        loginAt: new Date().toISOString(),
        role: user.role,
        name: user.name,
        userId: user.id,
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

      // Update lastLogin on user record
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], lastLogin: new Date().toISOString() };
        this.saveUsers(users);
      }

      this.addAuditLog("USER_LOGIN", user.id, user.id, "user", `User logged in: ${user.username}`);
      return true;
    }
    return false;
  },

  logout(): void {
    if (typeof window === "undefined") return;
    const session = this.getAuthSession();
    if (session) {
      this.addAuditLog("USER_LOGOUT", session.userId, session.userId, "user", `User logged out: ${session.username}`);
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },

  // ── Reset All Data ──
  resetAllData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.LEAVE_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.HOLIDAYS);
    localStorage.removeItem(STORAGE_KEYS.LEAVE_QUOTAS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    // Re-trigger defaults on next read
    window.dispatchEvent(new Event("storage_change"));
  },

  // ── Export / Import ──
  exportData(): string {
    this.addAuditLog("DATA_EXPORTED", "system", undefined, undefined, "Data exported");
    return JSON.stringify({
      employees: this.getEmployees(),
      leaveRequests: this.getLeaveRequests(),
      users: this.getUsers(),
      holidays: this.getHolidays(),
      leaveQuotas: this.getLeaveQuotas(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.employees) || !Array.isArray(data.leaveRequests)) {
        throw new Error("Invalid data format");
      }
      this.saveEmployees(data.employees);
      this.saveLeaveRequests(data.leaveRequests);
      if (Array.isArray(data.users)) {
        this.saveUsers(data.users);
      }
      if (Array.isArray(data.holidays)) {
        this.saveHolidays(data.holidays);
      }
      if (Array.isArray(data.leaveQuotas)) {
        this.saveLeaveQuotas(data.leaveQuotas);
      }
      this.addAuditLog("DATA_IMPORTED", "system", undefined, undefined, "Data imported");
      window.dispatchEvent(new Event("storage_change"));
      return true;
    } catch {
      return false;
    }
  },

  // ── Users ──
  getUsers(): User[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try { return JSON.parse(stored); }
    catch { return DEFAULT_USERS; }
  },

  saveUsers(users: User[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  createUser(data: Omit<User, "id" | "createdAt">): User {
    const users = this.getUsers();
    // Check for duplicate username
    if (users.some((u) => u.username === data.username)) {
      throw new Error("Username already exists");
    }
    const newUser: User = {
      ...data,
      id: `user-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    this.addAuditLog("USER_CREATED", "system", newUser.id, "user", `Created user: ${newUser.username} (${newUser.role})`);
    return newUser;
  },

  updateUser(id: string, data: Partial<Omit<User, "id" | "createdAt">>): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    // Check for duplicate username if username is being changed
    if (data.username && data.username !== users[index].username) {
      if (users.some((u) => u.username === data.username)) {
        throw new Error("Username already exists");
      }
    }
    const updated = { ...users[index], ...data };
    users[index] = updated;
    this.saveUsers(users);
    this.addAuditLog("USER_UPDATED", "system", id, "user", `Updated user: ${updated.username}`);
    return updated;
  },

  deleteUser(id: string): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    const filtered = users.filter((u) => u.id !== id);
    this.saveUsers(filtered);
    this.addAuditLog("USER_DELETED", "system", id, "user", `Deleted user: ${user?.username || id}`);
  },

  getUserByUsername(username: string): User | undefined {
    return this.getUsers().find((u) => u.username === username);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  // ── Holidays ──
  getHolidays(): Holiday[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    if (!stored) {
      // Seed from INDONESIAN_HOLIDAYS
      const defaultHolidays: Holiday[] = INDONESIAN_HOLIDAYS.map((h, index) => ({
        id: `hol-${index + 1}`,
        name: h.name,
        date: h.date,
        type: h.type as Holiday["type"],
        isRecurring: h.isRecurring,
      }));
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(defaultHolidays));
      return defaultHolidays;
    }
    try { return JSON.parse(stored); }
    catch { return []; }
  },

  saveHolidays(holidays: Holiday[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  },

  createHoliday(data: Omit<Holiday, "id">): Holiday {
    const holidays = this.getHolidays();
    const newHoliday: Holiday = {
      ...data,
      id: `hol-${Math.random().toString(36).substring(2, 11)}`,
    };
    holidays.push(newHoliday);
    this.saveHolidays(holidays);
    this.addAuditLog("HOLIDAY_CREATED", "system", newHoliday.id, "holiday", `Created holiday: ${newHoliday.name} on ${newHoliday.date}`);
    return newHoliday;
  },

  deleteHoliday(id: string): void {
    const holidays = this.getHolidays();
    const holiday = holidays.find((h) => h.id === id);
    const filtered = holidays.filter((h) => h.id !== id);
    this.saveHolidays(filtered);
    this.addAuditLog("HOLIDAY_DELETED", "system", id, "holiday", `Deleted holiday: ${holiday?.name || id}`);
  },

  isHoliday(dateStr: string): Holiday | undefined {
    const holidays = this.getHolidays();
    return holidays.find((h) => h.date === dateStr);
  },

  isWeekend(dateStr: string): boolean {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  },

  // ── Leave Quotas ──
  getLeaveQuotas(): LeaveQuota[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_QUOTAS);
    if (!stored) return [];
    try { return JSON.parse(stored); }
    catch { return []; }
  },

  saveLeaveQuotas(quotas: LeaveQuota[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.LEAVE_QUOTAS, JSON.stringify(quotas));
  },

  getEmployeeQuota(employeeId: string, year?: number): LeaveQuota {
    const targetYear = year || new Date().getFullYear();
    const quotas = this.getLeaveQuotas();
    let quota = quotas.find((q) => q.employeeId === employeeId && q.year === targetYear);

    if (!quota) {
      // Create a new quota entry for this employee+year
      const requests = this.getLeaveRequests().filter((r) => r.employeeId === employeeId);
      const approvedInYear = requests.filter((r) =>
        r.status === "APPROVED" && new Date(r.startDate).getFullYear() === targetYear
      );
      const pendingInYear = requests.filter((r) =>
        (r.status === "PENDING_MANAGER" || r.status === "PENDING_HR") && new Date(r.startDate).getFullYear() === targetYear
      );

      const usedQuota = approvedInYear.reduce((sum, r) => sum + calcWorkingDays(r.startDate, r.endDate), 0);
      const pendingQuota = pendingInYear.reduce((sum, r) => sum + calcWorkingDays(r.startDate, r.endDate), 0);

      quota = {
        employeeId,
        year: targetYear,
        totalQuota: DEFAULT_LEAVE_QUOTA,
        usedQuota,
        pendingQuota,
      };

      quotas.push(quota);
      this.saveLeaveQuotas(quotas);
    }

    return quota;
  },

  recalculateQuota(employeeId: string, year?: number): LeaveQuota {
    const targetYear = year || new Date().getFullYear();
    const quotas = this.getLeaveQuotas();
    const requests = this.getLeaveRequests().filter((r) => r.employeeId === employeeId);

    const approvedInYear = requests.filter((r) =>
      r.status === "APPROVED" && new Date(r.startDate).getFullYear() === targetYear
    );
    const pendingInYear = requests.filter((r) =>
      (r.status === "PENDING_MANAGER" || r.status === "PENDING_HR") && new Date(r.startDate).getFullYear() === targetYear
    );

    const usedQuota = approvedInYear.reduce((sum, r) => sum + calcWorkingDays(r.startDate, r.endDate), 0);
    const pendingQuota = pendingInYear.reduce((sum, r) => sum + calcWorkingDays(r.startDate, r.endDate), 0);

    const existingIndex = quotas.findIndex((q) => q.employeeId === employeeId && q.year === targetYear);
    const totalQuota = existingIndex !== -1 ? quotas[existingIndex].totalQuota : DEFAULT_LEAVE_QUOTA;

    const updatedQuota: LeaveQuota = {
      employeeId,
      year: targetYear,
      totalQuota,
      usedQuota,
      pendingQuota,
    };

    if (existingIndex !== -1) {
      quotas[existingIndex] = updatedQuota;
    } else {
      quotas.push(updatedQuota);
    }

    this.saveLeaveQuotas(quotas);
    return updatedQuota;
  },

  recalculateAllQuotas(): void {
    const employees = this.getEmployees();
    const currentYear = new Date().getFullYear();
    employees.forEach((emp) => {
      this.recalculateQuota(emp.id, currentYear);
    });
  },

  canApplyLeave(employeeId: string, requestedDays: number, year?: number): { allowed: boolean; reason?: string; remaining: number } {
    const quota = this.getEmployeeQuota(employeeId, year);
    const remaining = quota.totalQuota - quota.usedQuota - quota.pendingQuota;

    if (requestedDays > remaining) {
      return {
        allowed: false,
        reason: `Insufficient leave balance. You have ${remaining} days remaining.`,
        remaining,
      };
    }

    return { allowed: true, remaining };
  },

  // ── Holiday-Aware Utilities ──
  calcWorkingDaysExcludingHolidays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

    const holidays = this.getHolidays();
    const holidayDates = new Set(holidays.map((h) => h.date));

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      const dateStr = formatDateString(current);
      if (day !== 0 && day !== 6 && !holidayDates.has(dateStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  },

  validateLeaveDates(startDate: string, endDate: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, errors: ["Invalid date format"] };
    }

    if (end < start) {
      return { valid: false, errors: ["End date must be on or after start date"] };
    }

    const current = new Date(start);
    while (current <= end) {
      const dateStr = formatDateString(current);
      const day = current.getDay();

      if (day === 0 || day === 6) {
        errors.push(`Cannot apply leave on weekends (Saturday/Sunday)`);
      }

      const holiday = this.isHoliday(dateStr);
      if (holiday) {
        errors.push(`Cannot apply leave on ${holiday.name} (${dateStr})`);
      }

      current.setDate(current.getDate() + 1);
    }

    return { valid: errors.length === 0, errors };
  },

  // ── Audit Logs ──
  getAuditLogs(): AuditLog[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!stored) return [];
    try { return JSON.parse(stored); }
    catch { return []; }
  },

  saveAuditLogs(logs: AuditLog[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  addAuditLog(action: AuditAction, performedBy: string, targetId?: string, targetType?: string, details?: string): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Math.random().toString(36).substring(2, 11)}`,
      action,
      performedBy,
      targetId,
      targetType,
      details: details || action,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // newest first
    // Keep a reasonable limit to prevent localStorage bloat
    if (logs.length > 1000) {
      logs.length = 1000;
    }
    this.saveAuditLogs(logs);
    return newLog;
  },
};
