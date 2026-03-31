import { createClient } from "@/lib/supabase/server";
import type {
  PumpReport,
  RawPumpsJson,
  RawGradeCrind,
  RawProduct,
} from "@/types/database";

// ---------------------------------------------------------------------------
// List reports (without heavy raw_json column)
// ---------------------------------------------------------------------------

export async function getPumpReports(
  stationId: string,
  filters?: { from?: string; to?: string; status?: string },
): Promise<Omit<PumpReport, "raw_json">[]> {
  const supabase = await createClient();
  let query = supabase
    .from("pump_reports")
    .select(
      "id, station_id, business_date, report_number, external_id, status, shift_count, fuel_tax_rate, site_name, site_external_id, pos_type, fuel_sold_dollars, fuel_sold_units, fuel_cost_of_sales, fuel_profit, fuel_margin, fuel_over_short, financial_over_short, financial_additive, financial_subtractive, financial_memo, sections, shifts, issues, deliveries, fuel_tax_labels, imported_by, imported_at, created_at, updated_at",
    )
    .eq("station_id", stationId)
    .order("business_date", { ascending: false });

  if (filters?.from) query = query.gte("business_date", filters.from);
  if (filters?.to) query = query.lte("business_date", filters.to);
  if (filters?.status && filters.status !== "all")
    query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Omit<PumpReport, "raw_json">[];
}

// ---------------------------------------------------------------------------
// Single report with children
// ---------------------------------------------------------------------------

export async function getPumpReport(id: string): Promise<PumpReport | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pump_reports")
    .select("*, pumps:pump_report_pumps(*), grades:pump_report_grades(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as PumpReport | null;
}

// ---------------------------------------------------------------------------
// Import a pumps.json file
// ---------------------------------------------------------------------------

export interface ImportResult {
  reportId: string;
  isNew: boolean;
  gradesMatched: number;
  gradesUnmatched: string[];
  tanksMatched: number;
  tanksUnmatched: string[];
}

export async function importPumpReport(
  stationId: string,
  raw: RawPumpsJson,
  userId: string,
): Promise<ImportResult> {
  const supabase = await createClient();

  // 1. Validate required fields
  if (!raw.business_date) throw new Error("Missing business_date in JSON");
  if (!raw.pumps) throw new Error("Missing pumps array in JSON");
  if (!raw.grades) throw new Error("Missing grades array in JSON");

  const businessDate = raw.business_date;

  // 2. Build grade mapping: code -> fuel_grade_id
  const { data: fuelGrades } = await supabase
    .from("fuel_grades")
    .select("id, code, name")
    .eq("station_id", stationId);

  const gradeByCode = new Map<string, string>();
  const gradeByName = new Map<string, string>();
  for (const g of fuelGrades ?? []) {
    if (g.code) gradeByCode.set(g.code, g.id);
    if (g.name) gradeByName.set(g.name.toUpperCase(), g.id);
  }

  function matchGradeId(externalId?: string, name?: string): string | null {
    if (externalId && gradeByCode.has(externalId)) return gradeByCode.get(externalId)!;
    if (name && gradeByName.has(name.toUpperCase())) return gradeByName.get(name.toUpperCase())!;
    return null;
  }

  // 3. Build tank mapping: fuel_grade_id -> tank_id (first active match)
  const { data: fuelTanks } = await supabase
    .from("fuel_tanks")
    .select("id, tank_number, fuel_grade_id, is_active")
    .eq("station_id", stationId)
    .eq("is_active", true);

  const tankByGradeId = new Map<string, string>();
  for (const t of fuelTanks ?? []) {
    if (t.fuel_grade_id && !tankByGradeId.has(t.fuel_grade_id)) {
      tankByGradeId.set(t.fuel_grade_id, t.id);
    }
  }

  // 4. Check if report already exists
  const { data: existing } = await supabase
    .from("pump_reports")
    .select("id")
    .eq("station_id", stationId)
    .eq("business_date", businessDate)
    .maybeSingle();

  const isNew = !existing;

  // 5. Build sections from raw
  const fuelSummary = raw.fuel ?? {
    sold_dollars: 0,
    sold_units: 0,
    cost_of_sales: 0,
    profit: 0,
    margin: 0,
    over_short: 0,
  };
  const financialTypes = raw.financial?.types ?? {
    summary: { over_short: 0 },
    additive: { amount: 0 },
    subtractive: { amount: 0 },
    memo: { amount: 0 },
  };

  const reportRow = {
    station_id: stationId,
    business_date: businessDate,
    report_number: raw.number ?? null,
    external_id: raw.id != null ? String(raw.id) : null,
    status: raw.status === "closed" ? "closed" : "open",
    shift_count: raw.shifts?.length ?? 0,
    fuel_tax_rate: raw.fuel_tax_rate ?? 0,
    fuel_tax_labels: raw.fuel_tax_labels ?? [],
    site_name: raw.site?.name ?? null,
    site_external_id: raw.site?.external_id ?? null,
    pos_type: raw.site?.pos ?? null,
    raw_json: raw as unknown as Record<string, unknown>,
    fuel_sold_dollars: Number(fuelSummary.sold_dollars) || 0,
    fuel_sold_units: Number(fuelSummary.sold_units) || 0,
    fuel_cost_of_sales: Number(fuelSummary.cost_of_sales) || 0,
    fuel_profit: Number(fuelSummary.profit) || 0,
    fuel_margin: Number(fuelSummary.margin) || 0,
    fuel_over_short: Number(fuelSummary.over_short) || 0,
    financial_over_short: Number(financialTypes.summary.over_short) || 0,
    financial_additive: Number(financialTypes.additive.amount) || 0,
    financial_subtractive: Number(financialTypes.subtractive.amount) || 0,
    financial_memo: Number(financialTypes.memo.amount) || 0,
    sections: raw.sections ?? [],
    shifts: raw.shifts ?? [],
    issues: raw.issues ?? {},
    deliveries: raw.deliveries ?? [],
    imported_by: userId,
    imported_at: new Date().toISOString(),
  };

  // 6. Upsert the master report
  const { data: upserted, error: upsertError } = await supabase
    .from("pump_reports")
    .upsert(reportRow, { onConflict: "station_id,business_date" })
    .select("id")
    .single();
  if (upsertError) throw upsertError;

  const reportId = upserted.id;

  // 7. Delete existing children (for re-import)
  if (!isNew) {
    await supabase
      .from("pump_report_pumps")
      .delete()
      .eq("pump_report_id", reportId);
    await supabase
      .from("pump_report_grades")
      .delete()
      .eq("pump_report_id", reportId);
  }

  // 8. Insert pump meter readings
  if (raw.pumps?.length) {
    const pumpRows = raw.pumps.map((p) => ({
      pump_report_id: reportId,
      pump_number: p.pump_number,
      hose_number: p.hose_number,
      grade_name: p.grade_name,
      grade_external_id: p.grade_id ?? null,
      fuel_grade_id: matchGradeId(p.grade_id, p.grade_name),
      meter_dollars: Number(p.meter_dollars) || 0,
      meter_units: Number(p.meter_units) || 0,
      previous_meter_dollars: Number(p.previous_meter_dollars) || 0,
      previous_meter_units: Number(p.previous_meter_units) || 0,
      meter_change_dollars: Number(p.meter_change_dollars) || 0,
      meter_change_units: Number(p.meter_change_units) || 0,
      sold_dollars: Number(p.sold_dollars) || 0,
      sold_units: Number(p.sold_units) || 0,
    }));

    const { error: pumpErr } = await supabase
      .from("pump_report_pumps")
      .insert(pumpRows);
    if (pumpErr) throw pumpErr;
  }

  // 9. Insert grade rows (merge grades + grades_crind + products by external_id)
  const crindMap = new Map<string, RawGradeCrind>();
  for (const c of raw.grades_crind ?? []) {
    crindMap.set(c.external_id, c);
  }
  const productMap = new Map<string, RawProduct>();
  for (const p of raw.products ?? []) {
    productMap.set(p.external_id, p);
  }

  const gradesUnmatched: string[] = [];
  let gradesMatched = 0;

  if (raw.grades?.length) {
    const gradeRows = raw.grades.map((g) => {
      const crind = crindMap.get(g.external_id);
      const prod = productMap.get(g.external_id);
      const fuelGradeId = matchGradeId(g.external_id, g.name);

      if (fuelGradeId) {
        gradesMatched++;
      } else {
        gradesUnmatched.push(g.name);
      }

      return {
        pump_report_id: reportId,
        fuel_grade_id: fuelGradeId,
        external_id: g.external_id,
        name: g.name,
        service_level: g.service_level ?? null,
        sold_units: Number(g.sold_units) || 0,
        sold_dollars: Number(g.sold_dollars) || 0,
        average_price: Number(g.average_price) || 0,
        actual_price: Number(g.actual_price) || 0,
        average_cost: Number(g.average_cost) || 0,
        cost_of_sales: Number(g.cost_of_sales) || 0,
        profit: Number(g.profit) || 0,
        profit_percentage: Number(g.profit_percentage) || 0,
        margin: Number(g.margin) || 0,
        blended: g.blended ?? false,
        blend: g.blend ?? null,
        commission: Number(g.commission) || 0,
        // CRIND
        sold_units_crind: Number(crind?.sold_units_crind) || 0,
        sold_dollars_crind: Number(crind?.sold_dollars_crind) || 0,
        sold_units_kiosk: Number(crind?.sold_units_kiosk) || 0,
        sold_dollars_kiosk: Number(crind?.sold_dollars_kiosk) || 0,
        tax_one_crind: Number(crind?.tax_one_crind) || 0,
        tax_two_crind: Number(crind?.tax_two_crind) || 0,
        tax_one: Number(crind?.tax_one) || 0,
        tax_two: Number(crind?.tax_two) || 0,
        // Product inventory
        product_opening: Number(prod?.opening) || 0,
        product_closing: Number(prod?.closing) || 0,
        product_deliveries: Number(prod?.deliveries) || 0,
        dispensed_tanks: Number(prod?.dispensed_tanks) || 0,
        dispensed_meters: Number(prod?.dispensed_meters) || 0,
        dispensed_units_to_date: Number(prod?.dispensed_units_to_date) || 0,
        over_short: Number(prod?.over_short) || 0,
        over_short_carry_forward: Number(prod?.over_short_carry_forward) || 0,
        inventory_avg_cost: Number(prod?.average_cost) || 0,
        opening_avg_cost: Number(prod?.opening_average_cost) || 0,
        value_of_inventory: Number(prod?.value_of_inventory) || 0,
      };
    });

    const { error: gradeErr } = await supabase
      .from("pump_report_grades")
      .insert(gradeRows);
    if (gradeErr) throw gradeErr;
  }

  // 10. Cross-populate: fuel_sales_summary
  for (const g of raw.grades ?? []) {
    const fuelGradeId = matchGradeId(g.external_id, g.name);
    if (!fuelGradeId) continue;

    await supabase.from("fuel_sales_summary").upsert(
      {
        station_id: stationId,
        fuel_grade_id: fuelGradeId,
        summary_date: businessDate,
        dollars_sold: Number(g.sold_dollars) || 0,
        units_sold: Number(g.sold_units) || 0,
        avg_price: Number(g.average_price) || 0,
        avg_margin: Number(g.margin) || 0,
        gross_profit: Number(g.profit) || 0,
      },
      { onConflict: "station_id,fuel_grade_id,summary_date" },
    );
  }

  // 11. Cross-populate: fuel_tank_readings
  // Delete old import-source readings for this date first
  const dateStart = `${businessDate}T00:00:00`;
  const dateEnd = `${businessDate}T23:59:59`;

  const tanksUnmatched: string[] = [];
  let tanksMatched = 0;

  for (const tank of raw.tanks ?? []) {
    const gradeId = matchGradeId(tank.product_id ?? tank.external_id);
    if (!gradeId) {
      tanksUnmatched.push(tank.product_name);
      continue;
    }
    const tankId = tankByGradeId.get(gradeId);
    if (!tankId) {
      tanksUnmatched.push(tank.product_name);
      continue;
    }

    tanksMatched++;

    // Delete existing import readings for this tank on this date
    await supabase
      .from("fuel_tank_readings")
      .delete()
      .eq("tank_id", tankId)
      .eq("source", "import")
      .gte("reading_at", dateStart)
      .lte("reading_at", dateEnd);

    // Insert new reading
    await supabase.from("fuel_tank_readings").insert({
      tank_id: tankId,
      volume_litres: Number(tank.units) || 0,
      temperature_c: null,
      water_level_mm: Number(tank.water) || null,
      reading_at: `${businessDate}T23:59:59`,
      source: "import",
    });
  }

  // 12. Cross-populate: daily_reconciliations
  const sectionAmounts: Record<string, number> = {};
  for (const s of raw.sections ?? []) {
    sectionAmounts[s.name.toLowerCase()] = Number(s.amount) || 0;
  }

  await supabase.from("daily_reconciliations").upsert(
    {
      station_id: stationId,
      report_date: businessDate,
      shift_count: raw.shifts?.length ?? 0,
      status: "pending",
      fuel_volume: Number(fuelSummary.sold_units) || 0,
      fuel_sales: sectionAmounts["fuel sales"] ?? (Number(fuelSummary.sold_dollars) || 0),
      store_sales: sectionAmounts["sales"] ?? 0,
      other_sales: sectionAmounts["other sales"] ?? 0,
      taxes: sectionAmounts["taxes"] ?? 0,
      non_cash_tender: sectionAmounts["non-cash tender"] ?? 0,
      deposits: sectionAmounts["deposits"] ?? 0,
      payouts: sectionAmounts["payouts"] ?? 0,
      over_short_volume: Number(fuelSummary.over_short) || 0,
      over_short_dollars: Number(financialTypes.summary.over_short) || 0,
    },
    { onConflict: "station_id,report_date" },
  );

  return {
    reportId,
    isNew,
    gradesMatched,
    gradesUnmatched,
    tanksMatched,
    tanksUnmatched,
  };
}

// ---------------------------------------------------------------------------
// Delete a pump report
// ---------------------------------------------------------------------------

export async function deletePumpReport(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("pump_reports").delete().eq("id", id);
  if (error) throw error;
}
