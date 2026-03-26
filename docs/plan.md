## Project Overview

The primary objective of this project is the development of a functional clone and comprehensive replica of the XsiteIO platform. As a leading software solution within the Canadian market, XsiteIO provides essential infrastructure for gas stations and convenience store operations. This replication project aims to recreate the platform's core capabilities to provide a robust, familiar, and highly efficient management environment for retail fuel operators.

The development will focus on four critical pillars of the XsiteIO ecosystem:



This document is designed to serve as a detailed blueprint for developers, project managers, and stakeholders. It defines the functional requirements and technical specifications necessary to ensure that all legacy features are accurately captured, tested, and implemented in the new system.

## System Architecture

The replicated XsiteIO platform is engineered as a robust, cloud-based web application designed to handle the high-concurrency requirements of real-time retail environments. The architecture is built on a modular framework, allowing for independent scaling and maintenance of the core business units. This ensures that the system maintains high availability and data integrity, which are critical for continuous gas station operations.

### Modular Development Methodology

To achieve 1:1 functional parity with the original XsiteIO interface, the development process follows a strict modular capture approach. Each page and feature group is meticulously documented to ensure no logic is lost during the transition. For every module, the following elements are defined:



### Core System Modules

The architecture is partitioned into three primary functional modules, each serving a distinct aspect of the retail fuel ecosystem:

| Module           | Architectural Role                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Inventory Module | Manages centralized stock data, vendor EDI integrations, and price book updates.                |
| Fuel Module      | Handles telemetry data from Automatic Tank Gauges (ATG) and environmental compliance reporting. |
| POS Module       | Facilitates real-time transaction polling and synchronization with on-site hardware.            |

<callout variant="info" id="Eahgoli83l">
  **Data Integrity and Uptime:** The system utilizes redundant database clusters and load balancing to provide a seamless user experience even during peak transaction periods at the fuel islands.
</callout>

## System Architecture

The replicated XsiteIO platform is engineered as a robust, cloud-based web application designed to handle the high-concurrency requirements of real-time retail environments. The architecture is built on a modular framework, allowing for independent scaling and maintenance of the core business units. This ensures that the system maintains high availability and data integrity, which are critical for continuous gas station operations.

### Modular Development Methodology

To achieve 1:1 functional parity with the original XsiteIO interface, the development process follows a strict modular capture approach. Each page and feature group is meticulously documented to ensure no logic is lost during the transition. For every module, the following elements are defined:



### Core System Modules

The architecture is partitioned into three primary functional modules, each serving a distinct aspect of the retail fuel ecosystem:

| Module           | Architectural Role                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Inventory Module | Manages centralized stock data, vendor EDI integrations, and price book updates.                |
| Fuel Module      | Handles telemetry data from Automatic Tank Gauges (ATG) and environmental compliance reporting. |
| POS Module       | Facilitates real-time transaction polling and synchronization with on-site hardware.            |

<callout variant="info" id="pm7qHznbqr">
  **Data Integrity and Uptime:** The system utilizes redundant database clusters and load balancing to provide a seamless user experience even during peak transaction periods at the fuel islands.
</callout>

## Quick Navigation Directory

<callout variant="info" id="w-OD25V8-V">
  This directory acts as a comprehensive map for the functional specifications contained in this document. Users can use Ctrl+F to jump to any specific heading or feature group listed below to review technical requirements.
</callout>

<column_group>
  <column width="25%">
    ### 🏢 FOUNDATIONS


  </column>

  <column width="25%">
    ### 📦 PRODUCT & PRICE BOOK


  </column>

  <column width="25%">
    ### 🚛 OPERATIONS & FUEL


  </column>

  <column width="25%">
    ### 🛠️ ADMIN & FINANCE


  </column>
</column_group>

## System Architecture

The replicated XsiteIO platform is engineered as a robust, cloud-based web application designed to handle the high-concurrency requirements of real-time retail environments. The architecture is built on a modular framework, allowing for independent scaling and maintenance of the core business units. This ensures that the system maintains high availability and data integrity, which are critical for continuous gas station operations.

### Modular Development Methodology

To achieve 1:1 functional parity with the original XsiteIO interface, the development process follows a strict modular capture approach. Each page and feature group is meticulously documented to ensure no logic is lost during the transition. For every module, the following elements are defined:



### Core System Modules

The architecture is partitioned into three primary functional modules, each serving a distinct aspect of the retail fuel ecosystem:

| Module           | Architectural Role                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Inventory Module | Manages centralized stock data, vendor EDI integrations, and price book updates.                |
| Fuel Module      | Handles telemetry data from Automatic Tank Gauges (ATG) and environmental compliance reporting. |
| POS Module       | Facilitates real-time transaction polling and synchronization with on-site hardware.            |

<callout variant="info" id="Gr2uHmJK3r">
  **Data Integrity and Uptime:** The system utilizes redundant database clusters and load balancing to provide a seamless user experience even during peak transaction periods at the fuel islands.
</callout>

## Feature Catalog

### Dashboard

The Dashboard serves as the primary landing page and operational command center for the platform, providing real-time data aggregation across retail and fuel segments. **URL Path: /dashboard**

#### Global Navigation and Interface



#### Summary and Status Cards

| Store Metrics                                                                   | Fuel Summary                                                 |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Sales This Month, Sales This Year, Total Items on Hand, Value of Items on Hand. | Table breakdown by Grade including Volume and Amount totals. |

#### Sales Analytics and Real-Time Feeds



#### Inventory and Fuel Management

The Tanks section provides visual gauges for fuel inventory monitoring, specifically tracking Tank 122, Tank 126, and Tank 16. Gauges display total capacity and current fill percentage.

#### Inventory and Fuel Management

The Tanks section provides visual gauges for fuel inventory monitoring, specifically tracking Tank 122, Tank 126, and Tank 16. Gauges display total capacity and current fill percentage.

### System Settings

This section details the administrative configurations, user permissions, and site-level parameters that govern the platform's global behavior.

#### Fuel Sales Grade Summary

| Grade     | Dollars Sold                  | Units Sold     | Avg Price           | Avg Margin      | Gross Profit     |
| --------- | ----------------------------- | -------------- | ------------------- | --------------- | ---------------- |
| Data Rows | Financial reporting per grade | Volume metrics | Price/Cost analysis | Profitability % | Total Net Profit |

All data tables within the Fuel Sales section include export functionality for external reporting and analysis.

<callout variant="info" id="3vgD8vngsp">
  **Global Footer:** Contains a Financial Summary toggle to hide or reveal sensitive monetary data and a 'Report Issue' button for technical support.
</callout>

### Items Management

The Items page serves as the central repository for product data, inventory control, and pricing management. It allows administrators to monitor and adjust product attributes across the entire catalog.

<callout variant="info" id="WY7Wyn-S_L">
  **URL Path:** /dashboard/Items
</callout>

#### Header and Action Toolbar

The page header displays the 'Items' title along with an active item counter (e.g., '2118 Active') accessible via a dropdown filter. Below the header, the action toolbar provides global controls:



#### Pagination Controls

Located at the top and bottom of the grid, pagination controls allow for efficient navigation through large datasets. Users can select the 'Items per page' (defaulting to 100) and track their progress via the range indicator (e.g., 1-50 of 50) using previous and next arrow navigation.

#### Items Data Table Columns

| Column Name        | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| PLU / UPC / Part # | Identification codes including Price Look-Up, Barcode, and internal part numbers. |
| Description        | The item name, hyperlinked to a detailed product edit view.                       |
| Categorization     | Supplier, Department, and Subdepartment (e.g., TOBACCO, SNACKS).                  |
| Pricing & Taxes    | Retail Price, Bottle Deposit, and Tax codes (e.g., HST1, HST2).                   |
| Cost Metrics       | Case Size, Case Cost, Unit Cost, and Weighted Average Cost.                       |
| Margin & Status    | Calculated profit margin percentage and operational status (e.g., Active).        |

#### Functional Capabilities



### Items Management

The Items page serves as the central repository for product data, inventory control, and pricing management. It allows administrators to monitor and adjust product attributes across the entire catalog.

<callout variant="info" id="0twFpWmseq">
  **URL Path:** /dashboard/Items
</callout>

#### Header and Action Toolbar

The page header displays the 'Items' title along with an active item counter (e.g., '2118 Active') accessible via a dropdown filter. Below the header, the action toolbar provides global controls:



#### Pagination Controls

Located at the top and bottom of the grid, pagination controls allow for efficient navigation through large datasets. Users can select the 'Items per page' (defaulting to 100) and track their progress via the range indicator (e.g., 1-50 of 50) using previous and next arrow navigation.

#### Items Data Table Columns

| Column Name        | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| PLU / UPC / Part # | Identification codes including Price Look-Up, Barcode, and internal part numbers. |
| Description        | The item name, hyperlinked to a detailed product edit view.                       |
| Categorization     | Supplier, Department, and Subdepartment (e.g., TOBACCO, SNACKS).                  |
| Pricing & Taxes    | Retail Price, Bottle Deposit, and Tax codes (e.g., HST1, HST2).                   |
| Cost Metrics       | Case Size, Case Cost, Unit Cost, and Weighted Average Cost.                       |
| Margin & Status    | Calculated profit margin percentage and operational status (e.g., Active).        |

#### Functional Capabilities



#### Add / Edit Item Modal

The Add / Edit Item modal provides a centralized interface for detailed product configuration, organized into logical data blocks for efficient entry and modification.

**Header Fields (Quick Access)**



**General Information Block**



**Inventory & Ordering Block**



**Modal Actions**



### Shelf Tag Report

The Shelf Tag Report interface provides a dedicated workspace for managing the labeling lifecycle. It acts as a staging area where price updates and new items are queued for physical tag production.

**URL Path:** `/dashboard/shelf_tags`

#### Header and Action Toolbar

The page header displays the 'Shelf Tag Report' title accompanied by a real-time counter of items in the queue (e.g., '1086 Shelf Tags'). The toolbar includes several navigational and administrative tools:



#### Shelf Tag Data Table Columns

| Column        | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| PLU           | Price Look-Up code with interactive sorting functionality.         |
| UPC           | The Universal Product Code barcode.                                |
| Description   | The item name and volume (e.g., SMIRNOFF VODKA (PET) 375ML).       |
| Unit Or Order | The selling unit type, such as CS for Case or EA for Each.         |
| Case Size     | The quantity of individual items per case.                         |
| Unit Price    | The current retail price to be printed on the shelf label.         |
| Last Cost     | The most recent cost per unit recorded.                            |
| Case Cost     | The calculated cost per case (Last Cost multiplied by Case Size).  |
| Operation     | A trash icon button for removing an individual tag from the queue. |

#### Functional Features



### Payouts

The Payouts page, accessible via the `/dashboard/payouts` path, provides a centralized interface for defining and managing the various expense categories used during cash reconciliation and back-office accounting processes.

#### Header and Action Toolbar



#### Payouts Data Table Columns

| Column             | Description                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| ID                 | The numeric unique identifier for the payout type, featuring interactive sorting.                          |
| Description        | The primary name of the payout type, such as LOTTERY, CASH PURCHASE, or REFUND.                            |
| French Description | The secondary description used to support bilingual requirements in French-speaking regions.               |
| Operations         | Contains the Edit action (green pencil icon) and the Delete action (red trash icon) for record management. |

#### Functional Features



### Departments

**URL Path:** /dashboard/departments

#### Header and Action Toolbar



#### Departments Data Table Columns

| Column            | Description                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------- |
| ID                | The unique numeric identifier for the department.                                           |
| Name              | The full formal name of the department (e.g., ALCOHOL, BEER, BAKERY GOODS).                 |
| Short Name        | The abbreviated version for use on POS displays and shelf labels (e.g., LCBO).              |
| PCATS / Conexxus  | Industry-standard category codes used for electronic data interchange and reporting.        |
| Host Product Code | The mapping code used to synchronize data with host or ERP systems.                         |
| Sales Restriction | Specifies age or time-based restrictions applied to the entire department.                  |
| Taxes             | The tax codes (e.g., HST1, HST2) automatically applied to items in this department.         |
| Sales Report      | A toggle switch to determine if department data appears in general sales summaries.         |
| Shift Report      | A toggle switch to include or exclude the department in shift-end reconciliation processes. |
| # of Items        | A real-time count of individual products currently assigned to the department.              |
| Status            | The current operational state, typically marked as Active or Inactive.                      |

#### Functional Features



### Subdepartments

**URL Path:** /dashboard/subdepartments

#### Header and Action Toolbar



#### Subdepartments Data Table Columns

| Column     | Description                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Id         | A numeric unique identifier for the subdepartment, serving as a hyperlink to the record edit screen. |
| Name       | The formal name of the sub-category (e.g., ALCOHOL, BAKERY GOODS, BASIC GROCERIES).                  |
| Department | The parent department association (e.g., BAKERY GOODS) that defines the primary hierarchy.           |
| GL Code    | The General Ledger code assigned to this sub-category for financial and accounting integration.      |
| Status     | Visual badge indicating whether the subdepartment is currently Active.                               |

#### Functional Features



### Promotion Management

#### Item Lists

URL Path: `/dashboard/item_lists`

#### Header and Action Toolbar



#### Item Lists Data Table Columns

| Column             | Description                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------- |
| ID                 | A numeric unique identifier for the list, supporting ascending and descending sort order. |
| Description        | The descriptive name or purpose of the item list, facilitating easy identification.       |
| Linked Deal Groups | Lists the specific promotions or deal groups associated with this collection of items.    |

#### Functional Features



### Price Groups

**URL Path:** /dashboard/price\_groups

#### Header and Action Toolbar



#### Inline Quick-Add Header

Located directly above the data table, this row allows for rapid entry of new price groups without leaving the main view.



#### Price Groups Data Table Columns

| Column       | Description                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| ID           | The unique identifier for the price group (e.g., 0000000010001).                                            |
| Description  | The descriptive name of the group, such as Ghost 473ml, Back Woods, or Players 25.                          |
| Availability | A dropdown selector used to assign the group to specific sites or regions (e.g., ON Esso Bryanston).        |
| Unit Price   | The retail price value applied to every item linked to this group.                                          |
| Items        | A real-time numeric count of individual inventory items assigned to the group.                              |
| Operations   | Action buttons including Settings (gear icon) for configuration and Delete (trash icon) for record removal. |

#### Functional Features



## Deal Groups

URL Path: `/dashboard/deal_groups`

### Header and Action Toolbar



### Inline Quick-Add Header

An persistent input row located directly above the data table to allow for rapid record creation:



### Deal Groups Data Table Columns

| Column       | Description                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| ID           | The numeric unique identifier with built-in sorting capability.                                                                   |
| Name         | The descriptive name of the deal (e.g., flake combo).                                                                             |
| Start Date   | The activation date for the promotion (e.g., Jun 04, 2025).                                                                       |
| End Date     | The expiration date for the promotion (e.g., Jun 16, 2025).                                                                       |
| Availability | The specific site or geographical region where the deal is valid (e.g., ON Esso Bryanston).                                       |
| Components   | A numeric count of included items, followed by actions: Add (+) component, Edit (green pencil icon), and Delete (red trash icon). |

### Functional Features



### Tender Coupons

The Tender Coupons page, accessible via the path /dashboard/tender\_coupons, provides an interface for managing point-of-sale discounts and coupon redemptions. The header displays the **Tender Coupons** title followed by a dynamic counter showing the total number of records (e.g., 0 Tender Coupons).

#### Header and Action Toolbar



#### Inline Quick-Add Header

This row allows for rapid entry of new coupon records directly above the data table using the following fields:

| Field             | Input Type    | Description                                                |
| ----------------- | ------------- | ---------------------------------------------------------- |
| Id                | Text Input    | The unique numeric identifier for the coupon.              |
| Description       | Text Input    | The name or label for the coupon.                          |
| Type Of Discount  | Dropdown      | Selection of the discount calculation method.              |
| Amount            | Numeric       | The fixed value or percentage for the discount.            |
| Prompt for Amount | Toggle Switch | Determines if the cashier must enter the amount manually.  |
| Max Per Customer  | Numeric       | The limit on how many times a customer can use the coupon. |
| Available Always  | Toggle Switch | Bypasses date restrictions for permanent coupons.          |
| Start/End Date    | Date Picker   | The validity period for scheduled promotions.              |
| Disable           | Toggle Switch | Allows for deactivating the coupon without deleting it.    |
| UPC               | Text Input    | The Universal Product Code associated with the coupon.     |

#### Functional Features



### Batch Promotions

**URL Path:** /dashboard/batch\_promotions

The Batch Promotions module allows administrators to apply temporary price changes across large segments of inventory simultaneously. The page features a back arrow for easy navigation to the main Promotion Management dashboard.

#### Promotion Details Section

| Field           | Input Type  | Description                                                              |
| --------------- | ----------- | ------------------------------------------------------------------------ |
| Promotion Price | Numeric     | The flat target price to be applied to all items selected in the batch.  |
| Comments        | Text Area   | Internal notes regarding the campaign purpose or vendor funding details. |
| Start date\*    | Date Picker | Mandatory field for the activation date of the batch pricing.            |
| End date\*      | Date Picker | Mandatory field for the expiration date of the batch pricing.            |

#### Dynamic Item Filtering

The 'Apply promotions to items matching' section utilizes a rule-based engine to target specific groups of products. It includes the following components:



#### Affected Items Preview Table

This grid provides a real-time list of all items that meet the current filter criteria, allowing users to verify changes before saving.

| Column      | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| PLU         | The internal Price Look-Up code.                             |
| UPC         | The Universal Product Code / Barcode.                        |
| Description | The full name and size specification of the item.            |
| Unit Price  | The current standard retail price before the promotion.      |
| Promo Price | The new price calculated based on the Promotion Price field. |

#### Functional Features



### Liquor Imports

The Liquor Imports module provides a specialized workflow for managing price books and promotional updates from regional liquor boards. This tool is accessible via the path: `/dashboard/liquor_imports`.

#### Header and Action Toolbar

The page header facilitates navigation and global actions for the import workflow:



#### New Liquor Import Configuration

When initiating a new import, the system presents a configuration panel with the following parameters:



#### Import Audit Table

The main interface features 'Pending' and 'Posted' tabs to manage the lifecycle of imported data.

| Column             | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| ID                 | The unique numeric identifier for the import batch.                                     |
| Regular            | Indicates if the import targets standard retail price updates.                          |
| Limited Time Offer | Shows the specific 'Starting' and 'Ending' dates for the promotion period.              |
| Status             | The current processing state, such as Pending, Processing, or Completed.                |
| Imported           | The timestamp indicating when the file was uploaded to the system.                      |
| Item Count         | Displays 'Matched' (existing items) and 'Unmatched' (new/unrecognized items) metrics.   |
| Operations         | Action buttons to view logs, commit the import to the live system, or delete the batch. |

#### Functional Features



### Inventory Management

#### Purchase Orders

**URL Path:** `/dashboard/purchase_orders`

The Purchase Orders module facilitates the procurement process by providing tools to generate, track, and receive stock from vendors. The page header includes a back arrow for navigation, along with dedicated icons for analytics, data export, and printing.

#### Header and Action Toolbar



#### Purchase Orders Data Table Columns

| Column               | Description                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| ID                   | The internal numeric identifier for the order.                                           |
| Invoice/Created Date | The date the PO was generated, supporting ascending/descending sorts.                    |
| Invoice Number       | The reference number provided by the supplier.                                           |
| Supplier             | The name of the vendor or providing company.                                             |
| Expected / Received  | A comparison of item quantities originally ordered versus those confirmed upon delivery. |
| Status               | The current stage in the procurement lifecycle.                                          |
| Financial Totals     | Columns for Subtotal, Discount, Taxes, and the final Total amount.                       |

#### Functional Features



### Inventory Management

#### Purchase Orders

**URL Path:** `/dashboard/purchase_orders`

The Purchase Orders module facilitates the procurement process by providing tools to generate, track, and receive stock from vendors. The page header includes a back arrow for navigation, along with dedicated icons for analytics, data export, and printing.

#### Header and Action Toolbar



#### Purchase Orders Data Table Columns

| Column               | Description                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| ID                   | The internal numeric identifier for the order.                                           |
| Invoice/Created Date | The date the PO was generated, supporting ascending/descending sorts.                    |
| Invoice Number       | The reference number provided by the supplier.                                           |
| Supplier             | The name of the vendor or providing company.                                             |
| Expected / Received  | A comparison of item quantities originally ordered versus those confirmed upon delivery. |
| Status               | The current stage in the procurement lifecycle.                                          |
| Financial Totals     | Columns for Subtotal, Discount, Taxes, and the final Total amount.                       |

#### Functional Features



### Fuel Management

This section details the features and configurations for managing fuel retail operations, including grades, tanks, and automated tank gauge (ATG) integrations.

### Item Write-Off

The Item Write-Off module, accessible via `/dashboard/item_write_offs`, provides a structured workflow for adjusting inventory levels due to non-sale events such as damage, expiration, or theft. This interface allows managers to track inventory losses and reconcile financial records through a batch-based commitment process.

#### Header and Action Toolbar



#### Write-Off Data Table Columns

| Column       | Description                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------- |
| Number       | The unique document or batch identifier for the write-off.                                   |
| Date Created | The timestamp indicating when the batch was first initialized.                               |
| Posted On    | The timestamp when the adjustment was committed to the inventory system, supporting sorting. |
| Status       | The current state of the batch, typically 'Posted' or 'Draft'.                               |
| Total        | The total monetary value of all items included in the write-off batch.                       |

#### Functional Features



### Item Transfer Order

**URL Path:** `/dashboard/item_transfer_orders`

#### Header and Action Toolbar



#### Functional Features



### Physical Counts

**URL Path:** `/dashboard/inventory_counts`

#### Header and Action Toolbar



#### Counts Data Table Columns



#### Functional Features



### Batch Posts

The Batch Posts interface (URL Path: /dashboard/batch\_posts) serves as a centralized administrative ledger for tracking and auditing bulk data commitments and inventory updates within the system.

#### Header and Action Toolbar



#### Batch Posts Data Table Columns



#### Functional Features



### Inventory Control Configuration

The Inventory Control Configuration page, accessible via the path `/dashboard/inventory_config`, serves as the centralized administrative interface for defining how inventory levels are tracked and calculated across the organization.

#### Header and Policy Statement



#### Configuration Panels

The following panels allow administrators to toggle specific logic and business rules for inventory operations:



#### Functional Features



### Suppliers

**URL Path:** `/dashboard/suppliers`

#### Header and Action Toolbar

The Suppliers page header features the primary title with an integrated back navigation arrow and a global 'Add' (+) button for initiating new vendor records. Metadata displayed in the header includes a real-time active record counter (e.g., 37 Active Suppliers) and a toggle switch that allows users to filter the entire view by active or inactive status. The secondary action toolbar contains a 'Filter' search input for rapid, keyword-based lookup across all supplier records.

#### Inline Quick-Add Header

Located immediately above the data table, this input row facilitates the rapid creation of new supplier records without leaving the main view. It includes the following fields:



#### Suppliers Data Table Columns

| Column                     | Description                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------- |
| ID                         | Unique numeric identifier for the supplier.                                             |
| Name                       | The full vendor name, hyperlinked to a detailed edit view for comprehensive management. |
| Account #                  | The organization's specific account number assigned by the vendor.                      |
| Primary Contact            | Name of the main representative for the supplier.                                       |
| Phone Number               | Main contact telephone number for the vendor.                                           |
| Address 1 / City           | Physical location details of the vendor's primary office.                               |
| Country / Province / State | Geographical identifiers (e.g., CA for Canada).                                         |
| Postal / Zip Code          | The specific mailing code for logistics and billing.                                    |
| Number of Items            | Real-time numeric count of products currently sourced from this supplier.               |
| Status                     | Row-level toggle switch to activate or deactivate the relationship.                     |

#### Functional Features



### Price Book Settings

The Price Book Settings module provides a centralized interface for managing metadata and configuration parameters that govern item classification, payment processing, and third-party integrations. This page is accessible via the path `/dashboard/price_book_settings`.

#### Header and Site Selector

The page header includes a back arrow for rapid navigation to the previous dashboard view. It also features a primary Site Selector dropdown menu, allowing administrators to toggle settings for specific retail locations, such as ON Esso Bryanston, ensuring that configurations remain site-specific where necessary.

#### Configuration Cards

The settings are organized into modular cards, each utilizing an inline entry system for high-speed data management.

| Setting Category       | Columns and Inputs | Purpose                                                                      |
| ---------------------- | ------------------ | ---------------------------------------------------------------------------- |
| **Payments**           | Type, Name         | Defines and categorizes accepted payment methods within the system.          |
| **Host Product Codes** | Code, Description  | Maps internal inventory items to external codes used by host or ERP systems. |
| **Item Locations**     | Sort               | Identifies physical or logical stock placement areas within the store.       |

#### Functional Features



### Daily Reconciliations

**URL Path:** `/dashboard/daily_reconciliations`

#### Header and Reconciliation Trigger

The page header includes a back navigation arrow and a 'Create Report' action dropdown for manual entry. A central call-to-action button allows users to 'Reconcile \[Date] (\[Count] Shifts)', initiating the reconciliation process for specific shifts. Users can also utilize 'choose date' or 'choose shifts' links to adjust the scope of the reconciliation.

#### Filter and Audit Toolbar

| Control            | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| **Sites Dropdown** | Selects the specific retail location for auditing.                     |
| **Status Filter**  | Filters records by state: All, Pending, or Completed.                  |
| **Date Selection** | Includes 'From' and 'To' pickers and a 'Date range' quick-select menu. |

#### Reconciliation Reports Table Columns

| Column                     | Data Definition                                                               |
| -------------------------- | ----------------------------------------------------------------------------- |
| # / Date                   | Unique identification number and the calendar day of the report.              |
| Fuel (Vol) / Fuel (\$)     | Aggregated fuel volume and total dollar value of fuel sold.                   |
| Sales / Fuel Sales / Other | Total retail sales, specific fuel revenue, and non-standard sales categories. |
| Taxes / Non-Cash Tender    | Total tax collected and payments via card or alternative methods.             |
| Deposits & Payouts         | Cash management metrics for bank deposits and business expenses.              |
| O/S (Vol) / O/S (\$)       | Over/Short metrics for inventory volume and monetary currency.                |
| Status                     | Current workflow state of the reconciliation record.                          |

#### Sidebar Analytics Panels



#### Functional Features



### Fuel Configuration

**URL Path:** `/dashboard/fuel_config`

#### Header and Global Navigation



#### Sidebar Action Card: Auto-Configure

A dedicated sidebar component designed to streamline initial site setup. It contains quick action links for 'Add Products' and 'Add Tanks' to automate the sequence of fuel asset initialization.

#### Configuration Panels

The primary interface consists of two synchronized inline entry tables to manage fuel assets.

| Panel: Products | Description                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Columns         | ID, Name, and Actions.                                                                                                                                                        |
| Functionality   | Supports text and numeric input for defining product types like BIODiesel or ERegular Gas. Features a green '+' button for record creation and a red 'X' button for deletion. |

| Panel: Tanks  | Description                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Columns       | ID, Product (Relational Dropdown), Capacity, and Actions.                                                                                   |
| Functionality | Maps physical storage tanks to fuel products. Supports high-capacity numeric entries (e.g., 75000, 25000) via persistent inline input rows. |

#### Functional Features



## Fuel Tank Import

**URL Path:** `/dashboard/fuel_tank_import`

The Fuel Tank Import interface provides a standardized workflow for bulk uploading fuel inventory readings (dips) directly from external spreadsheet data. This system ensures high-volume data entry is processed with strict validation against existing site configurations.

| Component     | Functional Detail                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page Header   | Displays the 'Fuel Tank Import' title with a back arrow for navigation and a 'Submit Fuel Dip' primary action button to finalize the staging process. |
| Site Selector | A mandatory dropdown menu (e.g., 'ON Esso Bryanston') used to define the target location for the imported data.                                       |
| Import Zone   | A dedicated drag and drop area specifically configured for Excel (.xlsx) file uploads.                                                                |

### Excel Schema Requirements

<callout variant="info" id="T50SCPJjGA">
  **Requirement:** The uploaded Excel file must contain a worksheet specifically named **`FUEL TANK DIP`** to be recognized by the parser.
</callout>

| Column | Field Name | Description                               |
| ------ | ---------- | ----------------------------------------- |
| A      | SITEID     | Unique identifier for the retail site.    |
| B      | DATE       | The calendar date of the tank dip.        |
| C      | TIME       | Timestamp of the reading.                 |
| D      | TNKNO      | Physical tank number at the site.         |
| E      | PRODUCT    | The fuel grade or product code.           |
| F      | LITRESTC   | Temperature Compensated Litres.           |
| G      | LITRESG    | Gross Litres volume.                      |
| H      | ULLAGE     | Available capacity remaining in the tank. |
| I      | DIP        | Physical measurement depth.               |
| J      | WATER      | Measured water level in the tank.         |
| K      | TEMP       | Fuel temperature at the time of dipping.  |

### Data Preview Grid

Upon successful file parsing, the data is loaded into a staging grid for verification. The grid includes the following columns:



#### Functional Features



### General Administration

The General Administration module, located at `/dashboard/administration/general`, serves as the central configuration hub for the organization's identity and global logic. The interface features a header with a back arrow for navigation and is partitioned into three functional tabs: General, Taxes, and Options.

#### Tab 1: General

This tab manages the core identity of the organization and high-level inventory behavior:



A primary Save button at the bottom of the form persists all identity and control settings.

#### Tab 2: Taxes

The Taxes tab provides an inline data grid for defining the fiscal environment. Users can perform Insert, Save, and Remove operations on individual tax records.

| Column         | Description                                                                       |
| -------------- | --------------------------------------------------------------------------------- |
| Id             | The unique system-generated identifier for the tax code.                          |
| Name           | Text label for the tax (e.g., HST1, HST2).                                        |
| Percentage (%) | Numeric input for the applicable tax rate.                                        |
| Use in PO      | A checkbox determining if this tax is available within the Purchase Order module. |

#### Tab 3: Options

This tab utilizes a key-value administrative grid to manage specific system behavior flags and sequence values. Each row contains dedicated Save and Remove buttons.



#### Functional Features



### Regions

The Regions page provides the administrative interface for defining organizational boundaries and geographic groupings of retail locations. This interface is accessible via the URL path: `/dashboard/administration/regions`.

#### Header and Action Toolbar

The page header includes the **Regions** title and a back arrow icon for swift navigation back to the primary administration menu.

#### Inline Quick-Add Header

A persistent input row located at the top of the data table allows for rapid creation of new regional entities:



#### Regions Data Table Columns

| Column   | Description                                                                           |
| -------- | ------------------------------------------------------------------------------------- |
| Id       | The unique identifier (e.g., 'default'), hyperlinked to the region detail view.       |
| Name     | The formal region name, hyperlinked for direct access to regional settings.           |
| Category | Displays the assigned classification category for the specific region.                |
| Sites    | A numeric counter indicating the total number of retail sites assigned to the region. |

#### Functional Features



### Sites

The Sites management page (URL: `/dashboard/administration/sites`) serves as the primary administrative interface for configuring and monitoring individual retail locations. The header includes a navigation back arrow, the 'Sites' page title, and a settings gear icon for global site-related configurations.

#### Sites Data Table Columns

| Column              | Description                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID                  | Unique numeric identifier (e.g., 325356) for the site, hyperlinked to access detailed site-specific settings.                                                      |
| Sync POS            | Provides a refresh icon button that allows administrators to manually trigger a synchronization event with the on-site Point of Sale hardware.                     |
| Name                | Displays the formal site name and internal identifier, such as 'ON Esso Bryanston', hyperlinked for navigation.                                                    |
| Location Details    | Comprehensive geographic data including Street Address, Phone Number, City, Country, Province / State, and Postal / ZIP Code.                                      |
| P.O.S.              | Indicates the specific type or brand of Point of Sale system installed at the location (e.g., ESSO).                                                               |
| Pending Changes     | A numeric counter representing the number of configuration, price, or item updates awaiting synchronization to the site's POS.                                     |
| Operational Methods | Specifies the 'Inventory Control Method' (e.g., Transaction) and 'Sales Report Method' (e.g., Shift) utilized by the site.                                         |
| Connectivity Status | A series of audit fields including Sftp (last sync time), Realtime (connection state), Platform-Client-Transfer, and Platform-Client-Heartbeat (last signal time). |

#### Functional Features



### User Administration

The User Administration module (URL: `/dashboard/administration/users`) provides a centralized interface for managing system access, credentials, and organizational roles. The header includes a navigation back arrow and the 'User Administration' title. The page is organized into two primary tabs: **Users** (active by default) and **Roles**.

#### Tab 1: Users

This tab facilitates the management of individual system accounts, allowing administrators to create new users, assign them to specific sites, and monitor their current access levels.

#### Inline Quick-Add Header

| Field                       | Input Description                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Email ID                    | Text input for the user's primary login identifier and contact email.                                |
| Name                        | Text input for the user's full legal or display name.                                                |
| Password / Confirm Password | Masked text inputs for secure credential setup and verification.                                     |
| Site                        | Dropdown selector to associate the user with a specific retail location (e.g., 'ON Esso Bryanston'). |
| Access                      | Displays the assigned access tier (e.g., Limited, Admin) based on the selected role.                 |
| Status                      | Indicates the initial operational state (e.g., Inactive) upon record creation.                       |
| Add                         | Action button to commit the new user record to the system.                                           |

#### User Data Table Columns

| Column          | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| Email           | The primary login email address associated with the account.                       |
| Name            | The full name of the user.                                                         |
| Site            | The retail location or corporate entity the user is affiliated with.               |
| Access / Status | Visual badges representing the user's permission level and account activity state. |

#### Tab 2: Roles

The Roles tab allows administrators to define the overarching permission framework for the organization, creating distinct groups with specific functional rights.

#### Role Creation Header

| Field | Description                                                                         |
| ----- | ----------------------------------------------------------------------------------- |
| Name  | Text input to define the label for a new security role (e.g., Cashier, Supervisor). |
| Add   | Action button to create the role entry in the system.                               |

#### Roles Data Table Columns

| Column     | Description                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| Name       | Displays the defined roles such as Manager, Employee, or Master Admin.                                         |
| Operations | Contains 'Remove' (red button) for deletion and 'Manage' (green button) for granular permission configuration. |

#### Functional Features



### Vendors

The Vendors module (URL Path: /dashboard/administration/vendors) serves as the central directory for all external supply chain partners. The page features a standard header with a back navigation arrow and a primary add (+) icon for record creation.

#### Header and Action Toolbar

The top-level toolbar includes a 'Filter' search input designed for real-time record lookup. As users type, the data table below dynamically updates to reflect matching vendor entries based on ID or Name.

#### Inline Quick-Add Header

| Input Field | Description                                                                                |
| ----------- | ------------------------------------------------------------------------------------------ |
| Id          | Text input area for assigning a specific numeric or alphanumeric identifier to the vendor. |
| Name        | Text input for the formal or legal name of the vendor entity.                              |
| Add Button  | Green action button that commits the input values to the database as a new vendor record.  |

#### Vendors Data Table Columns

| Column | Description                                                                                               |
| ------ | --------------------------------------------------------------------------------------------------------- |
| Id     | Unique vendor identifier, hyperlinked to open the detailed configuration and contact page for the vendor. |
| Name   | The vendor's primary display name, also hyperlinked for quick access to the vendor profile.               |

#### Functional Features



### User Tools

The User Tools module acts as a centralized administrative workbench for performing high-volume data manipulation, system maintenance, and cross-platform data synchronization. This page is accessible via the URL path `/dashboard/user_tools` and features a header titled User Tools with a back arrow icon for returning to the previous settings menu.

#### Data Imports: Liquor and Pricing

These utilities facilitate the mapping and ingestion of external pricing and liquor data into the XsiteIO database.



#### POS-Specific XML Imports

Tools designed to handle legacy and standard POS data formats for synchronization with BT9000 and Verifone systems.



#### Site and Price Overrides

Utilities focused on site-specific configurations and cloning logic.



#### Bulk Excel Updates

These tools allow for the mass update of existing records through structured spreadsheet uploads.

| Update Category   | Supported Fields/Actions                                         |
| ----------------- | ---------------------------------------------------------------- |
| General Update    | Departments, Subdepartments, Items, Suppliers, Customers.        |
| Metadata Sync     | Descriptions, Part Numbers, Item Costs, Order Units, Case Sizes. |
| Status Management | Bulk activation and deactivation of items via file upload.       |

#### System Maintenance and Logic



#### Functional Features



## Financial Management

### Income Statement

The Income Statement module provides a comprehensive fiscal overview of business performance, aggregating data from sales, inventory, and accounting modules to present a structured annual profit and loss report.

#### Header and Action Toolbar



#### Data Entry and Generation



#### Statement Data Table Structure

| Financial Row Category    | Monthly Columns          | Total      |
| ------------------------- | ------------------------ | ---------- |
| REVENUE                   | January through December | Annual Sum |
| COST OF GOODS SOLD (COGS) | January through December | Annual Sum |

The hierarchical data grid includes the following key financial metrics calculated in real-time:



#### Functional Features



​
