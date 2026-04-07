<div align="center">

<img src="app/icon.svg" alt="Awaaz AI Logo" width="72" height="72" />

# Awaaz AI

### Real-Time News Fact-Checker powered by RAG + AI

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Paste a claim. Get a verdict in seconds.**  
Awaaz AI scrapes real-time news, builds evidence packages, and uses AI to fact-check any claim — with source citations and a confidence score.

[Demo](#getting-started) · [API Docs](#api-endpoints) · [Contributing](#contributing)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Real-Time RAG Pipeline** | Fetches live news articles via Google News RSS, scrapes full article content with Cheerio, and feeds evidence to the AI |
| 🤖 **Dual AI Provider** | Uses **OpenAI GPT-4o mini** by default, automatically falls back to **Google Gemini 2.5 Flash** if OpenAI is unavailable |
| ✅ **Structured Verdicts** | Every claim gets a `TRUE / FAKE / UNVERIFIED` verdict with a confidence score (0–100), reasoning, and source agreement level |
| 📰 **Trending Claims** | Pulls live headlines from Google News India, rewrites them into verifiable social media-style claims via AI |
| 🕐 **Verification History** | Slide-out drawer that persists past verifications in `localStorage` with timestamps and re-verify support |
| ⚡ **In-Memory Caching** | TTL-based cache prevents redundant AI calls — 10 min for trending, 30 min for verifications |
| 🛡️ **Rate Limiting** | Sliding-window IP-based rate limiter — 15 req/min on `/verify`, 20 req/min on `/trending` |
| 🧹 **Input Validation** | Sanitizes and validates all claim inputs before processing |
| 📦 **PWA Ready** | Installable as a Progressive Web App with a service worker and web manifest |
| 🎨 **Premium Dark UI** | Glassmorphism design with animated gradients, micro-animations, and a full dark theme |
| 🚨 **Custom Error Pages** | Styled 404 ("Signal Lost") and 500 ("Fact Check Failed") error pages matching the app aesthetic |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2 (App Router) | Full-stack React framework with Turbopack |
| [React](https://react.dev) | 19 | UI rendering with concurrent features |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety across the entire codebase |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling with custom design tokens |
| [Lucide React](https://lucide.dev) | 1.7 | Icon library |
| [Sonner](https://sonner.emilkowal.ski) | 2.0 | Toast notifications (PWA install prompt) |

### Backend / AI
| Technology | Version | Purpose |
|---|---|---|
| [OpenAI SDK](https://platform.openai.com) | 6.33 | Primary AI provider (GPT-4o mini) |
| [@google/generative-ai](https://ai.google.dev) | 0.24 | Fallback AI provider (Gemini 2.5 Flash) |
| [Cheerio](https://cheerio.js.org) | 1.2 | Server-side HTML scraping for article content |
| [rss-parser](https://github.com/rbren/rss-parser) | 3.13 | Google News RSS feed parsing |
| [Axios](https://axios-http.com) | 1.14 | HTTP client for article fetching |

---

## 📁 Project Structure

```
awaaz-rag-nextjs/
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fonts, Toaster, PWA)
│   ├── page.tsx                # Main page (fact-checker UI)
│   ├── not-found.tsx           # Custom 404 — "Signal Lost"
│   ├── error.tsx               # Route-level error boundary — "Fact Check Failed"
│   ├── global-error.tsx        # Root layout error boundary — "System Meltdown"
│   ├── manifest.ts             # PWA web manifest
│   ├── globals.css             # Design tokens, Tailwind config, animations
│   └── api/
│       ├── verify/route.ts     # POST /api/verify — core fact-check endpoint
│       ├── trending/route.ts   # GET  /api/trending — live trending claims
│       └── health/route.ts     # GET  /api/health — system health check
│
├── components/
│   ├── SearchBar.tsx           # Claim input with verify button
│   ├── TrendingClaims.tsx      # Trending claim pills with refresh
│   ├── VerdictCard.tsx         # Verdict, confidence, reasoning display
│   ├── SourcesList.tsx         # Cited news sources list
│   ├── VerificationHistory.tsx # Slide-out drawer with localStorage history
│   └── PWAInstallPrompt.tsx    # Service worker registration + install toast
│
├── lib/
│   ├── ai.ts                   # Dual-provider AI client (OpenAI → Gemini fallback)
│   ├── cache.ts                # In-memory TTL cache
│   ├── news.ts                 # Google News RSS + Cheerio article scraper
│   ├── rag.ts                  # Evidence builder (Promise.allSettled scraping)
│   ├── rate-limit.ts           # Sliding-window IP rate limiter
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── utils.ts                # Utility helpers (cn, etc.)
│   └── validation.ts           # Claim input sanitization & validation
│
├── public/
│   └── sw.js                   # PWA service worker
│
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- An **OpenAI API key** and/or a **Google Gemini API key** (at least one is required)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/awaaz-rag-nextjs.git
cd awaaz-rag-nextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example and fill in your API keys:

```bash
cp .env.example .env
```

**.env**
```env
# At least one is required. OpenAI is used first; Gemini is the fallback.
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

> **Note:** If only `GEMINI_API_KEY` is set, it will be used exclusively.  
> If both are set, OpenAI takes priority.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 📡 API Endpoints

### `POST /api/verify`

Fact-checks a claim against real-time news sources.

**Rate Limit:** 15 requests / minute / IP

**Request Body:**
```json
{
  "claim": "The government has banned social media for minors."
}
```

**Response (200 OK):**
```json
{
  "result": "{\"verdict\":\"UNVERIFIED\",\"reason\":\"...\",\"confidence\":42,\"agreement\":\"Low\"}",
  "sources": [
    {
      "title": "India considers social media age restrictions",
      "link": "https://...",
      "source": "The Hindu"
    }
  ],
  "cached": false
}
```

**Verdict values:** `TRUE` | `FAKE` | `UNVERIFIED`

**Response Headers:**
| Header | Description |
|---|---|
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-Cache` | `HIT` if served from cache, `MISS` if freshly generated |

**Error Responses:**
| Status | Reason |
|---|---|
| `400` | Claim failed validation (too short, too long, or empty) |
| `429` | Rate limit exceeded — retry after `Retry-After` seconds |
| `500` | AI provider or scraping error |

---

### `GET /api/trending`

Returns 3 AI-rewritten trending news claims from Google News India.

**Rate Limit:** 20 requests / minute / IP  
**Cache TTL:** 10 minutes

**Response (200 OK):**
```json
{
  "trending_claims": [
    "India's economy grew 7.6% last quarter",
    "New Delhi records cleanest air in a decade",
    "BCCI announces record IPL broadcast deal"
  ],
  "cached": true
}
```

---

### `GET /api/health`

Health check endpoint for uptime monitoring.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-07T07:00:00.000Z",
  "version": "0.1.0",
  "providers": {
    "openai": "configured",
    "gemini": "missing"
  },
  "uptime": 3600.5
}
```

**Status values:** `healthy` (at least one provider configured) | `degraded` (no API keys found)

---

## 🧠 How It Works

```
User Claim
    │
    ▼
Input Validation & Rate Limiting
    │
    ▼
Cache Check (30-min TTL)
    │ HIT → return cached result
    │ MISS ↓
    ▼
Google News RSS → Top 5 articles matching claim
    │
    ▼
Cheerio Article Scraper (Promise.allSettled — fails gracefully)
    │
    ▼
Evidence Package built from scraped content
    │
    ▼
AI Reasoning (OpenAI / Gemini)
    │ Prompt: claim + evidence → JSON verdict
    ▼
{ verdict, reason, confidence, agreement }
    │
    ▼
Store in cache → Return to client
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** and ensure TypeScript compiles:
   ```bash
   npm run build
   ```
4. **Lint your code:**
   ```bash
   npm run lint
   ```
5. **Commit** using conventional commits:
   ```bash
   git commit -m "feat: add support for X"
   ```
6. **Open a Pull Request** against `main`

### Ideas for Contributions

- 🔴 **Redis cache** — swap the in-memory cache for Upstash Redis for multi-instance deployments
- 🌐 **Multi-language support** — extend trending claims to other regions/languages
- 📊 **Analytics dashboard** — claim history trends, most-checked topics
- 🔔 **Webhook alerts** — notify users when a claim they saved changes verdict
- 🧪 **Test coverage** — add Vitest unit tests for `lib/` modules

---

## 📝 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ to combat misinformation.

**[awaaz-ai.vercel.app](https://awaaz-ai.vercel.app)** · [Report a Bug](https://github.com/your-username/awaaz-rag-nextjs/issues) · [Request a Feature](https://github.com/your-username/awaaz-rag-nextjs/issues)

</div>
