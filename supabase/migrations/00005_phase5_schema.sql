-- ============================================================
-- PHASE 5: Financial Management, Reporting & Release Hardening
-- ============================================================

-- ============================================================
-- PART 1: CREATE ALL TABLES
-- ============================================================

create table public.income_statement_entries (
  id          uuid          primary key default gen_random_uuid(),
  station_id  uuid          not null references public.stations(id) on delete cascade,
  fiscal_year int           not null,
  month       int           not null check (month between 1 and 12),
  section     text          not null,
  line_item   text          not null,
  sort_order  int           not null default 0,
  amount      numeric(14,2) not null default 0,
  is_override boolean       not null default false,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now(),
  unique(station_id, fiscal_year, month, section, line_item)
);
create index idx_ise_station_year on public.income_statement_entries (station_id, fiscal_year);

-- ============================================================
-- PART 2: TRIGGERS
-- ============================================================

create trigger set_updated_at before update on public.income_statement_entries
  for each row execute function public.update_updated_at();

-- ============================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.income_statement_entries enable row level security;

-- ============================================================
-- PART 4: RLS POLICIES
-- ============================================================

create policy "ise_select" on public.income_statement_entries for select to authenticated using (true);
create policy "ise_insert" on public.income_statement_entries for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "ise_update" on public.income_statement_entries for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "ise_delete" on public.income_statement_entries for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
