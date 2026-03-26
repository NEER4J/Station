import {
  DollarSign,
  TrendingUp,
  Package,
  Warehouse,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/utils";
import type { StoreMetricsSummary } from "@/types/database";

interface StoreMetricsSectionProps {
  metrics: StoreMetricsSummary;
}

export function StoreMetricsSection({ metrics }: StoreMetricsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Sales This Month"
        value={formatCurrency(metrics.sales_this_month)}
        icon={DollarSign}
        trend={
          metrics.monthly_trend !== 0
            ? {
                value: metrics.monthly_trend,
                direction: metrics.monthly_trend > 0 ? "up" : "down",
              }
            : undefined
        }
        helpText="Total sales for the current month"
      />
      <StatCard
        title="Sales This Year"
        value={formatCurrency(metrics.sales_this_year)}
        icon={TrendingUp}
        trend={
          metrics.yearly_trend !== 0
            ? {
                value: metrics.yearly_trend,
                direction: metrics.yearly_trend > 0 ? "up" : "down",
              }
            : undefined
        }
        helpText="Year-to-date sales total"
      />
      <StatCard
        title="Total Items on Hand"
        value={metrics.items_on_hand.toLocaleString()}
        icon={Package}
        helpText="Current inventory item count"
      />
      <StatCard
        title="Value of Items on Hand"
        value={formatCurrency(metrics.inventory_value)}
        icon={Warehouse}
        helpText="Total inventory valuation"
      />
    </div>
  );
}
