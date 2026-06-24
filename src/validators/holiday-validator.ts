import { z } from "zod";

export const holidaySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Holiday name must be at least 3 characters")
    .max(100, "Holiday name must be at most 100 characters"),
  date: z
    .string()
    .min(1, "Date is required"),
  type: z.enum(["national", "religious", "company", "regional"]),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  isRecurring: z.boolean(),
});

export type HolidayFormData = z.infer<typeof holidaySchema>;
