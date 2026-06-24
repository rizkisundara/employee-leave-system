"use client";

import { useState, useEffect } from "react";
import { Database, CheckCircle2, XCircle, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";

export default function SetupPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/db/setup", { method: "POST" });
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({ status: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkStatus(); }, []);

  const copySQL = async () => {
    if (status?.migration_sql) {
      await navigator.clipboard.writeText(status.migration_sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Database className="h-8 w-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Database Setup</h1>
          <p className="text-muted-foreground">Configure your Supabase database connection</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            <span className="text-muted-foreground">Checking database...</span>
          </div>
        )}

        {status && !loading && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className={`rounded-2xl border p-6 ${
              status.status === "ready" || status.status === "seeded"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : status.status === "tables_missing"
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-red-500/30 bg-red-500/5"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {status.status === "ready" || status.status === "seeded" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-amber-500" />
                )}
                <h2 className="text-lg font-semibold">{status.message}</h2>
              </div>

              {/* Table Status */}
              {status.tables && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {Object.entries(status.tables).map(([table, stat]) => (
                    <div key={table} className="flex items-center gap-2 text-sm rounded-lg bg-background/50 px-3 py-2">
                      <span>{String(stat).includes("✅") ? "✅" : "❌"}</span>
                      <span className="font-mono text-xs">{table}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Migration SQL (if tables missing) */}
            {status.status === "tables_missing" && status.migration_sql && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <h3 className="font-semibold">Steps to setup:</h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">1</span>
                      <span>Copy the SQL migration below</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">2</span>
                      <span>
                        Open{" "}
                        <a
                          href="https://supabase.com/dashboard/project/lhxiqucnadwfvvhapzju/sql/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:underline inline-flex items-center gap-1"
                        >
                          Supabase SQL Editor <ExternalLink className="h-3 w-3" />
                        </a>
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">3</span>
                      <span>Paste and click &quot;Run&quot;</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">4</span>
                      <span>Come back here and click &quot;Re-check&quot;</span>
                    </li>
                  </ol>

                  <button
                    onClick={copySQL}
                    className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-all cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "✅ Copied!" : "Copy SQL Migration"}
                  </button>
                </div>

                <pre className="max-h-60 overflow-auto rounded-xl border border-border bg-card p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {status.migration_sql}
                </pre>
              </div>
            )}

            {/* Success - go to app */}
            {(status.status === "ready" || status.status === "seeded") && (
              <a
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Go to Login
              </a>
            )}

            {/* Re-check button */}
            <button
              onClick={checkStatus}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Re-check Database
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
