import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export function generateFileId(): string {
  return `f_${nanoid()}`;
}

export function generateApiKeyId(): string {
  return nanoid(24);
}
