# Detailed Workflow Specifications

> **Source**: User-provided comprehensive workflow documentation
> **Date**: 2026-02-05

## Overview

This document captures the complete end-to-end workflow specifications for the ERP system, covering all modules from Sales Order to Finance, including customs compliance (BC 2.3 Import and BC 3.0 Export).

---

## A. Sales Order Workflow

### Process Flow

```mermaid
graph TD
    A[Customer sends PO] --> B[Sales Admin: Input SO]
    B --> C{Sales Manager Review}
    C -->|Reject| D[Notify Sales Admin]
    C -->|Approve| E[System Auto-trigger]
    E --> F[Check FG Stock]
    E --> G[Check Raw Material]
    E --> H[Update SO: CONFIRMED]
    F -->|Available| I[Reserve Stock → Logistics]
    F -->|Not Available| J[Create Production Planning]
    G -->|Below Reorder| K[Auto-create PR]
    H --> L[Notify: Production, Purchasing, Warehouse]
```

### Status Flow

`DRAFT` → `PENDING APPROVAL` → `APPROVED` → `IN PRODUCTION` → `READY TO SHIP` → `COMPLETED`

### Key Fields

- Customer, Product, Quantity, Delivery Date
- PO Document Upload
- Credit Limit Check
- Stock Availability Check

### Auto-triggers

- FG Stock check → Reserve or Create WO
- Raw Material check → Create PR if below reorder point
- Notifications to Production, Purchasing, Warehouse

---

## B. Purchasing & BC 2.3 (Import) Workflow

### Process Flow

```mermaid
graph TD
    A[PR Created] --> B[Purchasing: Review PR]
    B --> C[Create PO]
    C --> D{Manager Approve}
    D -->|Reject| B
    D -->|Approve| E[Send PO to Vendor]
    E --> F[Vendor Confirms]
    F --> G[Prepare BC 2.3]
    G --> H[Finance Verify BC 2.3]
    H --> I[Submit to Customs]
    I --> J{Customs Review}
    J -->|Query/Reject| K[Fix & Resubmit]
    J -->|Approve| L[Receive SPPB]
    L --> M[Vendor Delivers]
    M --> N[Warehouse GR]
```

### BC 2.3 Status Flow

`NOT REQUIRED` / `DRAFT` → `SUBMITTED` → `UNDER REVIEW` → `QUERY` → `APPROVED` → `CLOSED`

### PO Status Flow

`DRAFT` → `PENDING APPROVAL` → `APPROVED` → `SENT TO VENDOR` → `PARTIALLY RECEIVED` → `COMPLETED`

### Key Documents

- Commercial Invoice, Packing List, B/L
- HS Code, Origin, Value
- Duties & Taxes calculation (Bea Masuk, PPN, PPh 22)
- SPPB (Surat Persetujuan Pengeluaran Barang)

### Implementation Features ✅

**BC 2.3 Management** (`/purchasing/bc23`)

- Dashboard with stats (Pending, Approved, Total Value)
- List view with status badges
- Search and filter capabilities
- Quick navigation to detail pages

**BC 2.3 Detail Page** (`/purchasing/bc23/[id]`)

- Complete document information (BC number, PO reference, Supplier)
- Goods details with HS Code
- Duty calculations breakdown
- SPPB tracking
- Document checklist (Invoice, Packing List, B/L, COO)
- Status timeline visualization
- Activity log with audit trail
- **Lot Number Assignment** for material traceability

### Critical Data Points

- **Lot Number**: Assigned at import for full traceability (e.g., `RM-2026-001`)
- **HS Code**: Required for duty calculation
- **CIF Value**: Basis for customs duties
- **Duty Breakdown**: Bea Masuk + PPN + PPh 22 = Total Duties
- **SPPB Number**: Customs clearance approval reference

---

## C. Warehouse Receiving (GR) Workflow

### Process Flow

```mermaid
graph TD
    A[Goods Arrive] --> B[Security: Check Docs]
    B -->|Reject| C[Return to Vendor]
    B -->|Accept| D[Physical Inspection]
    D --> E[Create GR Draft]
    E --> F{Compare PO vs Actual}
    F -->|Variance > 5%| G[Alert Purchasing]
    F -->|OK| H[QC Inspection]
    H -->|Fail| I[Quarantine/Return]
    H -->|Pass| J[Assign Storage]
    J --> K[Supervisor Approve]
    K --> L[System Auto-update Stock]
    L --> M[Notify: Purchasing, Production, Finance]
```

### Status Flow

`PENDING ARRIVAL` → `DRAFT GR` → `QC INSPECTION` → `APPROVED` → `STOCK UPDATED`

### Key Actions

- Physical count, quality check, weighing
- Photo documentation
- BC 2.3 verification (for imports)
- 3-way matching trigger (PO-GR-Invoice)
- Stock card update, Laporan Mutasi Stok

---

## D. Production Workflow

### Process Flow

```mermaid
graph TD
    A[WO Request from SO] --> B[PPIC: Create WO]
    B --> C[Material Availability Check]
    C -->|Insufficient| D[Alert Purchasing]
    C -->|Sufficient| E[Manager Approve]
    E --> F[Material Reservation]
    F --> G[Release WO to Floor]
    G --> H[Warehouse: Issue Materials]
    H --> I[Start Production]
    I --> J[In-process QC]
    J --> K[Complete Production]
    K --> L[Final QC]
    L -->|Fail| M[Rework]
    L -->|Pass| N[Receive FG to Warehouse]
    N --> O[Generate Reports]
    O --> P[Close WO]
```

### Status Flow

`DRAFT` → `APPROVED` → `MATERIAL RESERVED` → `RELEASED` → `IN PROGRESS` → `COMPLETED` → `QC PASS` → `FG RECEIVED` → `CLOSED`

### Key Reports Auto-generated

1. **Laporan Hasil Produksi**
   - Target vs Actual output
   - Efficiency metrics
   - Quality metrics

2. **Konversi Bahan Baku Report** ✅ (`/reports/production`)
   - Raw material consumed (with BC 2.3 reference)
   - Finished goods produced (with lot number)
   - Conversion ratio (actual vs standard)
   - Variance analysis (standard vs actual)
   - Waste/scrap tracking
   - **Full Traceability**: BC 2.3 (import) → GR → WO → FG → BC 3.0 (export)

### Material Traceability System ✅

**Traceability Chain** (`/reports/traceability`)

- Visual flow: BC 2.3 → Goods Receipt → Work Order → Finished Goods → BC 3.0
- Lot/batch tracking throughout the chain
- Conversion analysis with variance
- Material Traceability Certificate generation
- Search by: Lot Number, BC 2.3, BC 3.0, WO, PO

**Key Traceability Data**:

- RM Lot Number (from BC 2.3): `RM-2026-001`
- FG Lot Number (from WO): `FG-2026-001`
- Conversion Ratio: Actual vs Standard
- Variance %: Performance indicator
- Waste Quantity: For audit compliance

---

## E. Logistics & BC 3.0 (Export) Workflow

### Process Flow

```mermaid
graph TD
    A[FG Ready] --> B[Sales: Create SI]
    B --> C[Logistics: Process SI]
    C --> D[Book Vessel/Flight]
    D --> E[Prepare BC 3.0]
    E --> F[Finance Verify]
    F --> G[Submit to Customs]
    G --> H{Customs Review}
    H -->|Query/Reject| I[Fix & Resubmit]
    H -->|Approve| J[Receive PEB]
    J --> K[Prepare Goods]
    K --> L{Physical Inspection?}
    L --> M[Load to Container]
    M --> N[Generate Export Docs]
    N --> O[Forwarder Collect]
    O --> P[In Transit]
    P --> Q[Delivered]
```

### BC 3.0 Status Flow

`DRAFT` → `VERIFIED` → `SUBMITTED` → `UNDER REVIEW` → `APPROVED` → `EXPORTED` → `CLOSED`

### Shipment Status Flow

`DRAFT SI` → `CONFIRMED` → `BC 3.0 SUBMITTED` → `BC 3.0 APPROVED` → `LOADED` → `IN TRANSIT` → `DELIVERED` → `COMPLETED`

### Key Documents

- Commercial Invoice, Packing List
- Certificate of Origin (Form E, etc)
- Health Certificate
- PEB (Pemberitahuan Ekspor Barang)
- NPE (Nomor Pendaftaran Eksportir)
- Bill of Lading / Airway Bill
- POD (Proof of Delivery)

### Implementation Features ✅

**BC 3.0 Management** (`/logistics/bc30`)

- Dashboard with stats (Pending, Approved, Total Export Value)
- List view with PEB tracking
- Status badges and filters
- Quick access to detail pages

**BC 3.0 Detail Page** (`/logistics/bc30/[id]`)

- Complete export declaration information
- PEB (Pemberitahuan Ekspor Barang) tracking
- NPE (Nomor Pendaftaran Eksportir) display
- **Full Traceability Chain**: Links back to BC 2.3 and WO
- Conversion analysis display
- Document checklist (Invoice, Packing List, COO, Health Cert, Form E)
- Status timeline
- Activity log

### Material Traceability Integration

**BC 3.0 to BC 2.3 Linkage**:

- Each BC 3.0 export is linked to source BC 2.3 import(s)
- Traceability chain visible on BC 3.0 detail page
- Shows: BC 2.3 → GR → WO → FG → BC 3.0
- Conversion ratio and waste tracking
- Compliance audit trail

**Stock Movement Report** ✅ (`/reports/stock-movement`)

- Period & material filters
- Balance summary (Opening, In, Out, Closing)
- Transaction breakdown by type:
  - Import (BC 2.3 references)
  - Production (WO references)
  - Export (BC 3.0 references)
  - Waste/Scrap
- Detailed transaction table with lot tracking
- BC references for all movements
- Export to Excel functionality

---

## F. Finance Workflow

### Accounts Payable (AP)

```mermaid
graph TD
    A[Vendor Invoice Received] --> B[Input Invoice]
    B --> C[3-Way Matching]
    C -->|Mismatch| D[Investigate]
    C -->|Match| E[Verify Tax]
    E --> F[Manager Approve]
    F --> G[Schedule Payment]
    G --> H[Execute Payment]
    H --> I[Update GL & Close PO]
```

### Accounts Receivable (AR)

```mermaid
graph TD
    A[Goods Shipped] --> B[Auto-generate Invoice]
    B --> C[AR Verify]
    C --> D[Generate Faktur Pajak]
    D --> E[Manager Approve]
    E --> F[Send to Customer]
    F --> G[Upload to DJP e-Faktur]
    G --> H[Payment Monitoring]
    H --> I{Payment Received?}
    I -->|Yes| J[Update AR & Close SO]
    I -->|Overdue| K[Collection Actions]
```

### Invoice Status Flow

`DRAFT` → `APPROVED` → `SENT` → `PARTIALLY PAID` → `PAID` / `OVERDUE`

---

## G. Integration & Auto-triggers

### Cross-Module Triggers

| Trigger Event       | Auto Actions                                                                                                               |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **SO APPROVED**     | Check FG Stock → Reserve or Create WO<br>Check Raw Material → Create PR if low<br>Update Sales Dashboard                   |
| **PO APPROVED**     | Notify Warehouse for GR prep<br>Create BC 2.3 template (imports)<br>Update Purchasing Dashboard                            |
| **BC 2.3 APPROVED** | Notify Warehouse: Ready to receive<br>Allow GR creation<br>Update Compliance Dashboard                                     |
| **GR COMPLETED**    | Update Inventory<br>Notify Production: Material available<br>Trigger AP: Invoice matching<br>Generate Laporan Mutasi Stok  |
| **WO COMPLETED**    | Update FG Inventory<br>Generate Production Reports<br>Generate Konversi Bahan Baku<br>Notify Logistics<br>Update SO status |
| **BC 3.0 APPROVED** | Allow shipment<br>Generate export documents<br>Update Compliance Dashboard                                                 |
| **GOODS SHIPPED**   | Update FG Stock<br>Auto-generate Sales Invoice<br>Update SO: SHIPPED<br>Start shipment tracking                            |
| **INVOICE CREATED** | Generate Faktur Pajak<br>Schedule email to customer<br>Start payment monitoring<br>Update AR Dashboard                     |

---

## H. Approval Matrix

| Document             | Level 1              | Level 2               | Level 3                       | Level 4          |
| :------------------- | :------------------- | :-------------------- | :---------------------------- | :--------------- |
| **Sales Order**      | Sales Admin (Create) | Sales Manager (>50M)  | Director (>500M)              | -                |
| **Purchase Request** | Requestor            | Dept Head             | Purchasing Mgr (>25M)         | -                |
| **Purchase Order**   | Purchasing Staff     | Purchasing Mgr (>50M) | Finance Mgr (>100M)           | Director (>500M) |
| **Goods Receipt**    | Warehouse Staff      | Warehouse Supervisor  | Purchasing Mgr (variance >5%) | -                |
| **Work Order**       | PPIC                 | Production Manager    | -                             | -                |
| **BC 2.3**           | Purchasing           | Finance               | Customs (External)            | -                |
| **BC 3.0**           | Logistics            | Finance               | Customs (External)            | -                |
| **Payment Voucher**  | AP Staff             | Finance Mgr (>25M)    | Director (>250M)              | -                |
| **Sales Invoice**    | AR Staff             | Finance Manager       | -                             | -                |

---

## I. Notification System

### Email Notifications

- SO Approved → Production (New WO needed)
- Stock below reorder → Purchasing (Create PR)
- PO Approved → Vendor (PO attached)
- GR Completed → Purchasing + Finance
- BC Submitted → Finance
- BC Approved → Warehouse/Logistics
- WO Completed → QC + Logistics
- Goods Shipped → Customer + Sales (tracking)
- Invoice Sent → Customer (Invoice + Faktur)
- Payment Due (3 days before) → Customer
- Payment Overdue → AR + Sales Manager

### Dashboard Alerts

🔴 **Critical**

- Stock critical level (<20% of reorder point)
- BC document rejected
- Payment overdue >30 days
- Production WO delayed >24 hours

🟡 **Warning**

- Stock below reorder point
- BC pending >3 days
- Payment due within 7 days
- PO delivery overdue

🟢 **Info**

- New SO awaiting approval
- GR completed
- WO completed
- Shipment delivered

---

## I-A. Customs Compliance Dashboard ✅

### Overview (`/compliance`)

**Centralized Monitoring**:

- Real-time BC 2.3 & BC 3.0 status tracking
- Compliance alerts and notifications
- Traceability overview
- Recent activity feed

### Key Metrics Displayed

**BC 2.3 Import Status**:

- Total active documents
- Pending review count
- Approved this month
- Recent documents with quick links

**BC 3.0 Export Status**:

- Total active documents
- Pending review count
- Approved this month
- Recent documents with quick links

**Material Traceability**:

- Total traceability records
- Exported vs pending
- Traceability gaps detection
- Progress tracking

**Compliance Alerts**:

- BC 2.3 pending review
- BC 3.0 pending review
- Traceability gaps warning
- "All Clear" status when no issues

### Integration with Executive Dashboard

**Executive Dashboard Updates** (`/`)

- Customs Compliance widget added
- Shows total pending approvals (BC 2.3 + BC 3.0)
- Color-coded alerts (Green = All Clear, Orange = Pending)
- Quick link to Compliance Dashboard
- Recent activities include BC approvals and traceability completions

---

## J. Reporting Requirements

### Daily Reports (Auto 06:00)

- Production Summary (yesterday)
- **Stock Movement Report** ✅ (with BC references)
- **BC Status Dashboard** ✅ (BC 2.3 & BC 3.0 pending)
- Cash Flow Daily

### Weekly Reports (Monday 08:00)

- Sales Performance
- Production Efficiency
- Inventory Aging
- AP/AR Aging
- **Customs Compliance Summary** ✅

### Monthly Reports (1st 08:00)

- Financial Statement (P&L, Balance Sheet)
- **BC 2.3 & BC 3.0 Summary** ✅
- **Material Traceability Report** ✅
- **Production Conversion Report** ✅ (with variance analysis)
- SPT PPN (Tax report)
- Vendor Performance
- Customer Sales Analysis

### On-Demand Reports

- **Material Traceability Certificate** ✅ (customs audit)
- **Stock Movement by Material** ✅ (period-based)
- **Konversi Bahan Baku Analysis** ✅ (RM to FG conversion)
- Production Cost Analysis
- SO Fulfillment Report
- Quality Metrics Report

### Customs Audit Reports ✅

**For Bea Cukai Compliance**:

1. **BC 2.3 to BC 3.0 Reconciliation**
   - Import quantities vs Export quantities
   - Conversion ratios and waste
   - Full traceability chain

2. **Material Traceability Certificate**
   - Lot-to-lot tracking
   - BC 2.3 source → BC 3.0 destination
   - Conversion analysis with variance

3. **Stock Movement Report**
   - All transactions with BC references
   - Opening/Closing balances
   - Import, Production, Export breakdown

---

## Next Steps

This specification will guide the implementation plan for:

1. Database schema design
2. API endpoints definition
3. UI/UX flow implementation
4. Integration logic
5. Approval workflow engine
6. Notification system
7. Reporting module
