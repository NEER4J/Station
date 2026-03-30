-- ============================================================
-- PHASE 3: Promotions, Inventory Operations & Fuel
-- ============================================================

-- ============================================================
-- PART 1: CREATE ALL TABLES
-- ============================================================

-- -------------------------------------------------------
-- Promotion Management
-- -------------------------------------------------------

create table public.item_lists (
  id           uuid        primary key default gen_random_uuid(),
  station_id   uuid        not null references public.stations(id) on delete cascade,
  description  text        not null,
  status       text        not null default 'active' check (status in ('active','inactive')),
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_item_lists_station on public.item_lists (station_id);

create table public.price_groups (
  id            uuid        primary key default gen_random_uuid(),
  station_id    uuid        not null references public.stations(id) on delete cascade,
  description   text        not null,
  availability  text,
  unit_price    numeric(10,2) not null default 0,
  status        text        not null default 'active' check (status in ('active','inactive')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_price_groups_station on public.price_groups (station_id);

create table public.price_group_items (
  id              uuid primary key default gen_random_uuid(),
  price_group_id  uuid not null references public.price_groups(id) on delete cascade,
  item_id         uuid not null references public.items(id) on delete cascade,
  unique(price_group_id, item_id)
);

create table public.deal_groups (
  id            uuid        primary key default gen_random_uuid(),
  station_id    uuid        not null references public.stations(id) on delete cascade,
  name          text        not null,
  start_date    date,
  end_date      date,
  availability  text,
  status        text        not null default 'active' check (status in ('active','inactive')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_deal_groups_station on public.deal_groups (station_id);

create table public.deal_group_components (
  id               uuid        primary key default gen_random_uuid(),
  deal_group_id    uuid        not null references public.deal_groups(id) on delete cascade,
  description      text        not null,
  component_type   text,
  amount           numeric(10,2),
  created_at       timestamptz not null default now()
);

create table public.item_list_deal_groups (
  id              uuid primary key default gen_random_uuid(),
  item_list_id    uuid not null references public.item_lists(id) on delete cascade,
  deal_group_id   uuid not null references public.deal_groups(id) on delete cascade,
  unique(item_list_id, deal_group_id)
);

create table public.tender_coupons (
  id                  uuid        primary key default gen_random_uuid(),
  station_id          uuid        not null references public.stations(id) on delete cascade,
  description         text        not null,
  type_of_discount    text        not null default 'fixed' check (type_of_discount in ('fixed','percentage','amount_off')),
  amount              numeric(10,2) not null default 0,
  prompt_for_amount   boolean     not null default false,
  max_per_customer    int         not null default 1,
  available_always    boolean     not null default false,
  start_date          date,
  end_date            date,
  is_disabled         boolean     not null default false,
  upc                 text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_tender_coupons_station on public.tender_coupons (station_id);

create table public.batch_promotions (
  id               uuid          primary key default gen_random_uuid(),
  station_id       uuid          not null references public.stations(id) on delete cascade,
  promotion_price  numeric(10,2) not null,
  comments         text,
  start_date       date          not null,
  end_date         date          not null,
  status           text          not null default 'draft' check (status in ('draft','active','expired')),
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);
create index idx_batch_promotions_station on public.batch_promotions (station_id);

create table public.batch_promotion_items (
  id                   uuid primary key default gen_random_uuid(),
  batch_promotion_id   uuid not null references public.batch_promotions(id) on delete cascade,
  item_id              uuid not null references public.items(id) on delete cascade,
  unique(batch_promotion_id, item_id)
);

create table public.liquor_imports (
  id              uuid        primary key default gen_random_uuid(),
  station_id      uuid        not null references public.stations(id) on delete cascade,
  is_regular      boolean     not null default true,
  lto_start_date  date,
  lto_end_date    date,
  status          text        not null default 'pending' check (status in ('pending','processing','completed','failed')),
  item_count      int         not null default 0,
  matched_count   int         not null default 0,
  imported_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index idx_liquor_imports_station on public.liquor_imports (station_id);

-- -------------------------------------------------------
-- Inventory Operations
-- -------------------------------------------------------

create table public.purchase_orders (
  id               uuid          primary key default gen_random_uuid(),
  station_id       uuid          not null references public.stations(id) on delete cascade,
  supplier_id      uuid          references public.suppliers(id) on delete set null,
  invoice_number   text,
  invoice_date     date,
  expected_date    date,
  received_date    date,
  status           text          not null default 'draft' check (status in ('draft','submitted','received','cancelled')),
  subtotal         numeric(12,2) not null default 0,
  discount_amount  numeric(12,2) not null default 0,
  tax_amount       numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);
create index idx_purchase_orders_station on public.purchase_orders (station_id);
create index idx_purchase_orders_supplier on public.purchase_orders (supplier_id);

create table public.purchase_order_lines (
  id                  uuid          primary key default gen_random_uuid(),
  purchase_order_id   uuid          not null references public.purchase_orders(id) on delete cascade,
  item_id             uuid          references public.items(id) on delete set null,
  qty_ordered         numeric(10,2) not null default 0,
  qty_received        numeric(10,2) not null default 0,
  unit_cost           numeric(10,2) not null default 0,
  created_at          timestamptz   not null default now()
);

create table public.item_write_offs (
  id           uuid          primary key default gen_random_uuid(),
  station_id   uuid          not null references public.stations(id) on delete cascade,
  status       text          not null default 'draft' check (status in ('draft','posted')),
  total_amount numeric(12,2) not null default 0,
  posted_at    timestamptz,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);
create index idx_item_write_offs_station on public.item_write_offs (station_id);

create table public.item_write_off_lines (
  id                 uuid          primary key default gen_random_uuid(),
  item_write_off_id  uuid          not null references public.item_write_offs(id) on delete cascade,
  item_id            uuid          references public.items(id) on delete set null,
  quantity           numeric(10,2) not null default 0,
  unit_cost          numeric(10,2) not null default 0,
  created_at         timestamptz   not null default now()
);

create table public.item_transfer_orders (
  id                uuid        primary key default gen_random_uuid(),
  station_id        uuid        not null references public.stations(id) on delete cascade,
  source_site       text,
  destination_site  text,
  status            text        not null default 'draft' check (status in ('draft','submitted','received','cancelled')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_item_transfer_orders_station on public.item_transfer_orders (station_id);

create table public.item_transfer_lines (
  id                       uuid          primary key default gen_random_uuid(),
  item_transfer_order_id   uuid          not null references public.item_transfer_orders(id) on delete cascade,
  item_id                  uuid          references public.items(id) on delete set null,
  quantity                 numeric(10,2) not null default 0,
  created_at               timestamptz   not null default now()
);

create table public.inventory_counts (
  id          uuid        primary key default gen_random_uuid(),
  station_id  uuid        not null references public.stations(id) on delete cascade,
  status      text        not null default 'draft' check (status in ('draft','counting','posted')),
  counted_at  timestamptz,
  posted_at   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_inventory_counts_station on public.inventory_counts (station_id);

create table public.inventory_count_lines (
  id                   uuid          primary key default gen_random_uuid(),
  inventory_count_id   uuid          not null references public.inventory_counts(id) on delete cascade,
  item_id              uuid          references public.items(id) on delete set null,
  expected_qty         numeric(10,2) not null default 0,
  counted_qty          numeric(10,2) not null default 0,
  variance             numeric(10,2) generated always as (counted_qty - expected_qty) stored,
  created_at           timestamptz   not null default now()
);

create table public.batch_posts (
  id              uuid        primary key default gen_random_uuid(),
  station_id      uuid        not null references public.stations(id) on delete cascade,
  type            text        not null,
  reference_id    uuid,
  reference_type  text,
  status          text        not null default 'pending' check (status in ('pending','completed','failed')),
  posted_at       timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_batch_posts_station on public.batch_posts (station_id);

create table public.inventory_config (
  id          uuid        primary key default gen_random_uuid(),
  station_id  uuid        not null unique references public.stations(id) on delete cascade,
  settings    jsonb       not null default '{}',
  updated_at  timestamptz not null default now()
);

-- -------------------------------------------------------
-- Extend fuel_tank_readings for xlsx import extra fields
-- -------------------------------------------------------
alter table public.fuel_tank_readings add column if not exists metadata jsonb;

-- ============================================================
-- PART 2: TRIGGERS (updated_at)
-- ============================================================

create trigger set_updated_at before update on public.item_lists
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.price_groups
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.deal_groups
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.tender_coupons
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.batch_promotions
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.purchase_orders
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.item_write_offs
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.item_transfer_orders
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.inventory_counts
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.inventory_config
  for each row execute function update_updated_at();

-- ============================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.item_lists           enable row level security;
alter table public.price_groups         enable row level security;
alter table public.price_group_items    enable row level security;
alter table public.deal_groups          enable row level security;
alter table public.deal_group_components enable row level security;
alter table public.item_list_deal_groups enable row level security;
alter table public.tender_coupons       enable row level security;
alter table public.batch_promotions     enable row level security;
alter table public.batch_promotion_items enable row level security;
alter table public.liquor_imports       enable row level security;
alter table public.purchase_orders      enable row level security;
alter table public.purchase_order_lines enable row level security;
alter table public.item_write_offs      enable row level security;
alter table public.item_write_off_lines enable row level security;
alter table public.item_transfer_orders enable row level security;
alter table public.item_transfer_lines  enable row level security;
alter table public.inventory_counts     enable row level security;
alter table public.inventory_count_lines enable row level security;
alter table public.batch_posts          enable row level security;
alter table public.inventory_config     enable row level security;

-- ============================================================
-- PART 4: RLS POLICIES
-- ============================================================

-- Helper: admin/manager check
-- (select using true; insert/update/delete require admin or manager role)

-- item_lists
create policy "item_lists_select" on public.item_lists for select to authenticated using (true);
create policy "item_lists_insert" on public.item_lists for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_lists_update" on public.item_lists for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_lists_delete" on public.item_lists for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- price_groups
create policy "price_groups_select" on public.price_groups for select to authenticated using (true);
create policy "price_groups_insert" on public.price_groups for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "price_groups_update" on public.price_groups for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "price_groups_delete" on public.price_groups for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- price_group_items
create policy "price_group_items_select" on public.price_group_items for select to authenticated using (true);
create policy "price_group_items_insert" on public.price_group_items for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "price_group_items_delete" on public.price_group_items for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- deal_groups
create policy "deal_groups_select" on public.deal_groups for select to authenticated using (true);
create policy "deal_groups_insert" on public.deal_groups for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "deal_groups_update" on public.deal_groups for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "deal_groups_delete" on public.deal_groups for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- deal_group_components
create policy "deal_group_components_select" on public.deal_group_components for select to authenticated using (true);
create policy "deal_group_components_insert" on public.deal_group_components for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "deal_group_components_update" on public.deal_group_components for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "deal_group_components_delete" on public.deal_group_components for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- item_list_deal_groups
create policy "item_list_deal_groups_select" on public.item_list_deal_groups for select to authenticated using (true);
create policy "item_list_deal_groups_insert" on public.item_list_deal_groups for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_list_deal_groups_delete" on public.item_list_deal_groups for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- tender_coupons
create policy "tender_coupons_select" on public.tender_coupons for select to authenticated using (true);
create policy "tender_coupons_insert" on public.tender_coupons for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "tender_coupons_update" on public.tender_coupons for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "tender_coupons_delete" on public.tender_coupons for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- batch_promotions
create policy "batch_promotions_select" on public.batch_promotions for select to authenticated using (true);
create policy "batch_promotions_insert" on public.batch_promotions for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "batch_promotions_update" on public.batch_promotions for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "batch_promotions_delete" on public.batch_promotions for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- batch_promotion_items
create policy "batch_promotion_items_select" on public.batch_promotion_items for select to authenticated using (true);
create policy "batch_promotion_items_insert" on public.batch_promotion_items for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "batch_promotion_items_delete" on public.batch_promotion_items for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- liquor_imports
create policy "liquor_imports_select" on public.liquor_imports for select to authenticated using (true);
create policy "liquor_imports_insert" on public.liquor_imports for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "liquor_imports_update" on public.liquor_imports for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "liquor_imports_delete" on public.liquor_imports for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- purchase_orders
create policy "purchase_orders_select" on public.purchase_orders for select to authenticated using (true);
create policy "purchase_orders_insert" on public.purchase_orders for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "purchase_orders_update" on public.purchase_orders for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "purchase_orders_delete" on public.purchase_orders for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- purchase_order_lines
create policy "purchase_order_lines_select" on public.purchase_order_lines for select to authenticated using (true);
create policy "purchase_order_lines_insert" on public.purchase_order_lines for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "purchase_order_lines_delete" on public.purchase_order_lines for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- item_write_offs
create policy "item_write_offs_select" on public.item_write_offs for select to authenticated using (true);
create policy "item_write_offs_insert" on public.item_write_offs for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_write_offs_update" on public.item_write_offs for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_write_offs_delete" on public.item_write_offs for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- item_write_off_lines
create policy "item_write_off_lines_select" on public.item_write_off_lines for select to authenticated using (true);
create policy "item_write_off_lines_insert" on public.item_write_off_lines for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_write_off_lines_delete" on public.item_write_off_lines for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- item_transfer_orders
create policy "item_transfer_orders_select" on public.item_transfer_orders for select to authenticated using (true);
create policy "item_transfer_orders_insert" on public.item_transfer_orders for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_transfer_orders_update" on public.item_transfer_orders for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_transfer_orders_delete" on public.item_transfer_orders for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- item_transfer_lines
create policy "item_transfer_lines_select" on public.item_transfer_lines for select to authenticated using (true);
create policy "item_transfer_lines_insert" on public.item_transfer_lines for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "item_transfer_lines_delete" on public.item_transfer_lines for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- inventory_counts
create policy "inventory_counts_select" on public.inventory_counts for select to authenticated using (true);
create policy "inventory_counts_insert" on public.inventory_counts for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "inventory_counts_update" on public.inventory_counts for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "inventory_counts_delete" on public.inventory_counts for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- inventory_count_lines
create policy "inventory_count_lines_select" on public.inventory_count_lines for select to authenticated using (true);
create policy "inventory_count_lines_insert" on public.inventory_count_lines for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "inventory_count_lines_delete" on public.inventory_count_lines for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- batch_posts
create policy "batch_posts_select" on public.batch_posts for select to authenticated using (true);
create policy "batch_posts_insert" on public.batch_posts for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "batch_posts_delete" on public.batch_posts for delete to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));

-- inventory_config
create policy "inventory_config_select" on public.inventory_config for select to authenticated using (true);
create policy "inventory_config_insert" on public.inventory_config for insert to authenticated
  with check (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
create policy "inventory_config_update" on public.inventory_config for update to authenticated
  using (exists (select 1 from public.user_profiles up join public.roles r on r.id = up.role_id where up.id = auth.uid() and r.name in ('admin','manager')));
