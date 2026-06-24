"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { employeeSchema, EmployeeFormData } from "@/validators/employee-validator";
import { DEPARTMENTS } from "@/constants";
import { Employee } from "@/types";

interface EmployeeFormProps {
  mode: "create" | "edit";
  defaultValues?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
}

export function EmployeeForm({ mode, defaultValues, onSubmit }: EmployeeFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: defaultValues
      ? { name: defaultValues.name, department: defaultValues.department, position: defaultValues.position }
      : { name: "", department: "", position: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-6">
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter employee name"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label htmlFor="department" className="text-sm font-medium">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            id="department"
            {...register("department")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-sm text-red-500">{errors.department.message}</p>
          )}
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label htmlFor="position" className="text-sm font-medium">
            Position <span className="text-red-500">*</span>
          </label>
          <input
            id="position"
            type="text"
            {...register("position")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter position"
          />
          {errors.position && (
            <p className="text-sm text-red-500">{errors.position.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/employees")}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Employee"
            : "Update Employee"}
        </button>
      </div>
    </form>
  );
}
