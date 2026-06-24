"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthSession } from "@/types";
import { api } from "@/lib/api-client";

const SESSION_KEY = "els_auth_session";

interface AuthContextType {
  session: AuthSession | null;
  status: "authenticated" | "unauthenticated" | "loading";
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"authenticated" | "unauthenticated" | "loading">("loading");

  useEffect(() => {
    // Restore session from localStorage (client-side session cache)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSession(parsed);
          setStatus("authenticated");
        } catch {
          setStatus("unauthenticated");
        }
      } else {
        setStatus("unauthenticated");
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(username, password);
      const data = response.user || response; // Handle both { user: {...} } and direct user
      const authSession: AuthSession = {
        username: data.username,
        isLoggedIn: true,
        loginAt: new Date().toISOString(),
        role: data.role,
        name: data.name,
        userId: data.id,
      };
      setSession(authSession);
      setStatus("authenticated");
      localStorage.setItem(SESSION_KEY, JSON.stringify(authSession));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setSession(null);
    setStatus("unauthenticated");
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ session, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
