import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Awaaz AI',
    short_name: 'Awaaz AI',
    description: 'Verify any news claim instantly with real-time sources and high-fidelity RAG analysis. Combat misinformation with Awaaz AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030303',
    theme_color: '#030303',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512 any',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
  }
}
