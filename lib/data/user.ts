import { createClient } from "@/lib/supabase/server";
import type { UserProfile, Role } from "@/types/database";

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*, role:roles(*), station:stations(*)")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function getUserRole(
  userId: string,
): Promise<Role["name"] | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_profiles")
    .select("role:roles(name)")
    .eq("id", userId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (data as any)?.role?.name;
  return role ?? null;
}
