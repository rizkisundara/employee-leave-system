"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Employee } from "@/types";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (id: string) => void;
}

export function EmployeeTable({ employees, onDelete }: EmployeeTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Reset page if data length changes
  const totalPages = Math.ceil(employees.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated data slice
  const paginatedEmployees = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return employees.slice(startIndex, startIndex + pageSize);
  }, [employees, safeCurrentPage, pageSize]);

  const startIndex = (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, employees.length);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/20">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">#</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Department</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Position</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Leaves</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedEmployees.map((employee, index) => {
                const globalIndex = (safeCurrentPage - 1) * pageSize + index + 1;
                return (
                  <tr key={employee.id} className="transition-all hover:bg-secondary/25 group">
                    <td className="px-6 py-4.5 text-sm text-muted-foreground font-semibold">{globalIndex}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                          {employee.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/employees/${employee.id}`}
                            className="text-sm font-semibold text-foreground hover:text-indigo-500 transition-colors"
                          >
                            {employee.name}
                          </Link>
                          <p className="text-xs text-muted-foreground sm:hidden mt-0.5">{employee.department} • {employee.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-sm hidden sm:table-cell font-medium text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground/80 border border-border/30">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-sm hidden md:table-cell font-semibold text-foreground/80">{employee.position}</td>
                    <td className="px-6 py-4.5 hidden lg:table-cell">
                      <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-500 border border-indigo-500/20">
                        — requests
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/employees/edit/${employee.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                          title="Edit employee"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(employee)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                          title="Delete employee"
                        >
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

        {/* Premium Pagination Footer */}
        {employees.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 bg-secondary/10 px-6 py-4">
            <div className="text-xs font-semibold text-muted-foreground">
              Showing <span className="text-foreground">{startIndex}</span> to <span className="text-foreground">{endIndex}</span> of <span className="text-foreground">{employees.length}</span> employees
            </div>

            <div className="flex items-center gap-1.5">
              {/* Rows per page selector */}
              <div className="flex items-center gap-1.5 mr-4 text-xs font-semibold text-muted-foreground">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-border bg-card px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card text-muted-foreground transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    safeCurrentPage === page
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                      : "border border-border bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card text-muted-foreground transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Employee"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all related leave requests. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id);
        }}
      />
    </>
  );
}
