import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/shared/page-header";
import {
  getPriceBookSettings,
  upsertPriceBookSetting,
  deletePriceBookSetting,
} from "@/lib/data/price-book-settings";
import type { PriceBookSetting } from "@/types/database";
import type { PriceBookSettingFormData } from "@/lib/validations/price-book-settings";
import { PriceBookSettingsClient } from "./client";

export default async function PriceBookSettingsPage() {
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
  const settings = stationId
    ? await getPriceBookSettings(stationId).catch(() => [])
    : [];

  async function upsertAction(
    data: PriceBookSettingFormData,
    existingId?: string,
  ) {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { upsertPriceBookSetting: upsert } = await import(
      "@/lib/data/price-book-settings"
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
    await upsert(p.station_id, {
      ...(existingId ? { id: existingId } : {}),
      category: data.category,
      key: data.key,
      value: data.value,
      sort_order: data.sort_order,
    });
    revalidatePath("/dashboard/price_book_settings");
  }

  async function deleteAction(id: string) {
    "use server";
    const { deletePriceBookSetting: del } = await import(
      "@/lib/data/price-book-settings"
    );
    await del(id);
    revalidatePath("/dashboard/price_book_settings");
  }

  // Group settings by category
  const payments = settings.filter((s) => s.category === "payments");
  const hostProductCodes = settings.filter(
    (s) => s.category === "host_product_codes",
  );
  const itemLocations = settings.filter(
    (s) => s.category === "item_locations",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Price Book Settings"
        subtitle="Configure payment methods, host product codes, and item locations"
        backHref="/dashboard"
      />
      <PriceBookSettingsClient
        payments={payments}
        hostProductCodes={hostProductCodes}
        itemLocations={itemLocations}
        upsertAction={upsertAction}
        deleteAction={deleteAction}
      />
    </div>
  );
}
