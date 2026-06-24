"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormData } from "@/validators/auth-validator";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, Eye, EyeOff, LogIn, Shield, Users, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    const success = await login(data.username, data.password);
    
    if (!success) {
      setError("Invalid username or password");
    } else {
      router.push("/dashboard");
    }
  };

  const accounts = [
    { username: "admin", password: "admin123", role: "Admin", icon: Shield, color: "from-indigo-500 to-indigo-600" },
    { username: "manager", password: "manager123", role: "Manager", icon: Users, color: "from-purple-500 to-purple-600" },
    { username: "alice", password: "user123", role: "Employee", icon: UserCheck, color: "from-sky-500 to-sky-600" },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/8 blur-3xl animate-float" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-purple-500/8 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/3 blur-3xl" />
      </div>

      <div className={`relative w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Logo & Title */}
        <div className="mb-8 text-center animate-slide-down">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 animate-float">
            <CalendarDays className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">LeaveFlow</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Enterprise Leave Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-scale-in" style={{ animationDelay: "150ms" }}>
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 animate-slide-down flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold">Username</label>
              <input
                id="username"
                type="text"
                {...register("username")}
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200"
                placeholder="Enter username"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-xs text-red-500 animate-slide-down">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 pr-11 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 animate-slide-down">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg animate-gradient"
          >
            <span className="flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              {isSubmitting ? "Signing in..." : "Sign In"}
            </span>
          </button>
        </form>

        {/* Quick Login Cards */}
        <div className="mt-8 space-y-3 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Login</p>
          <div className="grid grid-cols-3 gap-2">
            {accounts.map((acc, i) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.username}
                  type="button"
                  onClick={async () => {
                    setError("");
                    const success = await login(acc.username, acc.password);
                    if (success) router.push("/dashboard");
                  }}
                  className="group glass-panel rounded-xl p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 active:scale-[0.97]"
                  style={{ animationDelay: `${350 + i * 80}ms` }}
                >
                  <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${acc.color} shadow-md transition-transform group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-foreground">{acc.role}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{acc.username}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
