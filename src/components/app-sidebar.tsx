"use client";

import {
  Home,
  Key,
  CreditCard,
  Settings,
  BookOpen,
  FolderOpen,
  Activity,
  FileText,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Files", url: "/files", icon: FolderOpen },
  { title: "API Keys", url: "/api-keys", icon: Key },
  { title: "Logs", url: "/logs", icon: Activity },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

const resourcesNav = [
  { title: "Guides", url: "https://stashfyle.mintlify.app/introduction", icon: FileText, external: true },
  { title: "API Reference", url: "https://stashfyle.mintlify.app/api-reference/overview", icon: BookOpen, external: true },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userEmail: string;
  userName: string | null;
}

export function AppSidebar({ userEmail, userName, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-4 group-data-[collapsible=icon]:pb-2">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Logo className="size-7 text-primary shrink-0" />
          <span
            className="text-[33px] text-accent-foreground leading-none group-data-[collapsible=icon]:hidden select-none"
            style={{ fontFamily: "'Road Rage', sans-serif" }}
          >
            StashFyle
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <NavMain items={mainNav} />
        <NavMain items={resourcesNav} label="Resources" />
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
        <NavUser email={userEmail} name={userName} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
