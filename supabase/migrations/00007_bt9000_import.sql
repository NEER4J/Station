-- ============================================================
-- PHASE 7: BT9000 Price Book Import
-- ============================================================

-- ============================================================
-- PART 1: ALTER EXISTING TABLES — Add external_id for BT9000 sync
-- ============================================================

-- departments
alter table public.departments add column if not exists external_id text;
alter table public.departments add column if not exists loyalty_eligible boolean not null default false;
alter table public.departments add constraint departments_station_external_id unique (station_id, external_id);

-- items
alter table public.items add column if not exists external_id text;
alter table public.items add column if not exists french_description text;
alter table public.items add column if not exists age_restriction int;
alter table public.items add column if not exists loyalty_eligible boolean not null default false;
alter table public.items add column if not exists conexxus_product_code text;
alter table public.items add column if not exists quantity_pricing jsonb;
alter table public.items add constraint items_station_external_id unique (station_id, external_id);

-- payouts
alter table public.payouts add column if not exists external_id text;
alter table public.payouts add constraint payouts_station_external_id unique (station_id, external_id);

-- price_groups
alter table public.price_groups add column if not exists external_id text;
alter table public.price_groups add column if not exists french_description text;
alter table public.price_groups add column if not exists quantity_pricing jsonb;
alter table public.price_groups add constraint price_groups_station_external_id unique (station_id, external_id);

-- deal_groups
alter table public.deal_groups add column if not exists external_id text;
alter table public.deal_groups add column if not exists french_description text;
alter table public.deal_groups add column if not exists fuel_deal_config jsonb;
alter table public.deal_groups add constraint deal_groups_station_external_id unique (station_id, external_id);

-- tender_coupons
alter table public.tender_coupons add column if not exists external_id text;
alter table public.tender_coupons add column if not exists french_description text;
alter table public.tender_coupons add constraint tender_coupons_station_external_id unique (station_id, external_id);

-- ============================================================
-- PART 2: NEW TABLES
-- ============================================================

-- Multiple UPCs per item
create table public.item_upcs (
  id         uuid    primary key default gen_random_uuid(),
  item_id    uuid    not null references public.items(id) on delete cascade,
  upc        text    not null,
  is_primary boolean not null default false,
  unique(item_id, upc)
);
create index idx_item_upcs_upc on public.item_upcs (upc);

-- BT9000 import history
create table public.bt9000_imports (
  id                    uuid          primary key default gen_random_uuid(),
  station_id            uuid          not null references public.stations(id) on delete cascade,
  file_name             text          not null,
  bt9000_version        text,
  bt9000_station_id     text,
  file_creation_date    text,
  departments_count     int           not null default 0,
  items_count           int           not null default 0,
  price_groups_count    int           not null default 0,
  deal_groups_count     int           not null default 0,
  payouts_count         int           not null default 0,
  tender_coupons_count  int           not null default 0,
  status                text          not null default 'in_progress' check (status in ('in_progress','completed','failed')),
  imported_by           uuid          references auth.users(id),
  imported_at           timestamptz   not null default now(),
  created_at            timestamptz   not null default now()
);
create index idx_bt9000_imports_station on public.bt9000_imports (station_id, imported_at desc);

-- ============================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.item_upcs        enable row level security;
alter table public.bt9000_imports   enable row level security;

-- ============================================================
-- PART 4: RLS POLICIES
-- ============================================================

-- item_upcs
create policy "item_upcs_select" on public.item_upcs for select to authenticated using (true);
create policy "item_upcs_insert" on public.item_upcs for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_upcs_update" on public.item_upcs for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_upcs_delete" on public.item_upcs for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- bt9000_imports
create policy "bt9000_imports_select" on public.bt9000_imports for select to authenticated using (true);
create policy "bt9000_imports_insert" on public.bt9000_imports for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "bt9000_imports_update" on public.bt9000_imports for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "bt9000_imports_delete" on public.bt9000_imports for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
