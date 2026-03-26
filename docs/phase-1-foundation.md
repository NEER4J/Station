# Phase 1 - Foundations, Architecture, and Core Dashboard

## Objective
Create the platform foundation for Habiv (AI-Powered Proposals + Client Reporting Platform) while preserving the original XsiteIO architecture intent and baseline dashboard behavior.

## Source coverage from `plan.md`
- `Project Overview`
- `System Architecture` (repeated 3 times in source; deduplicated here)
- `Quick Navigation Directory`
- `Feature Catalog > Dashboard`
- `Feature Catalog > System Settings`

## Product and architecture baseline
The platform must be:
- Cloud-based, high-concurrency, and modular.
- Built for continuous operations in fuel retail contexts.
- Designed for data integrity and uptime via redundant storage and balanced traffic handling.

### Core system modules
| Module | Architectural Role |
| --- | --- |
| Inventory Module | Manages centralized stock data, vendor EDI integrations, and price book updates. |
| Fuel Module | Handles telemetry from ATG and environmental compliance reporting. |
| POS Module | Supports real-time transaction polling and sync with on-site hardware. |

### Development methodology (must apply to every module)
- Follow strict modular capture for 1:1 functional parity with source behavior.
- Document each page and feature group before implementation.
- Preserve data logic and business rules when transitioning flows.
- Keep module boundaries clear to allow independent scaling and maintenance.

## Quick navigation taxonomy to preserve
The feature system is categorized into:
- Foundations
- Product and Price Book
- Operations and Fuel
- Admin and Finance

## Dashboard specification
**URL:** `/dashboard`

### Global navigation and interface
- Dashboard is the primary landing page and operations command center.
- Must aggregate real-time data across retail and fuel.
- Must be responsive across desktop/tablet/mobile.

### Summary and status cards
| Store Metrics | Fuel Summary |
| --- | --- |
| Sales This Month, Sales This Year, Total Items on Hand, Value of Items on Hand | Grade-level table with Volume and Amount totals |

### Sales analytics and real-time feeds
- Include a real-time feed region in the layout.
- Reserve interaction hooks for periodic refresh/polling.

### Inventory and fuel management
- Tanks section must render visual gauges for:
  - Tank 122
  - Tank 126
  - Tank 16
- Gauges must show total capacity and current fill percentage.

## System settings baseline specification
This settings area defines:
- administrative configurations
- user permissions
- site-level global behavior

### Fuel sales grade summary table
| Grade | Dollars Sold | Units Sold | Avg Price | Avg Margin | Gross Profit |
| --- | --- | --- | --- | --- | --- |
| Data Rows | Financial reporting per grade | Volume metrics | Price/Cost analysis | Profitability % | Total Net Profit |

### Additional settings behavior
- Fuel Sales tables require export functionality.
- Global footer includes:
  - Financial Summary toggle (show/hide sensitive monetary data)
  - `Report Issue` support action

## Build checklist
- Implement responsive app shell, routing, and auth-protected dashboard layout.
- Implement shared primitives: page headers, toolbars, filters, table shell, pagination, status badges, empty/error/loading states.
- Implement dashboard cards, fuel summary table, and tank gauges.
- Implement settings shell with fuel grade summary table and export actions.
- Implement role-aware visibility guard for financial summaries.

## Acceptance criteria
- Architecture decisions and module boundaries are documented and enforced.
- Dashboard and settings load with real or contract-compatible mocked data.
- Shared UI foundation supports downstream module implementation without structural rework.
