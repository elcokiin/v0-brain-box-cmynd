"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickCaptureProps {
  onCapture: (content: string) => Promise<void>
}

export function QuickCapture({ onCapture }: QuickCaptureProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onCapture(content.trim())
      setContent("")
      setIsExpanded(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      setIsExpanded(false)
      setContent("")
    }
  }

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full h-12 justify-start gap-3 text-muted-foreground font-normal border-dashed"
        variant="outline"
      >
        <Plus className="size-4" />
        <span>Capture a new idea...</span>
      </Button>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to cancel,{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd+Enter</kbd> to save
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false)
                setContent("")
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
