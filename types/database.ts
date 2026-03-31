// ============================================================
// Station Jet Database Types — Phase 1
// These mirror the Supabase schema. Replace with generated
// types later via: supabase gen types typescript
// ============================================================

export interface Role {
  id: string;
  name: "admin" | "manager" | "employee" | "viewer";
  description: string | null;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface Station {
  id: string;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  pos_type: string | null;
  status: "active" | "inactive" | "pending";
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  role_id: string | null;
  station_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  role?: Role;
  station?: Station;
}

export interface FuelGrade {
  id: string;
  station_id: string;
  name: string;
  code: string;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FuelTank {
  id: string;
  station_id: string;
  fuel_grade_id: string;
  tank_number: string;
  capacity_litres: number;
  low_level_threshold: number;
  is_active: boolean;
  created_at: string;
  // Joined fields
  fuel_grade?: FuelGrade;
}

export interface FuelTankReading {
  id: string;
  tank_id: string;
  volume_litres: number;
  temperature_c: number | null;
  water_level_mm: number | null;
  reading_at: string;
  source: "manual" | "atg" | "import";
  created_at: string;
}

export interface StoreMetric {
  id: string;
  station_id: string;
  metric_date: string;
  sales_amount: number;
  transaction_count: number;
  items_on_hand: number;
  inventory_value: number;
  created_at: string;
}

export interface FuelSalesSummary {
  id: string;
  station_id: string;
  fuel_grade_id: string;
  summary_date: string;
  dollars_sold: number;
  units_sold: number;
  avg_price: number;
  avg_margin: number;
  gross_profit: number;
  created_at: string;
  // Joined fields
  fuel_grade?: FuelGrade;
}

export interface SystemSetting {
  id: string;
  station_id: string | null;
  key: string;
  value: unknown;
  category: string;
  created_at: string;
  updated_at: string;
}

// Tank with its latest reading — used on dashboard
export interface TankStatus {
  tank: FuelTank;
  latest_reading: FuelTankReading | null;
  fill_percentage: number;
  is_low: boolean;
}

// Dashboard store metrics summary
export interface StoreMetricsSummary {
  sales_this_month: number;
  sales_this_year: number;
  items_on_hand: number;
  inventory_value: number;
  monthly_trend: number; // percentage change vs prior month
  yearly_trend: number;  // percentage change vs prior year
}

// ============================================================
// Phase 2 — Product, Pricing & Catalog
// ============================================================

export interface Department {
  id: string;
  station_id: string;
  name: string;
  short_name: string | null;
  pcats_code: string | null;
  host_product_code: string | null;
  sales_restriction: string | null;
  taxes: string[];
  include_in_sales_report: boolean;
  include_in_shift_report: boolean;
  status: "active" | "inactive";
  sort_order: number;
  external_id: string | null;
  loyalty_eligible: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface Subdepartment {
  id: string;
  station_id: string;
  department_id: string;
  name: string;
  gl_code: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Supplier {
  id: string;
  station_id: string;
  name: string;
  account_number: string | null;
  primary_contact: string | null;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  country: string | null;
  province: string | null;
  postal_code: string | null;
  status: "active" | "inactive";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface Item {
  id: string;
  station_id: string;
  plu: string | null;
  upc: string | null;
  part_number: string | null;
  description: string;
  french_description: string | null;
  department_id: string | null;
  subdepartment_id: string | null;
  supplier_id: string | null;
  retail_price: number;
  bottle_deposit: number;
  tax_codes: string[];
  case_size: number | null;
  case_cost: number | null;
  unit_cost: number | null;
  weighted_avg_cost: number | null;
  margin: number | null;
  external_id: string | null;
  age_restriction: number | null;
  loyalty_eligible: boolean;
  conexxus_product_code: string | null;
  quantity_pricing: { quantity: number; price: number }[] | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  department?: Department;
  subdepartment?: Subdepartment;
  supplier?: Supplier;
}

export interface ShelfTag {
  id: string;
  station_id: string;
  item_id: string;
  unit_or_order: "EA" | "CS";
  created_at: string;
  item?: Item;
}

export interface Payout {
  id: string;
  station_id: string;
  description: string;
  french_description: string | null;
  external_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PriceBookSetting {
  id: string;
  station_id: string;
  category: "payments" | "host_product_codes" | "item_locations";
  key: string;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Phase 3 — Promotions, Inventory Operations & Fuel
// ============================================================

export interface ItemList {
  id: string;
  station_id: string;
  description: string;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
  updated_at: string;
  deal_group_count?: number;
}

export interface PriceGroup {
  id: string;
  station_id: string;
  description: string;
  availability: string | null;
  unit_price: number;
  external_id: string | null;
  french_description: string | null;
  quantity_pricing: { quantity: number; price: number }[] | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface DealGroup {
  id: string;
  station_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  availability: string | null;
  external_id: string | null;
  french_description: string | null;
  fuel_deal_config: Record<string, unknown> | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  component_count?: number;
}

export interface DealGroupComponent {
  id: string;
  deal_group_id: string;
  description: string;
  component_type: string | null;
  amount: number | null;
  created_at: string;
}

export interface TenderCoupon {
  id: string;
  station_id: string;
  description: string;
  type_of_discount: "fixed" | "percentage" | "amount_off";
  amount: number;
  prompt_for_amount: boolean;
  max_per_customer: number;
  external_id: string | null;
  french_description: string | null;
  available_always: boolean;
  start_date: string | null;
  end_date: string | null;
  is_disabled: boolean;
  upc: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchPromotion {
  id: string;
  station_id: string;
  promotion_price: number;
  comments: string | null;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "expired";
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface LiquorImport {
  id: string;
  station_id: string;
  is_regular: boolean;
  lto_start_date: string | null;
  lto_end_date: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  item_count: number;
  matched_count: number;
  imported_at: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  station_id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  expected_date: string | null;
  received_date: string | null;
  status: "draft" | "submitted" | "received" | "cancelled";
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface ItemWriteOff {
  id: string;
  station_id: string;
  status: "draft" | "posted";
  total_amount: number;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemTransferOrder {
  id: string;
  station_id: string;
  source_site: string | null;
  destination_site: string | null;
  status: "draft" | "submitted" | "received" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface InventoryCount {
  id: string;
  station_id: string;
  status: "draft" | "counting" | "posted";
  counted_at: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchPost {
  id: string;
  station_id: string;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  status: "pending" | "completed" | "failed";
  posted_at: string | null;
  created_at: string;
}

export interface InventoryConfig {
  id: string;
  station_id: string;
  settings: Record<string, unknown>;
  updated_at: string;
}

export interface ParsedDipRow {
  site_id: string;
  date: string;
  time: string;
  tank_no: string;
  product: string;
  litres_tc: number;
  litres_gross: number;
  ullage: number;
  dip: number;
  water: number;
  temp: number;
}

// ============================================================
// Phase 4 — Administration, Access & Operational Control
// ============================================================

export interface Tax {
  id: string;
  station_id: string;
  name: string;
  percentage: number;
  use_in_po: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminOption {
  id: string;
  station_id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  category: string | null;
  created_at: string;
  updated_at: string;
  site_count?: number;
}

export interface SiteDetail {
  id: string;
  station_id: string;
  site_code: string | null;
  pending_changes: number;
  sftp_enabled: boolean;
  realtime_enabled: boolean;
  last_sync_at: string | null;
  last_heartbeat_at: string | null;
  connectivity_notes: string | null;
  updated_at: string;
}

export interface Vendor {
  id: string;
  station_id: string;
  vendor_code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReconciliation {
  id: string;
  station_id: string;
  report_date: string;
  shift_count: number;
  status: "pending" | "reconciled" | "approved";
  fuel_volume: number;
  fuel_sales: number;
  store_sales: number;
  other_sales: number;
  taxes: number;
  non_cash_tender: number;
  deposits: number;
  payouts: number;
  over_short_volume: number;
  over_short_dollars: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Phase 5 — Financial Management
// ============================================================

export interface IncomeStatementEntry {
  id: string;
  station_id: string;
  fiscal_year: number;
  month: number;
  section: string;
  line_item: string;
  sort_order: number;
  amount: number;
  is_override: boolean;
  created_at: string;
  updated_at: string;
}

// Computed display shape — one row per line_item with 12 monthly amounts
export interface IncomeStatementRow {
  section: string;
  line_item: string;
  sort_order: number;
  months: number[]; // index 0 = Jan … 11 = Dec
  total: number;
  is_subtotal?: boolean;
  is_header?: boolean;
}

// ============================================================
// Phase 6 — Pump Report Import (Bulloch POS / XSite JSON)
// ============================================================

export interface PumpReport {
  id: string;
  station_id: string;
  business_date: string;
  report_number: number | null;
  external_id: string | null;
  status: "open" | "closed";
  shift_count: number;
  fuel_tax_rate: number;
  fuel_tax_labels: unknown[];
  site_name: string | null;
  site_external_id: string | null;
  pos_type: string | null;
  raw_json: Record<string, unknown>;
  fuel_sold_dollars: number;
  fuel_sold_units: number;
  fuel_cost_of_sales: number;
  fuel_profit: number;
  fuel_margin: number;
  fuel_over_short: number;
  financial_over_short: number;
  financial_additive: number;
  financial_subtractive: number;
  financial_memo: number;
  sections: RawSection[];
  shifts: RawShift[];
  issues: { error?: RawIssue[]; warning?: RawIssue[] };
  deliveries: unknown[];
  imported_by: string | null;
  imported_at: string;
  created_at: string;
  updated_at: string;
  // Joined
  pumps?: PumpReportPump[];
  grades?: PumpReportGrade[];
}

export interface PumpReportPump {
  id: string;
  pump_report_id: string;
  pump_number: number;
  hose_number: number;
  grade_name: string;
  grade_external_id: string | null;
  fuel_grade_id: string | null;
  meter_dollars: number;
  meter_units: number;
  previous_meter_dollars: number;
  previous_meter_units: number;
  meter_change_dollars: number;
  meter_change_units: number;
  sold_dollars: number;
  sold_units: number;
  created_at: string;
}

export interface PumpReportGrade {
  id: string;
  pump_report_id: string;
  fuel_grade_id: string | null;
  external_id: string | null;
  name: string;
  service_level: string | null;
  sold_units: number;
  sold_dollars: number;
  average_price: number;
  actual_price: number;
  average_cost: number;
  cost_of_sales: number;
  profit: number;
  profit_percentage: number;
  margin: number;
  blended: boolean;
  blend: { product_id_1: string | null; percentage_1: number; product_id_2: string | null; percentage_2: number } | null;
  commission: number;
  sold_units_crind: number;
  sold_dollars_crind: number;
  sold_units_kiosk: number;
  sold_dollars_kiosk: number;
  tax_one_crind: number;
  tax_two_crind: number;
  tax_one: number;
  tax_two: number;
  product_opening: number;
  product_closing: number;
  product_deliveries: number;
  dispensed_tanks: number;
  dispensed_meters: number;
  dispensed_units_to_date: number;
  over_short: number;
  over_short_carry_forward: number;
  inventory_avg_cost: number;
  opening_avg_cost: number;
  value_of_inventory: number;
  created_at: string;
}

// Raw pumps.json sub-types for parsing

export interface RawShift {
  shift_code: string;
  business_date: string;
  beginning: string;
  ending: string;
  shift_number: string;
}

export interface RawTank {
  product_id: string;
  product_name: string;
  external_id: string;
  capacity: number;
  dip: number;
  units: number;
  previous_units: number;
  change_units: number;
  water: number;
  closing_qty: string;
}

export interface RawPump {
  pump_number: number;
  hose_number: number;
  grade_name: string;
  grade_id: string;
  meter_dollars: number;
  meter_units: number;
  previous_meter_dollars: number;
  previous_meter_units: number;
  meter_change_dollars: number;
  meter_change_units: number;
  sold_dollars: number;
  sold_units: number;
}

export interface RawGrade {
  external_id: string;
  name: string;
  service_level: string;
  sold_units: number;
  sold_dollars: number;
  average_price: number;
  actual_price: number;
  commission: number;
  blended: boolean;
  average_cost: number | string;
  cost_of_sales: number | string;
  profit: number;
  profit_percentage: number;
  margin: number | string;
  blend: { product_id_1: string | null; percentage_1: number; product_id_2: string | null; percentage_2: number };
}

export interface RawGradeCrind {
  external_id: string;
  name: string;
  service_level: string;
  sold_units_crind: number;
  sold_dollars_crind: number;
  sold_units_kiosk: number;
  sold_dollars_kiosk: number;
  tax_one_crind: number;
  tax_two_crind: number;
  tax_one: number;
  tax_two: number;
}

export interface RawProduct {
  external_id: string;
  name: string;
  opening: number;
  closing: number;
  deliveries: number;
  dispensed_tanks: number;
  dispensed_meters: number;
  dispensed_units_to_date: number;
  over_short: number;
  over_short_carry_forward: number;
  average_cost: number;
  opening_average_cost: number;
  value_of_inventory: number | string;
}

export interface RawSectionCategory {
  external_id: string;
  name: string;
  gl_number: string | null;
  selector: string | null;
  commission_percentage: number | null;
  count: number;
  count_alt: number;
  amount: number;
  amount_alt: number;
  commission: number;
  extra: string;
}

export interface RawSection {
  external_id: string;
  name: string;
  type: "additive" | "subtractive" | "memo";
  is_locked: boolean;
  ord: number;
  is_required: boolean;
  is_in_list: boolean;
  dealer_commission: boolean;
  count: number;
  count_alt: number;
  amount: number;
  amount_alt: number;
  commission: number;
  categories: RawSectionCategory[];
}

export interface RawIssue {
  issue: string;
  identifier: string | null;
  category: string;
}

export interface RawPumpsJson {
  id: string | number;
  business_date: string;
  number: number;
  status: string;
  user: { id: number; external_id: string; name: string };
  site: { id: number; name: string; pos: string; external_id: string; pos_version: string; item_sales_version: string };
  client: { id: number };
  fuel_tax_rate: number;
  fuel_tax_labels: { external_id: string; name: string; default_rate: number }[];
  shifts: RawShift[];
  tanks: RawTank[];
  pumps: RawPump[];
  grades: RawGrade[];
  grades_crind: RawGradeCrind[];
  products: RawProduct[];
  sections: RawSection[];
  financial: {
    types: {
      summary: { over_short: number; commission: number };
      additive: { amount: number; amount_alt: number; count: number; count_alt: number };
      subtractive: { amount: number; amount_alt: number; count: number; count_alt: number };
      memo: { amount: number; amount_alt: number; count: number; count_alt: number };
    };
  };
  fuel: {
    sold_dollars: number;
    sold_units: number;
    cost_of_sales: number;
    average_price: number;
    profit: number;
    cents_per_unit: number;
    margin: number | string;
    over_short: number;
    over_short_percentage: number;
  };
  issues: { error: RawIssue[]; warning: RawIssue[] };
  deliveries: unknown[];
  comments: string | null;
}

// ============================================================
// Phase 7 — BT9000 Price Book Import
// ============================================================

export interface BT9000Metadata {
  bt9000Version: string;
  generatedBy: string;
  stationId: string;
  fileCreationDate: string;
}

export interface BT9000Department {
  departmentNumber: string;
  description: string;
  shiftReportFlag: boolean;
  salesSummaryReport: boolean;
  conexxusProductCode: string | null;
  essoHostDepartment: boolean;
  loyaltyCardEligible: boolean;
  defaultItem: string | null;
}

export interface BT9000PriceGroup {
  priceGroupNumber: string;
  englishDescription: string;
  frenchDescription: string;
  price: number;
  quantityPricing: { quantity: number; price: number }[] | null;
}

export interface BT9000Item {
  itemNumber: string;
  price: number;
  englishDescription: string;
  frenchDescription: string;
  department: string;
  conexxusProductCode: string | null;
  loyaltyCardEligible: boolean;
  tax1: boolean;
  tax2: boolean;
  upcs: string[];
  priceGroup: string | null;
  itemDeposit: number | null;
  ageRequirements: number | null;
  quantityPricing: { quantity: number; price: number }[] | null;
}

export interface BT9000DealGroupComponent {
  item: string | null;
  priceGroup: string | null;
  quantity: number;
  priceForQuantityOne: number;
  percentageOff: number | null;
  amountOff: number | null;
}

export interface BT9000DealGroup {
  dealGroupNumber: string;
  englishDescription: string;
  frenchDescription: string;
  components: BT9000DealGroupComponent[];
  requiresFuel: { posGrade: number; litres: number } | null;
  cplFuelDiscounting: { posGrade: number; cplDiscount: number } | null;
}

export interface BT9000Payout {
  payoutNumber: string;
  englishDescription: string;
  frenchDescription: string;
}

export interface BT9000TenderCoupon {
  itemNumber: string;
  englishDescription: string;
  frenchDescription: string;
}

export interface BT9000ParsedData {
  metadata: BT9000Metadata;
  departments: BT9000Department[];
  priceGroups: BT9000PriceGroup[];
  items: BT9000Item[];
  dealGroups: BT9000DealGroup[];
  payouts: BT9000Payout[];
  tenderCoupons: BT9000TenderCoupon[];
}

export interface BT9000Import {
  id: string;
  station_id: string;
  file_name: string;
  bt9000_version: string | null;
  bt9000_station_id: string | null;
  file_creation_date: string | null;
  departments_count: number;
  items_count: number;
  price_groups_count: number;
  deal_groups_count: number;
  payouts_count: number;
  tender_coupons_count: number;
  status: "in_progress" | "completed" | "failed";
  imported_by: string | null;
  imported_at: string;
  created_at: string;
}
