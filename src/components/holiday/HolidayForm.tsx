"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { holidaySchema, HolidayFormData } from "@/validators/holiday-validator";
import { HOLIDAY_TYPES } from "@/constants";

interface HolidayFormProps {
  onSubmit: (data: HolidayFormData) => void;
  onCancel: () => void;
}

export function HolidayForm({ onSubmit, onCancel }: HolidayFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: { name: "", date: "", type: "national", description: "", isRecurring: false },
  });

  const typeLabels: Record<string, string> = { national: "National", religious: "Religious", company: "Company", regional: "Regional" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-foreground">Add New Holiday</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="hol-name" className="text-sm font-medium">Holiday Name <span className="text-red-500">*</span></label>
          <input id="hol-name" type="text" {...register("name")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Hari Kemerdekaan" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="hol-date" className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
          <input id="hol-date" type="date" {...register("date")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="hol-type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
          <select id="hol-type" {...register("type")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {HOLIDAY_TYPES.map((t) => (<option key={t} value={t}>{typeLabels[t]}</option>))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="hol-desc" className="text-sm font-medium">Description</label>
          <input id="hol-desc" type="text" {...register("description")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Optional description" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input id="hol-recurring" type="checkbox" {...register("isRecurring")} className="h-4 w-4 rounded border-border" />
        <label htmlFor="hol-recurring" className="text-sm text-muted-foreground">Recurring yearly</label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting ? "Adding..." : "Add Holiday"}
        </button>
      </div>
    </form>
  );
}
