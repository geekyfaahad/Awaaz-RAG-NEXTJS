import { Article } from "./types"
import { extractArticle } from "./news"

/**
 * Build an evidence string from a list of articles by scraping their content.
 * Uses Promise.allSettled to handle individual article failures gracefully.
 * Includes source quality indicators for the AI.
 */
export async function buildEvidence(articles: Article[]): Promise<string> {
  if (articles.length === 0) {
    return "NO EVIDENCE FOUND. No relevant news articles were retrieved."
  }

  const results = await Promise.allSettled(
    articles.map(async (art, index) => {
      const text = await extractArticle(art.link)
      const hasContent = text.length > 50

      return [
        `--- SOURCE ${index + 1} ---`,
        `OUTLET: ${art.source}`,
        `HEADLINE: ${art.title}`,
        `CONTENT: ${hasContent ? text : "[Article content could not be extracted]"}`,
        `STATUS: ${hasContent ? "RETRIEVED" : "EXTRACTION_FAILED"}`,
        "",
      ].join("\n")
    })
  )

  const evidence = results
    .filter(
      (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled"
    )
    .map((r) => r.value)
    .join("\n")

  const successCount = results.filter(
    (r) => r.status === "fulfilled"
  ).length
  const failCount = results.filter(
    (r) => r.status === "rejected"
  ).length

  return [
    `EVIDENCE SUMMARY: ${successCount} sources retrieved, ${failCount} failed.`,
    "",
    evidence,
  ].join("\n")
}
