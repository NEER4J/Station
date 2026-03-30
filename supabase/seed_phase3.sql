-- ============================================================
-- Station Jet Phase 3 Seed Data
-- Run AFTER 00003_phase3_schema.sql and the Phase 2 seed
-- ============================================================

-- Station reference
-- b1000000-0000-0000-0000-000000000001 = ON Esso Bryanston
--
-- Supplier UUIDs from Phase 2 seed:
--   aa100000-...001 = Imperial Tobacco Canada
--   aa100000-...002 = Frito-Lay Canada
--   aa100000-...003 = LCBO Distribution
--   aa100000-...004 = Coca-Cola Bottling Ltd
--   aa100000-...005 = Canada Bread Company

-- ============================================================
-- 1. ITEM LISTS
-- ============================================================

insert into public.item_lists (id, station_id, description, status, sort_order) values
  ('ab100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Summer Snack Promo Bundle', 'active', 1),
  ('ab100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Holiday Beer & Wine Selection', 'active', 2),
  ('ab100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Back-to-School Essentials', 'active', 3),
  ('ab100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Tobacco Weekly Specials', 'active', 4),
  ('ab100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'Energy Drink Feature', 'inactive', 5)
on conflict do nothing;

-- ============================================================
-- 2. PRICE GROUPS
-- ============================================================

insert into public.price_groups (id, station_id, description, availability, unit_price, status) values
  ('ac100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Ghost 473ml Energy Drinks', 'ON Esso Bryanston', 3.49, 'active'),
  ('ac100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Back Woods Cigars', 'ON Esso Bryanston', 12.49, 'active'),
  ('ac100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Players 25 Cigarettes', 'ON Esso Bryanston', 16.99, 'active'),
  ('ac100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Domestic Beer 24pk', 'ON Esso Bryanston', 37.95, 'active'),
  ('ac100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'Soft Drink 591ml Bundle', 'ON Esso Bryanston', 2.29, 'inactive')
on conflict do nothing;

-- Link some items to price groups via PLU lookup
insert into public.price_group_items (price_group_id, item_id)
select 'ac100000-0000-0000-0000-000000000003', id
from public.items
where station_id = 'b1000000-0000-0000-0000-000000000001' and plu = '1001'
on conflict do nothing;

insert into public.price_group_items (price_group_id, item_id)
select 'ac100000-0000-0000-0000-000000000002', id
from public.items
where station_id = 'b1000000-0000-0000-0000-000000000001' and plu = '1004'
on conflict do nothing;

insert into public.price_group_items (price_group_id, item_id)
select 'ac100000-0000-0000-0000-000000000004', id
from public.items
where station_id = 'b1000000-0000-0000-0000-000000000001' and plu = '4001'
on conflict do nothing;

insert into public.price_group_items (price_group_id, item_id)
select 'ac100000-0000-0000-0000-000000000005', id
from public.items
where station_id = 'b1000000-0000-0000-0000-000000000001' and plu in ('8001','8002','8003')
on conflict do nothing;

-- ============================================================
-- 3. DEAL GROUPS
-- ============================================================

insert into public.deal_groups (id, station_id, name, start_date, end_date, availability, status) values
  ('ad100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Flake Combo Deal', '2026-04-01', '2026-06-30', 'ON Esso Bryanston', 'active'),
  ('ad100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Long Weekend Beer Bundle', '2026-05-16', '2026-05-19', 'ON Esso Bryanston', 'active'),
  ('ad100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Energy + Chips Combo', '2026-03-01', '2026-03-31', 'ON Esso Bryanston', 'inactive'),
  ('ad100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Wine & Spirits Pairing', '2026-06-01', '2026-08-31', 'ON Esso Bryanston', 'active')
on conflict do nothing;

-- Deal group components
insert into public.deal_group_components (id, deal_group_id, description, component_type, amount) values
  ('ae100000-0000-0000-0000-000000000001', 'ad100000-0000-0000-0000-000000000001', 'Chocolate Bar 52g', 'item', 2.29),
  ('ae100000-0000-0000-0000-000000000002', 'ad100000-0000-0000-0000-000000000001', 'Chips 235g', 'item', 4.99),
  ('ae100000-0000-0000-0000-000000000003', 'ad100000-0000-0000-0000-000000000001', 'Combo Discount', 'discount', -1.50),
  ('ae100000-0000-0000-0000-000000000004', 'ad100000-0000-0000-0000-000000000002', 'Molson Canadian 24pk', 'item', 39.95),
  ('ae100000-0000-0000-0000-000000000005', 'ad100000-0000-0000-0000-000000000002', 'Labatt Blue 12pk', 'item', 22.95),
  ('ae100000-0000-0000-0000-000000000006', 'ad100000-0000-0000-0000-000000000002', 'Bundle Discount', 'discount', -3.00),
  ('ae100000-0000-0000-0000-000000000007', 'ad100000-0000-0000-0000-000000000003', 'Monster Energy 473ml', 'item', 3.49),
  ('ae100000-0000-0000-0000-000000000008', 'ad100000-0000-0000-0000-000000000003', 'Doritos Nacho 255g', 'item', 4.99)
on conflict do nothing;

-- Link deal groups to item lists
insert into public.item_list_deal_groups (item_list_id, deal_group_id) values
  ('ab100000-0000-0000-0000-000000000001', 'ad100000-0000-0000-0000-000000000001'),
  ('ab100000-0000-0000-0000-000000000001', 'ad100000-0000-0000-0000-000000000003'),
  ('ab100000-0000-0000-0000-000000000002', 'ad100000-0000-0000-0000-000000000002'),
  ('ab100000-0000-0000-0000-000000000002', 'ad100000-0000-0000-0000-000000000004')
on conflict do nothing;

-- ============================================================
-- 4. TENDER COUPONS
-- ============================================================

insert into public.tender_coupons (id, station_id, description, type_of_discount, amount, prompt_for_amount, max_per_customer, available_always, start_date, end_date, is_disabled, upc) values
  ('af100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '$1.00 Off Any Snack', 'fixed', 1.00, false, 1, false, '2026-03-01', '2026-06-30', false, '8991000000001'),
  ('af100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '10% Off Energy Drinks', 'percentage', 10.00, false, 2, false, '2026-04-01', '2026-04-30', false, '8991000000002'),
  ('af100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Staff Discount Coupon', 'percentage', 15.00, false, 1, true, null, null, false, null),
  ('af100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Loyalty Reward $5 Off', 'fixed', 5.00, false, 1, false, '2026-01-01', '2026-12-31', false, '8991000000004'),
  ('af100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'Manager Discretion Discount', 'amount_off', 0.00, true, 1, true, null, null, false, null),
  ('af100000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'Expired Promo Coupon', 'fixed', 2.00, false, 1, false, '2025-01-01', '2025-03-31', true, '8991000000006')
on conflict do nothing;

-- ============================================================
-- 5. BATCH PROMOTIONS
-- ============================================================

insert into public.batch_promotions (id, station_id, promotion_price, comments, start_date, end_date, status) values
  ('ba100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 2.19, 'Spring soft drink promo — all 591ml bottles', '2026-04-01', '2026-05-31', 'active'),
  ('ba100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 15.99, 'Canada Day cigarette special — Players & Export A only', '2026-06-28', '2026-07-04', 'draft'),
  ('ba100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 3.89, 'Holiday chip promo', '2025-12-20', '2025-12-31', 'expired')
on conflict do nothing;

-- Link items to batch promotions
insert into public.batch_promotion_items (batch_promotion_id, item_id)
select 'ba100000-0000-0000-0000-000000000001', id
from public.items
where station_id = 'b1000000-0000-0000-0000-000000000001' and plu in ('8001','8002','8003')
on conflict do nothing;

insert into public.batch_promotion_items (batch_promotion_id, item_id)
select 'ba100000-0000-0000-0000-000000000002', id
from public.items
where station_id = 'b1000000-0000-0000-0000-000000000001' and plu in ('1001','1003')
on conflict do nothing;

insert into public.batch_promotion_items (batch_promotion_id, item_id)
select 'ba100000-0000-0000-0000-000000000003', id
from public.items
where station_id = 'b1000000-0000-0000-0000-000000000001' and plu in ('2001','2002','2003')
on conflict do nothing;

-- ============================================================
-- 6. LIQUOR IMPORTS
-- ============================================================

insert into public.liquor_imports (id, station_id, is_regular, lto_start_date, lto_end_date, status, item_count, matched_count, imported_at) values
  ('bb100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', true,  null,         null,         'completed', 142, 138, now() - interval '14 days'),
  ('bb100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', false, '2026-04-01', '2026-04-30', 'completed',  28,  26, now() - interval '7 days'),
  ('bb100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', true,  null,         null,         'processing', 95,   0, now() - interval '1 day'),
  ('bb100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', false, '2026-05-16', '2026-05-19', 'pending',    12,   0, now())
on conflict do nothing;

-- ============================================================
-- 7. PURCHASE ORDERS
-- ============================================================

insert into public.purchase_orders (id, station_id, supplier_id, invoice_number, invoice_date, expected_date, received_date, status, subtotal, discount_amount, tax_amount, total) values
  ('bc100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000002', 'FLC-2026-0441', '2026-03-10', '2026-03-17', '2026-03-17', 'received',  485.60, 12.14, 63.13,  536.59),
  ('bc100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000004', 'CCB-2026-1892', '2026-03-15', '2026-03-22', null,         'submitted', 312.40,  0.00, 40.61,  353.01),
  ('bc100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000001', 'ITC-2026-0033', '2026-03-20', '2026-03-27', null,         'draft',     940.00, 28.20, 122.20, 1033.00),
  ('bc100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000005', 'CBC-2026-0118', '2026-03-01', '2026-03-08', '2026-03-08', 'received',  164.80,  0.00, 21.42,  186.22),
  ('bc100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000003', 'LCBO-2026-077', '2026-03-18', '2026-03-25', null,         'submitted', 1247.50, 0.00, 162.18, 1409.68)
on conflict do nothing;

-- ============================================================
-- 8. ITEM WRITE-OFFS
-- ============================================================

insert into public.item_write_offs (id, station_id, status, total_amount, posted_at) values
  ('bd100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'posted', 47.80, now() - interval '30 days'),
  ('bd100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'posted', 23.15, now() - interval '15 days'),
  ('bd100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'draft',  12.49, null),
  ('bd100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'posted',  8.97, now() - interval '7 days')
on conflict do nothing;

-- ============================================================
-- 9. ITEM TRANSFER ORDERS
-- ============================================================

insert into public.item_transfer_orders (id, station_id, source_site, destination_site, status) values
  ('be100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'ON Esso Bryanston', 'ON Esso Oakville', 'received'),
  ('be100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'ON Esso Bryanston', 'ON Esso Mississauga', 'submitted'),
  ('be100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'ON Esso Burlington',  'ON Esso Bryanston', 'received'),
  ('be100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'ON Esso Bryanston', 'ON Esso Hamilton', 'draft')
on conflict do nothing;

-- ============================================================
-- 10. INVENTORY COUNTS
-- ============================================================

insert into public.inventory_counts (id, station_id, status, counted_at, posted_at) values
  ('bf100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'posted',   now() - interval '45 days', now() - interval '44 days'),
  ('bf100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'posted',   now() - interval '14 days', now() - interval '13 days'),
  ('bf100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'counting', now() - interval '1 day',   null),
  ('bf100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'draft',    null,                       null)
on conflict do nothing;

-- ============================================================
-- 11. BATCH POSTS
-- ============================================================

insert into public.batch_posts (id, station_id, type, reference_id, reference_type, status, posted_at) values
  ('ca100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'write_off',       'bd100000-0000-0000-0000-000000000001', 'item_write_offs',       'completed', now() - interval '30 days'),
  ('ca100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'inventory_count', 'bf100000-0000-0000-0000-000000000001', 'inventory_counts',      'completed', now() - interval '44 days'),
  ('ca100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'write_off',       'bd100000-0000-0000-0000-000000000002', 'item_write_offs',       'completed', now() - interval '15 days'),
  ('ca100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'inventory_count', 'bf100000-0000-0000-0000-000000000002', 'inventory_counts',      'completed', now() - interval '13 days'),
  ('ca100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'write_off',       'bd100000-0000-0000-0000-000000000004', 'item_write_offs',       'completed', now() - interval '7 days'),
  ('ca100000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'price_update',    'ba100000-0000-0000-0000-000000000001', 'batch_promotions',      'completed', now() - interval '2 days'),
  ('ca100000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000001', 'liquor_import',   'bb100000-0000-0000-0000-000000000001', 'liquor_imports',        'completed', now() - interval '14 days'),
  ('ca100000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000001', 'liquor_import',   'bb100000-0000-0000-0000-000000000002', 'liquor_imports',        'completed', now() - interval '7 days'),
  ('ca100000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000001', 'liquor_import',   'bb100000-0000-0000-0000-000000000003', 'liquor_imports',        'pending',   null)
on conflict do nothing;

-- ============================================================
-- 12. INVENTORY CONFIG
-- ============================================================

insert into public.inventory_config (station_id, settings) values
  ('b1000000-0000-0000-0000-000000000001', '{
    "track_inventory": true,
    "auto_reorder": false,
    "allow_negative_stock": false,
    "variance_threshold": 5,
    "cost_method": "average"
  }')
on conflict (station_id) do update
  set settings = excluded.settings;
