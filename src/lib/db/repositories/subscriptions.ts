import { db } from "../client";
import type { Subscription, SubscriptionInsert, SubscriptionUpdate } from "../types";

export const subscriptionsRepo = {
  async findByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await db
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const { data, error } = await db
      .from("subscriptions")
      .select("*")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async create(subscription: SubscriptionInsert): Promise<Subscription> {
    const { data, error } = await db
      .from("subscriptions")
      .insert({
        ...subscription,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: SubscriptionUpdate): Promise<Subscription> {
    const { data, error } = await db
      .from("subscriptions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateByUserId(userId: string, updates: SubscriptionUpdate): Promise<Subscription> {
    const { data, error } = await db
      .from("subscriptions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    updates: SubscriptionUpdate
  ): Promise<Subscription> {
    const { data, error } = await db
      .from("subscriptions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findExpiredGracePeriods(limit: number = 100): Promise<Subscription[]> {
    const { data, error } = await db
      .from("subscriptions")
      .select("*")
      .eq("status", "grace_period")
      .lt("grace_period_ends_at", new Date().toISOString())
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },

  async upsertByUserId(userId: string, subscription: SubscriptionInsert): Promise<Subscription> {
    const { data, error } = await db
      .from("subscriptions")
      .upsert(
        {
          ...subscription,
          user_id: userId,
          cancel_at_period_end: subscription.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
