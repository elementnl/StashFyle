"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/auth/browser";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

interface NavUserProps {
  email: string;
  name: string | null;
}

export function NavUser({ email, name }: NavUserProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="group/user flex items-center justify-between w-full px-2 py-2">
          <div className="grid flex-1 text-left leading-tight gap-0.5 min-w-0">
            {name && (
              <span className="truncate text-sm font-medium">{name}</span>
            )}
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 translate-x-2 group-hover/user:opacity-100 group-hover/user:translate-x-0 transition-all duration-200 ease-out"
              >
                <LogOut className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Log out
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
