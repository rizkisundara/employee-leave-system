"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm } from "@/components/user/UserForm";
import { useUsers } from "@/hooks/use-users";
import { useEmployees } from "@/hooks/use-employees";
import { useToast } from "@/components/shared/Toast";
import { useRouter } from "next/navigation";
import { UserFormData } from "@/validators/user-validator";

export default function NewUserPage() {
  const { createUser } = useUsers();
  const { employees } = useEmployees();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: UserFormData) => {
    try {
      await createUser({
        username: data.username,
        password: data.password,
        name: data.name,
        email: data.email,
        role: data.role,
        employeeId: data.employeeId || null,
        status: data.status || "active",
      });
      showToast("User created successfully");
      router.push("/users");
    } catch (error: any) {
      showToast(error?.message || "Failed to create user", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create New User" description="Add a new user account to the system" />
      <UserForm mode="create" employees={employees} onSubmit={handleSubmit} />
    </div>
  );
}
