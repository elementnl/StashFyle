"use client";

import { useState } from "react";
import {
  Trash2,
  Check,
  Lock,
  Globe,
  Folder,
  Link as LinkIcon,
  Loader2,
  ChevronRight,
  Image,
  FileText,
  FileCode,
  FileAudio,
  FileVideo,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FileResponse } from "@/lib/db/types";
import { removeFile, getFolderContents, getSignedUrlAction } from "./actions";

interface FolderInfo {
  name: string;
  size: number;
  fileCount: number;
}

interface FilesClientProps {
  initialFolders: FolderInfo[];
  initialFiles: FileResponse[];
  initialHasMore: boolean;
  initialCursor: string | null;
}

export function FilesClient({
  initialFolders,
  initialFiles,
  initialHasMore,
  initialCursor,
}: FilesClientProps) {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderInfo[]>(initialFolders);
  const [files, setFiles] = useState<FileResponse[]>(initialFiles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [signedUrlLoading, setSignedUrlLoading] = useState<string | null>(null);

  async function navigateToFolder(folder: string | null) {
    setIsNavigating(true);
    const result = await getFolderContents(folder);
    setCurrentPath(folder);
    setFolders(result.folders);
    setFiles(result.files);
    setHasMore(result.has_more);
    setCursor(result.cursor);
    setIsNavigating(false);
  }

  async function handleLoadMore() {
    if (!cursor || isLoading) return;
    setIsLoading(true);
    const result = await getFolderContents(currentPath, cursor);
    setFiles((prev) => [...prev, ...result.files]);
    setHasMore(result.has_more);
    setCursor(result.cursor);
    setIsLoading(false);
  }

  async function handleCopyUrl(file: FileResponse) {
    if (file.private) {
      setSignedUrlLoading(file.id);
      const result = await getSignedUrlAction(file.id, 3600);
      if (result.success && result.url) {
        await navigator.clipboard.writeText(result.url);
        setCopied(file.id);
        setTimeout(() => setCopied(null), 2000);
      }
      setSignedUrlLoading(null);
    } else if (file.url) {
      await navigator.clipboard.writeText(file.url);
      setCopied(file.id);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await removeFile(deleteTarget.id);
    if (result.success) {
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getFileIcon(mimeType: string | null) {
    if (!mimeType) return <File className="h-4 w-4" />;
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <FileVideo className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <FileAudio className="h-4 w-4" />;
    if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml")) {
      return <FileCode className="h-4 w-4" />;
    }
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("word")) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  }

  function getBreadcrumbs(): { name: string; path: string | null }[] {
    const crumbs: { name: string; path: string | null }[] = [{ name: "All Files", path: null }];
    if (currentPath) {
      const parts = currentPath.split("/");
      let accumulated = "";
      for (const part of parts) {
        accumulated = accumulated ? `${accumulated}/${part}` : part;
        crumbs.push({ name: part, path: accumulated });
      }
    }
    return crumbs;
  }

  const breadcrumbs = getBreadcrumbs();
  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and manage your uploaded files
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 py-2 px-3 bg-muted/30 rounded-lg border border-border">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path ?? "root"} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
            <button
              onClick={() => navigateToFolder(crumb.path)}
              disabled={isNavigating || crumb.path === currentPath}
              className={`px-2 py-1 rounded text-sm transition-colors ${
                crumb.path === currentPath
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
        {isNavigating && <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />}
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 py-16 bg-primary/5">
          <div className="rounded-full bg-primary/10 p-4">
            <Folder className="h-8 w-8 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            {currentPath ? "This folder is empty" : "No files yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentPath
              ? "Files uploaded to this folder will appear here"
              : "Upload files via the API to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unified Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                    Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                    Modified
                  </th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Folders first */}
                {folders.map((folder) => {
                  const fullPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
                  return (
                    <tr
                      key={`folder-${folder.name}`}
                      onClick={() => navigateToFolder(fullPath)}
                      className="hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            <Folder className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {folder.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatBytes(folder.size)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {folder.fileCount} {folder.fileCount === 1 ? "file" : "files"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  );
                })}

                {/* Then files */}
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-muted text-muted-foreground">
                          {getFileIcon(file.type)}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate max-w-[240px]">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-4 py-3">
                      {file.private ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Lock className="h-3 w-3" />
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-white px-2 py-0.5 rounded-full">
                          <Globe className="h-3 w-3" />
                          Public
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(file);
                          }}
                          disabled={signedUrlLoading === file.id}
                          title={file.private ? "Copy signed URL (1hr)" : "Copy URL"}
                        >
                          {signedUrlLoading === file.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : copied === file.id ? (
                            <Check className="h-3.5 w-3.5 text-secondary-foreground" />
                          ) : (
                            <LinkIcon className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(file);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-primary border-primary/30 hover:bg-primary/5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
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
    </>
  );
}
