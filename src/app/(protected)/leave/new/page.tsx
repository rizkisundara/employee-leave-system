"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeaveRequestForm } from "@/components/leave/LeaveRequestForm";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { LeaveRequestFormData } from "@/validators/leave-validator";
import { useToast } from "@/components/shared/Toast";
import { LeaveType } from "@/types";

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { createLeaveRequest } = useLeaveRequests();

  const handleSubmit = async (data: LeaveRequestFormData) => {
    await createLeaveRequest({ ...data, leaveType: data.leaveType as LeaveType });
    showToast("Leave request submitted successfully");
    router.push("/leave");
  };

  return (
    <div>
      <PageHeader title="New Leave Request" description="Submit a new leave request for an employee" />
      <LeaveRequestForm onSubmit={handleSubmit} />
    </div>
  );
}
