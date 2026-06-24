import { z } from "zod";
import { LEAVE_TYPES } from "@/constants";

export const leaveRequestSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee is required"),
  leaveType: z
    .string()
    .min(1, "Leave type is required"),
  startDate: z
    .string()
    .min(1, "Start date is required"),
  endDate: z
    .string()
    .min(1, "End date is required"),
  reason: z
    .string()
    .trim()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be at most 500 characters"),
}).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.endDate) >= new Date(data.startDate);
  },
  {
    message: "End date must be on or after start date",
    path: ["endDate"],
  }
);

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
