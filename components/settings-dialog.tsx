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
import { Settings, Keyboard, Moon, Sun, Monitor, Palette, Key } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import { ApiKeysManager } from "@/components/api-keys-manager"

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type SettingsSection = "appearance" | "keyboard" | "api"

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [keyboardNav, setKeyboardNav] = useState(true)
  const [newIdeaKeyEnabled, setNewIdeaKeyEnabled] = useState(true)
  const [themeToggleKeyEnabled, setThemeToggleKeyEnabled] = useState(true)
  const [settingsKeyEnabled, setSettingsKeyEnabled] = useState(true)
  const [section, setSection] = useState<SettingsSection>("appearance")
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const media = window.matchMedia("(max-width: 767px)")
    const syncMobile = (matches: boolean) => setIsMobile(matches)
    syncMobile(media.matches)

    const onMediaChange = (e: MediaQueryListEvent) => {
      syncMobile(e.matches)
    }

    media.addEventListener("change", onMediaChange)

    const storedNav = localStorage.getItem("brainbox-keyboard-nav")
    if (storedNav !== null) setKeyboardNav(storedNav === "true")

    const storedNewIdeaKey = localStorage.getItem("brainbox-shortcut-new-idea")
    if (storedNewIdeaKey !== null) setNewIdeaKeyEnabled(storedNewIdeaKey === "true")

    const storedThemeKey = localStorage.getItem("brainbox-shortcut-theme-toggle")
    if (storedThemeKey !== null) setThemeToggleKeyEnabled(storedThemeKey === "true")

    const storedSettingsKey = localStorage.getItem("brainbox-shortcut-settings")
    if (storedSettingsKey !== null) setSettingsKeyEnabled(storedSettingsKey === "true")

    return () => media.removeEventListener("change", onMediaChange)
  }, [])

  useEffect(() => {
    if (isMobile && section === "keyboard") {
      setSection("appearance")
    }
  }, [isMobile, section])

  const toggleKeyboardNav = (enabled: boolean) => {
    setKeyboardNav(enabled)
    localStorage.setItem("brainbox-keyboard-nav", String(enabled))
    window.dispatchEvent(new CustomEvent("brainbox-keyboard-nav", { detail: enabled }))
  }

  const toggleShortcut = (key: string, enabled: boolean) => {
    localStorage.setItem(key, String(enabled))
    window.dispatchEvent(new CustomEvent(key, { detail: enabled }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
          <Settings className="size-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)] w-[95vw] max-w-[95vw] h-[85vh] max-h-[85vh] sm:w-[820px] sm:max-w-[820px] sm:h-[620px] sm:max-h-[620px] overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle className="px-6 pt-6">Settings</DialogTitle>
          <DialogDescription className="px-6 pb-4">
            Configure your BrainBox experience
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="grid h-full min-h-0 gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <aside className="rounded-lg border bg-muted/20 p-2">
            <nav className="flex gap-2 md:flex-col">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSection("appearance")}
                className={cn(
                  "h-9 justify-start gap-2 rounded-md",
                  section === "appearance" && "bg-background shadow-sm text-foreground"
                )}
              >
                <Palette className="size-4" />
                Theme
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSection("keyboard")}
                className={cn(
                  "hidden h-9 justify-start gap-2 rounded-md md:flex",
                  section === "keyboard" && "bg-background shadow-sm text-foreground"
                )}
              >
                <Keyboard className="size-4" />
                Keybindings
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSection("api")}
                className={cn(
                  "h-9 justify-start gap-2 rounded-md",
                  section === "api" && "bg-background shadow-sm text-foreground"
                )}
              >
                <Key className="size-4" />
                API Keys
              </Button>
            </nav>
          </aside>

          <section className="themed-scrollbar min-h-0 space-y-6 overflow-y-auto rounded-lg border bg-background/50 p-4 pr-3 sm:p-5 sm:pr-4">
            {section === "appearance" && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={mounted && theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="gap-2"
                  >
                    <Sun className="size-4" />
                    Light
                  </Button>
                  <Button
                    variant={mounted && theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="gap-2"
                  >
                    <Moon className="size-4" />
                    Dark
                  </Button>
                  <Button
                    variant={mounted && theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="gap-2"
                  >
                    <Monitor className="size-4" />
                    System
                  </Button>
                </div>
              </div>
            )}

            {!isMobile && section === "keyboard" && (
              <>
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

                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-sm font-medium">Shortcut Toggles</Label>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm">New idea key</p>
                      <p className="text-xs text-muted-foreground">
                        Enable <Kbd>n</Kbd> to open quick capture
                      </p>
                    </div>
                    <Switch
                      checked={newIdeaKeyEnabled}
                      onCheckedChange={(enabled) => {
                        setNewIdeaKeyEnabled(enabled)
                        toggleShortcut("brainbox-shortcut-new-idea", enabled)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm">Theme toggle key</p>
                      <p className="text-xs text-muted-foreground">
                        Enable <Kbd>d</Kbd> to switch light/dark
                      </p>
                    </div>
                    <Switch
                      checked={themeToggleKeyEnabled}
                      onCheckedChange={(enabled) => {
                        setThemeToggleKeyEnabled(enabled)
                        toggleShortcut("brainbox-shortcut-theme-toggle", enabled)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm">Settings key</p>
                      <p className="text-xs text-muted-foreground">
                        Enable <Kbd>p</Kbd> or <Kbd>,</Kbd> to open/close settings
                      </p>
                    </div>
                    <Switch
                      checked={settingsKeyEnabled}
                      onCheckedChange={(enabled) => {
                        setSettingsKeyEnabled(enabled)
                        toggleShortcut("brainbox-shortcut-settings", enabled)
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">New idea</span>
                      <Kbd>n</Kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Toggle theme</span>
                      <Kbd>d</Kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Settings</span>
                      <div className="flex gap-1">
                        <Kbd>p</Kbd>
                        <Kbd>,</Kbd>
                      </div>
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
              </>
            )}

            {section === "api" && <ApiKeysManager />}
          </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
