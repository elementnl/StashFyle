import Stripe from "stripe";
import type { SubscriptionPlan } from "../db/types";

const isDev = process.env.NODE_ENV === "development";

function getEnvVar(prodKey: string, sandboxKey: string): string {
  const value = isDev ? process.env[sandboxKey] : process.env[prodKey];
  if (!value) {
    throw new Error(`Missing env var: ${isDev ? sandboxKey : prodKey}`);
  }
  return value;
}

function getOptionalEnvVar(prodKey: string, sandboxKey: string): string | undefined {
  return isDev ? process.env[sandboxKey] : process.env[prodKey];
}

const stripeSecretKey = getEnvVar("STRIPE_SECRET_KEY", "SANDBOX_STRIPE_SECRET_KEY");

export const stripe = new Stripe(stripeSecretKey);

// Price IDs from Stripe Dashboard
// These map to your products: Hobby ($9/mo, $90/yr) and Pro ($29/mo, $264/yr)
export const PRICE_IDS = {
  hobby_monthly: getOptionalEnvVar("STRIPE_HOBBY_MONTHLY_PRICE_ID", "SANDBOX_STRIPE_HOBBY_MONTHLY_PRICE_ID"),
  hobby_yearly: getOptionalEnvVar("STRIPE_HOBBY_YEARLY_PRICE_ID", "SANDBOX_STRIPE_HOBBY_YEARLY_PRICE_ID"),
  pro_monthly: getOptionalEnvVar("STRIPE_PRO_MONTHLY_PRICE_ID", "SANDBOX_STRIPE_PRO_MONTHLY_PRICE_ID"),
  pro_yearly: getOptionalEnvVar("STRIPE_PRO_YEARLY_PRICE_ID", "SANDBOX_STRIPE_PRO_YEARLY_PRICE_ID"),
} as const;

export type PriceKey = keyof typeof PRICE_IDS;

export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  if (priceId === PRICE_IDS.hobby_monthly || priceId === PRICE_IDS.hobby_yearly) {
    return "hobby";
  }
  if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_yearly) {
    return "pro";
  }
  return "free";
}

export function isYearlyPrice(priceId: string): boolean {
  return priceId === PRICE_IDS.hobby_yearly || priceId === PRICE_IDS.pro_yearly;
}

export async function createCustomer(email: string, userId: string): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });
}

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: "subscription",
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      metadata: {
        customerId: params.customerId,
      },
    },
  });
}

export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = getEnvVar("STRIPE_WEBHOOK_SECRET", "SANDBOX_STRIPE_WEBHOOK_SECRET");
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
