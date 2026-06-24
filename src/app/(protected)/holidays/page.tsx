"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { HolidayTable } from "@/components/holiday/HolidayTable";
import { HolidayForm } from "@/components/holiday/HolidayForm";
import { useHolidays } from "@/hooks/use-holidays";
import { useToast } from "@/components/shared/Toast";
import { HolidayType } from "@/types";
import { INDONESIAN_HOLIDAYS } from "@/constants";
import { api } from "@/lib/api-client";
import { HolidayFormData } from "@/validators/holiday-validator";
import { Search, TreePalm, Plus, Download, X, Calendar, Globe, BookHeart, Building2, MapPin } from "lucide-react";

const TYPE_TABS: { value: HolidayType | "ALL"; label: string; icon: any; color: string }[] = [
  { value: "ALL", label: "All", icon: Calendar, color: "" },
  { value: "national", label: "National", icon: Globe, color: "bg-indigo-500" },
  { value: "religious", label: "Religious", icon: BookHeart, color: "bg-amber-500" },
  { value: "company", label: "Company", icon: Building2, color: "bg-emerald-500" },
  { value: "regional", label: "Regional", icon: MapPin, color: "bg-purple-500" },
];

export default function HolidaysPage() {
  const { holidays, loading, createHoliday, deleteHoliday, refreshHolidays } = useHolidays();
  const { showToast } = useToast();

  const [typeFilter, setTypeFilter] = useState<HolidayType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        if (typeFilter !== "ALL" && h.type !== typeFilter) return false;
        if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, typeFilter, searchQuery]);

  const handleAdd = async (data: HolidayFormData) => {
    await createHoliday({
      name: data.name,
      date: data.date,
      type: data.type,
      description: data.description || "",
      isRecurring: data.isRecurring,
    });
    setShowForm(false);
    showToast("Holiday added successfully");
  };

  const handleDelete = (id: string) => {
    deleteHoliday(id);
    showToast("Holiday deleted successfully");
  };

  const handleImportIndonesian = async () => {
    let added = 0;
    const existing = holidays.map((h) => `${h.name}_${h.date}`);
    for (const hol of INDONESIAN_HOLIDAYS) {
      const key = `${hol.name}_${hol.date}`;
      if (!existing.includes(key)) {
        try {
          await api.createHoliday({ name: hol.name, date: hol.date, type: hol.type as HolidayType, isRecurring: hol.isRecurring });
          added++;
        } catch { /* skip duplicates */ }
      }
    }
    refreshHolidays();
    showToast(added > 0 ? `Imported ${added} Indonesian holidays` : "All Indonesian holidays already imported");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
        <PageHeader title="Holiday Management" description="Manage public holidays and company off-days" />
        <div className="flex flex-wrap gap-2 self-start sm:self-center">
          <button onClick={handleImportIndonesian}
            className="inline-flex h-10 items-center gap-2 justify-center rounded-xl bg-secondary px-3 sm:px-4 text-xs sm:text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-all duration-200 active:scale-[0.98]">
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Import</span> Indonesia
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex h-10 items-center gap-2 justify-center rounded-xl bg-primary px-3 sm:px-4 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90 hover:shadow-md hover:-translate-y-px transition-all duration-200 active:scale-[0.98]">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Holiday"}
          </button>
        </div>
      </div>

      {/* Add Form (animated) */}
      <div className={`transition-all duration-300 ease-out overflow-hidden ${showForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="animate-slide-down">
          <HolidayForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      </div>

      {/* Type Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 stagger-children">
        {TYPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.value === "ALL" ? holidays.length : holidays.filter(h => h.type === tab.value).length;
          return (
            <button key={tab.value} onClick={() => setTypeFilter(tab.value)}
              className={`group rounded-2xl border p-3 text-left transition-all duration-300 card-hover animate-scale-in ${
                typeFilter === tab.value
                  ? "border-primary/30 bg-primary/5 shadow-md shadow-primary/5"
                  : "border-border/40 bg-card hover:border-border"
              }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`h-4 w-4 ${typeFilter === tab.value ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`} />
                <span className="text-lg sm:text-xl font-extrabold text-foreground">{count}</span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holidays..."
            className="flex h-10 w-full rounded-xl border border-input bg-card/50 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200" />
        </div>
      </div>

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        {filteredHolidays.length === 0 ? (
          <EmptyState
            title={searchQuery || typeFilter !== "ALL" ? "No holidays match filters" : "No holidays found"}
            description={searchQuery || typeFilter !== "ALL" ? "Try resetting your filters" : "Add holidays or import Indonesian holidays"}
            icon={<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"><TreePalm className="h-8 w-8" /></div>}
          />
        ) : (
          <HolidayTable holidays={filteredHolidays} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
