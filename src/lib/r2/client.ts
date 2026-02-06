import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as s3GetSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.R2_ACCOUNT_ID) {
  throw new Error("Missing R2_ACCOUNT_ID");
}

if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error("Missing R2_ACCESS_KEY_ID");
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error("Missing R2_SECRET_ACCESS_KEY");
}

if (!process.env.R2_BUCKET_NAME) {
  throw new Error("Missing R2_BUCKET_NAME");
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucket = process.env.R2_BUCKET_NAME;

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function getSignedUrl(key: string, expiresIn: number): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return s3GetSignedUrl(r2, command, { expiresIn });
}

export function getPublicUrl(storageKey: string): string {
  return `${process.env.R2_PUBLIC_URL}/${storageKey}`;
}

export async function checkR2Health(): Promise<void> {
  await r2.send(new HeadBucketCommand({ Bucket: bucket }));
}
