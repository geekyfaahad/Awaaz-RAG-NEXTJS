"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ShieldCheck,
  AlertCircle,
  RefreshCcw,
  Loader2,
} from "lucide-react"
import type { VerificationResult, Article } from "@/lib/types"

import { SearchBar } from "@/components/SearchBar"
import { TrendingClaims } from "@/components/TrendingClaims"
import { VerdictCard } from "@/components/VerdictCard"
import { SourcesList } from "@/components/SourcesList"
import { VerificationHistory, addToHistory } from "@/components/VerificationHistory"

interface VerifyResult {
  result?: string
  sources?: Article[]
  parsedResult?: VerificationResult | null
  error?: string
  cached?: boolean
}

export default function Home() {
  const [claim, setClaim] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trending, setTrending] = useState<string[]>([])
  const [fetchingTrending, setFetchingTrending] = useState(false)

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    setFetchingTrending(true)
    try {
      const res = await fetch("/api/trending")
      const data = await res.json()
      if (data.trending_claims) {
        setTrending(data.trending_claims)
      }
    } catch (err) {
      console.error("Failed to fetch trending:", err)
    } finally {
      setFetchingTrending(false)
    }
  }

  const verify = useCallback(async (targetClaim?: string) => {
    const activeClaim = targetClaim || claim
    if (!activeClaim.trim()) return

    if (targetClaim) {
      setClaim(targetClaim)
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: activeClaim }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || "Verification failed")
        return
      }

      // Parse the AI response
      let parsed: VerificationResult | null = null
      if (typeof data.result === "string") {
        try {
          const cleaned = data.result.replace(/```json\n?|\n?```/g, "").trim()
          parsed = JSON.parse(cleaned)
        } catch {
          console.warn("Failed to parse AI output as JSON")
        }
      } else if (data.result && typeof data.result === "object") {
        parsed = data.result
      }

      const verifyResult: VerifyResult = {
        ...data,
        parsedResult: parsed,
      }
      setResult(verifyResult)

      // Save to history
      if (parsed) {
        addToHistory({
          claim: activeClaim,
          verdict: parsed.verdict,
          confidence: parsed.confidence,
          reason: parsed.reason,
          sourceCount: data.sources?.length || 0,
        })
      }
    } catch (err) {
      console.error("Verification failed:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [claim])

  const reset = () => {
    setResult(null)
    setError(null)
    setClaim("")
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-24">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight gradient-text">
          Awaaz AI
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Combat misinformation with real-time news verification and high-fidelity RAG analysis.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        claim={claim}
        setClaim={setClaim}
        onVerify={() => verify()}
        loading={loading}
      />

      {/* Trending Claims */}
      {!result && !loading && !error && (
        <TrendingClaims
          trending={trending}
          fetchingTrending={fetchingTrending}
          onRefresh={fetchTrending}
          onVerify={(t) => verify(t)}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <ShieldCheck className="absolute inset-0 m-auto w-10 h-10 text-indigo-500/50 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium text-slate-200">Analyzing Claim</h3>
            <p className="text-slate-500 text-sm animate-pulse">
              Searching global news sources...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="p-4 rounded-2xl bg-error/10">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium text-slate-200">
              Verification Failed
            </h3>
            <p className="text-slate-400 text-sm max-w-md">{error}</p>
          </div>
          <button
            onClick={reset}
            className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Cached badge */}
          {result.cached && (
            <div className="flex justify-center">
              <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                ⚡ Cached result — verified recently
              </span>
            </div>
          )}

          {/* Verdict Card */}
          {result.parsedResult && (
            <VerdictCard parsedResult={result.parsedResult} />
          )}

          {/* Fallback for unparsed results */}
          {!result.parsedResult && result.result && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Raw AI Response
              </h3>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {typeof result.result === "string"
                  ? result.result
                  : JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Sources */}
          <SourcesList sources={result.sources || []} />

          {/* Reset */}
          <div className="text-center pt-8">
            <button
              onClick={reset}
              className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto"
            >
              <RefreshCcw className="w-4 h-4" />
              Verify another claim
            </button>
          </div>
        </div>
      )}

      {/* Verification History Drawer */}
      <VerificationHistory onReVerify={(c) => verify(c)} />
    </div>
  )
}