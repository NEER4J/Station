import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getBatchPromotions } from "@/lib/data/batch-promotions";
import { BatchPromotionsClient } from "./_components/batch-promotions-client";

export default async function BatchPromotionsPage() {
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
  const batchPromotions = stationId
    ? await getBatchPromotions(stationId).catch(() => [])
    : [];

  async function createBatchPromotionAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createBatchPromotion } = await import(
      "@/lib/data/batch-promotions"
    );
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    const { data: p } = await sb
      .from("user_profiles")
      .select("station_id")
      .eq("id", u.id)
      .single();
    if (p?.station_id) {
      await createBatchPromotion(p.station_id, data);
      revalidatePath("/dashboard/batch_promotions");
    }
  }

  async function updateBatchPromotionAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateBatchPromotion } = await import(
      "@/lib/data/batch-promotions"
    );
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    await updateBatchPromotion(id, data);
    revalidatePath("/dashboard/batch_promotions");
  }

  async function deleteBatchPromotionAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteBatchPromotion } = await import(
      "@/lib/data/batch-promotions"
    );
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    await deleteBatchPromotion(id);
    revalidatePath("/dashboard/batch_promotions");
  }

  return (
    <div className="space-y-6">
      <BatchPromotionsClient
        initialData={batchPromotions}
        createAction={createBatchPromotionAction}
        updateAction={updateBatchPromotionAction}
        deleteAction={deleteBatchPromotionAction}
      />
    </div>
  );
}
