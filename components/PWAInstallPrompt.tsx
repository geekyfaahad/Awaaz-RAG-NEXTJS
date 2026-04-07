"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1. Register Service Worker to satisfy PWA requirements
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // 2. Listen for the install prompt event
    const handler = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  useEffect(() => {
    if (deferredPrompt) {
      const hasPrompted = localStorage.getItem("awaaz-pwa-prompted");
      if (hasPrompted) return;

      toast("Install Awaaz AI", {
        description: "Add to your home screen for quick access to real-time fact checking.",
        duration: 10000,
        position: "bottom-right",
        action: {
          label: "Install",
          onClick: async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
              setDeferredPrompt(null);
            }
          },
        },
        cancel: {
          label: "Maybe later",
          onClick: () => {
            localStorage.setItem("awaaz-pwa-prompted", "true");
          },
        },
        id: "pwa-install-toast"
      });
    }
  }, [deferredPrompt]);

  return null;
}
