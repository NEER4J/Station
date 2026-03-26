import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { StoreMetricsSection } from "./_components/store-metrics-section";
import { FuelSummaryTable } from "./_components/fuel-summary-table";
import { TankGaugesSection } from "./_components/tank-gauges-section";
import { RealtimeFeedPlaceholder } from "./_components/realtime-feed-placeholder";
import { getStoreMetrics, getFuelSalesSummary, getTankStatuses } from "@/lib/data/dashboard";
import type { StoreMetricsSummary } from "@/types/database";

// Fallback data when no station is assigned or tables don't exist yet
const FALLBACK_METRICS: StoreMetricsSummary = {
  sales_this_month: 0,
  sales_this_year: 0,
  items_on_hand: 0,
  inventory_value: 0,
  monthly_trend: 0,
  yearly_trend: 0,
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's assigned station
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("station_id")
    .eq("id", user!.id)
    .single();

  const stationId = profile?.station_id;

  // If no station assigned, show dashboard with empty state
  if (!stationId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Operations command center"
        />
        <StoreMetricsSection metrics={FALLBACK_METRICS} />
        <FuelSummaryTable data={[]} />
        <RealtimeFeedPlaceholder />
      </div>
    );
  }

  // Fetch all dashboard data in parallel
  const [metrics, fuelSales, tanks] = await Promise.all([
    getStoreMetrics(stationId).catch(() => FALLBACK_METRICS),
    getFuelSalesSummary(stationId).catch(() => []),
    getTankStatuses(stationId).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Operations command center"
      />
      <StoreMetricsSection metrics={metrics} />
      <FuelSummaryTable data={fuelSales} />
      <TankGaugesSection tanks={tanks} />
      <RealtimeFeedPlaceholder />
    </div>
  );
}
