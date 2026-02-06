"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/supabase";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  updateApiKeyOrigins,
} from "@/lib/services/api-keys";
import type { ApiKeyResponse } from "@/lib/db/types";

interface CreateKeyInput {
  name: string;
  type: "secret" | "public";
  allowedOrigins?: string[];
}

interface CreateKeyResult {
  success: boolean;
  key?: string;
  apiKey?: ApiKeyResponse;
  error?: string;
}

export async function createKey(input: CreateKeyInput): Promise<CreateKeyResult> {
  try {
    const user = await requireUser();

    if (!input.name.trim()) {
      return { success: false, error: "Name is required" };
    }

    const result = await createApiKey({
      userId: user.id,
      name: input.name.trim(),
      type: input.type,
      allowedOrigins: input.allowedOrigins,
    });

    revalidatePath("/api-keys");

    return {
      success: true,
      key: result.key,
      apiKey: result.apiKey,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create API key",
    };
  }
}

export async function getKeys(): Promise<ApiKeyResponse[]> {
  try {
    const user = await requireUser();
    return await listApiKeys(user.id);
  } catch {
    return [];
  }
}

export async function updateOrigins(
  id: string,
  origins: string[]
): Promise<{ success: boolean; apiKey?: ApiKeyResponse; error?: string }> {
  try {
    const user = await requireUser();
    const apiKey = await updateApiKeyOrigins(id, user.id, origins);
    revalidatePath("/api-keys");
    return { success: true, apiKey };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update origins",
    };
  }
}

export async function deleteKey(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();
    await revokeApiKey(id, user.id);
    revalidatePath("/api-keys");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke API key",
    };
  }
}
