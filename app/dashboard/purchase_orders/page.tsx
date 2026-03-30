import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getPurchaseOrders } from "@/lib/data/purchase-orders";
import { getSuppliers } from "@/lib/data/suppliers";
import { PurchaseOrdersClient } from "./_components/purchase-orders-client";

export default async function PurchaseOrdersPage() {
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

  const [purchaseOrders, suppliers] = await Promise.all([
    stationId ? getPurchaseOrders(stationId).catch(() => []) : [],
    stationId ? getSuppliers(stationId).catch(() => []) : [],
  ]);

  async function createPurchaseOrderAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createPurchaseOrder } = await import(
      "@/lib/data/purchase-orders"
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

    await createPurchaseOrder(p.station_id, data);
    revalidate("/dashboard/purchase_orders");
  }

  async function updatePurchaseOrderAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updatePurchaseOrder } = await import(
      "@/lib/data/purchase-orders"
    );
    const { revalidatePath: revalidate } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updatePurchaseOrder(id, data);
    revalidate("/dashboard/purchase_orders");
  }

  async function deletePurchaseOrderAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deletePurchaseOrder } = await import(
      "@/lib/data/purchase-orders"
    );
    const { revalidatePath: revalidate } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deletePurchaseOrder(id);
    revalidate("/dashboard/purchase_orders");
  }

  return (
    <PurchaseOrdersClient
      initialData={purchaseOrders}
      suppliers={suppliers}
      createAction={createPurchaseOrderAction}
      updateAction={updatePurchaseOrderAction}
      deleteAction={deletePurchaseOrderAction}
    />
  );
}
