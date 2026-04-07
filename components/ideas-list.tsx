"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { IdeaCard, type Idea } from "@/components/idea-card"
import { QuickCapture } from "@/components/quick-capture"
import { Empty } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"
import { Inbox, Archive, Trash2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface IdeasListProps {
  status: "inbox" | "archived" | "deleted"
  onOpenCapture?: () => void
}

export function IdeasList({ status, onOpenCapture }: IdeasListProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [keyboardEnabled, setKeyboardEnabled] = useState(true)
  const [captureOpen, setCaptureOpen] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<{ ideas: Idea[] }>(
    `/api/ideas?status=${status}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const ideas = data?.ideas ?? []

  useEffect(() => {
    const stored = localStorage.getItem("brainbox-keyboard-nav")
    if (stored !== null) setKeyboardEnabled(stored === "true")

    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent
      setKeyboardEnabled(custom.detail)
    }
    window.addEventListener("brainbox-keyboard-nav", handleToggle)
    return () => window.removeEventListener("brainbox-keyboard-nav", handleToggle)
  }, [])

  const handleNew = useCallback(() => {
    if (status === "inbox") {
      setCaptureOpen(true)
      onOpenCapture?.()
    }
  }, [status, onOpenCapture])

  useKeyboardNavigation({
    itemCount: ideas.length,
    selectedIndex,
    onSelect: setSelectedIndex,
    onNew: handleNew,
    enabled: keyboardEnabled && !captureOpen,
  })

  const handleCapture = async (content: string) => {
    const response = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (response.ok) {
      mutate()
    }
    setCaptureOpen(false)
  }

  const handleCaptureClose = () => {
    setCaptureOpen(false)
  }

  const handleStatusChange = async (id: string, newStatus: "inbox" | "archived" | "deleted") => {
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
    setSelectedIndex(-1)
  }

  const emptyState = {
    inbox: {
      icon: Inbox,
      title: "Your inbox is empty",
      description: "Press 'n' to capture a new idea",
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
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32 w-full break-inside-avoid" />
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

  const EmptyIcon = emptyState[status].icon

  return (
    <div className="space-y-6">
      {status === "inbox" && (
        <QuickCapture
          onCapture={handleCapture}
          isOpen={captureOpen}
          onOpenChange={setCaptureOpen}
          onClose={handleCaptureClose}
        />
      )}

      {ideas.length === 0 ? (
        <Empty
          icon={EmptyIcon}
          title={emptyState[status].title}
          description={emptyState[status].description}
        />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {ideas.map((idea, index) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onStatusChange={handleStatusChange}
              isSelected={index === selectedIndex}
            />
          ))}
        </div>
      )}
    </div>
  )
}
