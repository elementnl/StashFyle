import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  getGracePeriodDaysRemaining,
  getGracePeriodTargetPlan,
  isInGracePeriod,
} from "@/lib/services/subscriptions";
import { getCurrentUsage, getPlanLimits } from "@/lib/services/usage";

interface GracePeriodBannerProps {
  userId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export async function GracePeriodBanner({ userId }: GracePeriodBannerProps) {
  const inGracePeriod = await isInGracePeriod(userId);

  if (!inGracePeriod) {
    return null;
  }

  const daysRemaining = await getGracePeriodDaysRemaining(userId);
  const targetPlan = await getGracePeriodTargetPlan(userId);
  const limits = getPlanLimits(targetPlan ?? "free");
  const usage = await getCurrentUsage(userId);

  const isOverLimit = usage.storage_bytes > limits.maxStorage;
  const excessBytes = Math.max(0, usage.storage_bytes - limits.maxStorage);

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
      <div className="flex items-center justify-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="text-amber-900 dark:text-amber-200">
          Your subscription has ended.{" "}
          {daysRemaining !== null && daysRemaining > 0 ? (
            isOverLimit ? (
              <>
                Files exceeding {formatBytes(limits.maxStorage)} will be deleted in{" "}
                <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong>
                {" "}({formatBytes(excessBytes)} over limit).
              </>
            ) : (
              <>
                Your account will be downgraded in{" "}
                <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong>.
              </>
            )
          ) : (
            <>Files exceeding {formatBytes(limits.maxStorage)} will be deleted soon.</>
          )}
        </span>
        <Link
          href="/billing"
          className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 transition-colors shrink-0"
        >
          Resubscribe
        </Link>
      </div>
    </div>
  );
}
