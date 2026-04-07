import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Awaaz AI | Real-Time News Fact-Checker",
  description:
    "Verify any news claim instantly with real-time sources and AI-powered RAG analysis. Combat misinformation with Awaaz AI.",
  keywords: [
    "fact checker",
    "news verification",
    "misinformation",
    "AI",
    "RAG",
    "Awaaz",
    "fake news",
  ],
  openGraph: {
    title: "Awaaz AI — Real-Time News Fact-Checker",
    description:
      "Paste a claim. Get a verdict. Powered by AI and real-time news retrieval.",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="dark" position="bottom-right" />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
