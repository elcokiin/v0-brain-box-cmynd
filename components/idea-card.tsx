"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Archive, Inbox, Trash2, MessageSquare, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Idea {
  id: string
  content: string
  source: "web" | "telegram"
  status: "inbox" | "archived" | "deleted"
  tags: string[] | null
  created_at: string
  updated_at: string
}

interface IdeaCardProps {
  idea: Idea
  onStatusChange: (id: string, status: "inbox" | "archived" | "deleted") => void
}

export function IdeaCard({ idea, onStatusChange }: IdeaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: "inbox" | "archived" | "deleted") => {
    setIsUpdating(true)
    await onStatusChange(idea.id, newStatus)
    setIsUpdating(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-md",
        isUpdating && "opacity-50 pointer-events-none"
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {idea.content}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {idea.source === "telegram" ? (
                <MessageSquare className="size-3" />
              ) : (
                <Globe className="size-3" />
              )}
              <span>{formatDate(idea.created_at)}</span>
              {idea.tags && idea.tags.length > 0 && (
                <div className="flex gap-1">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {idea.status !== "inbox" && (
                <DropdownMenuItem onClick={() => handleStatusChange("inbox")}>
                  <Inbox className="size-4 mr-2" />
                  Move to Inbox
                </DropdownMenuItem>
              )}
              {idea.status !== "archived" && (
                <DropdownMenuItem onClick={() => handleStatusChange("archived")}>
                  <Archive className="size-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange("deleted")}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
