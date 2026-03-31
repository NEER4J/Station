-- ============================================================
-- PHASE 6: Pump Report Import (Bulloch POS / XSite JSON)
-- ============================================================

-- ============================================================
-- PART 1: CREATE ALL TABLES
-- ============================================================

-- Master daily report (one per station per business_date)
create table public.pump_reports (
  id                      uuid          primary key default gen_random_uuid(),
  station_id              uuid          not null references public.stations(id) on delete cascade,
  business_date           date          not null,
  report_number           int,
  external_id             text,
  status                  text          not null default 'open' check (status in ('open','closed')),
  shift_count             int           not null default 0,
  fuel_tax_rate           numeric(8,4)  default 0,
  fuel_tax_labels         jsonb         default '[]',
  site_name               text,
  site_external_id        text,
  pos_type                text,
  raw_json                jsonb         not null,
  -- Denormalized fuel summary
  fuel_sold_dollars       numeric(12,2) not null default 0,
  fuel_sold_units         numeric(12,3) not null default 0,
  fuel_cost_of_sales      numeric(12,2) not null default 0,
  fuel_profit             numeric(12,2) not null default 0,
  fuel_margin             numeric(8,4)  not null default 0,
  fuel_over_short         numeric(10,3) not null default 0,
  -- Denormalized financial summary
  financial_over_short    numeric(10,2) not null default 0,
  financial_additive      numeric(12,2) not null default 0,
  financial_subtractive   numeric(12,2) not null default 0,
  financial_memo          numeric(12,2) not null default 0,
  -- Variable-structure JSONB
  sections                jsonb         default '[]',
  shifts                  jsonb         default '[]',
  issues                  jsonb         default '{}',
  deliveries              jsonb         default '[]',
  -- Tracking
  imported_by             uuid          references auth.users(id),
  imported_at             timestamptz   not null default now(),
  created_at              timestamptz   not null default now(),
  updated_at              timestamptz   not null default now(),
  unique(station_id, business_date)
);
create index idx_pump_reports_station_date on public.pump_reports (station_id, business_date desc);

-- Per-hose pump meter readings
create table public.pump_report_pumps (
  id                      uuid          primary key default gen_random_uuid(),
  pump_report_id          uuid          not null references public.pump_reports(id) on delete cascade,
  pump_number             int           not null,
  hose_number             int           not null,
  grade_name              text          not null,
  grade_external_id       text,
  fuel_grade_id           uuid          references public.fuel_grades(id) on delete set null,
  meter_dollars           numeric(14,2) not null default 0,
  meter_units             numeric(14,3) not null default 0,
  previous_meter_dollars  numeric(14,2) not null default 0,
  previous_meter_units    numeric(14,3) not null default 0,
  meter_change_dollars    numeric(12,2) not null default 0,
  meter_change_units      numeric(12,3) not null default 0,
  sold_dollars            numeric(12,2) not null default 0,
  sold_units              numeric(12,3) not null default 0,
  created_at              timestamptz   not null default now()
);
create index idx_pump_report_pumps_report on public.pump_report_pumps (pump_report_id);

-- Per-grade aggregated sales + inventory reconciliation
create table public.pump_report_grades (
  id                      uuid          primary key default gen_random_uuid(),
  pump_report_id          uuid          not null references public.pump_reports(id) on delete cascade,
  fuel_grade_id           uuid          references public.fuel_grades(id) on delete set null,
  external_id             text,
  name                    text          not null,
  service_level           text,
  -- Sales
  sold_units              numeric(12,3) not null default 0,
  sold_dollars            numeric(12,2) not null default 0,
  average_price           numeric(10,6) not null default 0,
  actual_price            numeric(10,6) not null default 0,
  average_cost            numeric(10,6) not null default 0,
  cost_of_sales           numeric(12,2) not null default 0,
  profit                  numeric(12,2) not null default 0,
  profit_percentage       numeric(10,6) not null default 0,
  margin                  numeric(8,4)  not null default 0,
  -- Blend
  blended                 boolean       not null default false,
  blend                   jsonb,
  commission              numeric(12,2) not null default 0,
  -- CRIND breakdown
  sold_units_crind        numeric(12,3) not null default 0,
  sold_dollars_crind      numeric(12,2) not null default 0,
  sold_units_kiosk        numeric(12,3) not null default 0,
  sold_dollars_kiosk      numeric(12,2) not null default 0,
  tax_one_crind           numeric(12,2) not null default 0,
  tax_two_crind           numeric(12,2) not null default 0,
  tax_one                 numeric(12,2) not null default 0,
  tax_two                 numeric(12,2) not null default 0,
  -- Inventory reconciliation (from "products" section, matched by external_id)
  product_opening         numeric(12,3) default 0,
  product_closing         numeric(12,3) default 0,
  product_deliveries      numeric(12,3) default 0,
  dispensed_tanks         numeric(12,3) default 0,
  dispensed_meters        numeric(12,3) default 0,
  dispensed_units_to_date numeric(14,3) default 0,
  over_short              numeric(10,3) default 0,
  over_short_carry_forward numeric(14,3) default 0,
  inventory_avg_cost      numeric(10,6) default 0,
  opening_avg_cost        numeric(10,6) default 0,
  value_of_inventory      numeric(12,2) default 0,
  created_at              timestamptz   not null default now()
);
create index idx_pump_report_grades_report on public.pump_report_grades (pump_report_id);

-- ============================================================
-- PART 2: TRIGGERS (updated_at)
-- ============================================================

create trigger set_updated_at before update on public.pump_reports
  for each row execute function public.update_updated_at();

-- ============================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.pump_reports        enable row level security;
alter table public.pump_report_pumps   enable row level security;
alter table public.pump_report_grades  enable row level security;

-- ============================================================
-- PART 4: RLS POLICIES
-- ============================================================

-- pump_reports
create policy "pump_reports_select" on public.pump_reports for select to authenticated using (true);
create policy "pump_reports_insert" on public.pump_reports for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "pump_reports_update" on public.pump_reports for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "pump_reports_delete" on public.pump_reports for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- pump_report_pumps
create policy "pump_report_pumps_select" on public.pump_report_pumps for select to authenticated using (true);
create policy "pump_report_pumps_insert" on public.pump_report_pumps for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "pump_report_pumps_update" on public.pump_report_pumps for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "pump_report_pumps_delete" on public.pump_report_pumps for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- pump_report_grades
create policy "pump_report_grades_select" on public.pump_report_grades for select to authenticated using (true);
create policy "pump_report_grades_insert" on public.pump_report_grades for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "pump_report_grades_update" on public.pump_report_grades for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "pump_report_grades_delete" on public.pump_report_grades for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
