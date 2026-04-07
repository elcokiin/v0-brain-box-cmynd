"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Pencil } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key_preview: string
  full_key?: string
  created_at: string
  last_used_at: string | null
}

interface ApiKeysDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ApiKeysDialog({ open, onOpenChange }: ApiKeysDialogProps) {
  const { data, mutate } = useSWR<{ keys: ApiKey[] }>(
    open ? "/api/api-keys" : null,
    fetcher
  )

  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsCreating(false)
      setNewKeyName("")
      setNewlyCreatedKey(null)
      setEditingId(null)
      setEditingName("")
    }
  }, [open])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      if (response.ok) {
        const { key } = await response.json()
        setNewlyCreatedKey(key.full_key)
        setNewKeyName("")
        setIsCreating(false)
        mutate()
      }
    } catch (error) {
      console.error("Failed to create API key:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Failed to delete API key:", error)
    }
  }

  const handleUpdateKey = async (id: string) => {
    if (!editingName.trim()) return

    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      })
      setEditingId(null)
      setEditingName("")
      mutate()
    } catch (error) {
      console.error("Failed to update API key:", error)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const keys = data?.keys || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5" />
            API Keys
          </DialogTitle>
          <DialogDescription>
            Manage your API keys for n8n, Telegram bots, and other integrations.
            Keys are only shown once when created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Newly created key warning */}
          {newlyCreatedKey && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-primary">
                Save your API key now - it won&apos;t be shown again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded text-xs font-mono break-all">
                  {newlyCreatedKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newlyCreatedKey, "new")}
                >
                  {copiedId === "new" ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => setNewlyCreatedKey(null)}
              >
                I&apos;ve saved my key
              </Button>
            </div>
          )}

          {/* Existing keys list */}
          {keys.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Your API Keys
              </Label>
              <div className="space-y-2">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <Key className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingId === key.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-7 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateKey(key.id)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => handleUpdateKey(key.id)}
                          >
                            <Check className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-sm truncate">{key.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ****{key.key_preview} · Created {formatDate(key.created_at)}
                            {key.last_used_at && ` · Last used ${formatDate(key.last_used_at)}`}
                          </p>
                        </>
                      )}
                    </div>
                    {editingId !== key.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditingId(key.id)
                            setEditingName(key.name)
                          }}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create new key form */}
          {isCreating ? (
            <div className="space-y-3 p-4 border rounded-lg">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., n8n Production, Telegram Bot"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateKey()
                  if (e.key === "Escape") setIsCreating(false)
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Create Key"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="size-4 mr-2" />
              Create New API Key
            </Button>
          )}

          {/* Usage instructions */}
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground space-y-2">
            <p className="font-medium">How to use your API key:</p>
            <p>
              Include your key in the Authorization header when making requests:
            </p>
            <code className="block p-2 bg-background rounded text-xs">
              Authorization: Bearer bb_your_api_key_here
            </code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
