"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { userSchema, UserFormData } from "@/validators/user-validator";
import { USER_ROLES, USER_STATUSES } from "@/constants";
import { User, Employee } from "@/types";

interface UserFormProps {
  mode: "create" | "edit";
  defaultValues?: User;
  employees: Employee[];
  onSubmit: (data: UserFormData) => void;
}

export function UserForm({ mode, defaultValues, employees, onSubmit }: UserFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues
      ? { username: defaultValues.username, password: "", name: defaultValues.name, email: defaultValues.email, role: defaultValues.role, employeeId: defaultValues.employeeId, status: defaultValues.status }
      : { username: "", password: "", name: "", email: "", role: "employee", employeeId: null, status: "active" },
  });

  const roleLabels: Record<string, string> = { admin: "Admin", manager: "Manager", employee: "Employee" };
  const statusLabels: Record<string, string> = { active: "Active", inactive: "Inactive", suspended: "Suspended" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-6">
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm space-y-5">
        {/* Username */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">Username <span className="text-red-500">*</span></label>
          <input id="username" type="text" {...register("username")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter username" />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password {mode === "create" && <span className="text-red-500">*</span>}</label>
          <input id="password" type="password" {...register("password")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={mode === "edit" ? "Leave blank to keep current password" : "Enter password (min 6 characters)"} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
          <input id="name" type="text" {...register("name")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter full name" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
          <input id="email" type="email" {...register("email")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter email address" />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">Role <span className="text-red-500">*</span></label>
          <select id="role" {...register("role")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {USER_ROLES.map((role) => (<option key={role} value={role}>{roleLabels[role]}</option>))}
          </select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>

        {/* Link to Employee */}
        <div className="space-y-2">
          <label htmlFor="employeeId" className="text-sm font-medium">Link to Employee</label>
          <select id="employeeId" {...register("employeeId")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">No employee linked</option>
            {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>))}
          </select>
          <p className="text-[11px] text-muted-foreground">Optional. Link this user account to an employee record.</p>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <select id="status" {...register("status")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {USER_STATUSES.map((s) => (<option key={s} value={s}>{statusLabels[s]}</option>))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/users")}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
        </button>
      </div>
    </form>
  );
}
