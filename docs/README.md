# JKJ Manufacturing ERP - Documentation

> **Dokumentasi Lengkap Platform ERP - BC 2.0 Regular Import System**

## 📚 Daftar Dokumentasi

### 1. Platform Overview

📄 **File**: `platform_overview.md`

**Isi**: Panduan lengkap platform mencakup:

- Tentang Platform & Keunggulan
- Arsitektur Sistem
- Modul-Modul Utama (9 modul)
- Alur Kerja End-to-End
- Peran & Akses User
- Panduan Cepat per Role
- Fitur Unggulan
- Best Practices
- Support & Training

**Untuk**: New users, training, onboarding

---

### 2. Quick Reference Guide

📄 **File**: `quick_reference.md`

**Isi**: Cheat sheet untuk penggunaan sehari-hari:

- Navigation Map
- Common Tasks per Role
- Status Badges
- Traceability Flow
- Document Checklist
- Alerts & Notifications
- Tips & Tricks
- Troubleshooting

**Untuk**: Daily use, quick lookup

---

### 3. Detailed Workflow Specification

📄 **File**: `detailed_workflow_spec.md`

**Isi**: Spesifikasi workflow lengkap:

- Sales Order Workflow
- Purchasing & BC 2.0 Import (Regular Import with Dual Billing)
- Warehouse Receiving (GR with Landed Cost)
- Production & Optional Material Traceability
- Logistics & PEB Export (Regular Export)
- Finance Workflow (Dual Billing, Tax Assets, Landed Cost)
- Integration & Auto-triggers
- Alert Priorities
- Import & Tax Dashboard
- Reporting Requirements

**Untuk**: Technical reference, implementation guide

---

### 4. Customs Compliance Walkthrough

📄 **File**: `customs_walkthrough.md`

**Isi**: Walkthrough implementasi BC 2.0:

- BC 2.0 Import Module (with Dual Billing)
- PEB Export Module (Regular Export)
- Optional Material Traceability System
- Landed Cost Calculation & Capitalization
- Tax Asset Management (PPN & PPh 22)
- Stock Movement Report
- Import & Tax Dashboard
- Production Costing Report

**Untuk**: Understanding customs implementation

---

## 🚀 Quick Start

### Untuk User Baru

1. Baca **Platform Overview** untuk memahami sistem
2. Gunakan **Quick Reference** untuk navigasi sehari-hari
3. Refer ke **Detailed Workflow** untuk detail proses

### Untuk Developer

1. Review **PRD_BC20_System.md** untuk requirements lengkap
2. Follow **IMPLEMENTATION_PLAN.md** untuk 12-week roadmap
3. Check **Detailed Workflow Specification** untuk technical details
4. Review **Customs Walkthrough** untuk BC 2.0 implementation guide
5. Refer to code implementation in `/app` directory

### Untuk Training

1. Start with **Platform Overview** (comprehensive)
2. Practice with **Quick Reference** (hands-on)
3. Deep dive with **Detailed Workflow** (advanced)

---

## 📁 Struktur Folder

```
docs/
├── README.md                      (this file)
├── PRD_BC20_System.md             (Product Requirements Document)
├── IMPLEMENTATION_PLAN.md         (12-week implementation plan)
├── platform_overview.md           (comprehensive guide)
├── quick_reference.md             (quick cheat sheet)
├── detailed_workflow_spec.md      (technical workflow)
└── customs_walkthrough.md         (BC 2.0 implementation walkthrough)
```

---

## 🔑 Key Concepts

### BC 2.0 Regular Import System

- **Dual Billing**: Vendor payment (CIF) + Tax payment (Bea Masuk, PPN, PPh 22)
- **Upfront Tax Payment**: Taxes must be paid before customs release (blocking)
- **Landed Cost**: CIF + Bea Masuk + Freight + Handling (capitalized to inventory)
- **Tax Assets**: PPN & PPh 22 recorded as prepaid tax assets (not inventory cost)
- **Operational Flexibility**: No customs supervision, flexible sales (domestic or export)

### Material Traceability (Optional)

- **Optional feature** for internal quality control (NOT mandatory for customs)
- Full chain: BC 2.0 → GR → WO → FG → PEB (if implemented)
- Lot number tracking (optional)
- Conversion analysis for internal efficiency
- ISO certification support

### Customs Compliance

- **BC 2.0 (PIB)**: Regular Import Declaration with dual billing
- **PEB**: Regular Export Declaration (no mandatory BC 2.0 linkage)
- Tax payment monitoring
- Automated alerts for pending payments
- Landed cost tracking
- Tax asset reporting

### Workflow Integration

- Dual billing auto-generation on BC 2.0 submission
- Tax payment blocking for goods receipt
- Landed cost auto-calculation
- Tax asset auto-recording (PPN & PPh 22)
- Auto-triggers across modules
- Real-time notifications
- Status tracking
- Approval workflows

---

## 📞 Support

**Questions?**

- Check **Quick Reference** for common issues
- Review **Platform Overview** for detailed explanations
- Refer to **Detailed Workflow** for technical details

**Training Materials**:

- All documentation in this folder
- In-app tooltips and help
- Status badge explanations

---

---

## 📋 Product Requirements & Implementation

### 5. BC 2.0 System PRD

📄 **File**: `PRD_BC20_System.md`

**Isi**: Product requirements untuk BC 2.0 Regular Import:

- Executive Summary & Business Context
- BC 2.0 vs BC 2.3 Comparison
- User Personas & Roles
- Feature Requirements (Dual Billing, Landed Cost, Tax Assets)
- BC 2.0 Document Creation & Management
- Dual Billing Generation
- Landed Cost Calculation & Capitalization
- Tax Accounting (PPN & PPh 22)
- Purchasing & Procurement Integration
- Sales & Export (PEB)
- Inventory Management (No Customs Constraints)
- COGS & Production Costing
- Reports & Analytics
- UI Requirements & Mockups
- Testing Requirements
- Implementation Timeline

**Untuk**: Developers, product managers, technical reference

---

### 6. Implementation Plan

📄 **File**: `IMPLEMENTATION_PLAN.md`

**Isi**: 12-week step-by-step implementation plan:

- **Phase 1 (Weeks 1-3)**: BC 2.0 Import Module
  - Database schema & backend APIs
  - UI components (list, detail, create)
  - Dual billing & tax payment logic

- **Phase 2 (Weeks 4-5)**: Landed Cost & Tax Accounting
  - Landed cost calculation engine
  - Tax asset recording (PPN & PPh 22)
  - Automatic journal entries

- **Phase 3 (Weeks 6-7)**: Finance Integration
  - Dual billing in AP module
  - Tax payment management
  - Cash flow forecasting

- **Phase 4 (Weeks 8-9)**: PEB Export Module
  - PEB document management
  - Zero-rated VAT logic
  - Simple export workflow

- **Phase 5 (Weeks 10-11)**: Reporting & Dashboard
  - BC 2.0 & Tax Dashboard
  - Stock movement reports
  - Tax asset reports

- **Phase 6 (Week 12)**: Optional Traceability
  - Lot tracking system
  - Traceability certificates

**Untuk**: Developers, project managers, implementation team

---

**© 2026 JKJ Manufacturing ERP**
_Documentation v2.0 - BC 2.0 Regular Import System_

**Key Features**: Dual Billing • Upfront Tax Payment • Landed Cost • Tax Asset Management
