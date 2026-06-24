"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaveQuota } from "@/types";
import { api } from "@/lib/api-client";

export function useLeaveQuota(employeeId?: string) {
  const [quotas, setQuotas] = useState<LeaveQuota[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotas = useCallback(async () => {
    try {
      const data = await api.getLeaveQuotas(employeeId);
      setQuotas(data);
    } catch (error) {
      console.error("Failed to fetch leave quotas:", error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchQuotas();
  }, [fetchQuotas]);

  return { quotas, loading, refreshQuotas: fetchQuotas };
}
