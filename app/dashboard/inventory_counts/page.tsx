import { createClient } from "@/lib/supabase/server";
import { getInventoryCounts } from "@/lib/data/inventory-counts";
import { InventoryCountsClient } from "./_components/inventory-counts-client";

export default async function InventoryCountsPage() {
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

  const inventoryCounts = stationId
    ? await getInventoryCounts(stationId).catch(() => [])
    : [];

  async function createInventoryCountAction(
    formData: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createInventoryCount } = await import(
      "@/lib/data/inventory-counts"
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

    if (!p?.station_id) return;

    await createInventoryCount(p.station_id, formData);
    revalidatePath("/dashboard/inventory_counts");
  }

  async function updateInventoryCountAction(
    id: string,
    formData: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateInventoryCount } = await import(
      "@/lib/data/inventory-counts"
    );
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updateInventoryCount(id, formData);
    revalidatePath("/dashboard/inventory_counts");
  }

  async function deleteInventoryCountAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteInventoryCount } = await import(
      "@/lib/data/inventory-counts"
    );
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deleteInventoryCount(id);
    revalidatePath("/dashboard/inventory_counts");
  }

  return (
    <div className="space-y-6">
      <InventoryCountsClient
        initialData={inventoryCounts}
        createAction={createInventoryCountAction}
        updateAction={updateInventoryCountAction}
        deleteAction={deleteInventoryCountAction}
      />
    </div>
  );
}
