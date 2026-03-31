import { createClient } from "@/lib/supabase/server";
import type {
  BT9000Department,
  BT9000PriceGroup,
  BT9000Item,
  BT9000DealGroup,
  BT9000Payout,
  BT9000TenderCoupon,
  BT9000Import,
} from "@/types/database";

// ---------------------------------------------------------------------------
// Import Departments
// ---------------------------------------------------------------------------

export async function importBT9000Departments(
  stationId: string,
  departments: BT9000Department[],
): Promise<Record<string, string>> {
  const supabase = await createClient();
  const departmentMap: Record<string, string> = {};

  for (const dept of departments) {
    const row = {
      station_id: stationId,
      external_id: dept.departmentNumber,
      name: dept.description.trim(),
      pcats_code: dept.conexxusProductCode || null,
      include_in_shift_report: dept.shiftReportFlag,
      include_in_sales_report: dept.salesSummaryReport,
      loyalty_eligible: dept.loyaltyCardEligible,
    };

    const { data, error } = await supabase
      .from("departments")
      .upsert(row, { onConflict: "station_id,external_id" })
      .select("id")
      .single();

    if (error) {
      // If name conflict, try with external_id appended
      const rowWithId = { ...row, name: `${row.name} (${dept.departmentNumber})` };
      const { data: d2, error: e2 } = await supabase
        .from("departments")
        .upsert(rowWithId, { onConflict: "station_id,external_id" })
        .select("id")
        .single();
      if (e2) throw e2;
      departmentMap[dept.departmentNumber] = d2.id;
    } else {
      departmentMap[dept.departmentNumber] = data.id;
    }
  }

  return departmentMap;
}

// ---------------------------------------------------------------------------
// Import Price Groups
// ---------------------------------------------------------------------------

export async function importBT9000PriceGroups(
  stationId: string,
  priceGroups: BT9000PriceGroup[],
): Promise<Record<string, string>> {
  const supabase = await createClient();
  const priceGroupMap: Record<string, string> = {};

  const rows = priceGroups.map((pg) => ({
    station_id: stationId,
    external_id: pg.priceGroupNumber,
    description: pg.englishDescription.trim(),
    french_description: pg.frenchDescription.trim(),
    unit_price: pg.price,
    quantity_pricing: pg.quantityPricing || null,
  }));

  // Upsert in small batches
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { data, error } = await supabase
      .from("price_groups")
      .upsert(batch, { onConflict: "station_id,external_id" })
      .select("id, external_id");
    if (error) throw error;
    for (const pg of data ?? []) {
      if (pg.external_id) priceGroupMap[pg.external_id] = pg.id;
    }
  }

  return priceGroupMap;
}

// ---------------------------------------------------------------------------
// Import Items (batch of up to 500)
// ---------------------------------------------------------------------------

export async function importBT9000Items(
  stationId: string,
  items: BT9000Item[],
  departmentMap: Record<string, string>,
  priceGroupMap: Record<string, string>,
): Promise<number> {
  const supabase = await createClient();
  let count = 0;

  const rows = items.map((item) => {
    const taxCodes: string[] = [];
    if (item.tax1) taxCodes.push("TAX1");
    if (item.tax2) taxCodes.push("TAX2");

    return {
      station_id: stationId,
      external_id: item.itemNumber,
      plu: item.itemNumber,
      upc: item.upcs.length > 0 ? item.upcs[0] : null,
      description: item.englishDescription.trim(),
      french_description: item.frenchDescription.trim(),
      department_id: departmentMap[item.department] || null,
      retail_price: item.price,
      bottle_deposit: item.itemDeposit || 0,
      tax_codes: taxCodes,
      age_restriction: item.ageRequirements,
      loyalty_eligible: item.loyaltyCardEligible,
      conexxus_product_code: item.conexxusProductCode,
      quantity_pricing: item.quantityPricing || null,
    };
  });

  // Upsert items in batches of 100
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { data, error } = await supabase
      .from("items")
      .upsert(batch, { onConflict: "station_id,external_id" })
      .select("id, external_id, upc");
    if (error) throw error;

    const upsertedItems = data ?? [];
    count += upsertedItems.length;

    // Build item external_id -> id map for UPCs and price group linking
    const itemIdMap = new Map<string, string>();
    for (const item of upsertedItems) {
      if (item.external_id) itemIdMap.set(item.external_id, item.id);
    }

    // Insert UPCs for this batch
    const upcRows: { item_id: string; upc: string; is_primary: boolean }[] = [];
    for (const item of items.slice(i, i + 100)) {
      const itemId = itemIdMap.get(item.itemNumber);
      if (!itemId) continue;
      for (let u = 0; u < item.upcs.length; u++) {
        upcRows.push({
          item_id: itemId,
          upc: item.upcs[u],
          is_primary: u === 0,
        });
      }
    }

    if (upcRows.length > 0) {
      // Delete existing UPCs for these items first
      const itemIds = [...new Set(upcRows.map((r) => r.item_id))];
      for (const id of itemIds) {
        await supabase.from("item_upcs").delete().eq("item_id", id);
      }
      await supabase.from("item_upcs").insert(upcRows);
    }

    // Link price groups for items in this batch
    const pgRows: { price_group_id: string; item_id: string }[] = [];
    for (const item of items.slice(i, i + 100)) {
      if (!item.priceGroup) continue;
      const itemId = itemIdMap.get(item.itemNumber);
      const pgId = priceGroupMap[item.priceGroup];
      if (itemId && pgId) {
        pgRows.push({ price_group_id: pgId, item_id: itemId });
      }
    }

    if (pgRows.length > 0) {
      // Delete existing price group links for these items
      for (const row of pgRows) {
        await supabase
          .from("price_group_items")
          .delete()
          .eq("item_id", row.item_id);
      }
      await supabase.from("price_group_items").insert(pgRows);
    }
  }

  return count;
}

// ---------------------------------------------------------------------------
// Import Deal Groups
// ---------------------------------------------------------------------------

export async function importBT9000DealGroups(
  stationId: string,
  dealGroups: BT9000DealGroup[],
): Promise<number> {
  const supabase = await createClient();

  for (const dg of dealGroups) {
    const fuelConfig: Record<string, unknown> = {};
    if (dg.requiresFuel) fuelConfig.requires_fuel = dg.requiresFuel;
    if (dg.cplFuelDiscounting) fuelConfig.cpl_fuel_discounting = dg.cplFuelDiscounting;

    const row = {
      station_id: stationId,
      external_id: dg.dealGroupNumber,
      name: dg.englishDescription.trim(),
      french_description: dg.frenchDescription.trim(),
      fuel_deal_config: Object.keys(fuelConfig).length > 0 ? fuelConfig : null,
    };

    const { data, error } = await supabase
      .from("deal_groups")
      .upsert(row, { onConflict: "station_id,external_id" })
      .select("id")
      .single();
    if (error) throw error;

    const dealGroupId = data.id;

    // Delete existing components and reinsert
    await supabase
      .from("deal_group_components")
      .delete()
      .eq("deal_group_id", dealGroupId);

    if (dg.components.length > 0) {
      const componentRows = dg.components.map((c) => ({
        deal_group_id: dealGroupId,
        description: c.item
          ? `Item ${c.item}`
          : c.priceGroup
            ? `Price Group ${c.priceGroup}`
            : "Component",
        component_type: c.item ? "item" : c.priceGroup ? "price_group" : null,
        amount: c.priceForQuantityOne,
      }));

      const { error: compErr } = await supabase
        .from("deal_group_components")
        .insert(componentRows);
      if (compErr) throw compErr;
    }
  }

  return dealGroups.length;
}

// ---------------------------------------------------------------------------
// Import Payouts
// ---------------------------------------------------------------------------

export async function importBT9000Payouts(
  stationId: string,
  payouts: BT9000Payout[],
): Promise<number> {
  const supabase = await createClient();

  const rows = payouts.map((p, i) => ({
    station_id: stationId,
    external_id: p.payoutNumber,
    description: p.englishDescription.trim(),
    french_description: p.frenchDescription.trim(),
    sort_order: i,
  }));

  const { error } = await supabase
    .from("payouts")
    .upsert(rows, { onConflict: "station_id,external_id" });
  if (error) throw error;

  return payouts.length;
}

// ---------------------------------------------------------------------------
// Import Tender Coupons
// ---------------------------------------------------------------------------

export async function importBT9000TenderCoupons(
  stationId: string,
  tenderCoupons: BT9000TenderCoupon[],
): Promise<number> {
  const supabase = await createClient();

  const rows = tenderCoupons.map((tc) => ({
    station_id: stationId,
    external_id: tc.itemNumber,
    description: tc.englishDescription.trim(),
    french_description: tc.frenchDescription.trim(),
    type_of_discount: "fixed" as const,
    amount: 0,
    prompt_for_amount: true,
  }));

  const { error } = await supabase
    .from("tender_coupons")
    .upsert(rows, { onConflict: "station_id,external_id" });
  if (error) throw error;

  return tenderCoupons.length;
}

// ---------------------------------------------------------------------------
// Import History
// ---------------------------------------------------------------------------

export async function createBT9000Import(
  stationId: string,
  data: Partial<BT9000Import> & { file_name: string },
  userId: string,
): Promise<string> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("bt9000_imports")
    .insert({
      ...data,
      station_id: stationId,
      imported_by: userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return result.id;
}

export async function updateBT9000Import(
  id: string,
  data: Partial<BT9000Import>,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bt9000_imports")
    .update(data)
    .eq("id", id);
  if (error) throw error;
}

export async function getBT9000Imports(
  stationId: string,
): Promise<BT9000Import[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bt9000_imports")
    .select("*")
    .eq("station_id", stationId)
    .order("imported_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BT9000Import[];
}

export async function deleteBT9000Import(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bt9000_imports")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
