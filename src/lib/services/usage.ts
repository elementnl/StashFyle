import { usageRepo } from "../db/repositories/usage";
import { getUserPlanFromSubscription } from "./subscriptions";
import type { UsageResponse } from "../db/types";

// Plan limits in bytes
const PLAN_LIMITS = {
  free: {
    maxStorage: 1 * 1024 * 1024 * 1024, // 1 GB
    maxBandwidth: 5 * 1024 * 1024 * 1024, // 5 GB/month
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    maxUploads: 1000,
    maxApiKeys: 2,
  },
  hobby: {
    maxStorage: 10 * 1024 * 1024 * 1024, // 10 GB
    maxBandwidth: 50 * 1024 * 1024 * 1024, // 50 GB/month
    maxFileSize: 100 * 1024 * 1024, // 100 MB
    maxUploads: 50000,
    maxApiKeys: 10,
  },
  pro: {
    maxStorage: 100 * 1024 * 1024 * 1024, // 100 GB
    maxBandwidth: 500 * 1024 * 1024 * 1024, // 500 GB/month
    maxFileSize: 500 * 1024 * 1024, // 500 MB
    maxUploads: 500000,
    maxApiKeys: 50,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export interface PlanLimits {
  maxStorage: number;
  maxBandwidth: number;
  maxFileSize: number;
  maxUploads: number;
  maxApiKeys: number;
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export async function getCurrentUsage(userId: string): Promise<UsageResponse> {
  const usage = await usageRepo.findCurrent(userId);

  if (!usage) {
    const now = new Date();
    const periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    return {
      storage_bytes: 0,
      bandwidth_bytes: 0,
      upload_count: 0,
      period_start: periodStart,
    };
  }

  return {
    storage_bytes: usage.storage_bytes,
    bandwidth_bytes: usage.bandwidth_bytes,
    upload_count: usage.upload_count,
    period_start: usage.period_start,
  };
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const plan = await getUserPlanFromSubscription(userId);
  return plan as Plan;
}

export async function isUserOverLimitsForPlan(userId: string, plan: Plan): Promise<boolean> {
  const usage = await getCurrentUsage(userId);
  const limits = getPlanLimits(plan);

  return usage.storage_bytes > limits.maxStorage;
}
