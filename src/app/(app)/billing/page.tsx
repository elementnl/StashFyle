import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/supabase";
import { getSubscription } from "@/lib/services/subscriptions";
import { getCurrentUsage, getPlanLimits, getUserPlan } from "@/lib/services/usage";
import { BillingClient } from "./client";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireUser();

  const [subscription, usage, plan] = await Promise.all([
    getSubscription(user.id),
    getCurrentUsage(user.id),
    getUserPlan(user.id),
  ]);

  const limits = getPlanLimits(plan);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 ">
        <div className="flex items-center gap-2 px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-8">
        <div className="mx-auto w-full max-w-6xl flex flex-col gap-6">
          <BillingClient
            subscription={subscription}
            usage={{
              storage_bytes: usage.storage_bytes,
              upload_count: usage.upload_count,
            }}
            limits={{
              maxStorage: limits.maxStorage,
              maxUploads: limits.maxUploads,
            }}
          />
        </div>
      </div>
    </>
  );
}
