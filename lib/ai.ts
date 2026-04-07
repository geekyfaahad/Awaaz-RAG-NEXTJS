import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

/** Timeout wrapper that rejects after `ms` milliseconds */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ])
}

/** Default timeout for AI calls (30 seconds) */
const AI_TIMEOUT = 30_000

/**
 * Send a prompt to the configured AI provider and get a JSON response.
 * Tries OpenAI first, falls back to Gemini.
 * Includes a 30-second timeout to prevent hung requests.
 */
export async function aiReasoning(prompt: string): Promise<string> {
  if (openai) {
    const res = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temp for more consistent fact-checking
      }),
      AI_TIMEOUT,
      "OpenAI"
    )

    return res.choices[0].message.content || "{}"
  }

  if (gemini) {
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    })

    const result = await withTimeout(
      model.generateContent(prompt),
      AI_TIMEOUT,
      "Gemini"
    )

    return result.response.text()
  }

  throw new Error("No AI API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY.")
}