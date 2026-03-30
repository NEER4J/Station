import { createClient } from "@/lib/supabase/server";
import type { IncomeStatementEntry, IncomeStatementRow } from "@/types/database";

// ── Fetch stored entries ──────────────────────────────────────────────────────

export async function getIncomeStatementEntries(
  stationId: string,
  year: number,
): Promise<IncomeStatementEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("income_statement_entries")
    .select("*")
    .eq("station_id", stationId)
    .eq("fiscal_year", year)
    .order("section")
    .order("sort_order")
    .order("line_item");
  if (error) throw error;
  return data ?? [];
}

// ── Upsert a single line item ─────────────────────────────────────────────────

export async function upsertIncomeStatementEntry(
  stationId: string,
  year: number,
  entry: {
    month: number;
    section: string;
    line_item: string;
    sort_order?: number;
    amount: number;
    is_override?: boolean;
  },
): Promise<IncomeStatementEntry> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("income_statement_entries")
    .upsert(
      {
        station_id: stationId,
        fiscal_year: year,
        month: entry.month,
        section: entry.section,
        line_item: entry.line_item,
        sort_order: entry.sort_order ?? 0,
        amount: entry.amount,
        is_override: entry.is_override ?? false,
      },
      { onConflict: "station_id,fiscal_year,month,section,line_item" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Generate income statement from transactional data ────────────────────────

type MonthMap = Record<number, number>; // month(1-12) → amount

interface SourceAggregates {
  fuelSales: MonthMap;
  storeSales: MonthMap;
  otherSales: MonthMap;
  taxes: MonthMap;
  deposits: MonthMap;
  payouts: MonthMap;
  overShort: MonthMap;
  purchases: MonthMap;
  writeOffs: MonthMap;
}

async function getSourceAggregates(
  stationId: string,
  year: number,
): Promise<SourceAggregates> {
  const supabase = await createClient();

  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  // daily_reconciliations — one row per day, aggregated by month
  const { data: recons } = await supabase
    .from("daily_reconciliations")
    .select(
      "report_date, fuel_sales, store_sales, other_sales, taxes, deposits, payouts, over_short_dollars",
    )
    .eq("station_id", stationId)
    .gte("report_date", yearStart)
    .lte("report_date", yearEnd);

  // purchase_orders — aggregate by order_date month
  const { data: pos } = await supabase
    .from("purchase_orders")
    .select("order_date, total_amount")
    .eq("station_id", stationId)
    .gte("order_date", yearStart)
    .lte("order_date", yearEnd);

  // item_write_offs — aggregate by write_off_date month
  const { data: wos } = await supabase
    .from("item_write_offs")
    .select("write_off_date, total_cost")
    .eq("station_id", stationId)
    .gte("write_off_date", yearStart)
    .lte("write_off_date", yearEnd);

  const zeroMap = (): MonthMap =>
    Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0]));

  const fuelSales = zeroMap();
  const storeSales = zeroMap();
  const otherSales = zeroMap();
  const taxes = zeroMap();
  const deposits = zeroMap();
  const payouts = zeroMap();
  const overShort = zeroMap();
  const purchases = zeroMap();
  const writeOffs = zeroMap();

  for (const r of recons ?? []) {
    const m = new Date(r.report_date).getUTCMonth() + 1;
    fuelSales[m] = (fuelSales[m] ?? 0) + Number(r.fuel_sales ?? 0);
    storeSales[m] = (storeSales[m] ?? 0) + Number(r.store_sales ?? 0);
    otherSales[m] = (otherSales[m] ?? 0) + Number(r.other_sales ?? 0);
    taxes[m] = (taxes[m] ?? 0) + Number(r.taxes ?? 0);
    deposits[m] = (deposits[m] ?? 0) + Number(r.deposits ?? 0);
    payouts[m] = (payouts[m] ?? 0) + Number(r.payouts ?? 0);
    overShort[m] = (overShort[m] ?? 0) + Number(r.over_short_dollars ?? 0);
  }

  for (const p of pos ?? []) {
    const m = new Date(p.order_date).getUTCMonth() + 1;
    purchases[m] = (purchases[m] ?? 0) + Number(p.total_amount ?? 0);
  }

  for (const w of wos ?? []) {
    const m = new Date(w.write_off_date).getUTCMonth() + 1;
    writeOffs[m] = (writeOffs[m] ?? 0) + Number(w.total_cost ?? 0);
  }

  return { fuelSales, storeSales, otherSales, taxes, deposits, payouts, overShort, purchases, writeOffs };
}

export async function generateIncomeStatement(
  stationId: string,
  year: number,
): Promise<void> {
  const agg = await getSourceAggregates(stationId, year);

  const lines: Array<{
    section: string;
    line_item: string;
    sort_order: number;
    monthMap: MonthMap;
    is_override: boolean;
  }> = [
    { section: "revenue", line_item: "Fuel Sales",    sort_order: 1, monthMap: agg.fuelSales,  is_override: false },
    { section: "revenue", line_item: "Store Sales",   sort_order: 2, monthMap: agg.storeSales, is_override: false },
    { section: "revenue", line_item: "Other Sales",   sort_order: 3, monthMap: agg.otherSales, is_override: false },
    { section: "cogs",    line_item: "Purchases",     sort_order: 1, monthMap: agg.purchases,  is_override: false },
    { section: "cogs",    line_item: "Write-offs",    sort_order: 2, monthMap: agg.writeOffs,  is_override: false },
    { section: "metrics", line_item: "Taxes Collected", sort_order: 1, monthMap: agg.taxes,   is_override: false },
    { section: "metrics", line_item: "Deposits",      sort_order: 2, monthMap: agg.deposits,  is_override: false },
    { section: "metrics", line_item: "Payouts",       sort_order: 3, monthMap: agg.payouts,   is_override: false },
    { section: "metrics", line_item: "Over/Short",    sort_order: 4, monthMap: agg.overShort, is_override: false },
  ];

  const supabase = await createClient();

  // Build upsert rows for all 12 months × all line items (skip if is_override already set)
  const rows = [];
  for (const line of lines) {
    for (let m = 1; m <= 12; m++) {
      rows.push({
        station_id: stationId,
        fiscal_year: year,
        month: m,
        section: line.section,
        line_item: line.line_item,
        sort_order: line.sort_order,
        amount: Math.round((line.monthMap[m] ?? 0) * 100) / 100,
        is_override: false,
      });
    }
  }

  // Upsert only non-override rows — preserve manual overrides
  // We do this by first checking which rows already have is_override=true
  const { data: overrides } = await supabase
    .from("income_statement_entries")
    .select("month, section, line_item")
    .eq("station_id", stationId)
    .eq("fiscal_year", year)
    .eq("is_override", true);

  const overrideSet = new Set(
    (overrides ?? []).map((o) => `${o.month}|${o.section}|${o.line_item}`),
  );

  const toUpsert = rows.filter(
    (r) => !overrideSet.has(`${r.month}|${r.section}|${r.line_item}`),
  );

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("income_statement_entries")
      .upsert(toUpsert, {
        onConflict: "station_id,fiscal_year,month,section,line_item",
      });
    if (error) throw error;
  }
}

// ── Build display rows ────────────────────────────────────────────────────────

export function buildIncomeStatementRows(
  entries: IncomeStatementEntry[],
): IncomeStatementRow[] {
  // Group entries by section + line_item
  const rowMap = new Map<string, IncomeStatementRow>();

  for (const e of entries) {
    const key = `${e.section}|${e.line_item}`;
    if (!rowMap.has(key)) {
      rowMap.set(key, {
        section: e.section,
        line_item: e.line_item,
        sort_order: e.sort_order,
        months: Array(12).fill(0),
        total: 0,
      });
    }
    const row = rowMap.get(key)!;
    row.months[e.month - 1] = Number(e.amount);
    row.total += Number(e.amount);
  }

  const rows = Array.from(rowMap.values());

  // Helper: sum months arrays
  const sumMonths = (items: IncomeStatementRow[]): number[] =>
    items.reduce(
      (acc, r) => r.months.map((v, i) => acc[i] + v),
      Array(12).fill(0),
    );

  const revenue = rows.filter((r) => r.section === "revenue").sort((a, b) => a.sort_order - b.sort_order);
  const cogs    = rows.filter((r) => r.section === "cogs").sort((a, b) => a.sort_order - b.sort_order);
  const metrics = rows.filter((r) => r.section === "metrics").sort((a, b) => a.sort_order - b.sort_order);

  const revenueMonths = sumMonths(revenue);
  const cogsMonths    = sumMonths(cogs);
  const gpMonths      = revenueMonths.map((v, i) => v - cogsMonths[i]);

  const totalRevRow: IncomeStatementRow = {
    section: "revenue",
    line_item: "Total Revenue",
    sort_order: 999,
    months: revenueMonths,
    total: revenueMonths.reduce((a, b) => a + b, 0),
    is_subtotal: true,
  };

  const totalCogsRow: IncomeStatementRow = {
    section: "cogs",
    line_item: "Total COGS",
    sort_order: 999,
    months: cogsMonths,
    total: cogsMonths.reduce((a, b) => a + b, 0),
    is_subtotal: true,
  };

  const grossProfitRow: IncomeStatementRow = {
    section: "gross_profit",
    line_item: "Gross Profit",
    sort_order: 0,
    months: gpMonths,
    total: gpMonths.reduce((a, b) => a + b, 0),
    is_subtotal: true,
  };

  return [
    { section: "revenue", line_item: "REVENUE", sort_order: -1, months: Array(12).fill(0), total: 0, is_header: true },
    ...revenue,
    totalRevRow,
    { section: "cogs", line_item: "COST OF GOODS SOLD", sort_order: -1, months: Array(12).fill(0), total: 0, is_header: true },
    ...cogs,
    totalCogsRow,
    { section: "gross_profit", line_item: "GROSS PROFIT", sort_order: -1, months: Array(12).fill(0), total: 0, is_header: true },
    grossProfitRow,
    { section: "metrics", line_item: "OPERATING METRICS", sort_order: -1, months: Array(12).fill(0), total: 0, is_header: true },
    ...metrics,
  ];
}
