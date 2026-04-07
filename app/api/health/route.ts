/**
 * Health check endpoint for monitoring.
 * Returns system status and configuration.
 */
export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasGemini = !!process.env.GEMINI_API_KEY

  return Response.json({
    status: hasOpenAI || hasGemini ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    providers: {
      openai: hasOpenAI ? "configured" : "missing",
      gemini: hasGemini ? "configured" : "missing",
    },
    uptime: process.uptime?.() ?? null,
  })
}
