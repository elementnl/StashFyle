import { db } from "../client";
import type { ApiKey, ApiKeyInsert } from "../types";

export const apiKeysRepo = {
  async findByHash(hash: string): Promise<ApiKey | null> {
    const { data, error } = await db
      .from("api_keys")
      .select("*")
      .eq("key_hash", hash)
      .is("revoked_at", null)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async findByUser(userId: string): Promise<ApiKey[]> {
    const { data, error } = await db
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async findById(id: string): Promise<ApiKey | null> {
    const { data, error } = await db
      .from("api_keys")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async create(apiKey: ApiKeyInsert): Promise<ApiKey> {
    const { data, error } = await db
      .from("api_keys")
      .insert(apiKey)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLastUsed(id: string): Promise<void> {
    const { error } = await db
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async revoke(id: string, userId: string): Promise<void> {
    const { error } = await db
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await db
      .from("api_keys")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("revoked_at", null);

    if (error) throw error;
    return count ?? 0;
  },

  async updateOrigins(id: string, userId: string, allowedOrigins: string[]): Promise<ApiKey> {
    const { data, error } = await db
      .from("api_keys")
      .update({ allowed_origins: allowedOrigins })
      .eq("id", id)
      .eq("user_id", userId)
      .is("revoked_at", null)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
