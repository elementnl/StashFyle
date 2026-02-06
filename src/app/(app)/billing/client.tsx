"use client";

import { useState } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

const PLAN_DETAILS: Record<SubscriptionPlan, { name: string; color: string }> = {
  free: { name: "Free", color: "bg-zinc-100 text-zinc-700" },
  hobby: { name: "Hobby", color: "bg-blue-100 text-blue-700" },
  pro: { name: "Pro", color: "bg-purple-100 text-purple-700" },
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

  const planInfo = PLAN_DETAILS[subscription.plan];
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
    <div className="mx-auto max-w-xl space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Your Plan</CardTitle>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${planInfo.color}`}>
              {planInfo.name}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isFree && subscription.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? `Cancels ${formatDate(subscription.currentPeriodEnd)}`
                : `Renews ${formatDate(subscription.currentPeriodEnd)}`}
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span className="text-muted-foreground">
                  {formatBytes(usage.storage_bytes)} / {formatBytes(limits.maxStorage)}
                </span>
              </div>
              <Progress value={storagePercent} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploads this month</span>
                <span className="text-muted-foreground">
                  {usage.upload_count.toLocaleString()} / {limits.maxUploads.toLocaleString()}
                </span>
              </div>
              <Progress value={uploadsPercent} className="h-1.5" />
            </div>
          </div>

          {!isFree && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageBilling}
              disabled={loading === "portal"}
            >
              {loading === "portal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Manage Subscription
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options for Free Users */}
      {isFree && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Upgrade</CardTitle>
              <div className="flex items-center rounded-lg border p-1">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <Badge className={`ml-1.5 ${isYearly ? "bg-white text-primary" : "bg-primary text-white"}`}>
                    Save
                  </Badge>
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Hobby Plan */}
            <button
              onClick={() => handleUpgrade(isYearly ? "hobby_yearly" : "hobby_monthly")}
              disabled={loading !== null}
              className="flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
            >
              <div className="space-y-1">
                <div className="font-medium">Hobby</div>
                <div className="text-sm text-muted-foreground">10 GB storage, 100 MB files</div>
              </div>
              <div className="text-right">
                {loading === (isYearly ? "hobby_yearly" : "hobby_monthly") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="font-semibold">${isYearly ? "7.50" : "9"}/mo</div>
                    {isYearly && <div className="text-xs text-muted-foreground">$90/year</div>}
                  </>
                )}
              </div>
            </button>

            {/* Pro Plan */}
            <button
              onClick={() => handleUpgrade(isYearly ? "pro_yearly" : "pro_monthly")}
              disabled={loading !== null}
              className="flex w-full items-center justify-between rounded-lg border bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Pro</span>
                  <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">Popular</span>
                </div>
                <div className="text-sm text-muted-foreground">100 GB storage, 500 MB files</div>
              </div>
              <div className="text-right">
                {loading === (isYearly ? "pro_yearly" : "pro_monthly") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="font-semibold">${isYearly ? "22" : "29"}/mo</div>
                    {isYearly && <div className="text-xs text-muted-foreground">$264/year</div>}
                  </>
                )}
              </div>
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
