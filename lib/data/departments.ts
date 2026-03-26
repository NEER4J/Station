import { createClient } from "@/lib/supabase/server";
import type { Department } from "@/types/database";

export async function getDepartments(stationId: string): Promise<Department[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("station_id", stationId)
    .order("sort_order")
    .order("name");

  if (error) throw error;

  // Compute item counts
  const { data: counts } = await supabase
    .from("items")
    .select("department_id")
    .eq("station_id", stationId);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    if (row.department_id) {
      countMap.set(row.department_id, (countMap.get(row.department_id) ?? 0) + 1);
    }
  }

  return (data ?? []).map((d) => ({
    ...d,
    item_count: countMap.get(d.id) ?? 0,
  }));
}

export async function createDepartment(
  stationId: string,
  data: Partial<Department>,
): Promise<Department> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("departments")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateDepartment(
  id: string,
  data: Partial<Department>,
): Promise<Department> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("departments")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteDepartment(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
}
