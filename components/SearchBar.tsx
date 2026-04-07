"use client"

import { Search, Loader2 } from "lucide-react"
import { MAX_CLAIM_LENGTH } from "@/lib/validation"

interface SearchBarProps {
  claim: string
  setClaim: (claim: string) => void
  onVerify: () => void
  loading: boolean
}

export function SearchBar({ claim, setClaim, onVerify, loading }: SearchBarProps) {
  const charCount = claim.length
  const isOverLimit = charCount > MAX_CLAIM_LENGTH
  const isEmpty = claim.trim().length === 0

  return (
    <div className="relative max-w-3xl mx-auto mb-12">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-500" />
      </div>
      <input
        id="claim-input"
        type="text"
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !isEmpty && !isOverLimit && onVerify()}
        placeholder="Paste a news claim to verify..."
        maxLength={MAX_CLAIM_LENGTH + 50} // soft limit for UX
        className={`w-full glass-input h-16 pl-12 pr-32 rounded-2xl text-lg placeholder:text-slate-600 shadow-2xl ${
          isOverLimit ? "border-error/50 focus:border-error/80 focus:ring-error/30" : ""
        }`}
        aria-label="Enter a news claim to verify"
      />
      <div className="absolute inset-y-2 right-2 flex gap-2 items-center">
        {/* Character counter */}
        {charCount > 0 && (
          <span
            className={`text-xs font-mono transition-colors ${
              isOverLimit ? "text-error" : charCount > MAX_CLAIM_LENGTH * 0.8 ? "text-warning" : "text-slate-600"
            }`}
          >
            {charCount}/{MAX_CLAIM_LENGTH}
          </span>
        )}
        <button
          id="verify-btn"
          onClick={onVerify}
          disabled={loading || isEmpty || isOverLimit}
          className="btn-primary flex items-center gap-2"
          aria-label="Verify claim"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
        </button>
      </div>
    </div>
  )
}
