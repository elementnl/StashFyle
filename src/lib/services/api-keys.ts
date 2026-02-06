import { apiKeysRepo } from "../db/repositories/api-keys";
import { generateApiKey } from "../auth/api-keys";
import { getPlanLimits, getUserPlan } from "./usage";
import { ApiKeyLimitError } from "../utils/errors";
import type { ApiKeyResponse } from "../db/types";

interface CreateApiKeyParams {
  userId: string;
  name?: string;
  type: "secret" | "public";
  allowedOrigins?: string[];
}

interface CreateApiKeyResult {
  key: string;
  apiKey: ApiKeyResponse;
}

export async function createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult> {
  const { userId, name, type, allowedOrigins } = params;

  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  const currentCount = await apiKeysRepo.countByUser(userId);

  if (currentCount >= limits.maxApiKeys) {
    throw new ApiKeyLimitError(limits.maxApiKeys);
  }

  const { key, hash, prefix } = generateApiKey(type);

  const created = await apiKeysRepo.create({
    user_id: userId,
    key_hash: hash,
    key_prefix: prefix,
    name: name ?? null,
    type,
    allowed_origins: allowedOrigins ?? null,
  });

  return {
    key,
    apiKey: {
      id: created.id,
      name: created.name,
      prefix: created.key_prefix,
      type: created.type,
      allowed_origins: created.allowed_origins,
      last_used_at: created.last_used_at,
      created_at: created.created_at,
    },
  };
}

export async function listApiKeys(userId: string): Promise<ApiKeyResponse[]> {
  const keys = await apiKeysRepo.findByUser(userId);

  return keys.map((key) => ({
    id: key.id,
    name: key.name,
    prefix: key.key_prefix,
    type: key.type,
    allowed_origins: key.allowed_origins,
    last_used_at: key.last_used_at,
    created_at: key.created_at,
  }));
}

export async function updateApiKeyOrigins(
  id: string,
  userId: string,
  allowedOrigins: string[]
): Promise<ApiKeyResponse> {
  const updated = await apiKeysRepo.updateOrigins(id, userId, allowedOrigins);

  return {
    id: updated.id,
    name: updated.name,
    prefix: updated.key_prefix,
    type: updated.type,
    allowed_origins: updated.allowed_origins,
    last_used_at: updated.last_used_at,
    created_at: updated.created_at,
  };
}

export async function revokeApiKey(id: string, userId: string): Promise<void> {
  await apiKeysRepo.revoke(id, userId);
}

export async function getApiKeyCount(userId: string): Promise<number> {
  return apiKeysRepo.countByUser(userId);
}
