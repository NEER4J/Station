# Phase 5 - Financial Management, Reporting, and Release Hardening

## Objective
Implement fiscal reporting and finish platform hardening for production readiness.

## Source coverage from `plan.md`
- `Financial Management`
- `Income Statement`
- Cross-module dependencies implied by reconciliation, inventory, and sales/fuel flows

## Income Statement
The module provides annual profit/loss visibility by aggregating sales, inventory, and accounting data.

### Core sections to implement
- Header and Action Toolbar
- Data Entry and Generation
- Statement Data Table Structure
- Functional Features

### Required statement table structure
| Financial Row Category | Monthly Columns | Total |
| --- | --- | --- |
| REVENUE | January through December | Annual Sum |
| COST OF GOODS SOLD (COGS) | January through December | Annual Sum |

Additional requirement from source:
- Hierarchical data grid with key financial metrics calculated in real-time.

## Financial data integration requirements
Income statement calculations must reconcile with:
- Daily reconciliation outputs
- Inventory valuation and cost flows
- Fuel sales volume/value summaries
- Payout and tax behavior where applicable

## Sensitive data and access
- Financial data visibility must support role-aware restrictions.
- Preserve behavior similar to financial visibility toggle patterns in settings/dashboard areas.

## Hardening scope (required before deleting legacy plan)
Because source contains sparse placeholders in several `Functional Features` sections, this phase also formalizes release criteria:
- Fill all unresolved feature placeholders from implementation decisions.
- Add integration test coverage for cross-module financial totals.
- Add report export checks for completeness and format validity.
- Validate responsive behavior for heavy tables and monthly grids.
- Validate flat visual design consistency (no gradients, minimal shadows).

## QA and validation checklist
- Validate monthly and annual totals against source transactional data.
- Validate rollups for revenue and COGS at category and annual levels.
- Validate permission boundaries for finance pages and exports.
- Validate empty, partial, and corrected-data scenarios.
- Validate reconciliation between financial statements and operational reports.

## Acceptance criteria
- Income statement generates correctly for month and year views.
- Financial totals are reproducible from transactional source modules.
- Financial access controls, export flows, and responsive behavior pass QA.
- All details from `plan.md` are represented across phase documents, enabling safe removal of the original plan file.
