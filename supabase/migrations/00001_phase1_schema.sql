-- ============================================================
-- Station Jet Phase 1 Schema Migration
-- Run this in the Supabase SQL Editor or via `supabase db push`
-- ============================================================
-- Structure: ALL tables first, THEN all RLS policies
-- (policies reference user_profiles, so it must exist first)
-- ============================================================

-- ========================
-- PART 1: CREATE ALL TABLES
-- ========================

-- 1. ROLES
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  permissions jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 2. STATIONS
create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  country text default 'CA',
  postal_code text,
  phone text,
  pos_type text,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. USER PROFILES (extends auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id),
  station_id uuid references public.stations(id),
  full_name text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. FUEL GRADES
create table if not exists public.fuel_grades (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  name text not null,
  code text not null,
  color text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(station_id, code)
);

-- 5. FUEL TANKS
create table if not exists public.fuel_tanks (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  fuel_grade_id uuid not null references public.fuel_grades(id),
  tank_number text not null,
  capacity_litres numeric(10,2) not null,
  low_level_threshold numeric(10,2) not null default 2000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(station_id, tank_number)
);

-- 6. FUEL TANK READINGS
create table if not exists public.fuel_tank_readings (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.fuel_tanks(id) on delete cascade,
  volume_litres numeric(10,2) not null,
  temperature_c numeric(5,1),
  water_level_mm numeric(5,2),
  reading_at timestamptz not null default now(),
  source text not null default 'manual' check (source in ('manual', 'atg', 'import')),
  created_at timestamptz not null default now()
);

create index idx_tank_readings_latest on public.fuel_tank_readings (tank_id, reading_at desc);

-- 7. STORE METRICS (daily aggregates)
create table if not exists public.store_metrics (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  metric_date date not null,
  sales_amount numeric(12,2) not null default 0,
  transaction_count int not null default 0,
  items_on_hand int not null default 0,
  inventory_value numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(station_id, metric_date)
);

create index idx_store_metrics_date on public.store_metrics (station_id, metric_date);

-- 8. FUEL SALES SUMMARY (by grade, daily)
create table if not exists public.fuel_sales_summary (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  fuel_grade_id uuid not null references public.fuel_grades(id),
  summary_date date not null,
  dollars_sold numeric(12,2) not null default 0,
  units_sold numeric(12,3) not null default 0,
  avg_price numeric(6,3) not null default 0,
  avg_margin numeric(6,3) not null default 0,
  gross_profit numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(station_id, fuel_grade_id, summary_date)
);

create index idx_fuel_sales_date on public.fuel_sales_summary (station_id, summary_date);

-- 9. SYSTEM SETTINGS (key-value store)
create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  station_id uuid references public.stations(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}',
  category text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(station_id, key)
);

-- ========================
-- PART 2: TRIGGERS
-- ========================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger function (reusable)
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.stations
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.user_profiles
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.system_settings
  for each row execute function public.update_updated_at();

-- ========================
-- PART 3: ENABLE RLS ON ALL TABLES
-- ========================

alter table public.roles enable row level security;
alter table public.stations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.fuel_grades enable row level security;
alter table public.fuel_tanks enable row level security;
alter table public.fuel_tank_readings enable row level security;
alter table public.store_metrics enable row level security;
alter table public.fuel_sales_summary enable row level security;
alter table public.system_settings enable row level security;

-- ========================
-- PART 4: RLS POLICIES
-- (all tables exist now, so cross-table references are safe)
-- ========================

-- Helper: reusable admin check subquery
-- exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name = 'admin')

-- ROLES policies
create policy "Roles are viewable by authenticated users"
  on public.roles for select
  to authenticated
  using (true);

create policy "Only admins can manage roles"
  on public.roles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Only admins can update roles"
  on public.roles for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Only admins can delete roles"
  on public.roles for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

-- STATIONS policies
create policy "Stations are viewable by authenticated users"
  on public.stations for select
  to authenticated
  using (true);

create policy "Only admins can insert stations"
  on public.stations for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Only admins can update stations"
  on public.stations for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Only admins can delete stations"
  on public.stations for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

-- USER PROFILES policies
create policy "Users can view their own profile"
  on public.user_profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Admins can view all profiles"
  on public.user_profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Users can update their own profile"
  on public.user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Admins can manage all profiles"
  on public.user_profiles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.user_profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

create policy "Admins can delete profiles"
  on public.user_profiles for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name = 'admin'
    )
  );

-- FUEL GRADES policies
create policy "Fuel grades viewable by authenticated users"
  on public.fuel_grades for select
  to authenticated
  using (true);

create policy "Admins and managers can insert fuel grades"
  on public.fuel_grades for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can update fuel grades"
  on public.fuel_grades for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete fuel grades"
  on public.fuel_grades for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

-- FUEL TANKS policies
create policy "Fuel tanks viewable by authenticated users"
  on public.fuel_tanks for select
  to authenticated
  using (true);

create policy "Admins and managers can insert fuel tanks"
  on public.fuel_tanks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can update fuel tanks"
  on public.fuel_tanks for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete fuel tanks"
  on public.fuel_tanks for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

-- FUEL TANK READINGS policies
create policy "Tank readings viewable by authenticated users"
  on public.fuel_tank_readings for select
  to authenticated
  using (true);

create policy "Admins and managers can insert tank readings"
  on public.fuel_tank_readings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can update tank readings"
  on public.fuel_tank_readings for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete tank readings"
  on public.fuel_tank_readings for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

-- STORE METRICS policies
create policy "Store metrics viewable by authenticated users"
  on public.store_metrics for select
  to authenticated
  using (true);

create policy "Admins and managers can insert store metrics"
  on public.store_metrics for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can update store metrics"
  on public.store_metrics for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete store metrics"
  on public.store_metrics for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

-- FUEL SALES SUMMARY policies
create policy "Fuel sales viewable by authenticated users"
  on public.fuel_sales_summary for select
  to authenticated
  using (true);

create policy "Admins and managers can insert fuel sales"
  on public.fuel_sales_summary for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can update fuel sales"
  on public.fuel_sales_summary for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete fuel sales"
  on public.fuel_sales_summary for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

-- SYSTEM SETTINGS policies
create policy "System settings viewable by authenticated users"
  on public.system_settings for select
  to authenticated
  using (true);

create policy "Admins and managers can insert system settings"
  on public.system_settings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can update system settings"
  on public.system_settings for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete system settings"
  on public.system_settings for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      join public.roles r on r.id = up.role_id
      where up.id = auth.uid() and r.name in ('admin', 'manager')
    )
  );
