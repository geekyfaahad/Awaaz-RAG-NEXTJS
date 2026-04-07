/**
 * Input validation and sanitization for user-submitted claims.
 * Guards against prompt injection, XSS, and malformed input.
 */

export interface ValidationResult {
  valid: boolean
  sanitized: string
  error?: string
}

/** Maximum claim length in characters */
export const MAX_CLAIM_LENGTH = 500
/** Minimum claim length in characters */
export const MIN_CLAIM_LENGTH = 5

/**
 * Known prompt injection patterns to detect and block.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)/i,
  /you\s+are\s+now\s+/i,
  /system\s*:\s*/i,
  /\[\s*INST\s*\]/i,
  /<<\s*SYS\s*>>/i,
  /pretend\s+you\s+are/i,
  /bypass\s+(your|the)\s+(rules|instructions|filters)/i,
  /return\s+.*verdict.*TRUE.*100/i,
]

/**
 * Sanitize and validate a user-submitted claim.
 */
export function sanitizeClaim(raw: unknown): ValidationResult {
  // Type check
  if (!raw || typeof raw !== "string") {
    return { valid: false, sanitized: "", error: "No claim provided" }
  }

  // Trim whitespace
  let claim = raw.trim()

  // Length check
  if (claim.length < MIN_CLAIM_LENGTH) {
    return {
      valid: false,
      sanitized: "",
      error: `Claim too short (minimum ${MIN_CLAIM_LENGTH} characters)`,
    }
  }

  if (claim.length > MAX_CLAIM_LENGTH) {
    return {
      valid: false,
      sanitized: "",
      error: `Claim too long (maximum ${MAX_CLAIM_LENGTH} characters)`,
    }
  }

  // Strip HTML/script tags
  claim = claim
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")

  // Check for prompt injection attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(claim)) {
      return {
        valid: false,
        sanitized: "",
        error: "Invalid claim content detected",
      }
    }
  }

  // Normalize whitespace
  claim = claim.replace(/\s+/g, " ").trim()

  return { valid: true, sanitized: claim }
}
