"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IdeasList } from "@/components/ideas-list"
import { SettingsDialog } from "@/components/settings-dialog"
import { Inbox, Archive, Trash2 } from "lucide-react"

type TabValue = "inbox" | "archived" | "deleted"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>("inbox")
  const [settingsOpen, setSettingsOpen] = useState(false)

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

    // 'e' for settings
    if (e.key.toLowerCase() === "e") {
      e.preventDefault()
      setSettingsOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="min-h-screen bg-background">
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      
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
