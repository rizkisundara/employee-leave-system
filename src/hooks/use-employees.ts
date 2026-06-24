"use client";

import { useState, useEffect, useCallback } from "react";
import { Employee } from "@/types";
import { api } from "@/lib/api-client";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (data: Omit<Employee, "id">) => {
    const newEmployee = await api.createEmployee(data);
    setEmployees((prev) => [...prev, newEmployee]);
    return newEmployee;
  };

  const updateEmployee = async (id: string, data: Partial<Omit<Employee, "id">>) => {
    const updated = await api.updateEmployee(id, data);
    setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  const deleteEmployee = async (id: string) => {
    await api.deleteEmployee(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return { employees, loading, createEmployee, updateEmployee, deleteEmployee, refreshEmployees: fetchEmployees };
}
