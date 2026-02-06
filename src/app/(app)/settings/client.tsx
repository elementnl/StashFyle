"use client";

import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { updateName, deleteAllFiles } from "./actions";

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  fileCount: number;
}

export function SettingsClient({ user, fileCount }: SettingsClientProps) {
  const [name, setName] = useState(user.name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const hasNameChanged = name !== (user.name ?? "");

  async function handleSaveName() {
    setIsSaving(true);
    const result = await updateName(name);
    if (!result.success) {
      console.error(result.error);
    }
    setIsSaving(false);
  }

  async function handleDeleteAllFiles() {
    setIsDeleting(true);
    const result = await deleteAllFiles();
    if (result.success) {
      setDeleteDialogOpen(false);
      setConfirmText("");
    } else {
      console.error(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="rounded-lg border border-border p-5">
        <h2 className="text-sm font-medium mb-4">Profile</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs text-muted-foreground">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="max-w-xs"
              />
              <Button
                onClick={handleSaveName}
                disabled={!hasNameChanged || isSaving}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete all files</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete all {fileCount.toLocaleString()} file{fileCount !== 1 ? "s" : ""} from your account
            </p>
          </div>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                disabled={fileCount === 0}
              >
                <Trash2 className="h-4 w-4" />
                Delete All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete all files?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all {fileCount.toLocaleString()}{" "}
                  file{fileCount !== 1 ? "s" : ""} from your account. This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                <Label htmlFor="confirm">
                  Type <span className="font-mono font-medium">delete all</span> to confirm
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete all"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isDeleting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllFiles}
                  disabled={confirmText !== "delete all" || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete All Files"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
