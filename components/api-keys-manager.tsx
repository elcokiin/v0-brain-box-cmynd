"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Plus, Trash2, Copy, Check, Pencil } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key_preview: string
  full_key?: string
  created_at: string
  last_used_at: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export function ApiKeysManager() {
  const { data, mutate, isLoading } = useSWR<{ keys: ApiKey[] }>(
    "/api/api-keys",
    fetcher
  )

  const [newKeyName, setNewKeyName] = useState("")
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const keys = data?.keys ?? []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleCreate = async () => {
    if (!newKeyName.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      if (!response.ok) return

      const { key } = await response.json()
      setNewlyCreatedKey(key.full_key)
      setNewKeyName("")
      mutate()
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/api-keys/${id}`, { method: "DELETE" })
    if (response.ok) mutate()
  }

  const handleRename = async (id: string) => {
    if (!editingName.trim()) return

    const response = await fetch(`/api/api-keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    })

    if (response.ok) {
      setEditingId(null)
      setEditingName("")
      mutate()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Create API key</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Use this for external HTTP capture without browser session.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="e.g. n8n local workflow"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate()
          }}
        />
        <Button onClick={handleCreate} disabled={!newKeyName.trim() || isCreating} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Create
        </Button>
      </div>

      {newlyCreatedKey && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 space-y-2">
          <p className="text-sm font-medium">Copy your key now (shown once):</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 rounded bg-background px-2 py-2 text-[11px] leading-relaxed break-all whitespace-pre-wrap">
              {newlyCreatedKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => copyToClipboard(newlyCreatedKey, "new")}
            >
              {copiedId === "new" ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Your API keys</Label>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading keys...</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys yet.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <div key={key.id} className="rounded-lg border p-3 flex items-start gap-3">
                <Key className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  {editingId === key.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        className="h-8"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(key.id)
                          if (e.key === "Escape") {
                            setEditingId(null)
                            setEditingName("")
                          }
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" className="w-full sm:w-auto" onClick={() => handleRename(key.id)}>
                        <Check className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{key.name}</p>
                      <p className="text-xs text-muted-foreground break-words">
                        ****{key.key_preview} • Created {formatDate(key.created_at)}
                        {key.last_used_at ? ` • Last used ${formatDate(key.last_used_at)}` : ""}
                      </p>
                    </>
                  )}
                </div>
                {editingId !== key.id && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(key.id)
                        setEditingName(key.name)
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(key.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground/90">Use via HTTP</p>
        <div className="rounded bg-background p-2 text-[11px] leading-relaxed">
          <p className="break-words">Authorization:</p>
          <p className="break-all">Bearer bb_your_api_key_here</p>
        </div>
      </div>
    </div>
  )
}
