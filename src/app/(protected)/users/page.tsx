"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { UserTable } from "@/components/user/UserTable";
import { useUsers } from "@/hooks/use-users";
import { useEmployees } from "@/hooks/use-employees";
import { useToast } from "@/components/shared/Toast";
import { UserRole } from "@/types";
import { Search, Shield, Inbox, UserPlus } from "lucide-react";

const ROLE_TABS: { value: UserRole | "ALL"; label: string; color: string }[] = [
  { value: "ALL", label: "All Users", color: "" },
  { value: "admin", label: "Admin", color: "bg-indigo-500" },
  { value: "manager", label: "Manager", color: "bg-purple-500" },
  { value: "employee", label: "Employee", color: "bg-sky-500" },
];

export default function UsersPage() {
  const { users, loading, deleteUser } = useUsers();
  const { employees } = useEmployees();
  const { showToast } = useToast();

  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!user.name.toLowerCase().includes(q) && !user.username.toLowerCase().includes(q) && !user.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  const handleDelete = (id: string) => {
    deleteUser(id);
    showToast("User deleted successfully");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
        <PageHeader title="User Management" description="Manage user accounts, roles, and access controls" />
        <a href="/users/new"
          className="inline-flex h-10 items-center gap-2 justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90 hover:shadow-md hover:-translate-y-px transition-all duration-200 active:scale-[0.98] self-start sm:self-center btn-interactive">
          <UserPlus className="h-4 w-4" /> Add User
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {ROLE_TABS.map((tab) => {
          const count = tab.value === "ALL" ? users.length : users.filter(u => u.role === tab.value).length;
          return (
            <button key={tab.value} onClick={() => setRoleFilter(tab.value)}
              className={`rounded-2xl border p-3 sm:p-4 text-left transition-all duration-300 card-hover animate-scale-in ${
                roleFilter === tab.value
                  ? "border-primary/30 bg-primary/5 shadow-md shadow-primary/5"
                  : "border-border/40 bg-card hover:border-border"
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`h-2 w-2 rounded-full ${tab.color || "bg-foreground/40"}`} />
                {roleFilter === tab.value && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground animate-count-up">{count}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mt-0.5">{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="flex h-10 w-full rounded-xl border border-input bg-card/50 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/30 transition-all duration-200 placeholder:text-muted-foreground/60" />
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-muted-foreground whitespace-nowrap">{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        {filteredUsers.length === 0 ? (
          <EmptyState
            title={searchQuery || roleFilter !== "ALL" ? "No users match filters" : "No users found"}
            description={searchQuery || roleFilter !== "ALL" ? "Try resetting your search filters" : "Create your first user account to get started"}
            actionLabel={searchQuery || roleFilter !== "ALL" ? undefined : "Add User"}
            actionHref={searchQuery || roleFilter !== "ALL" ? undefined : "/users/new"}
            icon={<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"><Shield className="h-8 w-8" /></div>}
          />
        ) : (
          <UserTable users={filteredUsers} employees={employees} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
