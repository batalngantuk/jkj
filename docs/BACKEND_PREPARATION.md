# Dokumen Persiapan Backend — Sistem ERP JKJ

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Status:** Draft — belum diimplementasi  
**Scope:** Migrasi dari mock data (localStorage) ke backend production (Supabase + PostgreSQL)

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Stack Teknologi](#2-stack-teknologi)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Skema Database](#4-skema-database)
5. [Rencana Migrasi](#5-rencana-migrasi)
6. [Autentikasi & Kontrol Akses](#6-autentikasi--kontrol-akses)
7. [Keamanan & Ancaman](#7-keamanan--ancaman)
8. [Risiko Operasional & Mitigasi](#8-risiko-operasional--mitigasi)
9. [Strategi Backup & Recovery](#9-strategi-backup--recovery)
10. [Performa & Skalabilitas](#10-performa--skalabilitas)
11. [Kepatuhan KITE / DJBC](#11-kepatuhan-kite--djbc)
12. [Kebijakan Backdate](#12-kebijakan-backdate)
13. [Checklist Deployment](#13-checklist-deployment)
14. [Estimasi Waktu & Tahapan](#14-estimasi-waktu--tahapan)

---

## 1. Ringkasan Eksekutif

Sistem ERP JKJ saat ini berjalan sepenuhnya di browser menggunakan localStorage sebagai "database". Pendekatan ini hanya cocok untuk demo. Untuk production, dibutuhkan:

- **Database terpusat** agar semua user melihat data yang sama secara real-time
- **Autentikasi** dengan kontrol akses per role
- **Audit trail** yang tidak bisa dihapus
- **Backup otomatis** untuk keamanan data operasional
- **Keamanan berlapis** mengingat data berisi informasi impor/ekspor sensitif (BC 2.0, PEB, nilai transaksi)

**Rekomendasi:** Supabase (PostgreSQL managed) + Prisma ORM + Next.js API routes. Tidak perlu VPS terpisah pada fase awal.

---

## 2. Stack Teknologi

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | Next.js 16 (sudah ada) | Tidak berubah |
| ORM | Prisma (sudah ada di project) | Type-safe, schema migration, sudah terpasang |
| Database | PostgreSQL via Supabase | Relasional, cocok untuk ERP, managed |
| Auth | Supabase Auth | JWT, RLS, 8 role, sudah terintegrasi |
| File Storage | Supabase Storage | Dokumen PO, BC 2.0, PEB scan |
| Realtime | Supabase Realtime | Notif stok, status WO (opsional fase 2) |
| Cache | Supabase + React Query | Kurangi query berulang |
| Deployment | Vercel (frontend) + Supabase (backend) | Zero-DevOps, managed SSL |

**Biaya estimasi production:**
- Supabase Pro: $25/bulan (500MB DB, 5GB storage, unlimited auth users)
- Vercel Pro: $20/bulan (atau gratis jika traffic kecil)
- **Total: ~$25–45/bulan** — sangat terjangkau untuk sistem ERP korporat

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  Next.js App (React + TypeScript)                        │
│  - UI Components                                         │
│  - React Query (data fetching + cache)                   │
│  - Zustand (UI state only, bukan data)                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│               Next.js API Routes (/api/*)                │
│  - Validasi input (Zod)                                  │
│  - Auth check (Supabase JWT verify)                      │
│  - Business logic                                        │
│  - Prisma queries                                        │
└────────┬─────────────────────────────────┬──────────────┘
         │                                 │
┌────────▼────────┐               ┌────────▼────────────┐
│  Supabase       │               │  Supabase Storage   │
│  PostgreSQL     │               │  (dokumen upload)   │
│  - 25-30 tabel  │               │  - PO scan          │
│  - RLS policies │               │  - BC 2.0 PIB       │
│  - Triggers     │               │  - PEB dokumen      │
│  - Indexes      │               └─────────────────────┘
└─────────────────┘
```

---

## 4. Skema Database

### 4.1 Tabel Utama (~28 tabel)

```sql
-- ═══ AUTH & USER ═══════════════════════════════════════════

users (
  id          uuid PRIMARY KEY,  -- dari Supabase Auth
  email       text UNIQUE,
  full_name   text,
  role        enum('admin','sales','purchasing','gudang',
                   'produksi','keuangan','kite','djbc'),
  is_active   boolean DEFAULT true,
  created_at  timestamptz
)

-- ═══ MASTER DATA ════════════════════════════════════════════

suppliers (
  id            uuid PK,
  name          text NOT NULL,
  contact_person text,
  email         text,
  phone         text,
  address       text,
  npwp          text,
  rating        numeric(2,1),
  status        enum('Active','Inactive'),
  created_at    timestamptz
)

customers (
  id            uuid PK,
  name          text NOT NULL,
  contact_person text,
  email         text,
  country       text,
  address       text,
  created_at    timestamptz
)

-- ═══ PURCHASING ══════════════════════════════════════════════

purchase_orders (
  id              uuid PK,
  po_number       text UNIQUE,  -- PO-2026-001
  po_type         enum('Lokal','Impor'),
  supplier_id     uuid REFERENCES suppliers,
  order_date      date,
  expected_delivery date,
  status          enum('DRAFT','APPROVED','PARTIAL','RECEIVED',
                       'CANCELLED','CANCELLED_WITH_STOCK'),
  payment_status  enum('UNPAID','PARTIAL','PAID'),
  total_amount    numeric(15,2),
  cancel_reason   text,
  cancelled_at    timestamptz,
  cancelled_by    uuid REFERENCES users,
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

po_items (
  id          uuid PK,
  po_id       uuid REFERENCES purchase_orders ON DELETE CASCADE,
  code        text,
  name        text NOT NULL,
  quantity    numeric(12,3),
  unit        text,
  unit_price  numeric(12,2),
  total       numeric(15,2)
)

bc20_documents (
  id                  uuid PK,
  bc20_number         text UNIQUE,  -- PIB-2026-001234
  registration_number text,
  document_date       date,
  supplier_id         uuid REFERENCES suppliers,
  description         text,
  currency            text DEFAULT 'USD',
  exchange_rate       numeric(12,2),
  status              enum('ARRIVED','GR_DONE','TAX_PAID','COMPLETED'),
  document_url        text,  -- Supabase Storage URL
  created_by          uuid REFERENCES users,
  created_at          timestamptz
)

bc20_items (
  id              uuid PK,
  bc20_id         uuid REFERENCES bc20_documents ON DELETE CASCADE,
  material_code   text,
  material_name   text NOT NULL,
  hs_code         text,
  country_origin  text,
  quantity        numeric(12,3),
  unit            text,
  weight_kg       numeric(12,3),
  unit_price      numeric(12,4),
  cif_value       numeric(15,2),
  duty_rate       numeric(5,2),
  duty_amount     numeric(15,2),
  ppn_import      numeric(15,2),
  pph22           numeric(15,2),
  landed_cost     numeric(12,4)
)

-- ═══ WAREHOUSE ════════════════════════════════════════════

stock_items (
  id              uuid PK,
  material_code   text UNIQUE,
  material_name   text NOT NULL,
  category        enum('BB','Packaging','FG','WIP'),
  unit            text,
  qty_on_hand     numeric(12,3) DEFAULT 0,
  qty_reserved    numeric(12,3) DEFAULT 0,
  qty_available   numeric(12,3) GENERATED ALWAYS AS (qty_on_hand - qty_reserved) STORED,
  location        text,
  fasilitas       enum('KITE','Non-KITE'),
  min_stock       numeric(12,3),
  last_updated    timestamptz
)

stock_movements (
  id               uuid PK,
  movement_date    date NOT NULL,
  material_code    text REFERENCES stock_items(material_code),
  material_name    text,
  transaction_type enum('OPENING','IMPORT','LOCAL_PURCHASE',
                        'PRODUCTION_OUT','FG_IN','WIP_IN','WIP_OUT',
                        'EXPORT','WASTE','ADJUSTMENT'),
  reference_number text,  -- PO/WO/GR/PEB nomor
  reference_type   text,  -- 'PO','WO','GR','PEB'
  quantity_in      numeric(12,3) DEFAULT 0,
  quantity_out     numeric(12,3) DEFAULT 0,
  running_balance  numeric(12,3),
  notes            text,
  created_by       uuid REFERENCES users,
  created_at       timestamptz
)

goods_receipts (
  id              uuid PK,
  gr_number       text UNIQUE,
  gr_date         date,
  po_id           uuid REFERENCES purchase_orders,
  bc20_id         uuid REFERENCES bc20_documents,
  supplier_id     uuid REFERENCES suppliers,
  doc_type        enum('BC20','PO_Lokal','Subkontrak','Transfer','Lainnya'),
  vehicle_number  text,
  surat_jalan     text,
  receiver        text,
  status          enum('DRAFT','COMPLETED'),
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

gr_items (
  id              uuid PK,
  gr_id           uuid REFERENCES goods_receipts ON DELETE CASCADE,
  material_code   text,
  material_name   text NOT NULL,
  qty_ordered     numeric(12,3),
  qty_received    numeric(12,3),
  unit            text,
  condition       enum('Baik','Rusak Sebagian','Rusak Semua'),
  location        text,
  notes           text
)

temp_storage_items (
  id              uuid PK,
  material_code   text,
  material_name   text,
  qty             numeric(12,3),
  unit            text,
  unit_cost       numeric(12,2),
  total_value     numeric(15,2),
  location        text,
  source_po_id    uuid REFERENCES purchase_orders,
  supplier_id     uuid REFERENCES suppliers,
  cancelled_date  date,
  cancel_reason   text,
  status          enum('IN_STORAGE','RELEASED'),
  release_ref     text,
  release_date    date,
  released_qty    numeric(12,3),
  released_by     uuid REFERENCES users,
  created_at      timestamptz
)

waste_records (
  id              uuid PK,
  wo_id           uuid REFERENCES work_orders,
  material_code   text,
  material_name   text,
  qty_waste       numeric(12,3),
  unit            text,
  waste_type      text,
  bc24_number     text,
  status          enum('DRAFT','DIAJUKAN_BC24','DIVERIFIKASI','SELESAI'),
  notes           text,
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

-- ═══ PRODUCTION ════════════════════════════════════════════

bom_templates (
  id            uuid PK,
  product_code  text,
  product_name  text NOT NULL,
  version       text DEFAULT '1.0',
  is_active     boolean DEFAULT true,
  created_at    timestamptz
)

bom_items (
  id                uuid PK,
  bom_id            uuid REFERENCES bom_templates ON DELETE CASCADE,
  material_code     text,
  material_name     text NOT NULL,
  quantity_per_unit numeric(10,6),
  unit              text,
  sort_order        int
)

work_orders (
  id              uuid PK,
  wo_number       text UNIQUE,
  so_id           uuid REFERENCES sales_orders,
  product         text NOT NULL,
  quantity        numeric(12,3),
  unit            text DEFAULT 'ctn',
  bom_id          uuid REFERENCES bom_templates,
  start_date      date,
  end_date        date,
  status          enum('PLANNED','IN_PROGRESS','QC_INSPECTION',
                       'COMPLETED','ON_HOLD','CANCELLED'),
  priority        enum('Normal','Urgent'),
  production_line text,
  shift           text,
  supervisor      text,
  fg_location     text,
  progress        int DEFAULT 0,
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

wo_history (
  id          uuid PK,
  wo_id       uuid REFERENCES work_orders ON DELETE CASCADE,
  action      text,
  status      text,
  notes       text,
  created_by  uuid REFERENCES users,
  created_at  timestamptz
)

subkontrak_jobs (
  id                uuid PK,
  job_number        text UNIQUE,
  subkon_name       text NOT NULL,
  description       text,
  facility          text DEFAULT 'SUBK KITE 1.1/1.2',
  so_id             uuid REFERENCES sales_orders,
  sent_date         date,
  expected_return   date,
  actual_return     date,
  fee               numeric(15,2),
  status            enum('DRAFT','BB_DIKIRIM','DALAM_PROSES',
                         'HASIL_DITERIMA','SELESAI'),
  created_by        uuid REFERENCES users,
  created_at        timestamptz
)

-- ═══ SALES ═════════════════════════════════════════════════

sales_orders (
  id            uuid PK,
  so_number     text UNIQUE,
  customer_id   uuid REFERENCES customers,
  customer_name text NOT NULL,  -- denormalized untuk free-text
  po_number     text,           -- nomor PO dari customer
  currency      enum('IDR','USD','EUR'),
  exchange_rate numeric(12,2) DEFAULT 1,
  delivery_date date,
  status        enum('DRAFT','PENDING_APPROVAL','APPROVED',
                     'IN_PRODUCTION','READY_TO_SHIP',
                     'SHIPPED','COMPLETED','CANCELLED'),
  priority      enum('Normal','Urgent'),
  notes         text,
  created_by    uuid REFERENCES users,
  created_at    timestamptz
)

so_items (
  id            uuid PK,
  so_id         uuid REFERENCES sales_orders ON DELETE CASCADE,
  product_name  text NOT NULL,
  product_code  text,
  qty           numeric(12,3),
  unit          text,
  unit_price    numeric(12,4),
  total         numeric(15,2),
  notes         text,
  sort_order    int
)

so_bom_items (
  id              uuid PK,
  so_id           uuid REFERENCES sales_orders ON DELETE CASCADE,
  no              int,
  material_name   text NOT NULL,
  spesifikasi     text,
  warna           text,
  konsumsi        numeric(10,4),
  satuan          text,
  penggunaan      text,
  asal_material   enum('Lokal','Impor','')
)

-- ═══ LOGISTICS ═════════════════════════════════════════════

peb_documents (
  id              uuid PK,
  peb_number      text UNIQUE,
  so_id           uuid REFERENCES sales_orders,
  customer_id     uuid REFERENCES customers,
  export_date     date,
  destination     text,
  currency        text DEFAULT 'USD',
  exchange_rate   numeric(12,2),
  fob_value_usd   numeric(15,2),
  fob_value_idr   numeric(15,2),
  status          enum('DRAFT','APPROVED','EXPORTED'),
  document_url    text,
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

peb_items (
  id              uuid PK,
  peb_id          uuid REFERENCES peb_documents ON DELETE CASCADE,
  material_code   text,
  product_name    text NOT NULL,
  qty             numeric(12,3),
  unit            text,
  unit_price_usd  numeric(12,4),
  total_usd       numeric(15,2),
  total_idr       numeric(15,2)
)

shipments (
  id              uuid PK,
  sj_number       text UNIQUE,  -- SJ-EXP-2026-001
  so_id           uuid REFERENCES sales_orders,
  peb_id          uuid REFERENCES peb_documents,
  shipment_date   date,
  transporter     text,
  vehicle_number  text,
  driver          text,
  status          enum('PREPARED','DISPATCHED','DELIVERED'),
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

-- ═══ TRACEABILITY ════════════════════════════════════════════

traceability_records (
  id                uuid PK,
  bc20_id           uuid REFERENCES bc20_documents,
  bc20_number       text,
  rm_lot_number     text,
  rm_description    text,
  rm_quantity       numeric(12,3),
  rm_unit           text,
  gr_id             uuid REFERENCES goods_receipts,
  gr_number         text,
  gr_date           date,
  po_number         text,
  wo_id             uuid REFERENCES work_orders,
  wo_number         text,
  product_name      text,
  fg_lot_number     text,
  fg_quantity       numeric(12,3),
  fg_unit           text,
  production_date   date,
  conversion_ratio  numeric(5,4),
  standard_ratio    numeric(5,4),
  variance          numeric(6,2),
  waste             numeric(12,3),
  peb_id            uuid REFERENCES peb_documents,
  peb_number        text,
  export_date       date,
  export_quantity   numeric(12,3),
  created_at        timestamptz
)

materials_used (
  id              uuid PK,
  trace_id        uuid REFERENCES traceability_records ON DELETE CASCADE,
  material_code   text,
  material_name   text NOT NULL,
  qty_used        numeric(12,3),
  unit            text,
  unit_cost       numeric(12,2),
  total_cost      numeric(15,2),
  po_number       text,
  supplier_id     uuid REFERENCES suppliers,
  payment_status  enum('UNPAID','PARTIAL','PAID')
)

-- ═══ FINANCE ═══════════════════════════════════════════════

ar_invoices (
  id              uuid PK,
  invoice_number  text UNIQUE,
  so_id           uuid REFERENCES sales_orders,
  customer_id     uuid REFERENCES customers,
  invoice_date    date,
  due_date        date,
  total_amount    numeric(15,2),
  paid_amount     numeric(15,2) DEFAULT 0,
  balance         numeric(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status          enum('DRAFT','SENT','PARTIAL','PAID','OVERDUE','CANCELLED'),
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

ap_invoices (
  id              uuid PK,
  invoice_number  text UNIQUE,
  po_id           uuid REFERENCES purchase_orders,
  supplier_id     uuid REFERENCES suppliers,
  bc20_id         uuid REFERENCES bc20_documents,
  invoice_date    date,
  due_date        date,
  total_amount    numeric(15,2),
  paid_amount     numeric(15,2) DEFAULT 0,
  balance         numeric(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status          enum('DRAFT','VERIFIED','APPROVED','SCHEDULED','PAID'),
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

payments (
  id              uuid PK,
  payment_date    date,
  type            enum('INBOUND','OUTBOUND'),
  reference_id    uuid,   -- ar_invoice_id atau ap_invoice_id
  reference_type  text,
  amount          numeric(15,2),
  method          text,
  bank_account    text,
  notes           text,
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

journal_entries (
  id              uuid PK,
  entry_date      date,
  description     text NOT NULL,
  entry_type      enum('KAS_MASUK','KAS_KELUAR','JURNAL_UMUM'),
  reference       text,
  total_debit     numeric(15,2),
  total_credit    numeric(15,2),
  created_by      uuid REFERENCES users,
  created_at      timestamptz
)

journal_lines (
  id          uuid PK,
  entry_id    uuid REFERENCES journal_entries ON DELETE CASCADE,
  account     text NOT NULL,
  description text,
  debit       numeric(15,2) DEFAULT 0,
  credit      numeric(15,2) DEFAULT 0,
  sort_order  int
)
```

### 4.2 Index Kritis

```sql
-- Performa query traceability
CREATE INDEX idx_materials_used_material_code ON materials_used(material_code);
CREATE INDEX idx_trace_wo_id ON traceability_records(wo_id);
CREATE INDEX idx_stock_movements_code_date ON stock_movements(material_code, movement_date);
CREATE INDEX idx_stock_movements_ref ON stock_movements(reference_number);

-- Performa laporan KITE
CREATE INDEX idx_movements_type_date ON stock_movements(transaction_type, movement_date);
CREATE INDEX idx_peb_status ON peb_documents(status, export_date);

-- Auth & filter
CREATE INDEX idx_so_status ON sales_orders(status, created_at);
CREATE INDEX idx_wo_status ON work_orders(status, created_at);
CREATE INDEX idx_po_status ON purchase_orders(status, order_date);
```

### 4.3 Trigger Penting

```sql
-- Auto-update qty_available di stock_items setiap ada movement
CREATE OR REPLACE FUNCTION update_stock_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stock_items
  SET qty_on_hand = qty_on_hand + NEW.quantity_in - NEW.quantity_out,
      last_updated = now()
  WHERE material_code = NEW.material_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION update_stock_balance();

-- Auto-update AP invoice paid_amount setiap ada payment
-- (serupa, trigger on payments table)
```

---

## 5. Rencana Migrasi

### 5.1 Pendekatan

Migrasi dilakukan **bertahap per modul**, bukan sekaligus. Data mock dikodekan ulang sebagai seed data di Prisma.

### 5.2 Urutan Migrasi (low-risk dulu)

| Fase | Modul | Risiko | Estimasi |
|------|-------|--------|----------|
| 1 | Auth & Users | Rendah | 1 minggu |
| 2 | Master data (Suppliers, Customers) | Rendah | 3 hari |
| 3 | Purchasing (PO, BC 2.0) | Sedang | 1 minggu |
| 4 | Warehouse (stock, GR, movements) | Tinggi | 2 minggu |
| 5 | Production (WO, BOM, subkontrak) | Sedang | 1 minggu |
| 6 | Sales (SO) | Sedang | 1 minggu |
| 7 | Logistics (PEB, Shipment) | Sedang | 1 minggu |
| 8 | Traceability | Tinggi | 1 minggu |
| 9 | Finance (AR, AP, Journal) | Tinggi | 2 minggu |

### 5.3 Strategi Migrasi per Modul

Setiap modul dikerjakan dengan pola:

```
1. Tulis Prisma schema untuk tabel terkait
2. Buat API routes: GET /api/[modul], POST, PATCH, DELETE
3. Ganti hook (useStock, usePurchaseOrders, dll) → React Query + fetch
4. Jalankan paralel (localStorage + DB) selama 1 minggu testing
5. Hapus localStorage fallback setelah validasi data konsisten
```

### 5.4 Konversi localStorage → Database

Semua store file (`lib/store/*.ts`) diganti dengan React Query hooks:

```typescript
// Sebelum (localStorage)
const { orders } = usePurchaseOrders()

// Sesudah (database via API)
const { data: orders } = useQuery({
  queryKey: ['purchase-orders'],
  queryFn: () => fetch('/api/purchasing/po').then(r => r.json())
})
```

---

## 6. Autentikasi & Kontrol Akses

### 6.1 Supabase Auth + RLS

- Login via email/password (Supabase Auth)
- JWT token dikirim setiap request
- Row Level Security (RLS) di database sebagai lapisan kedua

### 6.2 Definisi Role & Permission

| Role | Create | Read | Update | Delete | Approve |
|------|--------|------|--------|--------|---------|
| admin | ✅ semua | ✅ semua | ✅ semua | ✅ semua | ✅ semua |
| sales | SO | SO, Reports | SO draft | — | — |
| purchasing | PO, BC20 | PO, BC20, Supplier | PO draft | — | — |
| gudang | GR, Stok, WIP | Stok, WO | — | — | GR |
| produksi | WO, Subkon | WO, SO, Stok | WO status | — | — |
| keuangan | Invoice, Payment, Journal | Finance, Reports | — | — | AP Invoice |
| kite | PEB | Semua laporan | — | — | PEB |
| djbc | — | Laporan, dokumen | — | — | — |

### 6.3 Contoh RLS Policy

```sql
-- DJBC hanya bisa READ laporan, tidak bisa write apapun
CREATE POLICY "djbc_read_only" ON peb_documents
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('djbc', 'admin', 'kite')
  );

-- Staff gudang hanya bisa edit stock_movements milik mereka hari ini
CREATE POLICY "gudang_insert_movements" ON stock_movements
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('gudang', 'admin')
  );
```

---

## 7. Keamanan & Ancaman

### 7.1 Ancaman & Mitigasi

| # | Ancaman | Dampak | Mitigasi |
|---|---------|--------|----------|
| A1 | **SQL Injection** | Kritis — manipulasi/hapus data | Selalu gunakan Prisma parameterized queries. **Jangan pernah** string concatenation di query. |
| A2 | **Broken Authentication** | Tinggi — akses tanpa izin | Supabase Auth JWT + RLS di database. Validasi token di setiap API route. Session expire 8 jam. |
| A3 | **Akses data lintas role** | Tinggi — DJBC bisa edit, sales bisa lihat keuangan | RLS policy di setiap tabel. Validasi role di API route sebagai lapisan kedua. |
| A4 | **XSS (Cross-Site Scripting)** | Sedang — inject script via form input | Next.js auto-escape JSX. Sanitasi input text panjang (deskripsi, catatan) dengan DOMPurify. |
| A5 | **CSRF** | Sedang — aksi tidak sah atas nama user | Supabase JWT tidak vulnerable CSRF (header-based, bukan cookie). SameSite cookie jika pakai cookie. |
| A6 | **Insecure File Upload** | Tinggi — upload malware, path traversal | Batasi tipe file (PDF, JPG, PNG saja) di Supabase Storage policy. Ukuran maksimal 10MB. Rename file saat upload. |
| A7 | **Data exposure di API** | Tinggi — nominal transaksi bocor | Jangan return seluruh row. Select field spesifik. Sembunyikan field sensitif dari role yang tidak butuh. |
| A8 | **Brute force login** | Sedang — akun dibobol | Supabase Auth sudah ada rate limiting. Tambah captcha jika perlu. Notif email login baru. |
| A9 | **Dependency vulnerabilities** | Sedang — library pihak ketiga | `npm audit` rutin. Dependabot alert. Update library secara berkala. |
| A10 | **Audit trail bisa dihapus** | Tinggi — data compliance KITE bisa dimanipulasi | Tabel `stock_movements`, `wo_history`, `journal_entries` tidak boleh ada DELETE policy. Append-only. |
| A11 | **API rate limit abuse** | Rendah | Supabase Pro sudah ada rate limiter. Tambah middleware rate limit di API routes jika perlu. |
| A12 | **Akses Supabase dashboard** | Kritis — full DB access | Rotasi API keys berkala. Jangan expose `service_role` key di client. Hanya `anon` key di browser. |

### 7.2 Implementasi Keamanan Wajib

```typescript
// 1. Validasi input di SETIAP API route dengan Zod
import { z } from 'zod'
const CreatePOSchema = z.object({
  supplier_id: z.string().uuid(),
  po_type: z.enum(['Lokal', 'Impor']),
  items: z.array(z.object({
    name: z.string().min(1).max(200),
    quantity: z.number().positive(),
    unit_price: z.number().nonnegative(),
  })).min(1),
})

// 2. Cek auth di setiap API route
import { createServerClient } from '@supabase/ssr'
export async function POST(req: Request) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  // cek role...
}

// 3. Jangan pernah expose service_role key
// ❌ SALAH: const supabase = createClient(url, process.env.SUPABASE_SERVICE_KEY)  ← di client
// ✅ BENAR: service_role hanya di server-side API routes
```

### 7.3 Variabel Lingkungan

```env
# .env.local — JANGAN commit ke git
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # aman di browser
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # HANYA server-side
DATABASE_URL=postgresql://...                # Prisma connection
```

**Tambahkan ke `.gitignore`:**
```
.env.local
.env.production
*.pem
```

---

## 8. Risiko Operasional & Mitigasi

### 8.1 Internet Mati

| Skenario | Dampak | Mitigasi |
|----------|--------|----------|
| Internet kantor mati | Sistem tidak bisa diakses sama sekali | **Offline mode:** simpan data penting (daftar PO, stok saat ini) di IndexedDB. Read-only saat offline. Sync saat kembali online. |
| Internet mati saat input transaksi | Data hilang, form tidak tersimpan | Auto-save draft ke localStorage tiap 30 detik. Warning "Anda sedang offline" dengan banner. Queue transaksi untuk sync saat online. |
| Koneksi tidak stabil (packet loss) | Request timeout, data ganda | Idempotency key di setiap POST request. Retry otomatis dengan exponential backoff. |

**Rekomendasi tambahan:**
- Pertimbangkan koneksi backup (4G/LTE router) untuk internet kantor
- Critical operations (input GR, update stok) harus selalu konfirmasi sukses sebelum lanjut
- Tambah indikator status koneksi di UI (hijau/merah di pojok kanan atas)

### 8.2 Supabase Downtime

| Skenario | Mitigasi |
|----------|----------|
| Supabase maintenance | Cek status.supabase.com. Jadwalkan maintenance window di luar jam kerja. |
| Supabase Pro SLA: 99.9% uptime | = max ~8.7 jam downtime/tahun. Untuk ERP internal, ini acceptable. |
| Downtime panjang (>2 jam) | Offline mode baca-saja + queue input. Atau failover ke backup DB (Neon/Railway). |

### 8.3 Korupsi / Kehilangan Data

| Skenario | Mitigasi |
|----------|----------|
| User tidak sengaja hapus data | Soft delete (tambah `deleted_at` kolom, bukan DELETE fisik). Data bisa dipulihkan admin. |
| Bug di code menyebabkan data salah | Rollback via backup harian. Audit log di tabel kritis. |
| Data dicuri (breach) | Enkripsi at-rest (Supabase default). Enkripsi field sensitif (NPWP, nilai kontrak) dengan pgcrypto jika perlu. |

### 8.4 Pertumbuhan Data

| Proyeksi | Estimasi |
|----------|----------|
| Transaksi per bulan | ~500–2000 rows (PO, WO, GR, PEB) |
| Stock movements per bulan | ~5000–10000 rows |
| Data 1 tahun | ~100–200MB — masih dalam Supabase Free tier |
| Data 5 tahun | ~500MB–1GB — masuk Supabase Pro storage |

---

## 9. Strategi Backup & Recovery

### 9.1 Supabase Built-in Backup

- **Free tier:** Daily backup, retensi 7 hari (tidak bisa pilih waktu restore)
- **Pro tier ($25/mo):** Daily backup, retensi 30 hari, Point-in-Time Recovery (PITR)
- **Rekomendasi:** Wajib pakai Pro untuk production ERP

### 9.2 Backup Tambahan (self-managed)

```bash
# Jalankan via cron job harian — simpan ke Google Drive / S3
pg_dump $DATABASE_URL --no-owner --no-acl \
  | gzip > backup_jkj_$(date +%Y%m%d).sql.gz

# Upload ke Google Drive (pakai rclone)
rclone copy backup_jkj_$(date +%Y%m%d).sql.gz gdrive:JKJ_ERP_Backups/
```

Retensi: simpan 90 hari terakhir, hapus yang lebih lama.

### 9.3 Recovery Time Objective (RTO)

| Skenario | Target Recovery |
|----------|----------------|
| Data 1 tabel korup | < 2 jam (restore dari backup + replay log) |
| Seluruh database hilang | < 4 jam (restore full backup) |
| Server crash | < 15 menit (Supabase auto-failover) |

### 9.4 Prosedur Restore

```
1. Buka Supabase dashboard → Settings → Backups
2. Pilih backup date → klik "Restore"
3. Tunggu ~15 menit
4. Verifikasi data terbaru
5. Notifikasi user bahwa sistem kembali normal
```

---

## 10. Performa & Skalabilitas

### 10.1 Bottleneck yang Diantisipasi

| Query | Potensi Lambat | Solusi |
|-------|---------------|--------|
| 8 laporan IT Inventory | Join 5-6 tabel, filter tanggal | Index di `movement_date` + `transaction_type`. Caching hasil query 5 menit. |
| Traceability FG→RM→PO | Multi-hop join | Index di `material_code`, `wo_id`, `po_number`. Denormalize beberapa field. |
| Stock running balance | Hitung ulang semua movements | Stored balance di `stock_items`, update via trigger. |
| Export Excel 8 sheet | Banyak data, proses di server | Generate di API route (server-side), stream ke browser. Limit 10.000 rows per export. |

### 10.2 Caching Strategy

```typescript
// React Query: cache 5 menit untuk data yang jarang berubah
useQuery({
  queryKey: ['kite-inventory', period],
  queryFn: fetchKiteInventory,
  staleTime: 5 * 60 * 1000,     // 5 menit
  gcTime: 10 * 60 * 1000,       // 10 menit
})

// Invalidate cache setelah mutasi
useMutation({
  mutationFn: createGR,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['stock'] })
    queryClient.invalidateQueries({ queryKey: ['kite-inventory'] })
  }
})
```

---

## 11. Kepatuhan KITE / DJBC

### 11.1 Persyaratan Khusus

| Persyaratan | Implementasi |
|-------------|-------------|
| Audit trail tidak bisa dihapus | Tabel movements, journal, wo_history: no DELETE policy via RLS |
| Data 5 tahun harus tersimpan | Backup retensi 5 tahun. Cold storage di akhir tahun buku. |
| Laporan bisa diakses DJBC kapan saja | Role `djbc` dengan akses read-only. URL khusus `/audit` (fase 2). |
| Nomor dokumen unik & berurutan | Constraint UNIQUE di database. Generate di server, bukan client. |
| Kurs PEB harus sesuai tanggal ekspor | Field `exchange_rate` wajib di setiap PEB. Validasi tidak boleh 0. |

### 11.2 Data yang Tidak Boleh Hilang

Tabel-tabel berikut harus ada constraint **append-only** (tidak ada DELETE):

- `stock_movements` — audit trail semua mutasi stok
- `journal_entries` + `journal_lines` — audit keuangan
- `wo_history` — riwayat status Work Order
- `traceability_records` — keterlacakan KITE
- `peb_documents` — dokumen ekspor

---

## 12. Kebijakan Backdate

Klien membutuhkan kemampuan memasukkan transaksi dengan tanggal mundur (backdate) — misalnya GR yang datang kemarin baru diinput hari ini, atau PO dengan tanggal minggu lalu yang terlupa diinput.

### 12.1 Prinsip Desain

Semua tabel transaksi sudah memisahkan dua jenis tanggal:

| Field | Tipe | Keterangan |
|-------|------|------------|
| `transaction_date` / `document_date` / `order_date` / `movement_date` / dll | `date` | **Tanggal bisnis** — bisa diisi manual, boleh mundur |
| `created_at` | `timestamptz` | **Tanggal sistem** — auto-set saat insert, **immutable**, tidak bisa diubah user |

Ini adalah fondasi yang benar. `created_at` selalu mencatat kapan data masuk sistem, sedangkan field tanggal bisnis mencatat tanggal dokumen/kejadian aktual.

### 12.2 Risiko Backdate

| Risiko | Level | Keterangan |
|--------|-------|------------|
| Manipulasi laporan periode | Tinggi | Input transaksi ke periode yang sudah tutup buku bisa mengubah saldo laporan keuangan & KITE |
| Backdate PEB / BC 2.0 | Kritis | DJBC bisa mendeteksi jika tanggal dokumen fisik ≠ tanggal sistem. Berpotensi masalah hukum. |
| Backdate tanpa alasan | Sedang | Celah untuk menyembunyikan kesalahan operasional |
| Laporan IT Inventory berubah retroaktif | Tinggi | Laporan KITE yang sudah dikirim ke DJBC tidak boleh berbeda dengan data sistem |

### 12.3 Aturan Backdate yang Direkomendasikan

```
1. Window backdate maksimal: 90 hari ke belakang (konfigurasi per role)
2. Role yang boleh backdate:
   - Admin: unlimited window
   - Manager/Supervisor: maksimal 90 hari
   - Operator biasa: TIDAK boleh backdate (tanggal = hari ini saja)
3. Wajib isi alasan (mandatory reason field, min 10 karakter)
4. Notifikasi ke supervisor/admin setiap ada backdate
5. Backdate ke periode yang sudah "closed" harus approval dulu
```

### 12.4 Skema Audit Backdate

Tambahkan tabel khusus untuk mencatat setiap kejadian backdate:

```sql
backdate_audit_log (
  id               uuid PK DEFAULT gen_random_uuid(),
  table_name       text NOT NULL,          -- 'stock_movements', 'purchase_orders', dst
  record_id        uuid NOT NULL,          -- id record yang dibackdate
  record_number    text,                   -- nomor dokumen (PO-2026-001, GR-001, dll)
  original_date    date NOT NULL,          -- tanggal yang diisi user (tanggal bisnis)
  system_date      date NOT NULL,          -- tanggal hari ini saat input
  days_backdated   int GENERATED ALWAYS AS (system_date - original_date) STORED,
  reason           text NOT NULL,          -- alasan wajib diisi
  approved_by      uuid REFERENCES users,  -- null jika tidak perlu approval
  approved_at      timestamptz,
  created_by       uuid REFERENCES users NOT NULL,
  created_at       timestamptz DEFAULT now()
);

-- Index untuk query audit
CREATE INDEX idx_backdate_audit_table ON backdate_audit_log(table_name, created_at);
CREATE INDEX idx_backdate_audit_user ON backdate_audit_log(created_by, created_at);
```

Tabel ini **append-only** — tidak ada DELETE policy.

### 12.5 Konfigurasi Window Backdate

Simpan konfigurasi di tabel settings agar bisa diubah tanpa deploy ulang:

```sql
system_settings (
  key    text PRIMARY KEY,
  value  text NOT NULL,
  notes  text
);

-- Contoh data:
INSERT INTO system_settings VALUES
  ('backdate_window_admin',    '9999', 'hari — admin tidak terbatas'),
  ('backdate_window_manager',  '90',   'hari'),
  ('backdate_window_operator', '0',    '0 = tidak boleh backdate sama sekali'),
  ('backdate_require_approval_after', '30', 'hari — backdate > 30 hari perlu approval');
```

### 12.6 Enforcement di API Route

```typescript
// lib/utils/backdate.ts

export function checkBackdatePolicy(
  transactionDate: Date,
  userRole: string,
  maxDays: Record<string, number>
): { allowed: boolean; requiresApproval: boolean; daysBack: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysBack = Math.floor((today.getTime() - transactionDate.getTime()) / 86400000)

  if (daysBack < 0) {
    // Tanggal di masa depan — izinkan (untuk purchase order dll)
    return { allowed: true, requiresApproval: false, daysBack }
  }

  const maxAllowed = maxDays[userRole] ?? 0
  if (daysBack > maxAllowed) {
    return { allowed: false, requiresApproval: false, daysBack }
  }

  const approvalThreshold = maxDays['approval_threshold'] ?? 30
  return {
    allowed: true,
    requiresApproval: daysBack > approvalThreshold,
    daysBack,
  }
}

// Contoh penggunaan di API route POST /api/warehouse/gr
export async function POST(req: Request) {
  const body = await req.json()
  const { user } = await getAuthUser(req)

  const grDate = new Date(body.gr_date)
  const { allowed, requiresApproval, daysBack } = checkBackdatePolicy(
    grDate, user.role, await getBackdateSettings()
  )

  if (!allowed) {
    return Response.json(
      { error: `Backdate melebihi batas. Maksimal ${maxDays[user.role]} hari.` },
      { status: 422 }
    )
  }

  if (daysBack > 0) {
    if (!body.backdate_reason || body.backdate_reason.trim().length < 10) {
      return Response.json(
        { error: 'Alasan backdate wajib diisi (min 10 karakter).' },
        { status: 422 }
      )
    }

    // Catat ke audit log
    await prisma.backdateAuditLog.create({
      data: {
        table_name: 'goods_receipts',
        record_id: newGrId,
        record_number: body.gr_number,
        original_date: grDate,
        system_date: new Date(),
        reason: body.backdate_reason,
        created_by: user.id,
      }
    })

    // Kirim notifikasi ke admin/supervisor (opsional)
    if (requiresApproval) {
      await notifyApprovers({ type: 'BACKDATE_REQUEST', daysBack, reason: body.backdate_reason })
    }
  }

  // ... lanjut proses GR biasa
}
```

### 12.7 Backdate di UI

Tambahkan di setiap form yang punya tanggal bisnis:

```
- Field tanggal: default = hari ini. Bisa diubah ke belakang.
- Jika tanggal < hari ini: muncul banner kuning "⚠ Anda memasukkan tanggal mundur (X hari lalu)"
- Field alasan muncul otomatis dan wajib diisi
- Jika > 30 hari: muncul warning "Backdate > 30 hari memerlukan konfirmasi supervisor"
- Laporan Backdate tersedia di menu Admin: siapa yang backdate apa, kapan, alasan apa
```

### 12.8 Periode Tutup Buku (Period Lock)

Untuk mencegah perubahan data di periode yang sudah dilaporkan ke DJBC:

```sql
closed_periods (
  id          uuid PK,
  period_year int NOT NULL,
  period_month int NOT NULL,  -- 1-12
  closed_at   timestamptz NOT NULL,
  closed_by   uuid REFERENCES users,
  notes       text,
  UNIQUE (period_year, period_month)
);
```

Setiap API route yang menerima tanggal bisnis harus cek:

```typescript
async function isPeriodClosed(date: Date): Promise<boolean> {
  const closed = await prisma.closedPeriods.findFirst({
    where: {
      period_year: date.getFullYear(),
      period_month: date.getMonth() + 1,
    }
  })
  return closed !== null
}

// Jika periode sudah ditutup → tolak semua input ke periode tersebut
// kecuali role 'admin' dengan alasan khusus
```

---

## 13. Checklist Deployment

### Pre-Launch

- [ ] Skema Prisma lengkap dan sudah `prisma migrate deploy`
- [ ] RLS policies aktif di semua tabel
- [ ] Semua API routes divalidasi dengan Zod
- [ ] Environment variables diset di Vercel (bukan hardcode)
- [ ] `.env.local` di `.gitignore`
- [ ] Supabase service_role key **tidak** di client-side code
- [ ] File upload: hanya PDF/JPG/PNG, max 10MB
- [ ] Soft delete aktif di tabel master (suppliers, customers, users)
- [ ] Tabel `backdate_audit_log` dan `closed_periods` dibuat
- [ ] Kebijakan backdate per role dikonfigurasi di `system_settings`
- [ ] Index database sudah dibuat
- [ ] Backup otomatis aktif (Supabase Pro)
- [ ] Test restore backup berhasil
- [ ] Load test dengan data realistis (~1000 PO, ~5000 movements)

### Launch

- [ ] Seed data awal (saldo stok opening, master data)
- [ ] Akun user semua role dibuat dan ditest
- [ ] Training singkat per role (30-60 menit per user)
- [ ] Mode paralel 2 minggu: input di sistem baru + sistem lama
- [ ] Validasi: laporan sistem baru vs data manual
- [ ] Go-live: matikan sistem lama

### Post-Launch

- [ ] Monitor error log Vercel minggu pertama
- [ ] Cek Supabase query performance (slow query log)
- [ ] Review RLS policies setelah 1 bulan pakai
- [ ] Backup test restore setiap bulan

---

## 14. Estimasi Waktu & Tahapan

### Total Estimasi: ~12–16 minggu (3–4 bulan)

| Tahap | Scope | Durasi |
|-------|-------|--------|
| **Fase 0** — Setup | Supabase project, Prisma schema, auth | 1 minggu |
| **Fase 1** — Core | Purchasing (PO, BC20) + Warehouse (stok, GR) | 3 minggu |
| **Fase 2** — Produksi & Sales | WO, BOM, Subkon, SO | 2 minggu |
| **Fase 3** — Logistik & Trace | PEB, Shipment, Traceability | 2 minggu |
| **Fase 4** — Finance | AR, AP, Payment, Journal | 3 minggu |
| **Fase 5** — Laporan KITE | 8 laporan IT Inventory live dari DB | 1 minggu |
| **Fase 6** — Testing & Hardening | Security audit, load test, UAT | 2 minggu |
| **Fase 7** — Go-Live | Paralel run, training, cutover | 2 minggu |

---

## Catatan Akhir

- **Jangan terburu-buru go-live.** Fase paralel (input di dua sistem) minimal 2 minggu adalah wajib untuk memastikan tidak ada data yang hilang atau salah.
- **Prioritas keamanan data > kecepatan fitur.** Audit trail KITE tidak bisa direkonstruksi jika sudah hilang — ini risiko hukum nyata.
- **Offline mode** adalah investasi yang worth it untuk manufaktur yang koneksi internetnya bisa tidak stabil.
- **Supabase Pro** wajib untuk production — bukan opsional. Point-in-Time Recovery adalah fitur kritis untuk ERP.

---

_Dokumen ini dibuat: Mei 2026_  
_Review berikutnya: saat memulai implementasi Fase 0_
