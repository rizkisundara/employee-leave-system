import { z } from "zod";
import { MIN_NAME_LENGTH } from "@/constants";

export const employeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`)
    .max(100, "Name must be at most 100 characters"),
  department: z
    .string()
    .min(1, "Department is required"),
  position: z
    .string()
    .trim()
    .min(1, "Position is required")
    .max(100, "Position must be at most 100 characters"),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
