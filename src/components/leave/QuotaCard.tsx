"use client";

import { useMemo } from "react";
import { DEFAULT_LEAVE_QUOTA } from "@/constants";

interface QuotaCardProps {
  totalQuota?: number;
  usedQuota: number;
  pendingQuota?: number;
  compact?: boolean;
}

export function QuotaCard({ totalQuota = DEFAULT_LEAVE_QUOTA, usedQuota, pendingQuota = 0, compact = false }: QuotaCardProps) {
  const remaining = Math.max(0, totalQuota - usedQuota - pendingQuota);
  const usedPercent = Math.min(100, (usedQuota / totalQuota) * 100);
  const pendingPercent = Math.min(100 - usedPercent, (pendingQuota / totalQuota) * 100);
  const totalUsedPercent = usedPercent + pendingPercent;

  const color = useMemo(() => {
    const remainPercent = (remaining / totalQuota) * 100;
    if (remainPercent > 50) return { stroke: "stroke-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (remainPercent > 25) return { stroke: "stroke-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" };
    return { stroke: "stroke-rose-500", text: "text-rose-500", bg: "bg-rose-500/10" };
  }, [remaining, totalQuota]);

  const size = compact ? 80 : 120;
  const strokeWidth = compact ? 6 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const usedDash = (usedPercent / 100) * circumference;
  const pendingDash = (pendingPercent / 100) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-border/30" />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className={color.stroke}
              strokeDasharray={`${usedDash} ${circumference - usedDash}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
            {pendingQuota > 0 && (
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-amber-400"
                strokeDasharray={`${pendingDash} ${circumference - pendingDash}`} strokeDashoffset={-usedDash}
                strokeLinecap="round" opacity={0.6} style={{ transition: "stroke-dasharray 0.5s ease" }} />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${color.text}`}>{remaining}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">{remaining} days left</p>
          <p className="text-[10px] text-muted-foreground">{usedQuota} used of {totalQuota}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border/60 ${color.bg} p-5 shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-border/30" />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className={color.stroke}
              strokeDasharray={`${usedDash} ${circumference - usedDash}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
            {pendingQuota > 0 && (
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-amber-400"
                strokeDasharray={`${pendingDash} ${circumference - pendingDash}`} strokeDashoffset={-usedDash}
                strokeLinecap="round" opacity={0.6} style={{ transition: "stroke-dasharray 0.5s ease" }} />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-extrabold ${color.text}`}>{remaining}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">remaining</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-bold text-foreground">Leave Quota</h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Quota</span>
              <span className="font-bold text-foreground">{totalQuota} days</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Used</span>
              <span className="font-bold text-foreground">{usedQuota} days</span>
            </div>
            {pendingQuota > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Pending</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{pendingQuota} days</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs border-t border-border/40 pt-1.5">
              <span className={`font-semibold ${color.text}`}>Remaining</span>
              <span className={`font-extrabold ${color.text}`}>{remaining} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
