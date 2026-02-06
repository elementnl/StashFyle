import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getRequestLogs, getStats } from "./actions";
import { LogsClient } from "./client";

export default async function LogsPage() {
  const [logsResult, stats] = await Promise.all([getRequestLogs(), getStats()]);

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
                <BreadcrumbPage className="text-sm font-medium">Logs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-8">
        <div className="mx-auto w-full max-w-6xl flex flex-col gap-6">
          <LogsClient
            initialLogs={logsResult.logs}
            initialHasMore={logsResult.has_more}
            initialCursor={logsResult.cursor}
            stats={stats}
          />
        </div>
      </div>
    </>
  );
}
