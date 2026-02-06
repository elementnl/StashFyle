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

  try {
    const expiredSubscriptions = await getExpiredGracePeriodSubscriptions();

    const results = {
      processed: 0,
      filesDeleted: 0,
      bytesFreed: 0,
      errors: [] as string[],
    };

    for (const subscription of expiredSubscriptions) {
      try {
        const targetPlan = subscription.plan as SubscriptionPlan;
        const limits = getPlanLimits(targetPlan);
        const usage = await getCurrentUsage(subscription.user_id);

        if (usage.storage_bytes <= limits.maxStorage) {
          await completeGracePeriod(subscription.id);
          results.processed++;
          continue;
        }

        const bytesToFree = usage.storage_bytes - limits.maxStorage;
        const deletionResult = await deleteFilesToFreeSpace(
          subscription.user_id,
          bytesToFree
        );

        results.filesDeleted += deletionResult.filesDeleted;
        results.bytesFreed += deletionResult.bytesFreed;
        results.errors.push(...deletionResult.errors);

        await updateUserStorage(subscription.user_id, deletionResult.bytesFreed);
        await completeGracePeriod(subscription.id);
        results.processed++;
      } catch (error) {
        results.errors.push(`Failed to process subscription ${subscription.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Grace period cron error:", error);
    return NextResponse.json(
      { error: "Failed to process grace periods" },
      { status: 500 }
    );
  }
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
