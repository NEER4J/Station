-- ============================================================
-- Station Jet Phase 2 Schema Migration
-- Product, Pricing, and Catalog Management
-- ============================================================

-- ========================
-- PART 1: CREATE ALL TABLES
-- ========================

-- 1. DEPARTMENTS
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  name text not null,
  short_name text,
  pcats_code text,
  host_product_code text,
  sales_restriction text,
  taxes text[] not null default '{}',
  include_in_sales_report boolean not null default true,
  include_in_shift_report boolean not null default true,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(station_id, name)
);

-- 2. SUBDEPARTMENTS
create table if not exists public.subdepartments (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  gl_code text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(station_id, department_id, name)
);

-- 3. SUPPLIERS
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  name text not null,
  account_number text,
  primary_contact text,
  phone text,
  address_line1 text,
  city text,
  country text default 'CA',
  province text,
  postal_code text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(station_id, name)
);

-- 4. ITEMS
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  plu text,
  upc text,
  part_number text,
  description text not null,
  department_id uuid references public.departments(id),
  subdepartment_id uuid references public.subdepartments(id),
  supplier_id uuid references public.suppliers(id),
  retail_price numeric(10,2) not null default 0,
  bottle_deposit numeric(10,2) not null default 0,
  tax_codes text[] not null default '{}',
  case_size int,
  case_cost numeric(10,2),
  unit_cost numeric(10,4),
  weighted_avg_cost numeric(10,4),
  margin numeric(6,2),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_items_station on public.items (station_id);
create index idx_items_station_status on public.items (station_id, status);
create index idx_items_upc on public.items (station_id, upc);
create index idx_items_plu on public.items (station_id, plu);
create index idx_items_department on public.items (department_id);
create index idx_items_supplier on public.items (supplier_id);

-- 5. SHELF TAGS (queue)
create table if not exists public.shelf_tags (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  unit_or_order text not null default 'EA' check (unit_or_order in ('EA', 'CS')),
  created_at timestamptz not null default now()
);

create index idx_shelf_tags_station on public.shelf_tags (station_id, created_at desc);

-- 6. PAYOUTS
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  description text not null,
  french_description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(station_id, description)
);

-- 7. PRICE BOOK SETTINGS
create table if not exists public.price_book_settings (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  category text not null check (category in ('payments', 'host_product_codes', 'item_locations')),
  key text not null,
  value text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(station_id, category, key)
);

-- ========================
-- PART 2: TRIGGERS
-- ========================

create trigger set_updated_at before update on public.departments
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.subdepartments
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.suppliers
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.items
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.payouts
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.price_book_settings
  for each row execute function public.update_updated_at();

-- ========================
-- PART 3: ENABLE RLS
-- ========================

alter table public.departments enable row level security;
alter table public.subdepartments enable row level security;
alter table public.suppliers enable row level security;
alter table public.items enable row level security;
alter table public.shelf_tags enable row level security;
alter table public.payouts enable row level security;
alter table public.price_book_settings enable row level security;

-- ========================
-- PART 4: RLS POLICIES
-- ========================

-- DEPARTMENTS
create policy "Departments viewable by authenticated users"
  on public.departments for select to authenticated using (true);
create policy "Departments insert by admin/manager"
  on public.departments for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Departments update by admin/manager"
  on public.departments for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Departments delete by admin/manager"
  on public.departments for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));

-- SUBDEPARTMENTS
create policy "Subdepartments viewable by authenticated users"
  on public.subdepartments for select to authenticated using (true);
create policy "Subdepartments insert by admin/manager"
  on public.subdepartments for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Subdepartments update by admin/manager"
  on public.subdepartments for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Subdepartments delete by admin/manager"
  on public.subdepartments for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));

-- SUPPLIERS
create policy "Suppliers viewable by authenticated users"
  on public.suppliers for select to authenticated using (true);
create policy "Suppliers insert by admin/manager"
  on public.suppliers for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Suppliers update by admin/manager"
  on public.suppliers for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Suppliers delete by admin/manager"
  on public.suppliers for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));

-- ITEMS
create policy "Items viewable by authenticated users"
  on public.items for select to authenticated using (true);
create policy "Items insert by admin/manager"
  on public.items for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Items update by admin/manager"
  on public.items for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Items delete by admin/manager"
  on public.items for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));

-- SHELF TAGS
create policy "Shelf tags viewable by authenticated users"
  on public.shelf_tags for select to authenticated using (true);
create policy "Shelf tags insert by admin/manager"
  on public.shelf_tags for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Shelf tags delete by admin/manager"
  on public.shelf_tags for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));

-- PAYOUTS
create policy "Payouts viewable by authenticated users"
  on public.payouts for select to authenticated using (true);
create policy "Payouts insert by admin/manager"
  on public.payouts for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Payouts update by admin/manager"
  on public.payouts for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Payouts delete by admin/manager"
  on public.payouts for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));

-- PRICE BOOK SETTINGS
create policy "Price book settings viewable by authenticated users"
  on public.price_book_settings for select to authenticated using (true);
create policy "Price book settings insert by admin/manager"
  on public.price_book_settings for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Price book settings update by admin/manager"
  on public.price_book_settings for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
create policy "Price book settings delete by admin/manager"
  on public.price_book_settings for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin', 'manager')));
