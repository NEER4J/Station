import { createClient } from "@/lib/supabase/server";
import type { UserProfile, Role, Station } from "@/types/database";

export type UserWithProfile = UserProfile & { role?: Role; station?: Station };

export async function listUsers(): Promise<UserWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*, role:roles(id, name, description), station:stations(id, name)")
    .order("full_name");
  if (error) throw error;
  return (data ?? []) as UserWithProfile[];
}

export async function updateUserProfile(
  id: string,
  data: { role_id?: string | null; station_id?: string | null; is_active?: boolean; full_name?: string | null },
): Promise<UserProfile> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("user_profiles")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function getRoles(): Promise<Role[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createRole(name: string, description?: string): Promise<Role> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .insert({ name, description: description ?? null, permissions: {} })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRole(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) throw error;
}
