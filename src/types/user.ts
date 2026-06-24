export type UserRole = "admin" | "manager" | "employee";
export type UserStatus = "active" | "inactive" | "suspended";

export type User = {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
  status: UserStatus;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
};
