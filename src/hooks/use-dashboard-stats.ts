"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  totalUsers: number;
  quotaUtilization: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalUsers: 0,
    quotaUtilization: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refreshStats: fetchStats };
}
