import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { RoleGate } from "@/components/shared/role-guard";
import { FuelGradeSummaryTable } from "./_components/fuel-grade-summary-table";
import { FinancialSummaryToggle } from "./_components/financial-summary-toggle";
import { getFuelGradeSummary, getSystemSetting } from "@/lib/data/settings";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SystemSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's assigned station
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("station_id")
    .eq("id", user!.id)
    .single();

  const stationId = profile?.station_id;

  const [fuelData, financialVisible] = await Promise.all([
    stationId ? getFuelGradeSummary(stationId).catch(() => []) : Promise.resolve([]),
    stationId
      ? getSystemSetting("financial_summary_visible", stationId)
          .then((v) => v !== "false" && v !== false)
          .catch(() => true)
      : Promise.resolve(true),
  ]);

  async function toggleFinancials(visible: boolean) {
    "use server";
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const { updateSystemSetting } = await import("@/lib/data/settings");
    const sb = await createServerClient();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) return;
    const { data: p } = await sb
      .from("user_profiles")
      .select("station_id")
      .eq("id", u.id)
      .single();
    if (p?.station_id) {
      await updateSystemSetting("financial_summary_visible", visible, p.station_id);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Administrative configurations and fuel sales overview"
        backHref="/dashboard"
      />

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Fuel Sales Grade Summary
        </h2>
        <FuelGradeSummaryTable
          data={fuelData}
          hideFinancials={!financialVisible}
        />
      </section>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white shadow-sm p-4">
        <RoleGate minimumRole="manager">
          <FinancialSummaryToggle
            initialVisible={financialVisible}
            onToggle={toggleFinancials}
          />
        </RoleGate>
        <Button variant="outline" size="sm" className="gap-2">
          <Bug className="h-4 w-4" />
          Report Issue
        </Button>
      </footer>
    </div>
  );
}
