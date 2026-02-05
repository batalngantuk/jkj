# JKJ Manufacturing ERP - Quick Reference Guide

> **Panduan Cepat untuk Penggunaan Sehari-hari**

---

## 🗺️ Navigation Map

```
📊 Dashboard (/)
   └─ Overview bisnis & metrics dengan charts

🛡️ Compliance (/compliance)
   ├─ BC 2.3 Status
   ├─ BC 3.0 Status
   ├─ Traceability Overview
   └─ Compliance Alerts

🛒 Sales Orders (/sales)
   ├─ All Orders
   ├─ Create Order (/sales/new)
   └─ Order Detail (/sales/[id])

🏭 Production (/production)
   ├─ Dashboard
   ├─ Planning (/production/planning)
   ├─ Work Orders (/production/wo)
   └─ New Work Order (/production/wo/new)

📦 Warehouse (/warehouse)
   ├─ Dashboard
   ├─ Inbound/Receiving (/warehouse/inbound)
   └─ Outbound/Shipping (/warehouse/outbound)

🛍️ Purchasing (/purchasing)
   ├─ Dashboard
   ├─ Suppliers (/purchasing/suppliers)
   ├─ Purchase Orders (/purchasing/po)
   ├─ New PO (/purchasing/po/new)
   └─ BC 2.3 Import (/purchasing/bc23) ✅
      └─ New BC 2.3 (/purchasing/bc23/new) ✅

🚚 Logistics (/logistics)
   ├─ Dashboard (with charts) ✅
   ├─ Fleet Management (/logistics/fleet) ✅
   ├─ Shipments Tracking (/logistics/shipments) ✅
   └─ BC 3.0 Export (/logistics/bc30) ✅
      └─ New BC 3.0 (/logistics/bc30/new) ✅

💰 Finance (/finance) ✅
   ├─ Dashboard ✅
   ├─ Accounts Receivable (/finance/ar) ✅
   ├─ Accounts Payable (/finance/ap) ✅
   └─ Payments (/finance/payments) ✅

📊 Reports (/reports) ✅
   ├─ Overview (with charts) ✅
   ├─ Sales Analysis (/reports/sales) ✅
   ├─ Inventory Valuation (/reports/inventory) ✅
   ├─ Material Traceability (/reports/traceability) ✅
   ├─ Stock Movement (/reports/stock-movement) ✅
   └─ Production Yield (/reports/production) ✅
```

---

## ⚡ Common Tasks

### Sales Admin

**Create Sales Order**:

1. Sales Orders → New Sales Order
2. Fill customer & product details
3. Upload customer PO
4. Submit for approval

### Purchasing Staff

**Create PO + BC 2.3**:

1. Purchasing → PO → New PO
2. Fill supplier & material
3. Submit for approval
4. After approved: BC 2.3 → New BC 2.3
5. Link to PO, fill HS Code & CIF Value
6. Submit to customs

### Warehouse Staff

**Goods Receipt (Import)**:

1. Warehouse → Inbound → New GR
2. Link to PO & BC 2.3
3. Input lot number (e.g., RM-2026-001)
4. Verify quantity
5. Complete GR

### Production Planner

**Create Work Order**:

1. Production → Work Orders → New WO
2. Select product & quantity
3. Link to SO (if any)
4. Check material availability
5. Schedule & submit

### Logistics Staff

**Create BC 3.0 Export**:

1. Logistics → BC 3.0 → New BC 3.0
2. Link to SO
3. Select FG with lot number
4. System auto-shows traceability chain
5. Fill PEB details
6. Submit for verification

**Create Shipment**:

1. Logistics → Shipments → New Shipment
2. Link to SO and BC 3.0
3. Assign vehicle and driver
4. Schedule delivery
5. Track status and update POD

### Finance Staff

**Create AR Invoice**:

1. Finance → AR → New Invoice
2. Link to Sales Order
3. System auto-fills customer and items
4. Generate Faktur Pajak
5. Send to customer

**Record Payment**:

1. Finance → Payments → New Payment
2. Link to invoice (AR or AP)
3. Select payment method
4. Input amount and reference
5. Complete payment

---

## 🎯 Status Badges

| Badge           | Meaning                             |
| --------------- | ----------------------------------- |
| 🔵 DRAFT        | Dokumen masih draft, belum submit   |
| 🟡 PENDING      | Menunggu approval                   |
| 🟠 SUBMITTED    | Sudah submit, menunggu review       |
| 🔴 UNDER REVIEW | Sedang direview (customs/manager)   |
| 🟣 QUERY        | Ada pertanyaan/revisi dari reviewer |
| 🟢 APPROVED     | Sudah diapprove                     |
| ⚫ CLOSED       | Dokumen selesai/closed              |
| 🔵 IN PROGRESS  | Sedang dikerjakan                   |
| 🟢 COMPLETED    | Selesai dikerjakan                  |

---

## 🔗 Traceability Flow

```
Import → Receipt → Production → Export

BC 2.3          →  GR          →  WO         →  FG         →  BC 3.0
(Lot: RM-xxx)      (Stock In)     (Convert)     (Lot: FG-xxx)  (Export)
```

**Key Points**:

- ✅ Lot number assigned di BC 2.3 (import)
- ✅ Lot number tracked di GR (receipt)
- ✅ Conversion tracked di WO (production)
- ✅ FG lot number assigned di WO
- ✅ Full chain visible di BC 3.0 (export)

---

## 📋 Document Checklist

### BC 2.3 Import

- [ ] Commercial Invoice
- [ ] Packing List
- [ ] Bill of Lading (B/L)
- [ ] Certificate of Origin (COO)

### BC 3.0 Export

- [ ] Commercial Invoice
- [ ] Packing List
- [ ] Certificate of Origin (Form E)
- [ ] Health Certificate (if needed)
- [ ] Other certificates

---

## 🚨 Alerts & Notifications

| Icon | Priority | Action                    |
| ---- | -------- | ------------------------- |
| 🔴   | CRITICAL | Immediate action required |
| 🟡   | WARNING  | Review within 24 hours    |
| 🟢   | INFO     | For information only      |

**Common Alerts**:

- 🔴 Stock critical level → Create PR immediately
- 🔴 BC rejected → Fix & resubmit
- 🔴 Payment overdue > 30 days → Follow up
- 🟡 Stock below reorder → Create PR soon
- 🟡 BC pending > 3 days → Check status
- 🟡 Payment due in 7 days → Prepare payment

---

## 💡 Tips & Tricks

### Data Entry

✅ **Always**:

- Input lot numbers saat GR
- Upload supporting documents
- Verify data before submit
- Use correct HS Code

❌ **Never**:

- Skip approval workflow
- Delete historical data
- Edit approved documents (use adjustment)

### Search

- Use **Ctrl+F** untuk search di page
- Filter by status untuk quick access
- Use date range untuk historical data

### Reports

- Export to Excel untuk further analysis
- Print untuk hard copy
- Save filters untuk recurring reports

---

## 🔧 Troubleshooting

### Stock tidak update?

→ Check apakah GR sudah complete (bukan draft)

### BC tidak bisa submit?

→ Pastikan semua required fields terisi (HS Code, CIF Value, Documents)

### Traceability chain kosong?

→ Verify lot number di BC 2.3 dan WO

### Conversion ratio salah?

→ Check BOM standard ratio dan actual quantity

### Approval stuck?

→ Check dengan approver atau admin

---

## 📞 Quick Help

**In-App**:

- Hover pada field untuk tooltip
- Click (?) icon untuk help
- Check status timeline untuk progress

**Documentation**:

- Platform Overview (comprehensive guide)
- Detailed Workflow Spec (technical details)
- Customs Walkthrough (BC 2.3 & BC 3.0)

---

## 🎓 Training Resources

### By Role

- **Sales**: Sales Order workflow
- **Purchasing**: PO & BC 2.3 management
- **Warehouse**: GR & stock management
- **Production**: WO & BOM management
- **Logistics**: Shipment & BC 3.0
- **Finance**: Invoice & payment
- **Compliance**: BC monitoring & reports

### By Module

- Customs Compliance (BC 2.3 & BC 3.0)
- Material Traceability
- Stock Movement
- Production Conversion

---

## 📊 Key Metrics

### Executive Dashboard

- 💰 Total Revenue (YTD)
- 🏭 Production Yield (%)
- 📦 Inventory Value (Rp)
- 💵 Net Cashflow (Rp)
- 🛡️ Customs Compliance Status

### Compliance Dashboard

- 📋 BC 2.3 Active / Pending
- 📋 BC 3.0 Active / Pending
- 🔗 Traceability Records
- ⚠️ Compliance Alerts

---

## 🔑 Glossary

| Term    | Meaning                              |
| ------- | ------------------------------------ |
| BC 2.3  | Import Declaration                   |
| BC 3.0  | Export Declaration                   |
| PEB     | Pemberitahuan Ekspor Barang          |
| SPPB    | Surat Persetujuan Pengeluaran Barang |
| NPE     | Nomor Pendaftaran Eksportir          |
| HS Code | Harmonized System Code               |
| CIF     | Cost, Insurance, Freight             |
| FOB     | Free on Board                        |
| GR      | Goods Receipt                        |
| WO      | Work Order                           |
| BOM     | Bill of Materials                    |
| FG      | Finished Goods                       |
| RM      | Raw Material                         |
| SO      | Sales Order                          |
| PO      | Purchase Order                       |

---

**© 2026 JKJ Manufacturing ERP**  
_Quick Reference v1.0_
