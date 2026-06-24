"use client";

import { useState, useMemo } from "react";
import { Holiday } from "@/types";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2, Repeat, Calendar } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  national: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  religious: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  company: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  regional: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

interface HolidayTableProps {
  holidays: Holiday[];
  onDelete: (id: string) => void;
}

export function HolidayTable({ holidays, onDelete }: HolidayTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(holidays.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedHolidays = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return holidays.slice(start, start + pageSize);
  }, [holidays, safeCurrentPage, pageSize]);

  const startIndex = (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, holidays.length);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/20">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">#</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Holiday Name</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Type</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Recurring</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedHolidays.map((holiday, index) => {
                const globalIndex = (safeCurrentPage - 1) * pageSize + index + 1;
                const typeColor = TYPE_COLORS[holiday.type] || TYPE_COLORS.company;
                return (
                  <tr key={holiday.id} className="transition-all hover:bg-secondary/25 group">
                    <td className="px-6 py-4.5 text-sm text-muted-foreground font-semibold">{globalIndex}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
                          <Calendar className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{holiday.name}</p>
                          {holiday.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{holiday.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-sm hidden sm:table-cell font-semibold text-foreground/80">{formatDate(holiday.date)}</td>
                    <td className="px-6 py-4.5 hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${typeColor}`}>{holiday.type}</span>
                    </td>
                    <td className="px-6 py-4.5 hidden lg:table-cell">
                      {holiday.isRecurring ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <Repeat className="h-3 w-3" /> Yearly
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">One-time</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-end">
                        <button onClick={() => setDeleteTarget(holiday)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all" title="Delete holiday">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {holidays.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 bg-secondary/10 px-6 py-4">
            <div className="text-xs font-semibold text-muted-foreground">
              Showing <span className="text-foreground">{startIndex}</span> to <span className="text-foreground">{endIndex}</span> of <span className="text-foreground">{holidays.length}</span> holidays
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 mr-4 text-xs font-semibold text-muted-foreground">
                <span>Show</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="rounded-lg border border-border bg-card px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
                  {[5, 10, 20, 50].map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={safeCurrentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 text-muted-foreground transition-all"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${safeCurrentPage === page ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card hover:bg-secondary text-muted-foreground"}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={safeCurrentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 text-muted-foreground transition-all"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Holiday" description={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.date})? This action cannot be undone.`}
        confirmLabel="Delete" variant="destructive" onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); }} />
    </>
  );
}
