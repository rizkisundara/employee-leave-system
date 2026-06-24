"use client";

import { useState, useEffect, useCallback } from "react";
import { Holiday } from "@/types";
import { api } from "@/lib/api-client";

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHolidays = useCallback(async () => {
    try {
      const data = await api.getHolidays();
      setHolidays(data);
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const createHoliday = async (data: Omit<Holiday, "id">) => {
    const newHoliday = await api.createHoliday(data);
    setHolidays((prev) => [...prev, newHoliday]);
    return newHoliday;
  };

  const deleteHoliday = async (id: string) => {
    await api.deleteHoliday(id);
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  return { holidays, loading, createHoliday, deleteHoliday, refreshHolidays: fetchHolidays };
}
