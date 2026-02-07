import { getUser } from "@/lib/auth/supabase";
import { LandingClient } from "./client";

export default async function LandingPage() {
  const user = await getUser();

  return <LandingClient isLoggedIn={!!user} />;
}
