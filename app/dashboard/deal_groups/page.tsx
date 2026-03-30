import { createClient } from "@/lib/supabase/server";
import { getDealGroups } from "@/lib/data/deal-groups";
import { DealGroupsClient } from "./_components/deal-groups-client";

export default async function DealGroupsPage() {
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

  const dealGroups = stationId
    ? await getDealGroups(stationId).catch(() => [])
    : [];

  async function createDealGroupAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createDealGroup } = await import("@/lib/data/deal-groups");
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

    await createDealGroup(p.station_id, data);
    revalidatePath("/dashboard/deal_groups");
  }

  async function updateDealGroupAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { updateDealGroup } = await import("@/lib/data/deal-groups");
    const { revalidatePath } = await import("next/cache");

    await updateDealGroup(id, data);
    revalidatePath("/dashboard/deal_groups");
  }

  async function deleteDealGroupAction(id: string) {
    "use server";
    const { deleteDealGroup } = await import("@/lib/data/deal-groups");
    const { revalidatePath } = await import("next/cache");

    await deleteDealGroup(id);
    revalidatePath("/dashboard/deal_groups");
  }

  return (
    <div className="space-y-6">
      <DealGroupsClient
        initialData={dealGroups}
        createAction={createDealGroupAction}
        updateAction={updateDealGroupAction}
        deleteAction={deleteDealGroupAction}
      />
    </div>
  );
}
