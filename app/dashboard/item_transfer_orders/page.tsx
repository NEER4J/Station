import { createClient } from "@/lib/supabase/server";
import { getItemTransferOrders } from "@/lib/data/item-transfer-orders";
import { ItemTransferOrdersClient } from "./_components/item-transfer-orders-client";

export default async function ItemTransferOrdersPage() {
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

  const itemTransferOrders = stationId
    ? await getItemTransferOrders(stationId).catch(() => [])
    : [];

  async function createItemTransferOrderAction(
    formData: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createItemTransferOrder } = await import(
      "@/lib/data/item-transfer-orders"
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

    await createItemTransferOrder(p.station_id, formData);
    revalidatePath("/dashboard/item_transfer_orders");
  }

  async function updateItemTransferOrderAction(
    id: string,
    formData: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateItemTransferOrder } = await import(
      "@/lib/data/item-transfer-orders"
    );
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updateItemTransferOrder(id, formData);
    revalidatePath("/dashboard/item_transfer_orders");
  }

  async function deleteItemTransferOrderAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteItemTransferOrder } = await import(
      "@/lib/data/item-transfer-orders"
    );
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deleteItemTransferOrder(id);
    revalidatePath("/dashboard/item_transfer_orders");
  }

  return (
    <div className="space-y-6">
      <ItemTransferOrdersClient
        initialData={itemTransferOrders}
        createAction={createItemTransferOrderAction}
        updateAction={updateItemTransferOrderAction}
        deleteAction={deleteItemTransferOrderAction}
      />
    </div>
  );
}
