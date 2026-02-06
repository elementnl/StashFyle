import { subscriptionsRepo } from "../db/repositories/subscriptions";
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from "../db/types";

export interface SubscriptionResponse {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
}

export async function getSubscription(userId: string): Promise<SubscriptionResponse> {
  const subscription = await subscriptionsRepo.findByUserId(userId);

  if (!subscription) {
    return {
      plan: "free",
      status: "active",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      gracePeriodEndsAt: null,
    };
  }

  return {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    gracePeriodEndsAt: subscription.grace_period_ends_at,
  };
}

export async function getUserPlanFromSubscription(userId: string): Promise<SubscriptionPlan> {
  const subscription = await subscriptionsRepo.findByUserId(userId);

  if (!subscription) {
    return "free";
  }

  if (subscription.status === "canceled") {
    return "free";
  }

  return subscription.plan;
}

export async function createFreeSubscription(userId: string): Promise<Subscription> {
  return subscriptionsRepo.upsertByUserId(userId, {
    user_id: userId,
    plan: "free",
    status: "active",
  });
}

export async function isInGracePeriod(userId: string): Promise<boolean> {
  const subscription = await subscriptionsRepo.findByUserId(userId);
  return subscription?.status === "grace_period";
}

export async function getGracePeriodDaysRemaining(userId: string): Promise<number | null> {
  const subscription = await subscriptionsRepo.findByUserId(userId);

  if (subscription?.status !== "grace_period" || !subscription.grace_period_ends_at) {
    return null;
  }

  const endsAt = new Date(subscription.grace_period_ends_at);
  const now = new Date();
  const diffMs = endsAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export async function startGracePeriod(
  userId: string,
  targetPlan: SubscriptionPlan = "free"
): Promise<Subscription> {
  const gracePeriodDays = 14;
  const gracePeriodEndsAt = new Date();
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + gracePeriodDays);

  return subscriptionsRepo.updateByUserId(userId, {
    status: "grace_period",
    plan: targetPlan,
    grace_period_ends_at: gracePeriodEndsAt.toISOString(),
    cancel_at_period_end: false,
  });
}

export async function getGracePeriodTargetPlan(userId: string): Promise<SubscriptionPlan | null> {
  const subscription = await subscriptionsRepo.findByUserId(userId);
  if (subscription?.status !== "grace_period") {
    return null;
  }
  return subscription.plan;
}

export async function getExpiredGracePeriodSubscriptions(): Promise<Subscription[]> {
  return subscriptionsRepo.findExpiredGracePeriods();
}

export async function completeGracePeriod(subscriptionId: string): Promise<Subscription> {
  return subscriptionsRepo.update(subscriptionId, {
    status: "canceled",
    grace_period_ends_at: null,
  });
}
