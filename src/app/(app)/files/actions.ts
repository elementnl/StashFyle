"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/supabase";
import { listFolderContents, deleteFile, createSignedUrl } from "@/lib/services/files";
import type { FileResponse } from "@/lib/db/types";

interface FolderInfo {
  name: string;
  size: number;
  fileCount: number;
}

interface FolderContentsResult {
  folders: FolderInfo[];
  files: FileResponse[];
  has_more: boolean;
  cursor: string | null;
}

export async function getFolderContents(
  folder: string | null,
  cursor?: string
): Promise<FolderContentsResult> {
  try {
    const user = await requireUser();
    return await listFolderContents(user.id, folder, { cursor, limit: 50 });
  } catch {
    return { folders: [], files: [], has_more: false, cursor: null };
  }
}

export async function removeFile(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();
    await deleteFile(id, user.id);
    revalidatePath("/files");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}

export async function getSignedUrlAction(
  fileId: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await requireUser();
    const result = await createSignedUrl(fileId, user.id, expiresIn);
    return { success: true, url: result.url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate signed URL",
    };
  }
}
