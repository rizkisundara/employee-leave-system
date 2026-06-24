import { Sparkline } from "./Sparkline";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trendText?: string;
  trendDirection?: "up" | "down" | "neutral";
  sparklineData?: number[];
  sparklineColors?: { stroke: string; fill: string };
  accentColor: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  trendText,
  trendDirection = "neutral",
  sparklineData,
  sparklineColors,
  accentColor,
  loading,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      
      {/* Dynamic colorful indicator bar at the top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor}`} />
      
      {/* Background radial glow */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-muted/60" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground shadow-sm border border-border/20 transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>

      {/* Sparkline & Trend section */}
      <div className="mt-6 flex items-end justify-between gap-4">
        {/* Trend Indicator */}
        <div className="flex flex-col gap-1">
          {trendText && (
            <div className="flex items-center gap-1">
              {trendDirection === "up" && (
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  {trendText}
                </span>
              )}
              {trendDirection === "down" && (
                <span className="flex items-center gap-0.5 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                  <ArrowDownRight className="h-3 w-3" />
                  {trendText}
                </span>
              )}
              {trendDirection === "neutral" && (
                <span className="flex items-center gap-0.5 rounded-full bg-secondary px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <Minus className="h-3 w-3" />
                  {trendText}
                </span>
              )}
            </div>
          )}
          <span className="text-[10px] text-muted-foreground font-medium">vs last month</span>
        </div>

        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkline
              data={sparklineData}
              colorClass={sparklineColors?.stroke}
              fillColorClass={sparklineColors?.fill}
            />
          </div>
        )}
      </div>
    </div>
  );
}
