"use client";

import { useState } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCheckout, openBillingPortal } from "./actions";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/db/types";
import type { PriceKey } from "@/lib/billing/stripe";

interface BillingClientProps {
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    gracePeriodEndsAt: string | null;
  };
  usage: {
    storage_bytes: number;
    upload_count: number;
  };
  limits: {
    maxStorage: number;
    maxUploads: number;
  };
}

const PLAN_BADGES: Record<SubscriptionPlan, { name: string; className: string }> = {
  free: { name: "Free", className: "bg-muted text-muted-foreground" },
  hobby: { name: "Hobby", className: "bg-primary/10 text-primary" },
  pro: { name: "Pro", className: "bg-secondary text-secondary-foreground" },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BillingClient({ subscription, usage, limits }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const planBadge = PLAN_BADGES[subscription.plan];
  const storagePercent = Math.min((usage.storage_bytes / limits.maxStorage) * 100, 100);
  const uploadsPercent = Math.min((usage.upload_count / limits.maxUploads) * 100, 100);
  const isFree = subscription.plan === "free";

  async function handleUpgrade(priceKey: PriceKey) {
    setLoading(priceKey);
    try {
      await createCheckout(priceKey);
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading("portal");
    try {
      await openBillingPortal();
    } catch (error) {
      console.error("Portal error:", error);
      setLoading(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription and usage
          </p>
        </div>
        <Badge className={`text-xs ${planBadge.className}`}>
          {planBadge.name} Plan
        </Badge>
      </div>

      <div className="rounded-lg border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Current Plan</h2>
          {!isFree && subscription.currentPeriodEnd && (
            <p className="text-xs text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? `Cancels ${formatDate(subscription.currentPeriodEnd)}`
                : `Renews ${formatDate(subscription.currentPeriodEnd)}`}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage</span>
              <span className="text-muted-foreground">
                {formatBytes(usage.storage_bytes)} / {formatBytes(limits.maxStorage)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploads this month</span>
              <span className="text-muted-foreground">
                {usage.upload_count.toLocaleString()} / {limits.maxUploads.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${uploadsPercent}%` }}
              />
            </div>
          </div>
        </div>

        {!isFree && (
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={handleManageBilling}
            disabled={loading === "portal"}
          >
            {loading === "portal" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Manage Subscription
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>

      {isFree && (
        <div className="rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Upgrade</h2>
            <div className="flex items-center rounded-md border p-0.5">
              <button
                onClick={() => setIsYearly(false)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <Badge className={`ml-2 ${isYearly ? "text-white bg-white/20" : "text-primary bg-primary/20"}`}>
                  Save
                </Badge>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleUpgrade(isYearly ? "hobby_yearly" : "hobby_monthly")}
              disabled={loading !== null}
              className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
            >
              <div>
                <div className="text-sm font-medium">Hobby</div>
                <div className="text-xs text-muted-foreground mt-0.5">10 GB storage, 100 MB files</div>
              </div>
              <div className="text-right">
                {loading === (isYearly ? "hobby_yearly" : "hobby_monthly") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="text-sm font-medium">${isYearly ? "7.50" : "9"}/mo</div>
                    {isYearly && <div className="text-xs text-muted-foreground">$90/year</div>}
                  </>
                )}
              </div>
            </button>

            <button
              onClick={() => handleUpgrade(isYearly ? "pro_yearly" : "pro_monthly")}
              disabled={loading !== null}
              className="flex w-full items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Pro</span>
                  <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Popular</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">100 GB storage, 500 MB files</div>
              </div>
              <div className="text-right">
                {loading === (isYearly ? "pro_yearly" : "pro_monthly") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="text-sm font-medium">${isYearly ? "22" : "29"}/mo</div>
                    {isYearly && <div className="text-xs text-muted-foreground">$264/year</div>}
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
