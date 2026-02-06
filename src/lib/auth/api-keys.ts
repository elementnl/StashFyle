import { createHash, randomBytes } from "crypto";
import { apiKeysRepo } from "../db/repositories/api-keys";
import type { ApiKey } from "../db/types";

function isValidKeyFormat(key: string): boolean {
  return key.startsWith("sf-secret-") || key.startsWith("sf-public-");
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(
  type: "secret" | "public"
): { key: string; hash: string; prefix: string } {
  const random = randomBytes(24).toString("base64url");
  const key = `sf-${type}-${random}`;

  return {
    key,
    hash: hashKey(key),
    prefix: key.slice(0, 16),
  };
}

export async function validateApiKey(
  authHeader: string | null
): Promise<ApiKey | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  if (!isValidKeyFormat(key)) return null;

  const hash = hashKey(key);
  const apiKey = await apiKeysRepo.findByHash(hash);
  if (!apiKey) return null;

  apiKeysRepo.updateLastUsed(apiKey.id).catch(() => {
    // Fire and forget - don't block the request
  });

  return apiKey;
}
