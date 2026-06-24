"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { useEmployees } from "@/hooks/use-employees";
import { EmployeeFormData } from "@/validators/employee-validator";
import { useToast } from "@/components/shared/Toast";

export default function NewEmployeePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { createEmployee } = useEmployees();

  const handleSubmit = async (data: EmployeeFormData) => {
    await createEmployee(data);
    showToast("Employee created successfully");
    router.push("/employees");
  };

  return (
    <div>
      <PageHeader title="Add New Employee" description="Fill in the details to create a new employee record" />
      <EmployeeForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
