import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getFolderContents } from "./actions";
import { FilesClient } from "./client";

export default async function FilesPage() {
  const { folders, files, has_more, cursor } = await getFolderContents(null);

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
                <BreadcrumbPage className="text-sm font-medium">Files</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-8">
        <div className="mx-auto w-full max-w-6xl flex flex-col gap-6">
          <FilesClient
            initialFolders={folders}
            initialFiles={files}
            initialHasMore={has_more}
            initialCursor={cursor}
          />
        </div>
      </div>
    </>
  );
}
