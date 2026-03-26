import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/types/database";

interface GetItemsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  supplierId?: string;
  status?: string;
}

export async function getItems(
  stationId: string,
  opts: GetItemsOptions = {},
): Promise<{ data: Item[]; count: number }> {
  const supabase = await createClient();
  const { page = 1, pageSize = 25, search, departmentId, supplierId, status } = opts;

  let query = supabase
    .from("items")
    .select(
      "*, department:departments(id, name), subdepartment:subdepartments(id, name), supplier:suppliers(id, name)",
      { count: "exact" },
    )
    .eq("station_id", stationId);

  if (search) {
    query = query.or(`description.ilike.%${search}%,upc.ilike.%${search}%,plu.ilike.%${search}%`);
  }
  if (departmentId) query = query.eq("department_id", departmentId);
  if (supplierId) query = query.eq("supplier_id", supplierId);
  if (status) query = query.eq("status", status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("description")
    .range(from, to);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getItem(id: string): Promise<Item | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select(
      "*, department:departments(id, name), subdepartment:subdepartments(id, name), supplier:suppliers(id, name)",
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createItem(
  stationId: string,
  data: Partial<Item>,
): Promise<Item> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("items")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateItem(
  id: string,
  data: Partial<Item>,
): Promise<Item> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("items")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}
