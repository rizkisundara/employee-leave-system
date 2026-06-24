export const STORAGE_KEYS = {
  EMPLOYEES: "els_employees",
  LEAVE_REQUESTS: "els_leave_requests",
  AUTH_SESSION: "els_auth_session",
  USERS: "els_users",
  HOLIDAYS: "els_holidays",
  LEAVE_QUOTAS: "els_leave_quotas",
  AUDIT_LOGS: "els_audit_logs",
} as const;

export const LEAVE_STATUS = {
  PENDING_MANAGER: "PENDING_MANAGER",
  PENDING_HR: "PENDING_HR",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const LEAVE_TYPES = [
  "Annual",
  "Sick",
  "Personal",
  "Unpaid",
  "Other",
] as const;

export const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "IT Support",
  "Legal",
] as const;

export const MIN_NAME_LENGTH = 3;

export const DEFAULT_LEAVE_QUOTA = 12;

export const USER_ROLES = ["admin", "manager", "employee"] as const;

export const USER_STATUSES = ["active", "inactive", "suspended"] as const;

export const HOLIDAY_TYPES = ["national", "religious", "company", "regional"] as const;

export const INDONESIAN_HOLIDAYS: Array<{name: string; date: string; type: string; isRecurring: boolean}> = [
  { name: "Tahun Baru Masehi", date: "2025-01-01", type: "national", isRecurring: true },
  { name: "Isra Mi'raj Nabi Muhammad SAW", date: "2025-01-27", type: "religious", isRecurring: false },
  { name: "Tahun Baru Imlek", date: "2025-01-29", type: "religious", isRecurring: false },
  { name: "Hari Raya Nyepi", date: "2025-03-29", type: "religious", isRecurring: false },
  { name: "Wafat Isa Al Masih", date: "2025-04-18", type: "religious", isRecurring: false },
  { name: "Hari Buruh", date: "2025-05-01", type: "national", isRecurring: true },
  { name: "Kenaikan Isa Al Masih", date: "2025-05-29", type: "religious", isRecurring: false },
  { name: "Hari Lahir Pancasila", date: "2025-06-01", type: "national", isRecurring: true },
  { name: "Hari Kemerdekaan RI", date: "2025-08-17", type: "national", isRecurring: true },
  { name: "Maulid Nabi Muhammad SAW", date: "2025-09-05", type: "religious", isRecurring: false },
  { name: "Hari Natal", date: "2025-12-25", type: "national", isRecurring: true },
  { name: "Tahun Baru Masehi", date: "2026-01-01", type: "national", isRecurring: true },
  { name: "Tahun Baru Imlek", date: "2026-02-17", type: "religious", isRecurring: false },
  { name: "Hari Raya Nyepi", date: "2026-03-19", type: "religious", isRecurring: false },
  { name: "Hari Raya Idul Fitri", date: "2026-03-20", type: "religious", isRecurring: false },
  { name: "Hari Raya Idul Fitri", date: "2026-03-21", type: "religious", isRecurring: false },
  { name: "Wafat Isa Al Masih", date: "2026-04-03", type: "religious", isRecurring: false },
  { name: "Hari Buruh", date: "2026-05-01", type: "national", isRecurring: true },
  { name: "Kenaikan Isa Al Masih", date: "2026-05-14", type: "religious", isRecurring: false },
  { name: "Hari Raya Waisak", date: "2026-05-24", type: "religious", isRecurring: false },
  { name: "Hari Lahir Pancasila", date: "2026-06-01", type: "national", isRecurring: true },
  { name: "Idul Adha", date: "2026-06-06", type: "religious", isRecurring: false },
  { name: "Tahun Baru Islam", date: "2026-06-27", type: "religious", isRecurring: false },
  { name: "Hari Kemerdekaan RI", date: "2026-08-17", type: "national", isRecurring: true },
  { name: "Maulid Nabi Muhammad SAW", date: "2026-09-05", type: "religious", isRecurring: false },
  { name: "Hari Natal", date: "2026-12-25", type: "national", isRecurring: true },
];
