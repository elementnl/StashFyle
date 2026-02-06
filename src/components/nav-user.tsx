"use client";

import { useRouter } from "next/navigation";
import { LogOut, ChevronsUpDown } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/auth/browser";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavUserProps {
  email: string;
  name: string | null;
}

export function NavUser({ email, name }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-14 data-[state=open]:bg-accent"
            >
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight gap-0.5">
                {name && (
                  <span className="truncate text-sm font-medium">{name}</span>
                )}
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-48 rounded-md"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={handleLogout} className="text-sm">
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
