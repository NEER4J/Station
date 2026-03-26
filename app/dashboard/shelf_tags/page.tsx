import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/shared/page-header";
import {
  getShelfTags,
  deleteShelfTag,
  clearAllShelfTags,
} from "@/lib/data/shelf-tags";
import { ShelfTagsClient } from "./client";

export default async function ShelfTagsPage() {
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
  const shelfTags = stationId
    ? await getShelfTags(stationId).catch(() => [])
    : [];

  async function updateShelfTagAction(id: string, unitOrOrder: string) {
    "use server";
    const { updateShelfTag: update } = await import("@/lib/data/shelf-tags");
    await update(id, unitOrOrder);
    revalidatePath("/dashboard/shelf_tags");
  }

  async function deleteShelfTagAction(id: string) {
    "use server";
    const { deleteShelfTag: del } = await import("@/lib/data/shelf-tags");
    await del(id);
    revalidatePath("/dashboard/shelf_tags");
  }

  async function clearAllAction() {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { clearAllShelfTags: clear } = await import(
      "@/lib/data/shelf-tags"
    );
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
    await clear(p.station_id);
    revalidatePath("/dashboard/shelf_tags");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shelf Tags"
        subtitle={`${shelfTags.length} shelf tags queued`}
        backHref="/dashboard"
      />
      <ShelfTagsClient
        data={shelfTags}
        updateAction={updateShelfTagAction}
        deleteAction={deleteShelfTagAction}
        clearAllAction={clearAllAction}
      />
    </div>
  );
}
