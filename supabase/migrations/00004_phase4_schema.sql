-- ============================================================
-- PHASE 4: Administration, Access & Operational Control
-- ============================================================

-- ============================================================
-- PART 1: CREATE ALL TABLES
-- ============================================================

-- Tax definitions per station
create table public.taxes (
  id          uuid          primary key default gen_random_uuid(),
  station_id  uuid          not null references public.stations(id) on delete cascade,
  name        text          not null,
  percentage  numeric(6,4)  not null default 0,
  use_in_po   boolean       not null default false,
  sort_order  int           not null default 0,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now(),
  unique(station_id, name)
);
create index idx_taxes_station on public.taxes (station_id);

-- Admin key-value options per station
create table public.admin_options (
  id          uuid        primary key default gen_random_uuid(),
  station_id  uuid        not null references public.stations(id) on delete cascade,
  key         text        not null,
  value       text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(station_id, key)
);
create index idx_admin_options_station on public.admin_options (station_id);

-- Regions (org-level groupings of sites)
create table public.regions (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  category    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Junction: region → stations
create table public.region_stations (
  id          uuid primary key default gen_random_uuid(),
  region_id   uuid not null references public.regions(id) on delete cascade,
  station_id  uuid not null references public.stations(id) on delete cascade,
  unique(region_id, station_id)
);

-- Operational/connectivity metadata extending stations
create table public.site_details (
  id                  uuid        primary key default gen_random_uuid(),
  station_id          uuid        not null unique references public.stations(id) on delete cascade,
  site_code           text,
  pending_changes     int         not null default 0,
  sftp_enabled        boolean     not null default false,
  realtime_enabled    boolean     not null default false,
  last_sync_at        timestamptz,
  last_heartbeat_at   timestamptz,
  connectivity_notes  text,
  updated_at          timestamptz not null default now()
);

-- Vendors (payment/EDI vendors — distinct from product suppliers)
create table public.vendors (
  id          uuid        primary key default gen_random_uuid(),
  station_id  uuid        not null references public.stations(id) on delete cascade,
  vendor_code text        not null,
  name        text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(station_id, vendor_code)
);
create index idx_vendors_station on public.vendors (station_id);

-- Daily reconciliation reports
create table public.daily_reconciliations (
  id                  uuid          primary key default gen_random_uuid(),
  station_id          uuid          not null references public.stations(id) on delete cascade,
  report_date         date          not null,
  shift_count         int           not null default 0,
  status              text          not null default 'pending' check (status in ('pending','reconciled','approved')),
  fuel_volume         numeric(12,2) not null default 0,
  fuel_sales          numeric(12,2) not null default 0,
  store_sales         numeric(12,2) not null default 0,
  other_sales         numeric(12,2) not null default 0,
  taxes               numeric(12,2) not null default 0,
  non_cash_tender     numeric(12,2) not null default 0,
  deposits            numeric(12,2) not null default 0,
  payouts             numeric(12,2) not null default 0,
  over_short_volume   numeric(10,2) not null default 0,
  over_short_dollars  numeric(10,2) not null default 0,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),
  unique(station_id, report_date)
);
create index idx_daily_recon_station_date on public.daily_reconciliations (station_id, report_date desc);

-- ============================================================
-- PART 2: TRIGGERS (updated_at)
-- ============================================================

create trigger set_updated_at before update on public.taxes
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.admin_options
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.regions
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.site_details
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.vendors
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.daily_reconciliations
  for each row execute function public.update_updated_at();

-- ============================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.taxes                  enable row level security;
alter table public.admin_options          enable row level security;
alter table public.regions                enable row level security;
alter table public.region_stations        enable row level security;
alter table public.site_details           enable row level security;
alter table public.vendors                enable row level security;
alter table public.daily_reconciliations  enable row level security;

-- ============================================================
-- PART 4: RLS POLICIES
-- ============================================================

-- taxes
create policy "taxes_select" on public.taxes for select to authenticated using (true);
create policy "taxes_insert" on public.taxes for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "taxes_update" on public.taxes for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "taxes_delete" on public.taxes for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- admin_options
create policy "admin_options_select" on public.admin_options for select to authenticated using (true);
create policy "admin_options_insert" on public.admin_options for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "admin_options_update" on public.admin_options for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "admin_options_delete" on public.admin_options for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- regions
create policy "regions_select" on public.regions for select to authenticated using (true);
create policy "regions_insert" on public.regions for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "regions_update" on public.regions for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "regions_delete" on public.regions for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- region_stations
create policy "region_stations_select" on public.region_stations for select to authenticated using (true);
create policy "region_stations_insert" on public.region_stations for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "region_stations_delete" on public.region_stations for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- site_details
create policy "site_details_select" on public.site_details for select to authenticated using (true);
create policy "site_details_insert" on public.site_details for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "site_details_update" on public.site_details for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- vendors
create policy "vendors_select" on public.vendors for select to authenticated using (true);
create policy "vendors_insert" on public.vendors for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "vendors_update" on public.vendors for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "vendors_delete" on public.vendors for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- daily_reconciliations
create policy "daily_recon_select" on public.daily_reconciliations for select to authenticated using (true);
create policy "daily_recon_insert" on public.daily_reconciliations for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "daily_recon_update" on public.daily_reconciliations for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "daily_recon_delete" on public.daily_reconciliations for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
