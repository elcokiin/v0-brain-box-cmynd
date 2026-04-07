"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IdeasList } from "@/components/ideas-list"
import { SettingsDialog } from "@/components/settings-dialog"
import { Inbox, Archive, Trash2 } from "lucide-react"

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <SettingsDialog />
      
      <main className="container max-w-5xl mx-auto px-4 py-8 pt-16">
        <Tabs defaultValue="inbox" className="space-y-6">
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
