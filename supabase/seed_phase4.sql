-- ============================================================
-- Station Jet Phase 4 Seed Data
-- Run AFTER 00004_phase4_schema.sql and the Phase 3 seed
-- ============================================================

-- Station reference
-- b1000000-0000-0000-0000-000000000001 = ON Esso Bryanston

-- ============================================================
-- 1. TAXES
-- ============================================================

insert into public.taxes (id, station_id, name, percentage, use_in_po, sort_order) values
  ('cb100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'HST1', 13.0000, true,  1),
  ('cb100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'HST2', 5.0000,  true,  2),
  ('cb100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'ECO',  0.0800,  false, 3),
  ('cb100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'DEP',  0.1000,  false, 4)
on conflict (station_id, name) do nothing;

-- ============================================================
-- 2. ADMIN OPTIONS
-- ============================================================

insert into public.admin_options (station_id, key, value) values
  ('b1000000-0000-0000-0000-000000000001', 'NEXT_INVOICE_SEQ', '10042'),
  ('b1000000-0000-0000-0000-000000000001', 'RECEIPT_FOOTER', 'Thank you for shopping at Esso Bryanston!'),
  ('b1000000-0000-0000-0000-000000000001', 'AUTO_ROUND_CASH', 'true'),
  ('b1000000-0000-0000-0000-000000000001', 'SHIFT_CLOSE_PROMPT', 'true'),
  ('b1000000-0000-0000-0000-000000000001', 'DEFAULT_TAX_CODE', 'HST1'),
  ('b1000000-0000-0000-0000-000000000001', 'LOYALTY_ENABLED', 'false')
on conflict (station_id, key) do nothing;

-- ============================================================
-- 3. REGIONS
-- ============================================================

insert into public.regions (id, name, category) values
  ('cc100000-0000-0000-0000-000000000001', 'Ontario South', 'province'),
  ('cc100000-0000-0000-0000-000000000002', 'Ontario North', 'province'),
  ('cc100000-0000-0000-0000-000000000003', 'Quebec',        'province'),
  ('cc100000-0000-0000-0000-000000000004', 'Atlantic',      'multi-province')
on conflict (name) do nothing;

-- Link station to region
insert into public.region_stations (region_id, station_id) values
  ('cc100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001')
on conflict (region_id, station_id) do nothing;

-- ============================================================
-- 4. SITE DETAILS
-- ============================================================

insert into public.site_details (station_id, site_code, pending_changes, sftp_enabled, realtime_enabled, last_sync_at, last_heartbeat_at, connectivity_notes) values
  ('b1000000-0000-0000-0000-000000000001', '325356', 2, true, true, now() - interval '4 hours', now() - interval '12 minutes', 'Primary uplink via Bell Fibe. Backup LTE modem on UPS.')
on conflict (station_id) do update
  set site_code          = excluded.site_code,
      pending_changes    = excluded.pending_changes,
      sftp_enabled       = excluded.sftp_enabled,
      realtime_enabled   = excluded.realtime_enabled,
      last_sync_at       = excluded.last_sync_at,
      last_heartbeat_at  = excluded.last_heartbeat_at,
      connectivity_notes = excluded.connectivity_notes;

-- ============================================================
-- 5. VENDORS
-- ============================================================

insert into public.vendors (id, station_id, vendor_code, name) values
  ('cd100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'MONERIS', 'Moneris Solutions Corp'),
  ('cd100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'GILBARCO', 'Gilbarco Veeder-Root'),
  ('cd100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'PETROCAN', 'Petro-Canada EDI'),
  ('cd100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'BELLMTS', 'Bell MTS Telecom'),
  ('cd100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'PUROLTR', 'Purolator Courier'),
  ('cd100000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'WASTMGMT', 'Waste Management Inc')
on conflict (station_id, vendor_code) do nothing;

-- ============================================================
-- 6. DAILY RECONCILIATIONS (30 days of data)
-- ============================================================

insert into public.daily_reconciliations (station_id, report_date, shift_count, status, fuel_volume, fuel_sales, store_sales, other_sales, taxes, non_cash_tender, deposits, payouts, over_short_volume, over_short_dollars)
select
  'b1000000-0000-0000-0000-000000000001',
  (current_date - d)::date,
  case when extract(dow from current_date - d) in (0, 6) then 2 else 3 end,
  case
    when d > 2 then 'approved'
    when d = 2 then 'reconciled'
    else 'pending'
  end,
  -- Fuel volume (litres)
  round((3500 + (random() * 1500))::numeric, 2),
  -- Fuel sales ($)
  round((5200 + (random() * 2200))::numeric, 2),
  -- Store sales ($)
  round((2800 + (random() * 1200))::numeric, 2),
  -- Other sales ($)
  round((120 + (random() * 180))::numeric, 2),
  -- Taxes ($)
  round((800 + (random() * 400))::numeric, 2),
  -- Non-cash tender ($)
  round((5500 + (random() * 2500))::numeric, 2),
  -- Deposits ($)
  round((2500 + (random() * 1000))::numeric, 2),
  -- Payouts ($)
  round((150 + (random() * 250))::numeric, 2),
  -- Over/short volume
  round(((random() - 0.5) * 20)::numeric, 2),
  -- Over/short dollars
  round(((random() - 0.5) * 30)::numeric, 2)
from generate_series(0, 29) as d
on conflict (station_id, report_date) do nothing;
