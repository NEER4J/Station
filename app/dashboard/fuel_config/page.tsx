import { createClient } from "@/lib/supabase/server";
import { getFuelGrades, getFuelTanks } from "@/lib/data/fuel-config";
import { PageHeader } from "@/components/shared/page-header";
import { FuelGradesPanel } from "./_components/fuel-grades-panel";
import { FuelTanksPanel } from "./_components/fuel-tanks-panel";

export default async function FuelConfigPage() {
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

  const [fuelGrades, fuelTanks] = await Promise.all([
    stationId ? getFuelGrades(stationId).catch(() => []) : Promise.resolve([]),
    stationId ? getFuelTanks(stationId).catch(() => []) : Promise.resolve([]),
  ]);

  async function createFuelGradeAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createFuelGrade } = await import("@/lib/data/fuel-config");
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

    if (!p?.station_id) return;
    await createFuelGrade(p.station_id, data);
    revalidatePath("/dashboard/fuel_config");
  }

  async function updateFuelGradeAction(id: string, data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateFuelGrade } = await import("@/lib/data/fuel-config");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updateFuelGrade(id, data);
    revalidatePath("/dashboard/fuel_config");
  }

  async function deleteFuelGradeAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteFuelGrade } = await import("@/lib/data/fuel-config");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deleteFuelGrade(id);
    revalidatePath("/dashboard/fuel_config");
  }

  async function createFuelTankAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createFuelTank } = await import("@/lib/data/fuel-config");
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

    if (!p?.station_id) return;
    await createFuelTank(p.station_id, data);
    revalidatePath("/dashboard/fuel_config");
  }

  async function updateFuelTankAction(id: string, data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateFuelTank } = await import("@/lib/data/fuel-config");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updateFuelTank(id, data);
    revalidatePath("/dashboard/fuel_config");
  }

  async function deleteFuelTankAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteFuelTank } = await import("@/lib/data/fuel-config");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deleteFuelTank(id);
    revalidatePath("/dashboard/fuel_config");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel Configuration"
        subtitle="Manage fuel products and tank configuration"
        backHref="/dashboard"
      />
      <FuelGradesPanel
        initialData={fuelGrades}
        createAction={createFuelGradeAction}
        updateAction={updateFuelGradeAction}
        deleteAction={deleteFuelGradeAction}
      />
      <FuelTanksPanel
        initialData={fuelTanks}
        fuelGrades={fuelGrades}
        createAction={createFuelTankAction}
        updateAction={updateFuelTankAction}
        deleteAction={deleteFuelTankAction}
      />
    </div>
  );
}
