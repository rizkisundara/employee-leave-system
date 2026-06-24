import { z } from "zod";
import { MIN_NAME_LENGTH } from "@/constants";

export const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`)
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address"),
  role: z.enum(["admin", "manager", "employee"]),
  employeeId: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
});

export type UserFormData = z.infer<typeof userSchema>;
