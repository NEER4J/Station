-- ============================================================
-- Station Jet Phase 1 Seed Data
-- Run this AFTER the migration in Supabase SQL Editor
-- ============================================================

-- 1. ROLES
insert into public.roles (id, name, description, permissions) values
  ('a1000000-0000-0000-0000-000000000001', 'admin', 'Full system access', '{"all": true}'),
  ('a1000000-0000-0000-0000-000000000002', 'manager', 'Station management access', '{"view_financials": true, "manage_settings": true, "export_data": true}'),
  ('a1000000-0000-0000-0000-000000000003', 'employee', 'Basic operational access', '{"export_data": true}'),
  ('a1000000-0000-0000-0000-000000000004', 'viewer', 'Read-only access', '{}')
on conflict (name) do nothing;

-- 2. DEMO STATION
insert into public.stations (id, name, address_line1, city, province, country, postal_code, phone, pos_type, status) values
  ('b1000000-0000-0000-0000-000000000001', 'ON Esso Bryanston', '1234 Fanshawe Park Rd W', 'London', 'ON', 'CA', 'N6G 0A4', '(519) 555-0122', 'ESSO', 'active')
on conflict do nothing;

-- 3. FUEL GRADES
insert into public.fuel_grades (id, station_id, name, code, color, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Regular', 'REG', '#22c55e', 1),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Mid-Grade', 'MID', '#3b82f6', 2),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Premium', 'PRM', '#a855f7', 3),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Diesel', 'DSL', '#f59e0b', 4)
on conflict (station_id, code) do nothing;

-- 4. FUEL TANKS
insert into public.fuel_tanks (id, station_id, fuel_grade_id, tank_number, capacity_litres, low_level_threshold) values
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '122', 30000.00, 5000.00),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', '126', 30000.00, 5000.00),
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', '16', 25000.00, 4000.00)
on conflict (station_id, tank_number) do nothing;

-- 5. FUEL TANK READINGS (latest readings for each tank)
insert into public.fuel_tank_readings (tank_id, volume_litres, temperature_c, water_level_mm, reading_at, source) values
  -- Tank 122 (Regular) — 72% full
  ('d1000000-0000-0000-0000-000000000001', 21600.00, 15.2, 2.10, now() - interval '2 hours', 'atg'),
  ('d1000000-0000-0000-0000-000000000001', 21850.00, 15.0, 2.05, now() - interval '6 hours', 'atg'),
  ('d1000000-0000-0000-0000-000000000001', 22100.00, 14.8, 2.00, now() - interval '12 hours', 'atg'),
  -- Tank 126 (Premium) — 45% full
  ('d1000000-0000-0000-0000-000000000002', 13500.00, 14.9, 1.80, now() - interval '2 hours', 'atg'),
  ('d1000000-0000-0000-0000-000000000002', 13750.00, 14.7, 1.75, now() - interval '6 hours', 'atg'),
  ('d1000000-0000-0000-0000-000000000002', 14200.00, 14.5, 1.70, now() - interval '12 hours', 'atg'),
  -- Tank 16 (Diesel) — 18% full — below threshold!
  ('d1000000-0000-0000-0000-000000000003', 4500.00, 13.8, 3.20, now() - interval '2 hours', 'atg'),
  ('d1000000-0000-0000-0000-000000000003', 4800.00, 13.5, 3.15, now() - interval '6 hours', 'atg'),
  ('d1000000-0000-0000-0000-000000000003', 5100.00, 13.2, 3.10, now() - interval '12 hours', 'atg');

-- 6. STORE METRICS (30 days of data)
insert into public.store_metrics (station_id, metric_date, sales_amount, transaction_count, items_on_hand, inventory_value)
select
  'b1000000-0000-0000-0000-000000000001',
  current_date - (gs.day || ' days')::interval,
  round((3500 + random() * 2500)::numeric, 2),
  (120 + floor(random() * 80))::int,
  (2050 + floor(random() * 150))::int,
  round((145000 + random() * 15000)::numeric, 2)
from generate_series(0, 29) as gs(day)
on conflict (station_id, metric_date) do nothing;

-- 7. FUEL SALES SUMMARY (30 days for each grade)
-- Regular
insert into public.fuel_sales_summary (station_id, fuel_grade_id, summary_date, dollars_sold, units_sold, avg_price, avg_margin, gross_profit)
select
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  current_date - (gs.day || ' days')::interval,
  round((2800 + random() * 1200)::numeric, 2),
  round((1800 + random() * 600)::numeric, 3),
  round((1.549 + random() * 0.06)::numeric, 3),
  round((0.065 + random() * 0.015)::numeric, 3),
  round((120 + random() * 50)::numeric, 2)
from generate_series(0, 29) as gs(day)
on conflict (station_id, fuel_grade_id, summary_date) do nothing;

-- Mid-Grade
insert into public.fuel_sales_summary (station_id, fuel_grade_id, summary_date, dollars_sold, units_sold, avg_price, avg_margin, gross_profit)
select
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000002',
  current_date - (gs.day || ' days')::interval,
  round((800 + random() * 400)::numeric, 2),
  round((480 + random() * 200)::numeric, 3),
  round((1.649 + random() * 0.06)::numeric, 3),
  round((0.075 + random() * 0.015)::numeric, 3),
  round((38 + random() * 18)::numeric, 2)
from generate_series(0, 29) as gs(day)
on conflict (station_id, fuel_grade_id, summary_date) do nothing;

-- Premium
insert into public.fuel_sales_summary (station_id, fuel_grade_id, summary_date, dollars_sold, units_sold, avg_price, avg_margin, gross_profit)
select
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000003',
  current_date - (gs.day || ' days')::interval,
  round((1200 + random() * 600)::numeric, 2),
  round((650 + random() * 300)::numeric, 3),
  round((1.799 + random() * 0.06)::numeric, 3),
  round((0.085 + random() * 0.02)::numeric, 3),
  round((58 + random() * 28)::numeric, 2)
from generate_series(0, 29) as gs(day)
on conflict (station_id, fuel_grade_id, summary_date) do nothing;

-- Diesel
insert into public.fuel_sales_summary (station_id, fuel_grade_id, summary_date, dollars_sold, units_sold, avg_price, avg_margin, gross_profit)
select
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000004',
  current_date - (gs.day || ' days')::interval,
  round((1600 + random() * 800)::numeric, 2),
  round((900 + random() * 400)::numeric, 3),
  round((1.699 + random() * 0.06)::numeric, 3),
  round((0.095 + random() * 0.02)::numeric, 3),
  round((88 + random() * 40)::numeric, 2)
from generate_series(0, 29) as gs(day)
on conflict (station_id, fuel_grade_id, summary_date) do nothing;

-- 8. SYSTEM SETTINGS
insert into public.system_settings (station_id, key, value, category) values
  ('b1000000-0000-0000-0000-000000000001', 'financial_summary_visible', 'true', 'display'),
  ('b1000000-0000-0000-0000-000000000001', 'default_currency', '"CAD"', 'general'),
  ('b1000000-0000-0000-0000-000000000001', 'timezone', '"America/Toronto"', 'general'),
  ('b1000000-0000-0000-0000-000000000001', 'items_per_page', '100', 'display')
on conflict (station_id, key) do nothing;
