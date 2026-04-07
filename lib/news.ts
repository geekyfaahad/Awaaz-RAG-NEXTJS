import Parser from "rss-parser"
import axios from "axios"
import * as cheerio from "cheerio"
import { Article } from "./types"

const parser = new Parser()

/**
 * Optimize a user query for news search by removing noise words and punctuation.
 */
function optimizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(
      /\b(did|is|was|were|has|have|had|the|a|an|happened|occurred|in|at|on|for|to|it|that|this|are|been|being|do|does)\b/g,
      ""
    )
    .replace(/[?.,!'"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Fetch relevant news articles from Google News RSS.
 * Returns up to `limit` articles with source attribution.
 */
export async function getGoogleNews(
  query: string,
  limit: number = 5
): Promise<Article[]> {
  const optimized = optimizeQuery(query)
  const encoded = encodeURIComponent(optimized || query)

  const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`

  try {
    const feed = await parser.parseURL(url)

    return feed.items.slice(0, limit).map((item) => {
      const title = item.title || ""
      const parts = title.split(" - ")
      const sourceFromTitle = parts.length > 1 ? parts.pop() : "Unknown"

      return {
        title: parts.join(" - "),
        link: item.link || "",
        source:
          (item as { source?: { _?: string } }).source?._ ||
          sourceFromTitle ||
          "Unknown",
      }
    })
  } catch (error) {
    console.error("Google News RSS fetch failed:", error)
    return []
  }
}

/**
 * Priority selectors for extracting article body text.
 * Ordered from most specific (article body) to most generic (all paragraphs).
 */
const CONTENT_SELECTORS = [
  "article p",
  '[class*="article-body"] p',
  '[class*="story-body"] p',
  '[class*="content-body"] p',
  "main p",
  ".post-content p",
  ".entry-content p",
  "#article-body p",
  "p",
]

/**
 * Extract readable text from a news article URL.
 * Uses progressive selector fallback for better content extraction.
 * Returns up to 2000 characters (up from 500) for richer context.
 */
export async function extractArticle(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 3,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    })

    const $ = cheerio.load(data)

    // Remove noise elements before extracting text
    $(
      "script, style, nav, footer, header, aside, .ad, .advertisement, .social-share, .comments, [class*='sidebar'], [class*='related']"
    ).remove()

    // Try selectors in priority order
    for (const selector of CONTENT_SELECTORS) {
      const paragraphs = $(selector)
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((text) => text.length > 30) // Skip trivially short paragraphs

      if (paragraphs.length >= 2) {
        return paragraphs.join(" ").slice(0, 2000)
      }
    }

    // Last resort: grab all visible text from body
    const bodyText = $("body").text().replace(/\s+/g, " ").trim()
    return bodyText.slice(0, 2000)
  } catch {
    return ""
  }
}