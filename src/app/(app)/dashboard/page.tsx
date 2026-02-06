import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getDashboardData } from "./actions";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { HardDrive, Upload, Key } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

interface UsageCardProps {
  title: string;
  icon: React.ReactNode;
  current: number;
  limit: number;
  format: "bytes" | "number";
}

function UsageCard({ title, icon, current, limit, format }: UsageCardProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  const displayCurrent = format === "bytes" ? formatBytes(current) : formatNumber(current);
  const displayLimit = format === "bytes" ? formatBytes(limit) : formatNumber(limit);

  return (
    <div className="rounded-lg border border-border hover:border-primary/30 transition-colors p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-md bg-primary/10">{icon}</div>
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tracking-tight">{displayCurrent}</span>
          <span className="text-sm text-muted-foreground">of {displayLimit}</span>
        </div>
        <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardHomePage() {
  const data = await getDashboardData();
  const { firstName, plan, limits, usage, apiKeyCount } = data;

  const greeting = firstName ? `Hi, ${firstName}` : "Welcome";

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border">
        <div className="flex items-center gap-2 px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-8">
        <div className="mx-auto w-full max-w-6xl flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
              <p className="text-sm text-muted-foreground mt-1">
            Simplify file uploads with StashFyle&apos;s REST API
            </p>
            </div>
            
            <Badge
              variant="outline"
              className="text-xs border-secondary text-secondary-foreground bg-secondary capitalize"
            >
              {plan} Plan
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <UsageCard
              title="Storage"
              icon={<HardDrive className="h-4 w-4 text-primary" />}
              current={usage.storage_bytes}
              limit={limits.maxStorage}
              format="bytes"
            />
            <UsageCard
              title="Uploads"
              icon={<Upload className="h-4 w-4 text-primary" />}
              current={usage.upload_count}
              limit={limits.maxUploads}
              format="number"
            />
            <UsageCard
              title="API Keys"
              icon={<Key className="h-4 w-4 text-primary" />}
              current={apiKeyCount}
              limit={limits.maxApiKeys}
              format="number"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Quick Start</h2>
            <CodeBlock />
            <p className="text-xs text-muted-foreground mt-3">
              Don&apos;t have an API key? <Link href="/api-keys" className="text-primary hover:underline">Create one here</Link>.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-medium text-primary mb-3">Current Period Usage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage</span>
                <span>{formatBytes(usage.storage_bytes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploads</span>
                <span>{formatNumber(usage.upload_count)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period Start</span>
                <span>{new Date(usage.period_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
