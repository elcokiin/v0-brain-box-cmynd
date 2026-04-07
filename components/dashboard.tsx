"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IdeasList } from "@/components/ideas-list"
import { Inbox, Archive, Trash2, Brain } from "lucide-react"

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">BrainBox</h1>
              <p className="text-xs text-muted-foreground">Capture ideas, anywhere</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="inbox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
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
