import { createClient } from "@/lib/supabase/server";
import type { Subdepartment } from "@/types/database";

export async function getSubdepartments(stationId: string): Promise<Subdepartment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subdepartments")
    .select("*, department:departments(id, name)")
    .eq("station_id", stationId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createSubdepartment(
  stationId: string,
  data: Partial<Subdepartment>,
): Promise<Subdepartment> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("subdepartments")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateSubdepartment(
  id: string,
  data: Partial<Subdepartment>,
): Promise<Subdepartment> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("subdepartments")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteSubdepartment(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("subdepartments").delete().eq("id", id);
  if (error) throw error;
}
