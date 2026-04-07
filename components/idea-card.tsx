"use client"

import { useState, useEffect, useRef } from "react"
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
  isSelected?: boolean
  onOpenMenu?: () => void
}

export function IdeaCard({ idea, onStatusChange, isSelected = false, onOpenMenu }: IdeaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStatusChange = async (newStatus: "inbox" | "archived" | "deleted") => {
    setIsUpdating(true)
    await onStatusChange(idea.id, newStatus)
    setIsUpdating(false)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [isSelected])

  useEffect(() => {
    if (isSelected && onOpenMenu) {
      const handleEnter = (e: KeyboardEvent) => {
        if (e.key === "Enter" && isSelected) {
          setMenuOpen(true)
        }
      }
      window.addEventListener("keydown", handleEnter)
      return () => window.removeEventListener("keydown", handleEnter)
    }
  }, [isSelected, onOpenMenu])

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
      ref={cardRef}
      className={cn(
        "group transition-all duration-200 hover:shadow-md break-inside-avoid",
        isUpdating && "opacity-50 pointer-events-none",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <CardContent className="pt-4">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {idea.content}
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {idea.source === "telegram" ? (
                <MessageSquare className="size-3" />
              ) : (
                <Globe className="size-3" />
              )}
              <span>{formatDate(idea.created_at)}</span>
            </div>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    isSelected && "opacity-100"
                  )}
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
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {idea.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
