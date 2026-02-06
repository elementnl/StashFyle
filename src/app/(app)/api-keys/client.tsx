"use client";

import { useState } from "react";
import { Plus, Copy, Check, Trash2, Key, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiKeyResponse } from "@/lib/db/types";
import { createKey, deleteKey, updateOrigins } from "./actions";

interface ApiKeysClientProps {
  initialKeys: ApiKeyResponse[];
}

export function ApiKeysClient({ initialKeys }: ApiKeysClientProps) {
  const [keys, setKeys] = useState<ApiKeyResponse[]>(initialKeys);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiKeyResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<"secret" | "public">("secret");
  const [allowedOrigins, setAllowedOrigins] = useState("");
  const [editOrigins, setEditOrigins] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate() {
    setIsCreating(true);
    setCreateError(null);
    const origins = type === "public" && allowedOrigins.trim()
      ? allowedOrigins.split(",").map((o) => o.trim()).filter(Boolean)
      : undefined;

    const result = await createKey({ name, type, allowedOrigins: origins });

    if (result.success && result.key && result.apiKey) {
      setNewKey(result.key);
      setKeys((prev) => [result.apiKey!, ...prev]);
    } else if (result.error) {
      setCreateError(result.error);
    }
    setIsCreating(false);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const result = await deleteKey(deleteTarget.id);
    if (result.success) {
      setKeys((prev) => prev.filter((k) => k.id !== deleteTarget.id));
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  }

  async function handleUpdateOrigins() {
    if (!editTarget) return;

    setIsUpdating(true);
    const origins = editOrigins.trim()
      ? editOrigins.split(",").map((o) => o.trim()).filter(Boolean)
      : [];

    const result = await updateOrigins(editTarget.id, origins);
    if (result.success && result.apiKey) {
      setKeys((prev) =>
        prev.map((k) => (k.id === editTarget.id ? result.apiKey! : k))
      );
    }
    setIsUpdating(false);
    setEditTarget(null);
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCloseCreate() {
    setIsCreateOpen(false);
    setNewKey(null);
    setName("");
    setType("secret");
    setAllowedOrigins("");
    setCreateError(null);
  }

  function handleOpenEdit(key: ApiKeyResponse) {
    setEditTarget(key);
    setEditOrigins(key.allowed_origins?.join(", ") ?? "");
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your API keys for accessing the StashFyle API
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {newKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Copy the API key now. You won&apos;t be able to see it again.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-4">
                  <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm break-all">
                    {newKey}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <DialogFooter className="mt-4">
                  <Button onClick={handleCloseCreate}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key to authenticate requests
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="My API Key"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={type}
                      onValueChange={(v) => setType(v as "secret" | "public")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secret">
                          Secret (Full access)
                        </SelectItem>
                        <SelectItem value="public">
                          Public (Browser uploads)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {type === "public" && (
                    <div className="grid gap-2">
                      <Label htmlFor="origins">Allowed Origins</Label>
                      <Input
                        id="origins"
                        placeholder="https://example.com, https://app.example.com"
                        value={allowedOrigins}
                        onChange={(e) => setAllowedOrigins(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated list of domains that can use this key for browser uploads
                      </p>
                    </div>
                  )}
                </div>
                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 py-12 bg-primary/5">
          <div className="rounded-full bg-primary/10 p-3">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">No API keys</p>
          <p className="mt-1 text-xs text-muted-foreground">Create a key to start using the API</p>
          <Button
            className="mt-4"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create your first key
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {key.name || "—"}
                      </span>
                      {key.type === "public" && key.allowed_origins && key.allowed_origins.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {key.allowed_origins.join(", ")}
                        </p>
                      )}
                      {key.type === "public" && (!key.allowed_origins || key.allowed_origins.length === 0) && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          No origins configured
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded-md bg-primary/5 border border-primary/10 px-2 py-1 font-mono text-xs text-foreground">
                      {key.prefix}...
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {key.type === "secret" ? (
                      <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Secret
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-secondary-foreground bg-secondary px-2 py-1 rounded-full">
                        Public
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {key.last_used_at ? formatDate(key.last_used_at) : "Never"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(key.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {key.type === "public" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleOpenEdit(key)}
                          title="Configure allowed origins"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name || "this key"}
              </span>
              ? This action cannot be undone and any applications using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Origins Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Allowed Origins</DialogTitle>
            <DialogDescription>
              Specify which domains can use this public key for browser uploads.
              Requests from other origins will be rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="edit-origins">Allowed Origins</Label>
            <Input
              id="edit-origins"
              placeholder="https://example.com, https://app.example.com"
              value={editOrigins}
              onChange={(e) => setEditOrigins(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of domains (e.g., https://example.com)
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateOrigins} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
