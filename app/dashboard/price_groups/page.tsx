import { createClient } from "@/lib/supabase/server";
import { getPriceGroups } from "@/lib/data/price-groups";
import { PriceGroupsClient } from "./_components/price-groups-client";

export default async function PriceGroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("station_id")
    .eq("id", user?.id ?? "")
    .single();

  const stationId = profile?.station_id;

  const priceGroups = stationId
    ? await getPriceGroups(stationId).catch(() => [])
    : [];

  async function createPriceGroupAction(formData: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createPriceGroup } = await import("@/lib/data/price-groups");
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

    await createPriceGroup(p.station_id, formData);
    revalidatePath("/dashboard/price_groups");
  }

  async function updatePriceGroupAction(
    id: string,
    formData: Record<string, unknown>,
  ) {
    "use server";
    const { updatePriceGroup } = await import("@/lib/data/price-groups");
    const { revalidatePath } = await import("next/cache");

    await updatePriceGroup(id, formData);
    revalidatePath("/dashboard/price_groups");
  }

  async function deletePriceGroupAction(id: string) {
    "use server";
    const { deletePriceGroup } = await import("@/lib/data/price-groups");
    const { revalidatePath } = await import("next/cache");

    await deletePriceGroup(id);
    revalidatePath("/dashboard/price_groups");
  }

  return (
    <div className="space-y-6">
      <PriceGroupsClient
        initialData={priceGroups}
        createAction={createPriceGroupAction}
        updateAction={updatePriceGroupAction}
        deleteAction={deletePriceGroupAction}
      />
    </div>
  );
}
