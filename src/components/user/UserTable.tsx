"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { User, Employee } from "@/types";
import { RoleBadge } from "./RoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";

interface UserTableProps {
  users: User[];
  employees: Employee[];
  onDelete: (id: string) => void;
}

export function UserTable({ users, employees, onDelete }: UserTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return users.slice(startIndex, startIndex + pageSize);
  }, [users, safeCurrentPage, pageSize]);

  const startIndex = (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, users.length);

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return "—";
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.name || "Unknown";
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/20">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">#</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Username</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Role</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Employee</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedUsers.map((user, index) => {
                const globalIndex = (safeCurrentPage - 1) * pageSize + index + 1;
                return (
                  <tr key={user.id} className="transition-all hover:bg-secondary/25 group">
                    <td className="px-6 py-4.5 text-sm text-muted-foreground font-semibold">{globalIndex}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-sm hidden sm:table-cell font-medium text-muted-foreground">
                      <code className="rounded bg-secondary px-2 py-0.5 text-xs font-mono">{user.username}</code>
                    </td>
                    <td className="px-6 py-4.5 hidden md:table-cell"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4.5 hidden md:table-cell"><UserStatusBadge status={user.status} /></td>
                    <td className="px-6 py-4.5 text-sm hidden lg:table-cell text-muted-foreground">{getEmployeeName(user.employeeId)}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/users/edit/${user.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                          title="Edit user"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                          title="Delete user"
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

        {users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 bg-secondary/10 px-6 py-4">
            <div className="text-xs font-semibold text-muted-foreground">
              Showing <span className="text-foreground">{startIndex}</span> to <span className="text-foreground">{endIndex}</span> of <span className="text-foreground">{users.length}</span> users
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 mr-4 text-xs font-semibold text-muted-foreground">
                <span>Show</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="rounded-lg border border-border bg-card px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
                  {[5, 10, 20, 50].map((size) => (<option key={size} value={size}>{size}</option>))}
                </select>
              </div>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={safeCurrentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 text-muted-foreground transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${safeCurrentPage === page ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card hover:bg-secondary text-muted-foreground"}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={safeCurrentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 text-muted-foreground transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.username})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); }}
      />
    </>
  );
}
