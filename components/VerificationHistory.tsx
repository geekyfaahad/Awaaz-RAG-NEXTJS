"use client"

import { useState, useEffect, useCallback } from "react"
import { Clock, ChevronRight, Trash2, X, History } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistoryEntry } from "@/lib/types"

const STORAGE_KEY = "awaaz:verification-history"
const MAX_HISTORY = 20

/** Load history from localStorage */
function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Save history to localStorage */
function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)))
  } catch {
    // Storage full — silently fail
  }
}

/** Add a new entry to history */
export function addToHistory(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  const history = loadHistory()
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  }
  saveHistory([newEntry, ...history])
}

interface VerificationHistoryProps {
  onReVerify: (claim: string) => void
}

export function VerificationHistory({ onReVerify }: VerificationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // Refresh when drawer opens
  useEffect(() => {
    if (isOpen) {
      setHistory(loadHistory())
    }
  }, [isOpen])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  const removeEntry = useCallback((id: string) => {
    const updated = loadHistory().filter((e) => e.id !== id)
    saveHistory(updated)
    setHistory(updated)
  }, [])

  const verdictColor = (verdict: string) => {
    switch (verdict) {
      case "TRUE": return "text-success"
      case "FAKE": return "text-error"
      default: return "text-warning"
    }
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        id="history-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-40 p-3 rounded-2xl transition-all shadow-lg",
          "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10",
          isOpen && "bg-indigo-600/20 border-indigo-500/30"
        )}
        title="Verification history"
        aria-label="Toggle verification history"
      >
        <History className={cn("w-5 h-5", isOpen ? "text-indigo-400" : "text-slate-400")} />
        {history.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {history.length}
          </span>
        )}
      </button>

      {/* Slide-out drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 z-50 transition-transform duration-300 ease-out",
          "glass-card rounded-l-3xl border-l border-white/10 shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History
          </h3>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-error transition-colors flex items-center gap-1"
                title="Clear all history"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto h-[calc(100%-60px)] p-3 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <History className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No verifications yet</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onReVerify(entry.claim)
                  setIsOpen(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onReVerify(entry.claim)
                    setIsOpen(false)
                  }
                }}
                className="relative w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/10 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs font-bold uppercase", verdictColor(entry.verdict))}>
                    {entry.verdict}
                  </span>
                  <span className="text-xs text-slate-600">{formatTime(entry.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2 leading-snug">{entry.claim}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-600 font-mono">{entry.confidence}%</span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                {/* Swipe to delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeEntry(entry.id)
                  }}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-error"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
