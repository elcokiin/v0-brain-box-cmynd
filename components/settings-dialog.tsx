"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Keyboard, Moon, Sun, Monitor } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [keyboardNav, setKeyboardNav] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedNav = localStorage.getItem("brainbox-keyboard-nav")
    if (storedNav !== null) setKeyboardNav(storedNav === "true")
  }, [])

  const toggleKeyboardNav = (enabled: boolean) => {
    setKeyboardNav(enabled)
    localStorage.setItem("brainbox-keyboard-nav", String(enabled))
    window.dispatchEvent(new CustomEvent("brainbox-keyboard-nav", { detail: enabled }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
          <Settings className="size-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your BrainBox experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={mounted && theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1 gap-2"
              >
                <Sun className="size-4" />
                Light
              </Button>
              <Button
                variant={mounted && theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1 gap-2"
              >
                <Moon className="size-4" />
                Dark
              </Button>
              <Button
                variant={mounted && theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex-1 gap-2"
              >
                <Monitor className="size-4" />
                System
              </Button>
            </div>
          </div>

          {/* Keyboard Navigation Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Keyboard className="size-4" />
                Keyboard Navigation
              </Label>
              <p className="text-xs text-muted-foreground">
                Navigate with vim-style keys
              </p>
            </div>
            <Switch
              checked={keyboardNav}
              onCheckedChange={toggleKeyboardNav}
            />
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New idea</span>
                <Kbd>n</Kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Settings</span>
                <Kbd>e</Kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Inbox</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>1</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Archived</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>2</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trash</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>3</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Navigate down</span>
                <Kbd>j</Kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Navigate up</span>
                <Kbd>k</Kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Navigate left</span>
                <Kbd>h</Kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Navigate right</span>
                <Kbd>l</Kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open actions</span>
                <Kbd>Enter</Kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deselect</span>
                <Kbd>Esc</Kbd>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
