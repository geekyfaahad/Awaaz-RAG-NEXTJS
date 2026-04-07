export interface Article {
  title: string
  link: string
  source: string
}

export interface VerificationResult {
  verdict: "TRUE" | "FAKE" | "UNVERIFIED"
  reason: string
  confidence: number
  agreement: "Low" | "Medium" | "High"
}

/** Structured API response from /api/verify */
export interface VerifyResponse {
  result?: string
  sources?: Article[]
  parsedResult?: VerificationResult | null
  error?: string
  cached?: boolean
}

/** A saved verification entry for history */
export interface HistoryEntry {
  id: string
  claim: string
  verdict: "TRUE" | "FAKE" | "UNVERIFIED"
  confidence: number
  reason: string
  sourceCount: number
  timestamp: number
}

/** Trending API response */
export interface TrendingResponse {
  trending_claims: string[]
  cached?: boolean
  error?: string
}