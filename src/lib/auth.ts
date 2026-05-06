import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRole = "owner" | "worker" | "client" | "estimator";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
};

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return profile as Profile;
}

export async function requireRole(...roles: UserRole[]): Promise<Profile> {
  const profile = await getProfile();
  if (!roles.includes(profile.role)) {
    redirect("/portal");
  }
  return profile;
}
