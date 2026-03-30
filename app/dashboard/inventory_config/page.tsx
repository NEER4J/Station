import { createClient } from "@/lib/supabase/server";
import { getInventoryConfig } from "@/lib/data/inventory-config";
import { InventoryConfigClient } from "./_components/inventory-config-client";

export default async function InventoryConfigPage() {
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

  const config = stationId
    ? await getInventoryConfig(stationId).catch(() => null)
    : null;

  async function saveInventoryConfigAction(settings: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { upsertInventoryConfig } = await import(
      "@/lib/data/inventory-config"
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

    await upsertInventoryConfig(p.station_id, settings);
    revalidatePath("/dashboard/inventory_config");
  }

  return (
    <div className="space-y-6">
      <InventoryConfigClient
        config={config}
        saveAction={saveInventoryConfigAction}
      />
    </div>
  );
}
