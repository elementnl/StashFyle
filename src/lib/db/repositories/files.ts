import { db } from "../client";
import type { StoredFile, FileInsert, FileUpdate } from "../types";

export const filesRepo = {
  async findById(id: string): Promise<StoredFile | null> {
    const { data, error } = await db
      .from("files")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async findByIdAndUser(id: string, userId: string): Promise<StoredFile | null> {
    const { data, error } = await db
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async findByUser(
    userId: string,
    options?: { folder?: string; limit?: number; cursor?: string }
  ): Promise<{ files: StoredFile[]; cursor: string | null }> {
    const limit = options?.limit ?? 50;

    let query = db
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (options?.folder) {
      query = query.ilike("folder", `${options.folder}%`);
    }

    if (options?.cursor) {
      const decoded = JSON.parse(atob(options.cursor));
      query = query.lt("created_at", decoded.created_at);
    }

    const { data, error } = await query;
    if (error) throw error;

    const files = data ?? [];
    const hasMore = files.length > limit;
    const results = hasMore ? files.slice(0, -1) : files;

    const nextCursor =
      hasMore && results.length > 0
        ? btoa(JSON.stringify({ created_at: results[results.length - 1].created_at }))
        : null;

    return { files: results, cursor: nextCursor };
  },

  async create(file: FileInsert): Promise<StoredFile> {
    const { data, error } = await db
      .from("files")
      .insert(file)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: FileUpdate): Promise<StoredFile> {
    const { data, error } = await db
      .from("files")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await db
      .from("files")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async findExpired(limit: number = 100): Promise<StoredFile[]> {
    const { data, error } = await db
      .from("files")
      .select("*")
      .lt("expires_at", new Date().toISOString())
      .is("deleted_at", null)
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },

  async findInFolder(
    userId: string,
    folder: string | null,
    options?: { limit?: number; cursor?: string }
  ): Promise<{ files: StoredFile[]; cursor: string | null }> {
    const limit = options?.limit ?? 50;

    let query = db
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (folder === null) {
      query = query.is("folder", null);
    } else {
      query = query.eq("folder", folder);
    }

    if (options?.cursor) {
      const decoded = JSON.parse(atob(options.cursor));
      query = query.lt("created_at", decoded.created_at);
    }

    const { data, error } = await query;
    if (error) throw error;

    const files = data ?? [];
    const hasMore = files.length > limit;
    const results = hasMore ? files.slice(0, -1) : files;

    const nextCursor =
      hasMore && results.length > 0
        ? btoa(JSON.stringify({ created_at: results[results.length - 1].created_at }))
        : null;

    return { files: results, cursor: nextCursor };
  },

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await db
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw error;
    return count ?? 0;
  },

  async findByUserSortedBySize(
    userId: string,
    order: "asc" | "desc" = "desc"
  ): Promise<Array<{ id: string; storage_key: string; size_bytes: number }>> {
    const { data, error } = await db
      .from("files")
      .select("id, storage_key, size_bytes")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("size_bytes", { ascending: order === "asc" });

    if (error) throw error;
    return data ?? [];
  },

  async findSubfoldersWithSize(
    userId: string,
    parentFolder: string | null
  ): Promise<{ name: string; size: number; fileCount: number }[]> {
    const { data, error } = await db
      .from("files")
      .select("folder, size_bytes")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .not("folder", "is", null);

    if (error) throw error;

    const folderStats = new Map<string, { size: number; fileCount: number }>();
    const prefix = parentFolder ? `${parentFolder}/` : "";

    for (const file of data ?? []) {
      if (!file.folder) continue;

      let folderName: string | null = null;

      if (parentFolder === null) {
        folderName = file.folder.split("/")[0];
      } else if (file.folder.startsWith(prefix)) {
        const remaining = file.folder.slice(prefix.length);
        const nextLevel = remaining.split("/")[0];
        if (nextLevel) folderName = nextLevel;
      }

      if (folderName) {
        const existing = folderStats.get(folderName) ?? { size: 0, fileCount: 0 };
        existing.size += file.size_bytes;
        existing.fileCount += 1;
        folderStats.set(folderName, existing);
      }
    }

    return Array.from(folderStats.entries())
      .map(([name, stats]) => ({ name, size: stats.size, fileCount: stats.fileCount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
};
