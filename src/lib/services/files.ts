import { filesRepo } from "../db/repositories/files";
import { usageRepo } from "../db/repositories/usage";
import { uploadToR2, deleteFromR2, getSignedUrl, getPublicUrl } from "../r2/client";
import { generateFileId } from "../utils/ids";
import { FileTooLargeError, StorageLimitError, NotFoundError } from "../utils/errors";
import type { StoredFile, FileResponse } from "../db/types";

interface UploadParams {
  userId: string;
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
  isPrivate?: boolean;
  expiresAt?: Date;
  limits: {
    maxFileSize: number;
    maxStorage: number;
    currentStorage: number;
  };
}

function toResponse(file: StoredFile): FileResponse {
  return {
    id: file.id,
    url: file.is_private ? null : getPublicUrl(file.storage_key),
    name: file.name,
    folder: file.folder,
    size: file.size_bytes,
    type: file.mime_type,
    private: file.is_private,
    expires_at: file.expires_at,
    created_at: file.created_at,
  };
}

export async function uploadFile(params: UploadParams): Promise<FileResponse> {
  const {
    userId,
    file,
    fileName,
    mimeType,
    folder,
    isPrivate,
    expiresAt,
    limits,
  } = params;

  if (file.length > limits.maxFileSize) {
    throw new FileTooLargeError(limits.maxFileSize);
  }

  if (limits.currentStorage + file.length > limits.maxStorage) {
    throw new StorageLimitError();
  }

  const fileId = generateFileId();
  const storageKey = folder
    ? `${userId}/${folder}/${fileId}/${fileName}`
    : `${userId}/${fileId}/${fileName}`;

  await uploadToR2(storageKey, file, mimeType);

  const storedFile = await filesRepo.create({
    id: fileId,
    user_id: userId,
    name: fileName,
    storage_key: storageKey,
    folder: folder ?? null,
    size_bytes: file.length,
    mime_type: mimeType,
    is_private: isPrivate ?? false,
    expires_at: expiresAt?.toISOString() ?? null,
  });

  await usageRepo.increment(userId, "storage_bytes", file.length);
  await usageRepo.increment(userId, "upload_count", 1);

  return toResponse(storedFile);
}

export async function getFile(fileId: string, userId: string): Promise<FileResponse> {
  const file = await filesRepo.findByIdAndUser(fileId, userId);
  if (!file) throw new NotFoundError("File not found");

  return toResponse(file);
}

export async function listFiles(
  userId: string,
  options?: { folder?: string; limit?: number; cursor?: string }
): Promise<{ files: FileResponse[]; has_more: boolean; cursor: string | null }> {
  const result = await filesRepo.findByUser(userId, options);

  return {
    files: result.files.map(toResponse),
    has_more: result.cursor !== null,
    cursor: result.cursor,
  };
}

export async function deleteFile(fileId: string, userId: string): Promise<void> {
  const file = await filesRepo.findByIdAndUser(fileId, userId);
  if (!file) throw new NotFoundError("File not found");

  await filesRepo.softDelete(fileId);
  await deleteFromR2(file.storage_key);
  await usageRepo.decrement(userId, "storage_bytes", file.size_bytes);
}

export async function createSignedUrl(
  fileId: string,
  userId: string,
  expiresIn: number
): Promise<{ url: string; expires_at: string }> {
  const file = await filesRepo.findByIdAndUser(fileId, userId);
  if (!file) throw new NotFoundError("File not found");

  const url = await getSignedUrl(file.storage_key, expiresIn);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return { url, expires_at: expiresAt.toISOString() };
}

interface FolderInfo {
  name: string;
  size: number;
  fileCount: number;
}

interface FolderContents {
  folders: FolderInfo[];
  files: FileResponse[];
  has_more: boolean;
  cursor: string | null;
}

export async function listFolderContents(
  userId: string,
  folder: string | null,
  options?: { limit?: number; cursor?: string }
): Promise<FolderContents> {
  const [subfolders, filesResult] = await Promise.all([
    filesRepo.findSubfoldersWithSize(userId, folder),
    filesRepo.findInFolder(userId, folder, options),
  ]);

  return {
    folders: subfolders,
    files: filesResult.files.map(toResponse),
    has_more: filesResult.cursor !== null,
    cursor: filesResult.cursor,
  };
}
