import { db } from "../client";
import type { Usage, UsageUpdate } from "../types";

function getCurrentPeriodStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export const usageRepo = {
  async findCurrent(userId: string): Promise<Usage | null> {
    const periodStart = getCurrentPeriodStart();

    const { data, error } = await db
      .from("usage")
      .select("*")
      .eq("user_id", userId)
      .eq("period_start", periodStart)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async upsert(userId: string, updates: UsageUpdate): Promise<Usage> {
    const periodStart = getCurrentPeriodStart();

    const { data, error } = await db
      .from("usage")
      .upsert(
        {
          user_id: userId,
          period_start: periodStart,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,period_start" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async increment(
    userId: string,
    field: "storage_bytes" | "bandwidth_bytes" | "upload_count",
    amount: number
  ): Promise<void> {
    const current = await this.findCurrent(userId);
    const currentValue = current?.[field] ?? 0;

    await this.upsert(userId, {
      [field]: currentValue + amount,
    });
  },

  async decrement(
    userId: string,
    field: "storage_bytes" | "bandwidth_bytes" | "upload_count",
    amount: number
  ): Promise<void> {
    const current = await this.findCurrent(userId);
    const currentValue = current?.[field] ?? 0;
    const newValue = Math.max(0, currentValue - amount);

    await this.upsert(userId, {
      [field]: newValue,
    });
  },
};
