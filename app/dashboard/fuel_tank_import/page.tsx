import { createClient } from "@/lib/supabase/server";
import type { ParsedDipRow } from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { FuelTankImportClient } from "./_components/fuel-tank-import-client";

export default async function FuelTankImportPage() {
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

  async function importFuelTankReadingsAction(
    rows: ParsedDipRow[],
  ): Promise<{ inserted: number; skipped: number }> {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { importFuelTankReadings } = await import(
      "@/lib/data/fuel-tank-import"
    );
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

    const result = await importFuelTankReadings(p.station_id, rows);
    revalidatePath("/dashboard/fuel_tank_import");
    return result;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel Tank Import"
        subtitle="Import fuel tank dip readings from Excel"
        backHref="/dashboard"
      />
      <FuelTankImportClient
        stationId={stationId}
        importAction={importFuelTankReadingsAction}
      />
    </div>
  );
}
