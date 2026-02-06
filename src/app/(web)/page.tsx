import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth/supabase";

export default async function LandingPage() {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex items-center gap-3">
        <Logo className="size-12 text-primary" />
        <span
          className="text-5xl text-accent-foreground"
          style={{ fontFamily: "'Road Rage', sans-serif" }}
        >
          StashFyle
        </span>
      </div>
      <div className="flex gap-3">
        {user ? (
          <Button asChild className="min-w-24">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="outline" className="min-w-24">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="min-w-24">
              <Link href="/signup">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
