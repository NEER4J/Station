import { createClient } from "@/lib/supabase/server";
import type { SiteDetail, Station } from "@/types/database";

export type SiteWithDetails = Station & { details: SiteDetail | null };

export async function getSitesWithDetails(): Promise<SiteWithDetails[]> {
  const supabase = await createClient();
  const { data: stations, error } = await supabase
    .from("stations")
    .select("*")
    .order("name");
  if (error) throw error;

  const { data: details } = await supabase
    .from("site_details")
    .select("*");

  const detailMap = new Map<string, SiteDetail>();
  for (const d of details ?? []) {
    detailMap.set(d.station_id, d);
  }

  return (stations ?? []).map((s) => ({ ...s, details: detailMap.get(s.id) ?? null }));
}

export async function upsertSiteDetails(
  stationId: string,
  data: Partial<SiteDetail>,
): Promise<SiteDetail> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("site_details")
    .upsert({ ...data, station_id: stationId }, { onConflict: "station_id" })
    .select()
    .single();
  if (error) throw error;
  return result;
}
