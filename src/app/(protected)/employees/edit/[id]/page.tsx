"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useEmployees } from "@/hooks/use-employees";
import { EmployeeFormData } from "@/validators/employee-validator";
import { Employee } from "@/types";
import { useToast } from "@/components/shared/Toast";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { employees, updateEmployee, loading: hookLoading } = useEmployees();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hookLoading) return;
    const id = params.id as string;
    const found = employees.find((e) => e.id === id);
    if (found) {
      setEmployee(found);
    } else {
      showToast("Employee not found", "error");
      router.push("/employees");
    }
    setLoading(false);
  }, [params.id, router, showToast, employees, hookLoading]);

  const handleSubmit = async (data: EmployeeFormData) => {
    if (!employee) return;
    await updateEmployee(employee.id, data);
    showToast("Employee updated successfully");
    router.push("/employees");
  };

  if (loading || hookLoading) return <LoadingSpinner />;
  if (!employee) return null;

  return (
    <div>
      <PageHeader title="Edit Employee" description={`Editing: ${employee.name}`} />
      <EmployeeForm mode="edit" defaultValues={employee} onSubmit={handleSubmit} />
    </div>
  );
}
