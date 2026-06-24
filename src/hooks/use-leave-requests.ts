"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaveRequest } from "@/types";
import { api } from "@/lib/api-client";

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      const data = await api.getLeaveRequests();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const createLeaveRequest = async (data: Omit<LeaveRequest, "id" | "status">) => {
    const newRequest = await api.createLeaveRequest(data);
    setLeaveRequests((prev) => [...prev, newRequest]);
    return newRequest;
  };

  const updateLeaveRequestStatus = async (
    id: string,
    status: string,
    approvedBy?: string,
    reviewNote?: string
  ) => {
    const updated = await api.updateLeaveRequestStatus(id, { status, approvedBy, reviewNote });
    setLeaveRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  return { leaveRequests, loading, createLeaveRequest, updateLeaveRequestStatus, refreshLeaveRequests: fetchLeaveRequests };
}
