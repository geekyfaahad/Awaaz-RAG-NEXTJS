"use client"

import { ExternalLink } from "lucide-react"
import type { Article } from "@/lib/types"

interface SourcesListProps {
  sources: Article[]
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest px-2">
        Cross-Referenced Sources ({sources.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source, i) => (
          <a
            key={i}
            id={`source-${i}`}
            href={source.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-5 hover:bg-white/10 transition-colors border-white/5 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-400 px-2 py-1 bg-indigo-500/10 rounded uppercase">
                {source.source}
              </span>
              <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <h4 className="text-slate-200 font-medium line-clamp-2 group-hover:text-white transition-colors">
              {source.title}
            </h4>
          </a>
        ))}
      </div>
    </div>
  )
}
