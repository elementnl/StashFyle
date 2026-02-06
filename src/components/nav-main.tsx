"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon, ArrowUpRight } from "lucide-react";
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
  external?: boolean;
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
              isActive={!item.external && pathname === item.url}
              tooltip={item.title}
              className="text-sm"
            >
              {item.external ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                  <ArrowUpRight className="size-3 ml-auto text-muted-foreground" />
                </a>
              ) : (
                <Link href={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
