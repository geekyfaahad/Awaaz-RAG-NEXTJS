import Parser from "rss-parser"
import { aiReasoning } from "@/lib/ai"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { getCache, setCache, getCacheAge, TTL } from "@/lib/cache"

const parser = new Parser()

/** Rate limit: 20 requests per minute per IP */
const RATE_WINDOW = 60_000
const RATE_MAX = 20

const CACHE_KEY = "trending:claims"

export async function GET(req: Request) {
  try {
    // --- Rate limiting ---
    const ip = getClientIp(req)
    const limit = checkRateLimit(ip, RATE_WINDOW, RATE_MAX)

    if (!limit.allowed) {
      return Response.json(
        { trending_claims: [], error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limit.resetInMs / 1000)),
          },
        }
      )
    }

    // --- Check cache first (10-minute TTL) ---
    const cached = getCache<string[]>(CACHE_KEY)
    if (cached) {
      const age = getCacheAge(CACHE_KEY)
      return Response.json(
        { trending_claims: cached, cached: true },
        {
          headers: {
            "X-Cache": "HIT",
            "X-Cache-Age": String(age),
          },
        }
      )
    }

    // --- Fetch fresh trending headlines ---
    const url =
      "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"

    const feed = await parser.parseURL(url)

    const titles = feed.items.slice(0, 8).map((i) => {
      const title = i.title || ""
      return title.split(" - ").slice(0, -1).join(" - ") || title
    })

    const prompt = `Rewrite these news headlines as short, verifiable factual claims (max 8 words each). 
Make them sound like something someone might share on social media.

Headlines:
${titles.join("\n")}

Return a JSON array of exactly 3 claims. Example: ["Claim one here", "Claim two here", "Claim three here"]
`

    const text = await aiReasoning(prompt)

    if (!text) {
      return Response.json({ trending_claims: [] })
    }

    let claims: string[] = []
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      claims = Array.isArray(parsed) ? parsed : []
    } catch (err) {
      console.error("Failed to parse trending claims JSON:", err)
      // Fallback: try to extract quoted strings
      const matches = text.match(/"([^"]+)"/g)
      if (matches) {
        claims = matches.map((m) => m.replace(/"/g, "")).slice(0, 3)
      } else {
        claims = text
          .split("\n")
          .filter((line) => line.trim())
          .slice(0, 3)
      }
    }

    const result = claims.slice(0, 3)

    // --- Cache for 10 minutes ---
    setCache(CACHE_KEY, result, TTL.TRENDING)

    return Response.json(
      { trending_claims: result, cached: false },
      {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    )
  } catch (err) {
    console.error("Trending API Error:", err)
    return Response.json(
      { trending_claims: [], error: "Service unavailable" },
      { status: 200 }
    )
  }
}