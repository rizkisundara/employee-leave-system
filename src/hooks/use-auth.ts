"use client";

import { useAuthContext } from "@/components/auth-provider";

export function useAuth() {
  const { session, status, login, logout } = useAuthContext();

  const loading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return {
    session,
    isAuthenticated,
    loading,
    login,
    logout,
  };
}
