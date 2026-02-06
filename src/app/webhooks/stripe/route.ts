import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent, getPlanFromPriceId, getSubscription as fetchStripeSubscription } from "@/lib/billing/stripe";
import { subscriptionsRepo } from "@/lib/db/repositories/subscriptions";
import { usersRepo } from "@/lib/db/repositories/users";
import { startGracePeriod } from "@/lib/services/subscriptions";
import { isUserOverLimitsForPlan, type Plan } from "@/lib/services/usage";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Log every event for debugging
  console.log(`[Webhook] Received event: ${event.type} (ID: ${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription || !session.customer) {
    return;
  }

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer.id;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) {
    console.error("No user found for customer:", customerId);
    return;
  }

  // Subscription details will be handled by subscription.created/updated event
  console.log(`Checkout completed for user ${user.id}`);
}

async function handleSubscriptionUpdated(webhookSub: Stripe.Subscription) {
  const customerId = typeof webhookSub.customer === "string"
    ? webhookSub.customer
    : webhookSub.customer.id;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) {
    console.error("No user found for customer:", customerId);
    return;
  }

  // Fetch full subscription from Stripe API to get all fields (webhook data is incomplete)
  const subscription = await fetchStripeSubscription(webhookSub.id);

  console.log(`[Webhook] Stripe API response:`, JSON.stringify({
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at: subscription.cancel_at,
    cancel_at_period_end: subscription.cancel_at_period_end,
  }));

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  const existingSub = await subscriptionsRepo.findByUserId(user.id);

  // Stripe billing portal sets cancel_at instead of cancel_at_period_end
  const isScheduledToCancel = subscription.cancel_at_period_end || subscription.cancel_at !== null;

  // Use cancel_at as fallback for period_end (when subscription is scheduled to cancel)
  // If neither is available, preserve existing value from database
  const periodEnd = subscription.current_period_end || subscription.cancel_at;
  const periodStart = subscription.current_period_start;

  const subscriptionData: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan,
    status: mapStripeStatus(subscription.status),
    cancel_at_period_end: isScheduledToCancel,
  };

  // Only update period dates if we have new values from Stripe
  // This prevents losing existing data when Stripe doesn't return these fields
  if (periodStart) {
    subscriptionData.current_period_start = new Date(periodStart * 1000).toISOString();
  }
  if (periodEnd) {
    subscriptionData.current_period_end = new Date(periodEnd * 1000).toISOString();
  }

  if (existingSub) {
    // Check for downgrade scenario: user moved to a lower plan
    const previousPlan = existingSub.plan;
    const isDowngrade = isDowngradePlan(previousPlan, plan);

    if (isDowngrade) {
      const overLimits = await isUserOverLimitsForPlan(user.id, plan as Plan);
      if (overLimits) {
        await startGracePeriod(user.id, plan as Plan);
        console.log(`[Webhook] User ${user.id} downgraded from ${previousPlan} to ${plan} and is over limits. Grace period started with target plan ${plan}.`);
        return;
      }
    }

    await subscriptionsRepo.update(existingSub.id, subscriptionData);
  } else {
    await subscriptionsRepo.create({
      user_id: user.id,
      ...subscriptionData,
    });
  }

  console.log(`[Webhook] Saved subscription for user ${user.id}: plan=${plan}, cancel_at_period_end=${isScheduledToCancel}, period_end=${subscriptionData.current_period_end}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSub = await subscriptionsRepo.findByStripeSubscriptionId(subscription.id);

  if (!existingSub) {
    console.error("No subscription found for:", subscription.id);
    return;
  }

  // Start 14-day grace period instead of immediately downgrading
  await startGracePeriod(existingSub.user_id);

  console.log(`Subscription deleted, grace period started for user ${existingSub.user_id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Access subscription from invoice (may be string, object, or null)
  const invoiceAny = invoice as unknown as { subscription: string | { id: string } | null };
  if (!invoiceAny.subscription) return;

  const subscriptionId = typeof invoiceAny.subscription === "string"
    ? invoiceAny.subscription
    : invoiceAny.subscription.id;

  const existingSub = await subscriptionsRepo.findByStripeSubscriptionId(subscriptionId);

  if (existingSub) {
    // Start grace period when payment fails (card declined)
    await startGracePeriod(existingSub.user_id);
    console.log(`Payment failed for subscription ${subscriptionId}, grace period started for user ${existingSub.user_id}`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Access subscription from invoice (may be string, object, or null)
  const invoiceAny = invoice as unknown as { subscription: string | { id: string } | null };
  if (!invoiceAny.subscription) return;

  const subscriptionId = typeof invoiceAny.subscription === "string"
    ? invoiceAny.subscription
    : invoiceAny.subscription.id;

  const existingSub = await subscriptionsRepo.findByStripeSubscriptionId(subscriptionId);

  if (existingSub && existingSub.status === "past_due") {
    await subscriptionsRepo.update(existingSub.id, {
      status: "active",
    });
    console.log(`Payment succeeded, subscription reactivated ${subscriptionId}`);
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): "active" | "canceled" | "past_due" | "grace_period" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "active";
  }
}

async function findUserByStripeCustomerId(customerId: string) {
  // Query users table by stripe_customer_id
  const { data, error } = await (await import("@/lib/db/client")).db
    .from("users")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error finding user by customer ID:", error);
    return null;
  }

  return data;
}

const PLAN_TIER: Record<string, number> = {
  free: 0,
  hobby: 1,
  pro: 2,
};

function isDowngradePlan(previousPlan: string, newPlan: string): boolean {
  const previousTier = PLAN_TIER[previousPlan] ?? 0;
  const newTier = PLAN_TIER[newPlan] ?? 0;
  return newTier < previousTier;
}
