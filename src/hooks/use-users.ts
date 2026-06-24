"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { api } from "@/lib/api-client";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data: any) => {
    const newUser = await api.createUser(data);
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, data: any) => {
    const updated = await api.updateUser(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  };

  const deleteUser = async (id: string) => {
    await api.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return { users, loading, createUser, updateUser, deleteUser, refreshUsers: fetchUsers };
}
