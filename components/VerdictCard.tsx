"use client"

import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VerificationResult } from "@/lib/types"

interface VerdictCardProps {
  parsedResult: VerificationResult
}

function getVerdictStyles(verdict: string) {
  switch (verdict?.toUpperCase()) {
    case "TRUE":
      return {
        icon: <ShieldCheck className="w-8 h-8 text-success" />,
        bg: "bg-success/10",
        border: "border-success/20",
        text: "text-success",
      }
    case "FAKE":
      return {
        icon: <ShieldAlert className="w-8 h-8 text-error" />,
        bg: "bg-error/10",
        border: "border-error/20",
        text: "text-error",
      }
    default:
      return {
        icon: <ShieldQuestion className="w-8 h-8 text-warning" />,
        bg: "bg-warning/10",
        border: "border-warning/20",
        text: "text-warning",
      }
  }
}

export function VerdictCard({ parsedResult }: VerdictCardProps) {
  const styles = getVerdictStyles(parsedResult.verdict)

  return (
    <div
      id="verdict-card"
      className={cn(
        "glass-card p-8 border-2 overflow-hidden relative",
        styles.border
      )}
    >
      {/* Ambient glow */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20",
          styles.bg
        )}
      />

      <div className="flex flex-col md:flex-row md:items-start gap-8 relative">
        <div className={cn("p-4 rounded-2xl", styles.bg)}>{styles.icon}</div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                "text-3xl font-bold tracking-tight uppercase",
                styles.text
              )}
            >
              {parsedResult.verdict || "Unverified"}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-tighter">
                  Confidence
                </p>
                <p className="font-mono text-xl text-slate-200">
                  {parsedResult.confidence || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", styles.bg.replace("/10", ""))}
              style={{ width: `${parsedResult.confidence || 0}%` }}
            />
          </div>

          <p className="text-slate-300 text-lg leading-relaxed italic">
            &ldquo;{parsedResult.reason || "No detailed reasoning provided."}&rdquo;
          </p>

          {parsedResult.agreement && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
              Source Agreement: {parsedResult.agreement}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
