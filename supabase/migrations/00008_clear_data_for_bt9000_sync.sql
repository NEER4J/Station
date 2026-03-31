-- ============================================================
-- Clear existing dummy data before BT9000 Price Book sync
-- Order matters: delete children before parents (FK constraints)
-- ============================================================

-- Promotion junction tables
delete from public.price_group_items;
delete from public.item_list_deal_groups;
delete from public.batch_promotion_items;

-- Promotion tables
delete from public.deal_group_components;
delete from public.deal_groups;
delete from public.price_groups;
delete from public.tender_coupons;
delete from public.batch_promotions;
delete from public.item_lists;

-- Inventory operations (depend on items)
delete from public.inventory_count_lines;
delete from public.inventory_counts;
delete from public.item_write_off_lines;
delete from public.item_write_offs;
delete from public.item_transfer_lines;
delete from public.item_transfer_orders;
delete from public.purchase_order_lines;
delete from public.purchase_orders;

-- Item children
delete from public.item_upcs;
delete from public.shelf_tags;

-- Items
delete from public.items;

-- Departments & subdepartments
delete from public.subdepartments;
delete from public.departments;

-- Payouts
delete from public.payouts;

-- Import history
delete from public.bt9000_imports;
