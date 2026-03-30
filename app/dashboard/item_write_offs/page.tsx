import { createClient } from "@/lib/supabase/server";
import { getItemWriteOffs } from "@/lib/data/item-write-offs";
import { ItemWriteOffsClient } from "./_components/item-write-offs-client";

export default async function ItemWriteOffsPage() {
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
  const itemWriteOffs = stationId
    ? await getItemWriteOffs(stationId).catch(() => [])
    : [];

  async function createItemWriteOffAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createItemWriteOff } = await import("@/lib/data/item-write-offs");
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

    await createItemWriteOff(p.station_id, data);
    revalidatePath("/dashboard/item_write_offs");
  }

  async function updateItemWriteOffAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateItemWriteOff } = await import("@/lib/data/item-write-offs");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updateItemWriteOff(id, data);
    revalidatePath("/dashboard/item_write_offs");
  }

  async function deleteItemWriteOffAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteItemWriteOff } = await import("@/lib/data/item-write-offs");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deleteItemWriteOff(id);
    revalidatePath("/dashboard/item_write_offs");
  }

  return (
    <ItemWriteOffsClient
      initialData={itemWriteOffs}
      createAction={createItemWriteOffAction}
      updateAction={updateItemWriteOffAction}
      deleteAction={deleteItemWriteOffAction}
    />
  );
}
