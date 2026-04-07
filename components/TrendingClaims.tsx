"use client"

import { TrendingUp, ExternalLink, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendingClaimsProps {
  trending: string[]
  fetchingTrending: boolean
  onRefresh: () => void
  onVerify: (claim: string) => void
}

export function TrendingClaims({
  trending,
  fetchingTrending,
  onRefresh,
  onVerify,
}: TrendingClaimsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-slate-300 font-medium tracking-wide text-sm uppercase">
          <TrendingUp className="w-4 h-4" />
          Trending Claims
        </h2>
        <button
          id="refresh-trending-btn"
          onClick={onRefresh}
          className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
          title="Refresh trends"
          aria-label="Refresh trending claims"
        >
          <RefreshCcw
            className={cn("w-4 h-4", fetchingTrending && "animate-spin")}
          />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trending.length > 0
          ? trending.map((t, i) => (
              <button
                key={i}
                id={`trending-claim-${i}`}
                onClick={() => onVerify(t)}
                className="glass-card p-4 text-left hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
              >
                <p className="text-slate-200 line-clamp-2 leading-relaxed font-medium">
                  {t}
                </p>
                <div className="mt-3 text-xs text-slate-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Verify now <ExternalLink className="w-3 h-3" />
                </div>
              </button>
            ))
          : Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="glass-card h-24 animate-pulse bg-white/5"
                />
              ))}
      </div>
    </div>
  )
}
