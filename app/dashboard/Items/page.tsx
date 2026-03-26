import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/shared/page-header";
import { getItems, createItem, updateItem, deleteItem } from "@/lib/data/items";
import { getDepartments } from "@/lib/data/departments";
import { getSubdepartments } from "@/lib/data/subdepartments";
import { getSuppliers } from "@/lib/data/suppliers";
import type { Item } from "@/types/database";
import type { ItemFormData } from "@/lib/validations/items";
import { ItemsClient } from "./client";

export default async function ItemsPage() {
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

  const [itemsResult, departments, subdepartments, suppliers] = stationId
    ? await Promise.all([
        getItems(stationId, { page: 1, pageSize: 25 }).catch(() => ({ data: [], count: 0 })),
        getDepartments(stationId).catch(() => []),
        getSubdepartments(stationId).catch(() => []),
        getSuppliers(stationId).catch(() => []),
      ])
    : [{ data: [], count: 0 }, [], [], []];

  async function createItemAction(data: ItemFormData) {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { createItem: create } = await import("@/lib/data/items");
    const sb = await sc();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    const { data: p } = await sb
      .from("user_profiles")
      .select("station_id")
      .eq("id", u.id)
      .single();
    if (!p?.station_id) return;
    await create(p.station_id, data);
    revalidatePath("/dashboard/Items");
  }

  async function updateItemAction(id: string, data: ItemFormData) {
    "use server";
    const { updateItem: upd } = await import("@/lib/data/items");
    await upd(id, data);
    revalidatePath("/dashboard/Items");
  }

  async function deleteItemAction(id: string) {
    "use server";
    const { deleteItem: del } = await import("@/lib/data/items");
    await del(id);
    revalidatePath("/dashboard/Items");
  }

  async function fetchItemsAction(opts: {
    page: number;
    pageSize: number;
    search?: string;
    departmentId?: string;
    supplierId?: string;
    status?: string;
  }): Promise<{ data: Item[]; count: number }> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { getItems: get } = await import("@/lib/data/items");
    const sb = await sc();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return { data: [], count: 0 };
    const { data: p } = await sb
      .from("user_profiles")
      .select("station_id")
      .eq("id", u.id)
      .single();
    if (!p?.station_id) return { data: [], count: 0 };
    return get(p.station_id, opts);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Items"
        subtitle={`${itemsResult.count} Total Items`}
        backHref="/dashboard"
      />
      <ItemsClient
        initialData={itemsResult.data}
        initialCount={itemsResult.count}
        departments={departments}
        subdepartments={subdepartments}
        suppliers={suppliers}
        createItemAction={createItemAction}
        updateItemAction={updateItemAction}
        deleteItemAction={deleteItemAction}
        fetchItemsAction={fetchItemsAction}
      />
    </div>
  );
}
