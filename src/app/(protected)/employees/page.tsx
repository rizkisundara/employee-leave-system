"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { useEmployees } from "@/hooks/use-employees";
import { useToast } from "@/components/shared/Toast";
import { DEPARTMENTS } from "@/constants";
import { Search, Filter, UserPlus } from "lucide-react";

export default function EmployeesPage() {
  const { employees, loading, deleteEmployee } = useEmployees();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("");

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    showToast("Employee record deleted successfully");
  };

  // Filter by search and department
  const finalEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedDept && e.department !== selectedDept) return false;
      return true;
    });
  }, [employees, searchQuery, selectedDept]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="View, filter, and manage organizational employee profiles"
        actionLabel="Add Employee"
        actionHref="/employees/new"
      />

      {/* Modern Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        
        {/* Search Name */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employees by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-3.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all"
          />
        </div>

        {/* Filter Department */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Results */}
      {finalEmployees.length === 0 ? (
        <EmptyState
          title={searchQuery || selectedDept ? "No matches found" : "No employees registered"}
          description={
            searchQuery || selectedDept 
              ? "Refine your filters or search terms" 
              : "Onboard your first employee to start managing attendance"
          }
          actionLabel={searchQuery || selectedDept ? undefined : "Add Employee"}
          actionHref={searchQuery || selectedDept ? undefined : "/employees/new"}
          icon={
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <UserPlus className="h-8 w-8" />
            </div>
          }
        />
      ) : (
        <EmployeeTable employees={finalEmployees} onDelete={handleDelete} />
      )}
    </div>
  );
}
