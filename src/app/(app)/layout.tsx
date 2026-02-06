import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/supabase";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { GracePeriodBanner } from "@/components/grace-period-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const userName = (user.user_metadata?.name as string) ?? null;

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email ?? ""} userName={userName} />
      <SidebarInset>
        <GracePeriodBanner userId={user.id} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
