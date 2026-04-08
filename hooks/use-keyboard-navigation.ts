"use client"

import { useEffect, useCallback } from "react"

interface UseKeyboardNavigationOptions {
  itemCount: number
  selectedIndex: number
  onSelect: (index: number) => void
  onAction?: (index: number) => void
  onNew?: () => void
  enabled?: boolean
}

export function useKeyboardNavigation({
  itemCount,
  selectedIndex,
  onSelect,
  onAction,
  onNew,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Ignore when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore when Ctrl/Meta/Alt is pressed to avoid conflicts with browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault()
          onNew?.()
          break
        case "j":
        case "arrowdown":
          e.preventDefault()
          if (itemCount > 0) {
            const next = selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0
            onSelect(next)
          }
          break
        case "k":
        case "arrowup":
          e.preventDefault()
          if (itemCount > 0) {
            const prev = selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1
            onSelect(prev)
          }
          break
        case "h":
        case "arrowleft":
          e.preventDefault()
          // Move to previous column in masonry (approximate: go back 2-3 items)
          if (itemCount > 0) {
            const prev = Math.max(0, selectedIndex - 3)
            onSelect(prev)
          }
          break
        case "l":
        case "arrowright":
          e.preventDefault()
          // Move to next column in masonry (approximate: go forward 2-3 items)
          if (itemCount > 0) {
            const next = Math.min(itemCount - 1, selectedIndex + 3)
            onSelect(next)
          }
          break
        case "enter":
          e.preventDefault()
          if (selectedIndex >= 0) {
            onAction?.(selectedIndex)
          }
          break
        case "escape":
          e.preventDefault()
          onSelect(-1)
          break
      }
    },
    [enabled, itemCount, selectedIndex, onSelect, onAction, onNew]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return { selectedIndex }
}
