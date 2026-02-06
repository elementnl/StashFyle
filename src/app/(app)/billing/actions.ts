"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/supabase";
import { usersRepo } from "@/lib/db/repositories/users";
import {
  createCheckoutSession,
  createBillingPortalSession,
  createCustomer,
  PRICE_IDS,
  type PriceKey,
} from "@/lib/billing/stripe";
import { getSubscription } from "@/lib/services/subscriptions";

export async function createCheckout(priceKey: PriceKey) {
  const user = await requireUser();
  const dbUser = await usersRepo.findById(user.id);

  if (!dbUser) {
    throw new Error("User not found in database");
  }

  const subscription = await getSubscription(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // If user already has an active paid subscription, redirect to billing portal for upgrades
  if (subscription.plan !== "free" && subscription.status === "active" && dbUser.stripe_customer_id) {
    const portalSession = await createBillingPortalSession({
      customerId: dbUser.stripe_customer_id,
      returnUrl: `${appUrl}/billing`,
    });
    redirect(portalSession.url);
  }

  let customerId: string;

  if (dbUser.stripe_customer_id) {
    customerId = dbUser.stripe_customer_id;
  } else {
    const customer = await createCustomer(dbUser.email, dbUser.id);
    customerId = customer.id;
    await usersRepo.update(dbUser.id, { stripe_customer_id: customerId });
  }

  const priceId = PRICE_IDS[priceKey];
  if (!priceId) {
    throw new Error(`Invalid price key: ${priceKey}`);
  }

  const session = await createCheckoutSession({
    customerId,
    priceId: priceId as string,
    successUrl: `${appUrl}/billing?success=true`,
    cancelUrl: `${appUrl}/billing?canceled=true`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(session.url);
}

export async function openBillingPortal() {
  const user = await requireUser();
  const dbUser = await usersRepo.findById(user.id);

  if (!dbUser?.stripe_customer_id) {
    throw new Error("No billing account found");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await createBillingPortalSession({
    customerId: dbUser.stripe_customer_id,
    returnUrl: `${appUrl}/billing`,
  });

  redirect(session.url);
}

export async function getSubscriptionData() {
  const user = await requireUser();
  return getSubscription(user.id);
}
