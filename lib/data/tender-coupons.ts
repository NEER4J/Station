import { createClient } from "@/lib/supabase/server";
import type { TenderCoupon } from "@/types/database";

export async function getTenderCoupons(stationId: string): Promise<TenderCoupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tender_coupons")
    .select("*")
    .eq("station_id", stationId)
    .order("description");
  if (error) throw error;
  return data ?? [];
}

export async function createTenderCoupon(
  stationId: string,
  data: Partial<TenderCoupon>,
): Promise<TenderCoupon> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("tender_coupons")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateTenderCoupon(
  id: string,
  data: Partial<TenderCoupon>,
): Promise<TenderCoupon> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("tender_coupons")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteTenderCoupon(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tender_coupons").delete().eq("id", id);
  if (error) throw error;
}
