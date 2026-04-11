"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IdeasList } from "@/components/ideas-list"
import { SettingsDialog } from "@/components/settings-dialog"
import { Inbox, Archive, Trash2 } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useTheme } from "@/components/theme-provider"

type TabValue = "inbox" | "archived" | "deleted"

interface DashboardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("inbox")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [keyboardEnabled, setKeyboardEnabled] = useState(true)
  const [themeToggleKeyEnabled, setThemeToggleKeyEnabled] = useState(true)
  const [settingsKeyEnabled, setSettingsKeyEnabled] = useState(true)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const stored = localStorage.getItem("brainbox-keyboard-nav")
    if (stored !== null) setKeyboardEnabled(stored === "true")

    const storedThemeKey = localStorage.getItem("brainbox-shortcut-theme-toggle")
    if (storedThemeKey !== null) setThemeToggleKeyEnabled(storedThemeKey === "true")

    const storedSettingsKey = localStorage.getItem("brainbox-shortcut-settings")
    if (storedSettingsKey !== null) setSettingsKeyEnabled(storedSettingsKey === "true")

    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent<boolean>
      setKeyboardEnabled(custom.detail)
    }

    const handleThemeKeyToggle = (e: Event) => {
      const custom = e as CustomEvent<boolean>
      setThemeToggleKeyEnabled(custom.detail)
    }

    const handleSettingsKeyToggle = (e: Event) => {
      const custom = e as CustomEvent<boolean>
      setSettingsKeyEnabled(custom.detail)
    }

    window.addEventListener("brainbox-keyboard-nav", handleToggle)
    window.addEventListener("brainbox-shortcut-theme-toggle", handleThemeKeyToggle)
    window.addEventListener("brainbox-shortcut-settings", handleSettingsKeyToggle)

    return () => {
      window.removeEventListener("brainbox-keyboard-nav", handleToggle)
      window.removeEventListener("brainbox-shortcut-theme-toggle", handleThemeKeyToggle)
      window.removeEventListener("brainbox-shortcut-settings", handleSettingsKeyToggle)
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore when typing in inputs
    const target = e.target as HTMLElement
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return
    }

    if (!keyboardEnabled) {
      return
    }

    // Ctrl+1, Ctrl+2, Ctrl+3 for tab switching
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "1":
          e.preventDefault()
          setActiveTab("inbox")
          break
        case "2":
          e.preventDefault()
          setActiveTab("archived")
          break
        case "3":
          e.preventDefault()
          setActiveTab("deleted")
          break
      }
      return
    }

    // 'p' or ',' toggles settings
    if (settingsKeyEnabled && (e.key.toLowerCase() === "p" || e.key === ",")) {
      e.preventDefault()
      setSettingsOpen((prev) => !prev)
      return
    }

    // 'd' toggles light/dark theme
    if (themeToggleKeyEnabled && e.key.toLowerCase() === "d") {
      e.preventDefault()
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }
  }, [keyboardEnabled, resolvedTheme, setTheme, settingsKeyEnabled, themeToggleKeyEnabled])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="min-h-screen bg-background">
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      
      {/* User menu in top right */}
      <div className="fixed top-4 right-4 z-50">
        <UserMenu user={user} />
      </div>
      
      <main className="container max-w-5xl mx-auto px-4 py-8 pt-16">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="size-4" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            <TabsTrigger value="archived" className="gap-2">
              <Archive className="size-4" />
              <span className="hidden sm:inline">Archived</span>
            </TabsTrigger>
            <TabsTrigger value="deleted" className="gap-2">
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Trash</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            <IdeasList status="inbox" />
          </TabsContent>

          <TabsContent value="archived">
            <IdeasList status="archived" />
          </TabsContent>

          <TabsContent value="deleted">
            <IdeasList status="deleted" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
