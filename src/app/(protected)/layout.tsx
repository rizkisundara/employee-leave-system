"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { useTheme } from "@/components/theme-provider";
import { AuthGuard } from "@/components/shared/AuthGuard";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X,
  User,
  Shield,
  TreePalm,
  ScrollText,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "User Management", href: "/users", icon: Shield },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Leave Requests", href: "/leave", icon: FileText },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Holidays", href: "/holidays", icon: TreePalm },
  { label: "Audit Log", href: "/audit", icon: ScrollText },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, session } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pageKey, setPageKey] = useState(pathname);

  // Animate on route change
  useEffect(() => {
    setPageKey(pathname);
    setIsMobileOpen(false);
  }, [pathname]);

  // Load pending leave count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const stats = await api.getDashboardStats();
        setPendingCount(stats.pendingLeaves);
      } catch {
        setPendingCount(0);
      }
    };
    loadPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load collapsible state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("els_sidebar_collapsed");
    if (saved) setIsCollapsed(saved === "true");
    // Auto-collapse on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("els_sidebar_collapsed", String(nextState));
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const active = NAV_ITEMS.find((item) => isActiveRoute(item.href));
    if (active) return active.label;
    if (pathname.includes("/employees/new")) return "Add Employee";
    if (pathname.includes("/employees/edit")) return "Edit Employee";
    if (pathname.includes("/users/new")) return "New User";
    if (pathname.includes("/users/edit")) return "Edit User";
    if (pathname.includes("/leave/new")) return "New Leave Request";
    return "Management System";
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background text-foreground">
        
        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
            isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/40 bg-card/80 backdrop-blur-2xl md:sticky md:top-0 md:h-screen transition-all duration-300 ease-out ${
            isCollapsed ? "w-[72px]" : "w-64"
          } ${
            isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Sidebar Header */}
          <div className={`flex h-16 items-center border-b border-border/30 ${isCollapsed ? "justify-center px-3" : "justify-between px-5"}`}>
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/15 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-indigo-500/25">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-base font-bold tracking-tight gradient-text transition-opacity duration-200">
                  LeaveFlow
                </span>
              )}
            </Link>
            
            {/* Desktop collapse toggle */}
            {!isCollapsed && (
              <button
                onClick={handleToggleCollapse}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
            {isCollapsed && (
              <button
                onClick={handleToggleCollapse}
                className="hidden md:flex absolute -right-3 top-5 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm hover:shadow transition-all duration-200 z-10"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            )}

            {/* Mobile close */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`flex-1 space-y-1 overflow-y-auto py-4 ${isCollapsed ? "px-2" : "px-3"}`}>
            {NAV_ITEMS.map((item, index) => {
              const active = isActiveRoute(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isCollapsed ? "justify-center px-2 py-2.5" : "px-3.5 py-2.5"
                  } ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`} />
                  {!isCollapsed && (
                    <span className="flex-1 flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.label === "Leave Requests" && pendingCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white animate-pop-in">
                          {pendingCount}
                        </span>
                      )}
                    </span>
                  )}
                  {/* Collapsed badge */}
                  {isCollapsed && item.label === "Leave Requests" && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                  {/* Tooltip for collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 hidden group-hover:block z-50">
                      <div className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-lg whitespace-nowrap animate-tooltip-in">
                        {item.label}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions Footer */}
          <div className={`border-t border-border/30 space-y-2 bg-secondary/10 ${isCollapsed ? "p-2" : "p-3"}`}>
            {/* Mini profile */}
            <div className={`flex items-center gap-3 rounded-xl p-2 ${isCollapsed ? "justify-center" : ""}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {((session as any)?.name || "A").charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-primary/70">{(session as any)?.role || "admin"}</p>
                  <p className="truncate text-sm font-semibold text-foreground">{(session as any)?.name || session?.username || "Administrator"}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className={`flex gap-1.5 ${isCollapsed ? "flex-col items-center" : ""}`}>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2.5 rounded-xl py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 ${
                  isCollapsed ? "justify-center px-2 w-full" : "px-3 flex-1"
                }`}
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500 shrink-0" />
                )}
                {!isCollapsed && <span className="text-xs">{theme === "dark" ? "Light" : "Dark"}</span>}
              </button>

              <button
                onClick={logout}
                className={`flex items-center gap-2.5 rounded-xl py-2 text-sm font-medium text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-600 transition-all duration-200 ${
                  isCollapsed ? "justify-center px-2 w-full" : "px-3 flex-1"
                }`}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="text-xs">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <div className="flex flex-1 flex-col min-w-0">
          
          {/* Sticky Top Header */}
          <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border/30 bg-background/80 px-4 sm:px-6 backdrop-blur-xl">
            
            {/* Left: mobile toggle & breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card md:hidden transition-all duration-200 active:scale-95"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1.5 text-sm">
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">App</Link>
                <span className="text-border hidden sm:block">/</span>
                <span className="text-foreground font-semibold">{getPageTitle()}</span>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/leave/new"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90 transition-all duration-200 hover:shadow-md hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Request</span>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main key={pageKey} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto page-transition">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
