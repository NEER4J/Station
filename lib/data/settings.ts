import { createClient } from "@/lib/supabase/server";
import type { FuelSalesSummary, SystemSetting } from "@/types/database";

export async function getFuelGradeSummary(
  stationId: string,
): Promise<FuelSalesSummary[]> {
  const supabase = await createClient();

  // Get the latest 30 days of fuel sales summary, aggregated by grade
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("fuel_sales_summary")
    .select("*, fuel_grade:fuel_grades(*)")
    .eq("station_id", stationId)
    .gte("summary_date", startDate)
    .order("summary_date", { ascending: false });

  if (error) throw error;

  // Aggregate by grade
  const byGrade = new Map<string, FuelSalesSummary>();

  for (const row of data ?? []) {
    const existing = byGrade.get(row.fuel_grade_id);
    if (existing) {
      existing.dollars_sold += Number(row.dollars_sold);
      existing.units_sold += Number(row.units_sold);
      existing.gross_profit += Number(row.gross_profit);
    } else {
      byGrade.set(row.fuel_grade_id, {
        ...row,
        dollars_sold: Number(row.dollars_sold),
        units_sold: Number(row.units_sold),
        avg_price: Number(row.avg_price),
        avg_margin: Number(row.avg_margin),
        gross_profit: Number(row.gross_profit),
      });
    }
  }

  return Array.from(byGrade.values()).map((row) => ({
    ...row,
    avg_price:
      row.units_sold > 0 ? row.dollars_sold / row.units_sold : row.avg_price,
  }));
}

export async function getSystemSettings(
  stationId?: string,
): Promise<SystemSetting[]> {
  const supabase = await createClient();

  let query = supabase.from("system_settings").select("*");

  if (stationId) {
    query = query.eq("station_id", stationId);
  }

  const { data, error } = await query.order("key");

  if (error) throw error;
  return data ?? [];
}

export async function getSystemSetting(
  key: string,
  stationId?: string,
): Promise<unknown> {
  const supabase = await createClient();

  let query = supabase
    .from("system_settings")
    .select("value")
    .eq("key", key);

  if (stationId) {
    query = query.eq("station_id", stationId);
  }

  const { data } = await query.single();
  return data?.value;
}

export async function updateSystemSetting(
  key: string,
  value: unknown,
  stationId?: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      {
        station_id: stationId,
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "station_id,key" },
    );

  if (error) throw error;
}
