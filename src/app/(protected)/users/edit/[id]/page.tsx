"use client";

import { useState, useEffect, use } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm } from "@/components/user/UserForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useUsers } from "@/hooks/use-users";
import { useEmployees } from "@/hooks/use-employees";
import { useToast } from "@/components/shared/Toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { User } from "@/types";
import { UserFormData } from "@/validators/user-validator";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { updateUser } = useUsers();
  const { employees } = useEmployees();
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getUser(id);
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      const updateData: Record<string, any> = {
        username: data.username,
        name: data.name,
        email: data.email,
        role: data.role,
        employeeId: data.employeeId || null,
        status: data.status || "active",
      };
      if (data.password && data.password.length >= 6) {
        updateData.password = data.password;
      }
      await updateUser(id, updateData);
      showToast("User updated successfully");
      router.push("/users");
    } catch (error: any) {
      showToast(error?.message || "Failed to update user", "error");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Not Found" description="The requested user could not be found" />
        <a href="/users" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Back to Users
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit User" description={`Editing user: ${user.name} (${user.username})`} />
      <UserForm mode="edit" defaultValues={user} employees={employees} onSubmit={handleSubmit} />
    </div>
  );
}
