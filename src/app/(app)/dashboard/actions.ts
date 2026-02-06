"use server";

import { requireUser } from "@/lib/auth/supabase";
import { getCurrentUsage, getPlanLimits, getUserPlan, type Plan, type PlanLimits } from "@/lib/services/usage";
import { getApiKeyCount } from "@/lib/services/api-keys";
import type { UsageResponse } from "@/lib/db/types";

export interface DashboardData {
  firstName: string | null;
  plan: Plan;
  limits: PlanLimits;
  usage: UsageResponse;
  apiKeyCount: number;
}

function getFirstName(user: { user_metadata?: { name?: string }; email?: string }): string | null {
  const fullName = user.user_metadata?.name;
  if (fullName) {
    return fullName.split(" ")[0];
  }
  return null;
}

export async function getDashboardData(): Promise<DashboardData> {
  const user = await requireUser();

  const [plan, usage, apiKeyCount] = await Promise.all([
    getUserPlan(user.id),
    getCurrentUsage(user.id),
    getApiKeyCount(user.id),
  ]);

  const limits = getPlanLimits(plan);

  return {
    firstName: getFirstName(user),
    plan,
    limits,
    usage,
    apiKeyCount,
  };
}
