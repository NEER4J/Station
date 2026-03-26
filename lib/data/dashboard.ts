import { createClient } from "@/lib/supabase/server";
import type {
  StoreMetricsSummary,
  FuelSalesSummary,
  TankStatus,
} from "@/types/database";

export async function getStoreMetrics(
  stationId: string,
): Promise<StoreMetricsSummary> {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const startOfYear = new Date(now.getFullYear(), 0, 1)
    .toISOString()
    .split("T")[0];
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];
  const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1)
    .toISOString()
    .split("T")[0];
  const endOfPrevYear = new Date(now.getFullYear() - 1, 11, 31)
    .toISOString()
    .split("T")[0];

  // Fetch current month, current year, previous month, previous year in parallel
  const [monthRes, yearRes, prevMonthRes, prevYearRes, latestRes] =
    await Promise.all([
      supabase
        .from("store_metrics")
        .select("sales_amount")
        .eq("station_id", stationId)
        .gte("metric_date", startOfMonth),
      supabase
        .from("store_metrics")
        .select("sales_amount")
        .eq("station_id", stationId)
        .gte("metric_date", startOfYear),
      supabase
        .from("store_metrics")
        .select("sales_amount")
        .eq("station_id", stationId)
        .gte("metric_date", startOfPrevMonth)
        .lt("metric_date", startOfMonth),
      supabase
        .from("store_metrics")
        .select("sales_amount")
        .eq("station_id", stationId)
        .gte("metric_date", startOfPrevYear)
        .lte("metric_date", endOfPrevYear),
      supabase
        .from("store_metrics")
        .select("items_on_hand, inventory_value")
        .eq("station_id", stationId)
        .order("metric_date", { ascending: false })
        .limit(1),
    ]);

  const sum = (rows: { sales_amount: number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + Number(r.sales_amount), 0);

  const salesThisMonth = sum(monthRes.data);
  const salesThisYear = sum(yearRes.data);
  const salesPrevMonth = sum(prevMonthRes.data);
  const salesPrevYear = sum(prevYearRes.data);

  const latest = latestRes.data?.[0];

  const monthlyTrend =
    salesPrevMonth > 0
      ? ((salesThisMonth - salesPrevMonth) / salesPrevMonth) * 100
      : 0;
  const yearlyTrend =
    salesPrevYear > 0
      ? ((salesThisYear - salesPrevYear) / salesPrevYear) * 100
      : 0;

  return {
    sales_this_month: salesThisMonth,
    sales_this_year: salesThisYear,
    items_on_hand: latest?.items_on_hand ?? 0,
    inventory_value: latest?.inventory_value ?? 0,
    monthly_trend: monthlyTrend,
    yearly_trend: yearlyTrend,
  };
}

export async function getFuelSalesSummary(
  stationId: string,
): Promise<FuelSalesSummary[]> {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("fuel_sales_summary")
    .select("*, fuel_grade:fuel_grades(*)")
    .eq("station_id", stationId)
    .gte("summary_date", startOfMonth)
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

  // Recalculate averages
  const result = Array.from(byGrade.values()).map((row) => ({
    ...row,
    avg_price:
      row.units_sold > 0 ? row.dollars_sold / row.units_sold : row.avg_price,
    avg_margin: row.avg_margin,
  }));

  return result;
}

export async function getTankStatuses(
  stationId: string,
): Promise<TankStatus[]> {
  const supabase = await createClient();

  // Get all active tanks with their fuel grade
  const { data: tanks, error: tanksError } = await supabase
    .from("fuel_tanks")
    .select("*, fuel_grade:fuel_grades(*)")
    .eq("station_id", stationId)
    .eq("is_active", true)
    .order("tank_number");

  if (tanksError) throw tanksError;
  if (!tanks?.length) return [];

  // Get latest reading for each tank
  const statuses: TankStatus[] = await Promise.all(
    tanks.map(async (tank) => {
      const { data: readings } = await supabase
        .from("fuel_tank_readings")
        .select("*")
        .eq("tank_id", tank.id)
        .order("reading_at", { ascending: false })
        .limit(1);

      const latest = readings?.[0] ?? null;
      const currentVolume = latest ? Number(latest.volume_litres) : 0;
      const capacity = Number(tank.capacity_litres);
      const fillPercentage = capacity > 0 ? (currentVolume / capacity) * 100 : 0;

      return {
        tank,
        latest_reading: latest,
        fill_percentage: fillPercentage,
        is_low: currentVolume < Number(tank.low_level_threshold),
      };
    }),
  );

  return statuses;
}
