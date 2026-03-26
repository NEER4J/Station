# Phase 3 - Promotions, Inventory Operations, and Fuel

## Objective
Ship all operational workflows tied to promotions, inventory movement/control, and fuel setup/import.

## Source coverage from `plan.md`
- `Promotion Management > Item Lists`
- `Price Groups`
- `Deal Groups`
- `Tender Coupons`
- `Batch Promotions`
- `Liquor Imports`
- `Inventory Management > Purchase Orders` (repeated twice in source; deduplicated here)
- `Fuel Management`
- `Item Write-Off`
- `Item Transfer Order`
- `Physical Counts`
- `Batch Posts`
- `Inventory Control Configuration`
- `Fuel Configuration`
- `Fuel Tank Import`

## Promotion Management

### Item Lists
**URL:** `/dashboard/item_lists`

| Column | Description |
| --- | --- |
| ID | Sortable unique list identifier. |
| Description | Item list purpose/name. |
| Linked Deal Groups | Deal groups connected to list. |

### Price Groups
**URL:** `/dashboard/price_groups`

| Column | Description |
| --- | --- |
| ID | Unique group id (example: 0000000010001). |
| Description | Group name (Ghost 473ml, Back Woods, Players 25). |
| Availability | Site/region assignment selector (example: ON Esso Bryanston). |
| Unit Price | Price applied to all linked items. |
| Items | Live count of linked inventory items. |
| Operations | Settings and Delete actions. |

### Deal Groups
**URL:** `/dashboard/deal_groups`

| Column | Description |
| --- | --- |
| ID | Sortable unique identifier. |
| Name | Deal name (example: flake combo). |
| Start Date | Promotion start date. |
| End Date | Promotion end date. |
| Availability | Site/region applicability. |
| Components | Component count with add/edit/delete actions. |

### Tender Coupons
**URL:** `/dashboard/tender_coupons`

Quick-add fields to preserve:
| Field | Input Type | Description |
| --- | --- | --- |
| Id | Text | Coupon identifier |
| Description | Text | Coupon label |
| Type Of Discount | Dropdown | Discount method |
| Amount | Numeric | Fixed/percentage value |
| Prompt for Amount | Toggle | Cashier prompt behavior |
| Max Per Customer | Numeric | Usage cap per customer |
| Available Always | Toggle | Date bypass behavior |
| Start/End Date | Date Picker | Schedule window |
| Disable | Toggle | Soft deactivate |
| UPC | Text | Coupon barcode linkage |

### Batch Promotions
**URL:** `/dashboard/batch_promotions`

Promotion details fields:
| Field | Input Type | Description |
| --- | --- | --- |
| Promotion Price | Numeric | Flat target promo price |
| Comments | Text Area | Internal notes |
| Start date* | Date Picker | Mandatory start |
| End date* | Date Picker | Mandatory end |

Affected items preview table:
| Column | Description |
| --- | --- |
| PLU | Price lookup code |
| UPC | Barcode |
| Description | Full item name/size |
| Unit Price | Current retail price |
| Promo Price | New derived promo price |

### Liquor Imports
**URL:** `/dashboard/liquor_imports`

Import audit table:
| Column | Description |
| --- | --- |
| ID | Import batch identifier |
| Regular | Standard retail update flag |
| Limited Time Offer | Promo start/end range |
| Status | Pending/Processing/Completed |
| Imported | Upload timestamp |
| Item Count | Matched vs unmatched item metrics |
| Operations | Logs, commit, delete |

## Inventory operations

### Purchase Orders
**URL:** `/dashboard/purchase_orders`

| Column | Description |
| --- | --- |
| ID | PO identifier |
| Invoice/Created Date | PO date with sorting |
| Invoice Number | Supplier invoice reference |
| Supplier | Vendor name |
| Expected / Received | Ordered vs received comparison |
| Status | Procurement stage |
| Financial Totals | Subtotal, Discount, Taxes, Total |

### Item Write-Off
**URL:** `/dashboard/item_write_offs`

| Column | Description |
| --- | --- |
| Number | Write-off batch/document id |
| Date Created | Initial creation timestamp |
| Posted On | Commit timestamp |
| Status | Draft/Posted |
| Total | Total write-off monetary value |

### Item Transfer Order
**URL:** `/dashboard/item_transfer_orders`
- Implement header, actions, and transfer lifecycle states (source has minimal field details).

### Physical Counts
**URL:** `/dashboard/inventory_counts`
- Implement count sessions, count lines, variance handling, and posting hooks (source leaves table schema open).

### Batch Posts
**URL:** `/dashboard/batch_posts`
- Centralized audit ledger for batch commits and inventory updates.
- Implement source placeholders for table columns and workflow actions.

### Inventory Control Configuration
**URL:** `/dashboard/inventory_config`
- Central admin interface for inventory tracking/calculation logic.
- Provide policy header + toggleable business-rule panels.

## Fuel operations

### Fuel Management
- Covers grade, tank, and ATG-related configuration context.

### Fuel Configuration
**URL:** `/dashboard/fuel_config`

Products panel:
| Aspect | Description |
| --- | --- |
| Columns | ID, Name, Actions |
| Functionality | Add/remove product types such as BIODiesel and ERegular Gas |

Tanks panel:
| Aspect | Description |
| --- | --- |
| Columns | ID, Product (relational), Capacity, Actions |
| Functionality | Map physical tanks to products, including high-capacity numeric entries |

### Fuel Tank Import
**URL:** `/dashboard/fuel_tank_import`

Core components:
| Component | Functional Detail |
| --- | --- |
| Page Header | Title, back navigation, Submit Fuel Dip action |
| Site Selector | Mandatory target site selection |
| Import Zone | Drag-and-drop Excel upload (`.xlsx`) |

Excel schema requirements:
- Worksheet name must be `FUEL TANK DIP`.

| Column | Field Name | Description |
| --- | --- | --- |
| A | SITEID | Retail site id |
| B | DATE | Dip date |
| C | TIME | Dip timestamp |
| D | TNKNO | Tank number |
| E | PRODUCT | Fuel grade/product code |
| F | LITRESTC | Temperature-compensated litres |
| G | LITRESG | Gross litres |
| H | ULLAGE | Remaining tank capacity |
| I | DIP | Physical dip depth |
| J | WATER | Water level |
| K | TEMP | Fuel temperature |

## Build checklist
- Implement promotion entities and all quick-add/list/edit workflows.
- Implement operational inventory records for PO, transfer, write-off, count, and batch post.
- Implement inventory control rule toggles and policy persistence.
- Implement fuel product/tank setup and full import pipeline with schema validation and preview.
- Add lifecycle statuses, audit metadata, and action logs across operations.

## Acceptance criteria
- Promotion setup can be configured and activated with valid date/site constraints.
- Inventory movement/control workflows are traceable and state-safe.
- Fuel configuration and import paths validate structure and reject invalid files cleanly.
