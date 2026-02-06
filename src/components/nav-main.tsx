"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavMainProps {
  items: NavItem[];
  label?: string;
}

export function NavMain({ items, label }: NavMainProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-xs text-muted-foreground font-normal px-2 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url}
              tooltip={item.title}
              className="text-sm"
            >
              <Link href={item.url}>
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
