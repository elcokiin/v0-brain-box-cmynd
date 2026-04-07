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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Archive, Inbox, Trash2, MessageSquare, Globe, Pin, PinOff, Palette, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Idea {
  id: string
  content: string
  source: "web" | "telegram"
  status: "inbox" | "archived" | "deleted"
  tags: string[] | null
  pinned: boolean
  background_color: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const CARD_COLORS = [
  { id: null, name: "Default", color: null },
  { id: "coral", name: "Coral", color: "oklch(0.75 0.12 25)" },
  { id: "peach", name: "Peach", color: "oklch(0.80 0.10 55)" },
  { id: "sand", name: "Sand", color: "oklch(0.85 0.06 85)" },
  { id: "mint", name: "Mint", color: "oklch(0.85 0.08 155)" },
  { id: "sage", name: "Sage", color: "oklch(0.78 0.06 145)" },
  { id: "fog", name: "Fog", color: "oklch(0.82 0.04 250)" },
  { id: "storm", name: "Storm", color: "oklch(0.70 0.06 260)" },
  { id: "dusk", name: "Dusk", color: "oklch(0.75 0.10 300)" },
  { id: "lavender", name: "Lavender", color: "oklch(0.80 0.08 290)" },
  { id: "blossom", name: "Blossom", color: "oklch(0.82 0.10 350)" },
  { id: "rose", name: "Rose", color: "oklch(0.78 0.12 10)" },
]

interface IdeaCardProps {
  idea: Idea
  onStatusChange: (id: string, status: "inbox" | "archived" | "deleted") => void
  onPinChange: (id: string, pinned: boolean) => void
  onColorChange: (id: string, color: string | null) => void
  onPermanentDelete?: (id: string) => void
  isSelected?: boolean
  onOpenMenu?: () => void
  showTrashInfo?: boolean
}

export function IdeaCard({
  idea,
  onStatusChange,
  onPinChange,
  onColorChange,
  onPermanentDelete,
  isSelected = false,
  onOpenMenu,
  showTrashInfo = false
}: IdeaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStatusChange = async (newStatus: "inbox" | "archived" | "deleted") => {
    setIsUpdating(true)
    await onStatusChange(idea.id, newStatus)
    setIsUpdating(false)
    setMenuOpen(false)
  }

  const handlePinToggle = async () => {
    setIsUpdating(true)
    await onPinChange(idea.id, !idea.pinned)
    setIsUpdating(false)
    setMenuOpen(false)
  }

  const handleColorSelect = async (colorId: string | null) => {
    setIsUpdating(true)
    await onColorChange(idea.id, colorId)
    setIsUpdating(false)
  }

  const handlePermanentDelete = async () => {
    if (onPermanentDelete) {
      setIsUpdating(true)
      await onPermanentDelete(idea.id)
      setIsUpdating(false)
      setMenuOpen(false)
    }
  }

  const formatTimeInTrash = (deletedAt: string | null) => {
    if (!deletedAt) return null
    const deleted = new Date(deletedAt)
    const now = new Date()
    const diffMs = now.getTime() - deleted.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return "Just deleted"
    if (diffMinutes < 60) return `In trash for ${diffMinutes}m`
    if (diffHours < 24) return `In trash for ${diffHours}h`
    if (diffDays === 1) return "In trash for 1 day"
    return `In trash for ${diffDays} days`
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

  const selectedColor = CARD_COLORS.find(c => c.id === idea.background_color)
  const cardStyle = selectedColor?.color
    ? { backgroundColor: selectedColor.color }
    : undefined

  return (
    <Card
      ref={cardRef}
      style={cardStyle}
      className={cn(
        "group transition-all duration-200 hover:shadow-md break-inside-avoid relative",
        isUpdating && "opacity-50 pointer-events-none",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        idea.background_color && "border-transparent"
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handlePinToggle}
        className={cn(
          "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
          idea.pinned && "opacity-100 text-primary"
        )}
      >
        {idea.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        <span className="sr-only">{idea.pinned ? "Unpin" : "Pin"}</span>
      </Button>

      <CardContent className="pt-2 pr-10">
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
              {showTrashInfo && idea.deleted_at ? (
                <span className="text-destructive/70 flex items-center gap-1">
                  <Trash2 className="size-3" />
                  {formatTimeInTrash(idea.deleted_at)}
                </span>
              ) : (
                <span>{formatDate(idea.created_at)}</span>
              )}
              {idea.pinned && <Pin className="size-3 text-primary" />}
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handlePinToggle}>
                  {idea.pinned ? (
                    <>
                      <PinOff className="size-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="size-4 mr-2" />
                      Pin to top
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="size-4 mr-2" />
                    Background color
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="p-2">
                      <div className="grid grid-cols-6 gap-1.5">
                        {CARD_COLORS.map((colorOption) => (
                          <button
                            key={colorOption.id ?? "default"}
                            onClick={() => handleColorSelect(colorOption.id)}
                            className={cn(
                              "size-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                              colorOption.id === null
                                ? "bg-card border-border"
                                : "border-transparent",
                              idea.background_color === colorOption.id && "ring-2 ring-primary ring-offset-1"
                            )}
                            style={colorOption.color ? { backgroundColor: colorOption.color } : undefined}
                            title={colorOption.name}
                          >
                            {idea.background_color === colorOption.id && (
                              <Check className="size-3 text-foreground/70" />
                            )}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

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
                {showTrashInfo && onPermanentDelete ? (
                  <DropdownMenuItem
                    onClick={handlePermanentDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <AlertTriangle className="size-4 mr-2" />
                    Delete permanently
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("deleted")}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
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
