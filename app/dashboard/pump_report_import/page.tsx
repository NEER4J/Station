import { createClient } from "@/lib/supabase/server";
import type { RawPumpsJson, PumpReport } from "@/types/database";
import type { ImportResult } from "@/lib/data/pump-reports";
import { PageHeader } from "@/components/shared/page-header";
import { PumpReportImportClient } from "./_components/pump-report-import-client";

export default async function PumpReportImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("station_id")
    .eq("id", user?.id ?? "")
    .single();

  const stationId = profile?.station_id ?? "";

  // Fetch existing reports for duplicate detection & listing
  let existingReports: Omit<PumpReport, "raw_json">[] = [];
  if (stationId) {
    const { getPumpReports } = await import("@/lib/data/pump-reports");
    existingReports = await getPumpReports(stationId).catch(() => []);
  }

  async function importPumpReportAction(
    rawJson: RawPumpsJson,
  ): Promise<ImportResult> {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { importPumpReport } = await import("@/lib/data/pump-reports");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    const { data: p } = await sb
      .from("user_profiles")
      .select("station_id")
      .eq("id", u.id)
      .single();

    if (!p?.station_id) throw new Error("No station assigned");

    const result = await importPumpReport(p.station_id, rawJson, u.id);
    revalidatePath("/dashboard/pump_report_import");
    revalidatePath("/dashboard/daily_reconciliations");
    revalidatePath("/dashboard");
    return result;
  }

  async function deletePumpReportAction(id: string): Promise<void> {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deletePumpReport } = await import("@/lib/data/pump-reports");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deletePumpReport(id);
    revalidatePath("/dashboard/pump_report_import");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pump Report Import"
        subtitle="Import daily pump reports from Bulloch POS (JSON format)"
        backHref="/dashboard"
      />
      <PumpReportImportClient
        existingReports={existingReports}
        importAction={importPumpReportAction}
        deleteAction={deletePumpReportAction}
      />
    </div>
  );
}
