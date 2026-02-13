import { NextRequest, NextResponse } from "next/server";
import { getExpiredGracePeriodSubscriptions, completeGracePeriod } from "@/lib/services/subscriptions";
import { filesRepo } from "@/lib/db/repositories/files";
import { usageRepo } from "@/lib/db/repositories/usage";
import { deleteFromR2 } from "@/lib/r2/client";
import { getPlanLimits, getCurrentUsage } from "@/lib/services/usage";
import type { SubscriptionPlan } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiredFilesResult = await cleanupExpiredFiles();
  const gracePeriodResult = await processGracePeriods();

  return NextResponse.json({
    success: true,
    expired_files: expiredFilesResult,
    grace_periods: gracePeriodResult,
  });
}

async function cleanupExpiredFiles(): Promise<{
  deleted: number;
  bytesFreed: number;
  errors: string[];
}> {
  const result = { deleted: 0, bytesFreed: 0, errors: [] as string[] };

  try {
    const expiredFiles = await filesRepo.findExpired(100);

    for (const file of expiredFiles) {
      try {
        await deleteFromR2(file.storage_key);
        await filesRepo.softDelete(file.id);
        await usageRepo.increment(file.user_id, "storage_bytes", -file.size_bytes);
        result.deleted++;
        result.bytesFreed += file.size_bytes;
      } catch (error) {
        result.errors.push(`Failed to delete file ${file.id}: ${error}`);
      }
    }
  } catch (error) {
    result.errors.push(`Failed to query expired files: ${error}`);
  }

  return result;
}

async function processGracePeriods(): Promise<{
  processed: number;
  filesDeleted: number;
  bytesFreed: number;
  errors: string[];
}> {
  const result = {
    processed: 0,
    filesDeleted: 0,
    bytesFreed: 0,
    errors: [] as string[],
  };

  try {
    const expiredSubscriptions = await getExpiredGracePeriodSubscriptions();

    for (const subscription of expiredSubscriptions) {
      try {
        const targetPlan = subscription.plan as SubscriptionPlan;
        const limits = getPlanLimits(targetPlan);
        const usage = await getCurrentUsage(subscription.user_id);

        if (usage.storage_bytes <= limits.maxStorage) {
          await completeGracePeriod(subscription.id);
          result.processed++;
          continue;
        }

        const bytesToFree = usage.storage_bytes - limits.maxStorage;
        const deletionResult = await deleteFilesToFreeSpace(
          subscription.user_id,
          bytesToFree
        );

        result.filesDeleted += deletionResult.filesDeleted;
        result.bytesFreed += deletionResult.bytesFreed;
        result.errors.push(...deletionResult.errors);

        await updateUserStorage(subscription.user_id, deletionResult.bytesFreed);
        await completeGracePeriod(subscription.id);
        result.processed++;
      } catch (error) {
        result.errors.push(`Failed to process subscription ${subscription.id}: ${error}`);
      }
    }
  } catch (error) {
    result.errors.push(`Failed to query grace periods: ${error}`);
  }

  return result;
}

async function deleteFilesToFreeSpace(
  userId: string,
  bytesToFree: number
): Promise<{ filesDeleted: number; bytesFreed: number; errors: string[] }> {
  const result = { filesDeleted: 0, bytesFreed: 0, errors: [] as string[] };

  const files = await filesRepo.findByUserSortedBySize(userId, "desc");

  for (const file of files) {
    if (result.bytesFreed >= bytesToFree) break;

    try {
      await deleteFromR2(file.storage_key);
      await filesRepo.softDelete(file.id);
      result.bytesFreed += file.size_bytes;
      result.filesDeleted++;
    } catch (error) {
      result.errors.push(`Failed to delete file ${file.id}: ${error}`);
    }
  }

  return result;
}

async function updateUserStorage(userId: string, bytesFreed: number) {
  const usage = await getCurrentUsage(userId);
  const newStorage = Math.max(0, usage.storage_bytes - bytesFreed);

  await usageRepo.upsert(userId, {
    storage_bytes: newStorage,
  });
}
