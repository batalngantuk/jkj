# JKJ Manufacturing ERP - Quick Reference Guide

> **Panduan Cepat untuk Penggunaan Sehari-hari**

---

## 🗺️ Navigation Map

```
📊 Dashboard (/)
   └─ Overview bisnis & metrics dengan charts

🛡️ Compliance (/compliance)
   ├─ BC 2.0 Status
   ├─ PEB Export Status
   ├─ Traceability Overview (Optional)
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
   └─ BC 2.0 Import (/purchasing/bc20) ✅
      └─ New BC 2.0 (/purchasing/bc20/new) ✅

🚚 Logistics (/logistics)
   ├─ Dashboard (with charts) ✅
   ├─ Fleet Management (/logistics/fleet) ✅
   ├─ Shipments Tracking (/logistics/shipments) ✅
   └─ PEB Export (/logistics/peb) ✅
      └─ New PEB (/logistics/peb/new) ✅

💰 Finance (/finance) ✅
   ├─ Dashboard ✅
   ├─ Accounts Receivable (/finance/ar) ✅
   ├─ Accounts Payable (/finance/ap) ✅
   ├─ Payments (/finance/payments) ✅
   ├─ Tax Assets (/finance/tax-assets) ✅
   │  ├─ PPN Import Credits
   │  └─ PPh 22 Prepaid Tax
   └─ Landed Cost (/finance/landed-cost) ✅

📊 Reports (/reports) ✅
   ├─ Overview (with charts) ✅
   ├─ Sales Analysis (/reports/sales) ✅
   ├─ Inventory Valuation (/reports/inventory) ✅
   ├─ Material Traceability (Optional) (/reports/traceability) ✅
   ├─ Stock Movement (/reports/stock-movement) ✅
   ├─ Production Yield (/reports/production) ✅
   ├─ BC 2.0 Import Summary (/reports/bc20-summary) ✅
   ├─ Landed Cost Analysis (/reports/landed-cost) ✅
   ├─ Tax Payment Tracking (/reports/tax-tracking) ✅
   └─ Cash Flow Forecast (/reports/cashflow) ✅
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

**Create PO + BC 2.0 (with Dual Billing)**:

1. Purchasing → PO → New PO
2. Fill supplier & material (FOB + Freight + Insurance)
3. Review estimated total cost (CIF + duties)
4. Submit for approval
5. After approved: BC 2.0 → New BC 2.0
6. Link to PO, fill HS Code & CIF Value
7. System auto-calculates: Bea Masuk, PPN Import, PPh 22
8. Submit to customs
9. **Two billings auto-created**:
   - Billing 1: Vendor Payment (CIF amount)
   - Billing 2: Tax Payment (duties to DJBC)
10. Coordinate with Finance for tax payment

### Warehouse Staff

**Goods Receipt (Import with Landed Cost)**:

1. Wait for BC 2.0 status = "CUSTOMS RELEASED" (after tax paid)
2. Warehouse → Inbound → New GR
3. Link to PO & BC 2.0
4. Input lot number (e.g., RM-2026-001) - optional for quality tracking
5. Verify quantity
6. System auto-shows **Landed Cost per unit**:
   - CIF + Bea Masuk + Freight + Handling
   - PPN & PPh NOT included (recorded as tax assets)
7. Complete GR → Inventory updated at landed cost

### Production Planner

**Create Work Order**:

1. Production → Work Orders → New WO
2. Select product & quantity
3. Link to SO (if any)
4. Check material availability
5. Schedule & submit

### Logistics Staff

**Create PEB Export (Regular, No BC Linkage)**:

1. Logistics → PEB → New PEB
2. Link to SO
3. Select finished goods for export
4. **No need to link to BC 2.0 import** (not required for BC 2.0)
5. **No material traceability requirement** (optional for internal use)
6. Fill standard export details (PEB number, port, etc.)
7. Upload export documents (Invoice, Packing List, COO)
8. Submit for customs clearance
9. Export is VAT zero-rated (0% PPN)

**Create Shipment**:

1. Logistics → Shipments → New Shipment
2. Link to SO and PEB
3. Assign vehicle and driver
4. Schedule delivery
5. Track status and update POD

### Finance Staff

**Process Tax Payment (BC 2.0)**:

1. Monitor BC 2.0 status = "TAX PAYMENT PENDING"
2. Finance → Tax Assets → Tax Payments
3. Review tax breakdown:
   - Bea Masuk (Import Duty)
   - PPN Import (11% VAT)
   - PPh 22 (2.5%-10% withholding tax)
4. Process payment to DJBC (Customs)
5. Upload payment proof
6. System auto-records:
   - PPN Import → Prepaid Tax Asset (can credit against output VAT)
   - PPh 22 → Prepaid Tax Asset (can credit against annual income tax)
7. BC 2.0 status updates to "TAX PAID" → "CUSTOMS RELEASED"

**Process Vendor Payment (Dual Billing)**:

1. Finance → AP → Vendor Payments
2. Review vendor billing (CIF amount in USD)
3. Pay per payment terms (e.g., 30 days from B/L date)
4. Transfer to vendor's bank account
5. Record payment and upload proof

**Create AR Invoice**:

1. Finance → AR → New Invoice
2. Link to Sales Order
3. System auto-fills customer and items
4. For domestic sales: Add PPN 11% (Faktur Pajak)
5. For export sales: 0% PPN (zero-rated)
6. Send to customer

**Track Tax Credits**:

1. Finance → Tax Assets → PPN Credits
2. Monitor PPN Import available for crediting
3. Offset against monthly PPN Keluaran (output VAT)
4. Finance → Tax Assets → PPh 22 Credits
5. Track PPh 22 prepaid for annual tax credit

---

## 🎯 Status Badges

| Badge                    | Meaning                                          |
| ------------------------ | ------------------------------------------------ |
| 🔵 DRAFT                 | Dokumen masih draft, belum submit                |
| 🟡 PENDING               | Menunggu approval                                |
| 🟠 SUBMITTED             | Sudah submit ke customs                          |
| 🔴 UNDER CUSTOMS REVIEW  | Sedang direview oleh customs                     |
| 🔴 TAX PAYMENT PENDING   | **BLOCKING** - Harus bayar pajak dulu            |
| 🟢 TAX PAID              | Pajak sudah dibayar, menunggu SPPB               |
| 🟢 CUSTOMS RELEASED      | SPPB diterima, barang bisa diterima              |
| 🔵 GOODS RECEIVED        | Barang sudah diterima warehouse                  |
| ⚫ CLOSED                 | Dokumen selesai/closed                           |
| 🔵 IN PROGRESS           | Sedang dikerjakan                                |
| 🟢 COMPLETED             | Selesai dikerjakan                               |

---

## 🔗 Traceability Flow (Optional for BC 2.0)

```
Import → Receipt → Production → Export (Flexible)

BC 2.0          →  GR          →  WO         →  FG         →  PEB or Domestic
(Lot: RM-xxx)      (Stock In)     (Convert)     (Lot: FG-xxx)  (No linkage required)
 Optional           Optional        Optional       Optional       Simple export
```

**Key Differences from BC 2.3**:

- ⚠️ **Material traceability is OPTIONAL** (for internal quality control only)
- ⚠️ **NOT required by customs** (BC 2.0 = regular import, not bonded zone)
- ✅ Can sell domestically OR export freely
- ✅ Export PEB does NOT need to link back to BC 2.0 import
- ✅ No mandatory conversion analysis for customs
- ✅ Lot tracking recommended for ISO certification & customer requirements

**Dual Billing Flow (BC 2.0 Specific)**:

```
BC 2.0 Submitted → Auto-Generate Dual Billing
                   ├─ Billing 1: Vendor Payment (CIF in USD)
                   └─ Billing 2: Tax Payment (Duties in IDR)
                                  ↓
                          Tax Payment UPFRONT (blocking)
                                  ↓
                          Customs Released (SPPB)
                                  ↓
                          Goods Receipt (with Landed Cost)
```

---

## 📋 Document Checklist

### BC 2.0 Import (Regular Import)

**Required Documents**:
- [ ] Commercial Invoice (vendor invoice)
- [ ] Packing List
- [ ] Bill of Lading (B/L) / Airway Bill (AWB)
- [ ] Certificate of Origin (COO) - optional

**Tax Payment Documents**:
- [ ] Tax payment proof (Bea Masuk, PPN, PPh 22)
- [ ] SPPB (Customs release approval)
- [ ] Bank transfer receipt to DJBC

**Landed Cost Documents**:
- [ ] Freight invoice (international shipping)
- [ ] Insurance certificate
- [ ] Handling fee invoice (port/customs broker)
- [ ] Domestic freight invoice (port to warehouse)

### PEB Export (Regular Export)

**No BC 2.0 Linkage Required**:
- [ ] Commercial Invoice (to buyer)
- [ ] Packing List
- [ ] Certificate of Origin (Form E / other)
- [ ] Health Certificate (if needed)
- [ ] Other certificates (as per buyer requirements)
- [ ] No traceability documents needed for customs

---

## 🚨 Alerts & Notifications

| Icon | Priority | Action                    |
| ---- | -------- | ------------------------- |
| 🔴   | CRITICAL | Immediate action required |
| 🟡   | WARNING  | Review within 24 hours    |
| 🟢   | INFO     | For information only      |

**Common Alerts**:

- 🔴 Stock critical level → Create PR immediately
- 🔴 BC 2.0 rejected → Fix & resubmit
- 🔴 **Tax payment pending (BC 2.0)** → **BLOCKING** - Pay immediately to release goods
- 🔴 Payment overdue > 30 days → Follow up
- 🔴 **Dual billing created** → Finance must process tax payment ASAP
- 🟡 Stock below reorder → Create PR soon
- 🟡 BC 2.0 pending > 3 days → Check status with customs
- 🟡 **Vendor payment due in 7 days** → Prepare payment (separate from tax)
- 🟡 **Tax payment due** → Coordinate with Finance for DJBC payment
- 🟡 **Landed cost variance** → Review freight/handling costs
- 🟢 SPPB received → Warehouse can proceed with GR
- 🟢 **Tax credits available** → PPN/PPh can be offset in monthly tax report

---

## 💡 Tips & Tricks

### Data Entry

✅ **Always**:

- Input lot numbers saat GR (optional for BC 2.0, but recommended for quality tracking)
- Upload supporting documents (especially tax payment proof)
- Verify data before submit
- **Use correct HS Code** (affects duty calculation!)
- **Verify CIF calculation** (FOB + Freight + Insurance)
- **Review dual billing** (vendor + tax separate)
- **Track tax payment status** (blocks goods receipt)

❌ **Never**:

- Skip approval workflow
- Delete historical data
- Edit approved documents (use adjustment)
- **Receive goods before tax paid** (system will block)
- **Forget to record tax payment** (blocks customs release)
- **Mix vendor payment and tax payment** (dual billing keeps them separate)

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
→ Verify BC 2.0 status = "CUSTOMS RELEASED" (tax must be paid first)

### BC 2.0 tidak bisa submit?

→ Pastikan semua required fields terisi (HS Code, CIF Value, Documents)
→ Check duty calculation (Bea Masuk, PPN, PPh 22 must auto-calculate)

### Goods receipt blocked?

→ **Tax payment status!** Check BC 2.0 status = "TAX PAYMENT PENDING"
→ Coordinate with Finance to pay taxes to DJBC
→ Upload tax payment proof
→ Wait for status to change to "CUSTOMS RELEASED"

### Dual billing tidak muncul?

→ Check BC 2.0 status sudah "SUBMITTED"
→ System auto-creates 2 billings on submit
→ Contact admin if still missing

### Landed cost salah?

→ Verify CIF calculation (FOB + Freight + Insurance)
→ Check Bea Masuk calculation (CIF × HS Code duty rate)
→ Review freight and handling fees
→ **PPN & PPh should NOT be included** (tax assets, not inventory cost)

### Traceability chain kosong?

→ **For BC 2.0: Traceability is optional** (internal use only)
→ Verify lot number di GR dan WO if tracking for quality purposes
→ Not required for customs (unlike BC 2.3)

### Conversion ratio salah?

→ Check BOM standard ratio dan actual quantity

### Approval stuck?

→ Check dengan approver atau admin

### Tax credits tidak muncul?

→ Verify tax payment sudah recorded
→ Check Finance → Tax Assets → PPN Credits / PPh 22 Credits
→ PPN can be credited monthly, PPh 22 annually

---

## 📞 Quick Help

**In-App**:

- Hover pada field untuk tooltip
- Click (?) icon untuk help
- Check status timeline untuk progress

**Documentation**:

- Platform Overview (comprehensive guide)
- Detailed Workflow Spec (technical details)
- BC 2.0 System PRD (BC 2.0 regular import process)
- Dual Billing Guide (vendor vs tax payments)
- Landed Cost Calculation Guide

---

## 🎓 Training Resources

### By Role

- **Sales**: Sales Order workflow (domestic & export)
- **Purchasing**: PO & BC 2.0 management with dual billing
- **Warehouse**: GR & stock management with landed cost
- **Production**: WO & BOM management with accurate COGS
- **Logistics**: Shipment & PEB export (no BC linkage)
- **Finance**: Invoice, payment, tax assets, landed cost
- **EXIM**: BC 2.0 processing & customs coordination

### By Module

- BC 2.0 Regular Import (upfront tax payment)
- Dual Billing System (vendor + tax)
- Landed Cost Calculation & Capitalization
- Tax Accounting (PPN & PPh 22 as prepaid assets)
- Material Traceability (optional for internal use)
- Stock Movement (no customs constraints)
- Production Costing with Landed Cost

---

## 📊 Key Metrics

### Executive Dashboard

- 💰 Total Revenue (YTD)
- 🏭 Production Yield (%)
- 📦 Inventory Value (Rp) - **at Landed Cost**
- 💵 Net Cashflow (Rp) - **includes upfront tax payments**
- 🛡️ Customs Compliance Status
- 💸 Tax Credits Available (PPN + PPh 22)

### Compliance Dashboard

- 📋 BC 2.0 Active / Pending
- 📋 PEB Export Active / Pending
- 💰 Tax Payment Status (Pending / Paid)
- 💸 Dual Billing Summary
- 🔗 Traceability Records (optional)
- ⚠️ Compliance Alerts

### Finance Dashboard

- 💰 Outstanding AP - Vendor Payments
- 💰 Outstanding AP - Tax Payments (DJBC)
- 💸 PPN Import Credits Available
- 💸 PPh 22 Prepaid Tax Balance
- 📊 Landed Cost Summary by Material
- 📈 Cash Flow Forecast (vendor + tax payments)

---

## 🔑 Glossary

| Term               | Meaning                                                    |
| ------------------ | ---------------------------------------------------------- |
| **BC 2.0 (PIB)**   | Regular Import Declaration (Pemberitahuan Impor Barang)   |
| **BC 2.3**         | Bonded Zone Import (not used in this system)               |
| **PEB**            | Regular Export Declaration (Pemberitahuan Ekspor Barang)   |
| **SPPB**           | Customs Release Approval (Surat Persetujuan Pengeluaran Barang) |
| **HS Code**        | Harmonized System Code (determines duty rate)              |
| **CIF**            | Cost, Insurance, Freight (total value at port)             |
| **FOB**            | Free on Board (price at origin port)                       |
| **Bea Masuk**      | Import Duty (varies by HS Code, e.g., 5%)                  |
| **PPN Import**     | Import VAT 11% - recorded as **Prepaid Tax Asset**         |
| **PPh 22 Import**  | Withholding Tax 2.5-10% - recorded as **Prepaid Tax Asset** |
| **Landed Cost**    | CIF + Bea Masuk + Freight + Handling (full material cost)  |
| **DJBC**           | Directorate General of Customs (tax payment destination)   |
| **Dual Billing**   | Two separate billings: Vendor Payment + Tax Payment        |
| **COGS**           | Cost of Goods Sold (includes landed cost)                  |
| **GR**             | Goods Receipt                                              |
| **WO**             | Work Order                                                 |
| **BOM**            | Bill of Materials                                          |
| **FG**             | Finished Goods                                             |
| **RM**             | Raw Material                                               |
| **SO**             | Sales Order                                                |
| **PO**             | Purchase Order                                             |
| **API**            | Importer License (affects PPh 22 rate)                     |

---

**© 2026 JKJ Manufacturing ERP**  
_Quick Reference v1.0_
