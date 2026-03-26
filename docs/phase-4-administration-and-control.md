# Phase 4 - Administration, Access, and Operational Control

## Objective
Deliver all organization-level controls: administration setup, locations, users/roles, vendors, utilities, and reconciliation.

## Source coverage from `plan.md`
- `General Administration`
- `Regions`
- `Sites`
- `User Administration`
- `Vendors`
- `User Tools`
- `Daily Reconciliations`

## General Administration
**URL:** `/dashboard/administration/general`

The page is structured into three tabs:
- General
- Taxes
- Options

### Tab 1: General
- Manages organization identity and high-level inventory behavior.
- Save button persists overall configuration.

### Tab 2: Taxes
Inline tax grid with Insert/Save/Remove actions:

| Column | Description |
| --- | --- |
| Id | System-generated tax identifier |
| Name | Tax code label (HST1, HST2, etc.) |
| Percentage (%) | Tax rate input |
| Use in PO | Include tax in purchase order workflows |

### Tab 3: Options
- Key-value control grid for system flags and sequence values.
- Row-level Save and Remove actions.

## Regions
**URL:** `/dashboard/administration/regions`

### Header and behavior
- Regions title with back navigation.
- Inline quick-add row for rapid region creation.

### Regions table
| Column | Description |
| --- | --- |
| Id | Unique id (example: `default`) linking to detail |
| Name | Region name linking to settings |
| Category | Region classification |
| Sites | Count of assigned sites |

## Sites
**URL:** `/dashboard/administration/sites`

### Sites table
| Column | Description |
| --- | --- |
| ID | Site identifier (example: 325356), linked to detail |
| Sync POS | Manual POS sync action |
| Name | Site display name and internal identifier |
| Location Details | Street, phone, city, country, province/state, postal/zip |
| P.O.S. | Installed POS type (example: ESSO) |
| Pending Changes | Count of not-yet-synced updates |
| Operational Methods | Inventory control and sales report methods |
| Connectivity Status | Sftp sync, realtime state, transfer and heartbeat audit fields |

## User Administration
**URL:** `/dashboard/administration/users`

Tabs:
- Users (default)
- Roles

### Users tab
Inline quick-add inputs:
| Field | Input Description |
| --- | --- |
| Email ID | Login and contact email |
| Name | User full name |
| Password / Confirm Password | Secure credential entry |
| Site | Assigned site dropdown |
| Access | Access tier preview |
| Status | Initial state (for example, Inactive) |
| Add | Create user action |

Users table:
| Column | Description |
| --- | --- |
| Email | Login email |
| Name | User name |
| Site | Assigned location/entity |
| Access / Status | Permission and account state badges |

### Roles tab
Role creation:
| Field | Description |
| --- | --- |
| Name | Role label (Cashier, Supervisor, etc.) |
| Add | Create role action |

Roles table:
| Column | Description |
| --- | --- |
| Name | Role names (Manager, Employee, Master Admin, etc.) |
| Operations | Remove and Manage permissions actions |

## Vendors
**URL:** `/dashboard/administration/vendors`

### Header and toolbar
- Back navigation and add action.
- Filter search performs real-time match on ID and Name.

### Inline quick-add
| Input Field | Description |
| --- | --- |
| Id | Vendor id (numeric/alphanumeric) |
| Name | Vendor legal/display name |
| Add Button | Commit new vendor |

### Vendors table
| Column | Description |
| --- | --- |
| Id | Unique vendor id linking to detail/config page |
| Name | Vendor name linking to profile |

## User Tools
**URL:** `/dashboard/user_tools`

Sections to implement:
- Data Imports: Liquor and Pricing
- POS-Specific XML Imports (BT9000 and Verifone)
- Site and Price Overrides
- Bulk Excel Updates
- System Maintenance and Logic

Bulk Excel update matrix:
| Update Category | Supported Fields/Actions |
| --- | --- |
| General Update | Departments, Subdepartments, Items, Suppliers, Customers |
| Metadata Sync | Descriptions, Part Numbers, Item Costs, Order Units, Case Sizes |
| Status Management | Bulk item activation/deactivation |

## Daily Reconciliations
**URL:** `/dashboard/daily_reconciliations`

### Header and trigger flow
- Create Report dropdown for manual report creation.
- Reconcile action pattern: `Reconcile [Date] ([Count] Shifts)`.
- Support date/shift scope selectors.

### Filter toolbar
| Control | Description |
| --- | --- |
| Sites Dropdown | Scope by retail location |
| Status Filter | All, Pending, Completed |
| Date Selection | From/To and range quick-select |

### Reconciliation table
| Column | Data Definition |
| --- | --- |
| # / Date | Report id and date |
| Fuel (Vol) / Fuel ($) | Fuel volume and value aggregates |
| Sales / Fuel Sales / Other | Core sales categories |
| Taxes / Non-Cash Tender | Tax and card/non-cash values |
| Deposits and Payouts | Cash and expense movement |
| O/S (Vol) / O/S ($) | Over/short metrics |
| Status | Workflow state |

### Sidebar analytics
- Implement summary panels tied to filtered reconciliation dataset.

## Build checklist
- Implement all administration pages with full CRUD and validation.
- Enforce role-based access boundaries for admin-only controls.
- Implement site/region hierarchies and sync/health metadata surfaces.
- Implement user tools import workflows and audit traces.
- Implement reconciliation generation, filtering, and report state transitions.

## Acceptance criteria
- Admin team can configure organization, users/roles, sites, and vendors end-to-end.
- Reconciliation and user tools workflows are operable with audit visibility.
- Access model prevents unauthorized modification of protected controls.
