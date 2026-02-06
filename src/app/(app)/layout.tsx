import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/supabase";
import { usersRepo } from "@/lib/db/repositories/users";
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

  const dbUser = await usersRepo.findById(user.id);
  const userName = dbUser?.name ?? null;

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
