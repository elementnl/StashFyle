import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/supabase";
import { usersRepo } from "@/lib/db/repositories/users";
import { filesRepo } from "@/lib/db/repositories/files";
import { SettingsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const authUser = await requireUser();

  const [dbUser, fileCount] = await Promise.all([
    usersRepo.findById(authUser.id),
    filesRepo.countByUser(authUser.id),
  ]);

  const user = {
    id: authUser.id,
    email: authUser.email ?? "",
    name: dbUser?.name ?? null,
  };

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
                <BreadcrumbPage className="text-sm font-medium">Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-8">
        <div className="mx-auto w-full max-w-6xl flex flex-col gap-6">
          <SettingsClient user={user} fileCount={fileCount} />
        </div>
      </div>
    </>
  );
}
