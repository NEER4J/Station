# Phase 2 - Product, Pricing, and Catalog Management

## Objective
Implement all core catalog and pricing controls used in daily retail operations.

## Source coverage from `plan.md`
- `Items Management` (repeated twice in source; deduplicated here)
- `Add / Edit Item Modal`
- `Shelf Tag Report`
- `Payouts`
- `Departments`
- `Subdepartments`
- `Suppliers`
- `Price Book Settings`

## Items Management
**URL:** `/dashboard/Items`

### Header and action toolbar
- Page title: `Items`
- Active item counter (example: `2118 Active`) with dropdown filter.
- Global controls in toolbar for list-level actions.

### Pagination controls
- Present at both top and bottom of grid.
- Selectable page size (default 100).
- Range indicator (example: `1-50 of 50`).
- Previous/Next arrow navigation.

### Items data table columns
| Column | Description |
| --- | --- |
| PLU / UPC / Part # | Item identifiers including PLU, barcode, and part number. |
| Description | Item name with link to detail/edit view. |
| Categorization | Supplier, Department, Subdepartment (example: TOBACCO, SNACKS). |
| Pricing and Taxes | Retail Price, Bottle Deposit, tax codes (example: HST1, HST2). |
| Cost Metrics | Case Size, Case Cost, Unit Cost, Weighted Average Cost. |
| Margin and Status | Calculated margin % and operational status (Active/Inactive). |

### Add / Edit Item modal
- Centralized product configuration interface.
- Structured into:
  - Header Fields (quick access)
  - General Information block
  - Inventory and Ordering block
  - Modal action footer
- Must support validation, create, and update behavior.

## Shelf Tag Report
**URL:** `/dashboard/shelf_tags`

### Header and toolbar
- Title: `Shelf Tag Report`
- Live queue counter (example: `1086 Shelf Tags`)
- Toolbar supports navigation and admin actions.

### Shelf tag data table columns
| Column | Description |
| --- | --- |
| PLU | Sortable price lookup code. |
| UPC | Barcode identifier. |
| Description | Item name and volume (example: SMIRNOFF VODKA (PET) 375ML). |
| Unit Or Order | Unit type (CS, EA, etc.). |
| Case Size | Number of units per case. |
| Unit Price | Current retail shelf price. |
| Last Cost | Most recent unit cost. |
| Case Cost | Last Cost x Case Size. |
| Operation | Delete/removal action from queue. |

## Payouts
**URL:** `/dashboard/payouts`

### Payouts data table columns
| Column | Description |
| --- | --- |
| ID | Numeric unique identifier with sorting. |
| Description | Payout type (LOTTERY, CASH PURCHASE, REFUND, etc.). |
| French Description | Bilingual support text for French regions. |
| Operations | Edit and Delete actions. |

## Departments
**URL:** `/dashboard/departments`

### Departments data table columns
| Column | Description |
| --- | --- |
| ID | Department unique identifier. |
| Name | Formal department name (ALCOHOL, BEER, BAKERY GOODS). |
| Short Name | POS/display abbreviation (example: LCBO). |
| PCATS / Conexxus | Industry category/integration codes. |
| Host Product Code | Mapping for host/ERP sync. |
| Sales Restriction | Age/time restrictions at department level. |
| Taxes | Auto-applied tax codes (HST1/HST2). |
| Sales Report | Include/exclude in sales summary. |
| Shift Report | Include/exclude in shift reconciliation. |
| # of Items | Real-time assigned item count. |
| Status | Active/Inactive state. |

## Subdepartments
**URL:** `/dashboard/subdepartments`

### Subdepartments data table columns
| Column | Description |
| --- | --- |
| Id | Unique id linking to edit screen. |
| Name | Subcategory name (ALCOHOL, BAKERY GOODS, BASIC GROCERIES). |
| Department | Parent department relation. |
| GL Code | General Ledger mapping code. |
| Status | Operational badge (Active/Inactive). |

## Suppliers
**URL:** `/dashboard/suppliers`

### Header and toolbar behavior
- Page header includes title, back arrow, global add button.
- Displays active supplier count (example: `37 Active Suppliers`).
- Includes active/inactive toggle and filter search.

### Inline quick-add
- Create suppliers inline above table without leaving page.

### Suppliers data table columns
| Column | Description |
| --- | --- |
| ID | Unique supplier identifier. |
| Name | Supplier name linking to detail/edit view. |
| Account # | Vendor account number. |
| Primary Contact | Main vendor contact person. |
| Phone Number | Contact phone number. |
| Address 1 / City | Main office address data. |
| Country / Province / State | Region fields (for example, CA). |
| Postal / Zip Code | Mailing code. |
| Number of Items | Real-time sourced item count. |
| Status | Active/inactive toggle per row. |

## Price Book Settings
**URL:** `/dashboard/price_book_settings`

### Header and site selector
- Back navigation arrow.
- Site selector (example: ON Esso Bryanston) for site-specific settings context.

### Configuration cards
| Setting Category | Columns and Inputs | Purpose |
| --- | --- | --- |
| Payments | Type, Name | Configure accepted payment method taxonomy. |
| Host Product Codes | Code, Description | Map internal inventory to external host/ERP codes. |
| Item Locations | Sort | Define physical/logical item placement. |

## Build checklist
- Implement all catalog entities with CRUD, filtering, sorting, and pagination.
- Maintain relational integrity across items, departments, subdepartments, and suppliers.
- Implement item modal validation and persistence.
- Implement shelf tag queue and tag lifecycle operations.
- Implement payout management
 with bilingual field support.
- Implement price book settings with site-scoped configuration behavior.

## Acceptance criteria
- Catalog teams can manage product records and structure end-to-end.
- Pricing/classification metadata stays consistent across dependent modules.
- All listed columns and workflows from source are represented and functional.
