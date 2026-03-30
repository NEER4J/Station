-- ============================================================
-- Station Jet Phase 5 Seed Data
-- Run AFTER 00005_phase5_schema.sql
-- ============================================================

-- Station reference
-- b1000000-0000-0000-0000-000000000001 = ON Esso Bryanston

-- ============================================================
-- 1. INCOME STATEMENT ENTRIES - Fiscal Year 2025
--    Generated (is_override = false) for all 12 months
-- ============================================================

insert into public.income_statement_entries
  (station_id, fiscal_year, month, section, line_item, sort_order, amount, is_override)
select
  'b1000000-0000-0000-0000-000000000001',
  2025,
  gs.m,
  t.section,
  t.line_item,
  t.sort_order,
  round((t.base + (random() * t.variance))::numeric, 2),
  false
from (
  select 1 as sort_order, 'revenue'::text as section, 'Fuel Sales'::text    as line_item, 5500::numeric as base, 2200::numeric as variance
  union all
  select 2, 'revenue', 'Store Sales',    2900, 1100
  union all
  select 3, 'revenue', 'Other Sales',    150,  80
  union all
  select 1, 'cogs',    'Purchases',      3800, 1400
  union all
  select 2, 'cogs',    'Write-offs',     80,   60
  union all
  select 1, 'metrics', 'Taxes Collected', 820, 380
  union all
  select 2, 'metrics', 'Deposits',       2600, 900
  union all
  select 3, 'metrics', 'Payouts',        175,  125
  union all
  select 4, 'metrics', 'Over/Short',     -5,   20
) as t
cross join (select generate_series(1, 12) as m) as gs
on conflict (station_id, fiscal_year, month, section, line_item) do nothing;
