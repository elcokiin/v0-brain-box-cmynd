"use client"

import useSWR from "swr"
import { IdeaCard, type Idea } from "@/components/idea-card"
import { QuickCapture } from "@/components/quick-capture"
import { Empty } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Inbox, Archive, Trash2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface IdeasListProps {
  status: "inbox" | "archived" | "deleted"
}

export function IdeasList({ status }: IdeasListProps) {
  const { data, error, isLoading, mutate } = useSWR<{ ideas: Idea[] }>(
    `/api/ideas?status=${status}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const handleCapture = async (content: string) => {
    const response = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (response.ok) {
      mutate()
    }
  }

  const handleStatusChange = async (id: string, newStatus: "inbox" | "archived" | "deleted") => {
    // Optimistic update
    mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.filter((idea) => idea.id !== id),
        }
      },
      false
    )

    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })

    mutate()
  }

  const emptyState = {
    inbox: {
      icon: Inbox,
      title: "Your inbox is empty",
      description: "Capture ideas from the web or send them via Telegram",
    },
    archived: {
      icon: Archive,
      title: "No archived ideas",
      description: "Ideas you archive will appear here",
    },
    deleted: {
      icon: Trash2,
      title: "Trash is empty",
      description: "Deleted ideas will appear here",
    },
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {status === "inbox" && <Skeleton className="h-12 w-full" />}
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Empty
        icon={emptyState[status].icon}
        title="Failed to load ideas"
        description="There was an error loading your ideas. Please try again."
      />
    )
  }

  const ideas = data?.ideas ?? []
  const EmptyIcon = emptyState[status].icon

  return (
    <div className="space-y-4">
      {status === "inbox" && <QuickCapture onCapture={handleCapture} />}

      {ideas.length === 0 ? (
        <Empty
          icon={EmptyIcon}
          title={emptyState[status].title}
          description={emptyState[status].description}
        />
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
