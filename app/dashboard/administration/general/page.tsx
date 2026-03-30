import { createClient } from "@/lib/supabase/server";
import { getTaxes } from "@/lib/data/taxes";
import { getAdminOptions } from "@/lib/data/admin-options";
import { PageHeader } from "@/components/shared/page-header";
import { GeneralAdminClient } from "./_components/general-admin-client";
import type { Station } from "@/types/database";

export default async function GeneralAdministrationPage() {
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

  const [stationResult, taxes, adminOptions] = await Promise.all([
    Promise.resolve(
      supabase
        .from("stations")
        .select("*")
        .eq("id", stationId)
        .single(),
    )
      .then(({ data }) => (data ?? null) as Station | null)
      .catch(() => null),
    getTaxes(stationId).catch(() => []),
    getAdminOptions(stationId).catch(() => []),
  ]);

  async function updateStationAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { revalidatePath: revalidate } = await import("next/cache");

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

    const { error } = await sb
      .from("stations")
      .update(data)
      .eq("id", p.station_id);

    if (error) throw error;
    revalidate("/dashboard/administration/general");
  }

  async function createTaxAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createTax } = await import("@/lib/data/taxes");
    const { revalidatePath: revalidate } = await import("next/cache");

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

    await createTax(p.station_id, data);
    revalidate("/dashboard/administration/general");
  }

  async function updateTaxAction(id: string, data: Record<string, unknown>) {
    "use server";
    const { updateTax } = await import("@/lib/data/taxes");
    const { revalidatePath: revalidate } = await import("next/cache");

    await updateTax(id, data);
    revalidate("/dashboard/administration/general");
  }

  async function deleteTaxAction(id: string) {
    "use server";
    const { deleteTax } = await import("@/lib/data/taxes");
    const { revalidatePath: revalidate } = await import("next/cache");

    await deleteTax(id);
    revalidate("/dashboard/administration/general");
  }

  async function upsertOptionAction(key: string, value: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { upsertAdminOption } = await import("@/lib/data/admin-options");
    const { revalidatePath: revalidate } = await import("next/cache");

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

    await upsertAdminOption(p.station_id, key, value);
    revalidate("/dashboard/administration/general");
  }

  async function deleteOptionAction(id: string) {
    "use server";
    const { deleteAdminOption } = await import("@/lib/data/admin-options");
    const { revalidatePath: revalidate } = await import("next/cache");

    await deleteAdminOption(id);
    revalidate("/dashboard/administration/general");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Administration"
        subtitle="Manage station configuration, taxes and system options"
        backHref="/dashboard"
      />
      <GeneralAdminClient
        station={stationResult}
        taxes={taxes}
        adminOptions={adminOptions}
        updateStationAction={updateStationAction}
        createTaxAction={createTaxAction}
        updateTaxAction={updateTaxAction}
        deleteTaxAction={deleteTaxAction}
        upsertOptionAction={upsertOptionAction}
        deleteOptionAction={deleteOptionAction}
      />
    </div>
  );
}
