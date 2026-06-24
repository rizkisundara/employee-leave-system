"use client";

import { useState, useEffect, useCallback } from "react";
import { AuditLog } from "@/types";
import { api } from "@/lib/api-client";

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return { auditLogs, loading, refreshAuditLogs: fetchAuditLogs };
}
