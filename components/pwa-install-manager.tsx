"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Download, CheckCircle2, Share2, PlusSquare } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function PwaInstallManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    setIsInstalled(isStandaloneMode())
    const ua = window.navigator.userAgent.toLowerCase()
    setIsIos(/iphone|ipad|ipod/.test(ua))

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Install BrainBox</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Add BrainBox to your home screen for a native app-like experience.
        </p>
      </div>

      {isInstalled ? (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-500" />
          App is already installed on this device.
        </div>
      ) : deferredPrompt ? (
        <Button className="w-full" onClick={handleInstall}>
          <Download className="size-4 mr-2" />
          Install App
        </Button>
      ) : isIos ? (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
          <p className="font-medium">Install on iPhone/iPad</p>
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            <Share2 className="size-4" />
            Tap Share in Safari.
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            <PlusSquare className="size-4" />
            Choose Add to Home Screen.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          Install prompt is not available yet. Open this site in Chrome/Edge and use browser install option.
        </div>
      )}
    </div>
  )
}
