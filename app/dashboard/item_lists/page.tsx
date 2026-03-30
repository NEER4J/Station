import { createClient } from "@/lib/supabase/server";
import { getItemLists } from "@/lib/data/item-lists";
import { ItemListsClient } from "./_components/item-lists-client";

export default async function ItemListsPage() {
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

  const itemLists = stationId
    ? await getItemLists(stationId).catch(() => [])
    : [];

  async function createItemListAction(formData: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createItemList } = await import("@/lib/data/item-lists");
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

    await createItemList(p.station_id, formData);
    revalidatePath("/dashboard/item_lists");
  }

  async function updateItemListAction(
    id: string,
    formData: Record<string, unknown>,
  ) {
    "use server";
    const { updateItemList } = await import("@/lib/data/item-lists");
    const { revalidatePath } = await import("next/cache");

    await updateItemList(id, formData);
    revalidatePath("/dashboard/item_lists");
  }

  async function deleteItemListAction(id: string) {
    "use server";
    const { deleteItemList } = await import("@/lib/data/item-lists");
    const { revalidatePath } = await import("next/cache");

    await deleteItemList(id);
    revalidatePath("/dashboard/item_lists");
  }

  return (
    <div className="space-y-6">
      <ItemListsClient
        initialData={itemLists}
        createAction={createItemListAction}
        updateAction={updateItemListAction}
        deleteAction={deleteItemListAction}
      />
    </div>
  );
}
