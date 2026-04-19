# Panduan Pengguna — Sistem ERP JKJ (KITE)

**Versi:** April 2026  
**Untuk:** PT JKJ — Perusahaan Penerima Fasilitas KITE (Kemudahan Impor Tujuan Ekspor)

---

## 1. Daftar User & Peran

Sistem ini dirancang untuk **8 user** dengan peran berbeda:

| No | User | Tipe Akses | Deskripsi |
|----|------|-----------|-----------|
| 1 | **Admin / Manager** | Full access | Approval semua dokumen, akses seluruh modul, laporan eksekutif |
| 2 | **Staff Sales** | Operasional | Kelola Sales Order, customer, koordinasi dengan produksi |
| 3 | **Staff Purchasing** | Operasional | Kelola PO, BC 2.0, supplier, penerimaan barang |
| 4 | **Staff Gudang** | Operasional | Stok, inbound BB, outbound FG, waste/scrap |
| 5 | **Staff Produksi** | Operasional | Work Order, subkontrak KITE |
| 6 | **Staff Keuangan** | Operasional | AR, AP, payments, faktur pajak, tax assets |
| 7 | **Staff KITE / Customs Internal** | Operasional | PEB ekspor, laporan KITE, IT Inventory, traceability |
| 8 | **Petugas DJBC** | Read-only | Audit laporan — hanya melihat, tidak bisa edit |

> **Catatan:** Sistem saat ini belum membatasi akses per user (login/role belum diimplementasi). Semua user mengakses menu yang sama. Role-based access dan halaman khusus DJBC read-only dijadwalkan pada fase berikutnya.

---

## 2. Workflow Besar (End-to-End)

```
[Sales]       Terima order customer → Buat Sales Order (SO)
                    ↓
[Manager]     Approve SO
                    ↓
[Purchasing]  Buat PO ke supplier → Input BC 2.0 saat barang tiba
                    ↓
[Gudang]      Goods Receipt — BB masuk gudang → klik "Complete GR & Update Stock"
                    ↓ ← Lap 1 (Pemasukan BB) ✅ OTOMATIS UPDATE
                    ↓ ← Lap 6 (Mutasi BB) ✅ OTOMATIS UPDATE
[Produksi]    Buat Work Order dari SO yang approved
                    ↓
[Produksi]    Klik "Mulai Produksi" di halaman WO → BB dipakai, FG dihasilkan
                    ↓ ← Lap 2 (Pemakaian BB) ✅ OTOMATIS UPDATE
                    ↓ (jika ada subkontrak)
[Produksi]    Buat job subkontrak baru → Kirim BB ke subkontraktor (SUBK KITE)
                    ↓ ← Lap 3 (Pemakaian BB Subkon) ✅ OTOMATIS UPDATE
[Gudang]      Input FG ke gudang (WO Completed → "Terima ke Gudang")
                    ↓ ← Lap 4 (Pemasukan HP) ✅ OTOMATIS UPDATE
[Gudang]      Catat waste / scrap → Ajukan BC 2.4
                    ↓ ← Lap 8 (Waste/Scrap) ✅ OTOMATIS UPDATE
[KITE]        Buat PEB → Submit / Approved / Exported
                    ↓ ← Lap 5 (Pengeluaran HP) ✅ OTOMATIS UPDATE
                    ↓ ← Lap 7 (Mutasi HP) ✅ OTOMATIS UPDATE
[Keuangan]    Buat AR Invoice → terima pembayaran customer
                    ↓
[KITE]        Buka `/reports/kite-inventory` → cek 8 laporan → Export Semua
                    ↓
[DJBC]        Audit laporan & dokumen via akses read-only
```

---

## 3. Workflow & Fitur Per User

---

### 👤 1. Admin / Manager

**Tanggung jawab:** Oversight penuh, approval dokumen penting, pantau KPI perusahaan.

| Menu | Aksi |
|------|------|
| `/` Dashboard | Pantau KPI: revenue, produksi, stok, AR/AP |
| Semua modul | Approve SO, PO, PEB, WO |
| `/reports/*` | Akses semua laporan |
| `/finance/reports` | Laporan keuangan ringkasan |

---

### 👤 2. Staff Sales

**Tanggung jawab:** Kelola order masuk dari customer, koordinasi kebutuhan produksi.

1. **Terima inquiry dari customer** — negosiasi harga & qty
2. **Buat Sales Order** → `/sales/new`
   - Nama customer bebas (free-text, tidak perlu master customer)
   - Nama produk bebas (free-text)
   - Tambah BOM preview per line item untuk estimasi kebutuhan BB
   - Pilih currency (IDR/USD/EUR) dan kurs
   - Multi-line item dengan subtotal per baris
3. **Pantau status SO** → `/sales`
   - Lihat SO: Draft → Approved → In Production → Completed
4. **Cek WO terkait** → `/sales/[id]`
   - Dari halaman detail SO, lihat WO yang sudah dibuat untuk SO tersebut
   - Tombol "Buat Work Order" muncul saat SO sudah Approved
5. **Pantau laporan penjualan** → `/reports/sales`
   - Revenue trend, order volume, top customer, sales by product

---

### 👤 3. Staff Purchasing

**Tanggung jawab:** Pengadaan bahan baku impor, kelola dokumen BC 2.0.

1. **Buat Purchase Order** → `/purchasing/po` → *Create PO*
   - Isi supplier, item, qty, harga, kurs
   - Sistem otomatis hitung DPP (×11/12) dan PPN 12%
   - Preview blok tanda tangan (Dibuat / Diperiksa / Disetujui / Supplier)
2. **Input BC 2.0** saat barang tiba di pelabuhan → `/purchasing/bc20/new`
   - Nomor PIB, supplier, deskripsi barang, HS Code
   - Nilai CIF (USD), kurs, bea masuk, PPN import, PPh 22
   - Sistem catat otomatis sebagai tax asset (PPN & PPh 22 tidak masuk landed cost)
3. **Pantau dashboard BC 2.0** → `/purchasing/bc20/dashboard`
   - Status: Arrived / GR Done / Tax Paid / dll
4. **Kelola supplier** → `/purchasing/suppliers`
5. **Pantau Dual Billing** → `/reports/dual-billing`
   - Pastikan pembayaran vendor (CIF) dan pajak impor tidak overdue
   - Alert merah jika tax payment overdue (barang diblokir Bea Cukai)
6. **Analisis landed cost** → `/reports/landed-cost-analysis`
   - Breakdown biaya: CIF + Bea Masuk + Freight + Handling + Port Charges

---

### 👤 4. Staff Gudang

**Tanggung jawab:** Terima BB dari impor, kelola stok, terima FG dari produksi, catat waste.

1. **Terima BB dari impor** → `/warehouse/inbound`
   - Referensi ke BC 2.0 dari Purchasing
   - Input lot number, qty aktual, kondisi barang
2. **Goods Receipt resmi** → `/warehouse/gr`
3. **Pantau stok gudang** → `/warehouse`
   - Search by nama / kode barang / lokasi
   - Filter by kategori (BB / FG / Packaging / WIP)
   - Lihat status stok: OK / Low Stock / Out of Stock
4. **Terima FG dari produksi** → `/warehouse/outbound` → Tab *Input Barang Jadi*
   - Pilih WO yang sudah selesai
   - Input qty diterima, qty reject, lokasi gudang FG, nama penerima
5. **Kirim FG ke customer** → `/warehouse/outbound` → Tab *Kirim ke Customer*
   - Isi no. Surat Jalan, transporter, supir, no. kendaraan
   - Link ke nomor PEB jika pengiriman ekspor
6. **Catat waste / scrap** → `/warehouse/waste`
   - Input waste per batch produksi
   - Sistem otomatis bandingkan waste ratio aktual vs batas BCLKT
   - Alert jika melebihi batas — perlu pelaporan khusus ke DJBC
   - Export laporan waste ke Excel

---

### 👤 5. Staff Produksi

**Tanggung jawab:** Buat dan eksekusi Work Order, kelola subkontrak KITE.

1. **Lihat SO yang sudah Approved** → `/sales`
2. **Buat Work Order** → `/production/wo/new`
   - Pilih SO → sistem auto-fill data produk
   - Tampil BOM per produk + cek stok BB otomatis
   - Warning merah jika stok BB kurang dari kebutuhan
   - Isi: Line Produksi, shift, supervisor, lokasi gudang FG tujuan
3. **Update status WO** → `/production/wo/[id]`
   - Draft → In Progress → Completed
   - Saat Completed → klik *"Input BJ ke Gudang"* (notif ke Gudang)
4. **Kelola Subkontrak KITE** → `/production/subkontrak`
   - Buat job subkon baru, pilih subkontraktor dari master
   - Catat dokumen SUBK KITE:
     - **1.1 / 1.2** → fasilitas Pembebasan
     - **2.1 / 2.2** → fasilitas Pengembalian
   - Pantau alur: Draft → BB Dikirim → Dalam Proses → Hasil Diterima → Selesai
   - Catat fee jasa subkontraktor (diproses ke Finance → AP)
5. **Pantau laporan produksi** → `/reports/production`
   - Konversi ratio aktual vs standar per WO
   - Variance alert jika deviasi > threshold
6. **Analisis konversi detail** → `/reports/conversion-analysis`
   - Breakdown waste per tipe (cutting loss, edge trim, process loss)
   - Nilai waste dalam rupiah

---

### 👤 6. Staff Keuangan

**Tanggung jawab:** Kelola AR, AP, pembayaran, faktur pajak, pantau tax assets.

1. **AR (Piutang Customer)** → `/finance/ar`
   - Buat invoice ke customer dari SO yang sudah dikirim
   - Pantau status: Draft → Sent → Partially Paid → Paid → Overdue
   - Export daftar piutang ke Excel
2. **AP (Hutang Vendor)** → `/finance/ap`
   - Input tagihan dari supplier / subkontraktor
   - Pantau jatuh tempo pembayaran
   - Export daftar hutang ke Excel
3. **Payments** → `/finance/payments`
   - Catat pembayaran masuk (dari customer) dan keluar (ke vendor)
   - Export rekap pembayaran ke Excel
4. **Faktur Pajak PPN** → `/finance/faktur`
   - Kelola faktur pajak keluaran (penjualan domestik, PPN 11%)
   - Export untuk upload ke aplikasi e-Faktur DJP
5. **Tax Assets** → `/finance/tax-assets` atau `/reports/tax-assets`
   - Pantau PPN import yang bisa dikreditkan vs PPN keluaran
   - Pantau PPh 22 yang bisa dikreditkan di SPT Tahunan PPh Badan
   - Rekonsiliasi bulanan: PPN masukan vs keluaran → lebih/kurang bayar
6. **Laporan keuangan** → `/finance/reports`

---

### 👤 7. Staff KITE / Customs Internal

**Tanggung jawab:** Kelola dokumen ekspor (PEB) dan semua laporan wajib KITE untuk DJBC.

1. **Buat PEB (Pemberitahuan Ekspor Barang)** → `/logistics/peb/new`
   - Pilih customer ekspor, negara tujuan
   - Input item FG yang diekspor + qty
   - **Input kurs USD/IDR** sesuai kurs resmi BI/DJBC pada tanggal ekspor
   - Sistem otomatis hitung FOB: qty × harga × kurs = nilai Rp
   - PPN otomatis 0% (ekspor = zero-rated)
2. **Proses PEB** → `/logistics/peb/[id]`
   - Draft → Approved → Exported
   - Pantau alur: Dokumen siap → Customs clearance → Shipped
3. **Dashboard KITE** → `/kite`
   - Ringkasan: status waste, subkontrak aktif, mutasi BB terkini
4. **8 Laporan IT Inventory Wajib** → `/reports/kite-inventory`

   Sesuai Lampiran XXII PER-5/BC/2023. Semua laporan **otomatis terisi** dari transaksi yang sudah diinput di modul lain — tidak perlu input ulang.

   | No | Nama Laporan | Sumber Data Otomatis | Cara Memperbarui |
   |----|-------------|---------------------|-----------------|
   | **Lap 1** | Pemasukan Bahan Baku | ✅ **Live** — Stock movements IMPORT/GR | Klik *"Complete GR & Update Stock"* di `/warehouse/gr` |
   | **Lap 2** | Pemakaian Bahan Baku | ✅ **Live** — Stock movements PRODUCTION_OUT | Klik *"Mulai Produksi"* di halaman WO `/production/wo/[id]` |
   | **Lap 3** | Pemakaian BB Subkontrak | ✅ **Live** — Subkontrak records (item KITE) | Buat job subkontrak di `/production/subkontrak` → *Simpan sebagai Draft* |
   | **Lap 4** | Pemasukan Hasil Produksi | ✅ **Live** — FG Receipts (WO Completed → Input ke Gudang) | Setelah WO selesai, klik *"Terima ke Gudang"* di `/warehouse/outbound` |
   | **Lap 5** | Pengeluaran Hasil Produksi | ✅ **Live** — PEB (status Submitted / Approved / Exported) | Buat PEB di `/logistics/peb/new` → Submit |
   | **Lap 6** | Mutasi Bahan Baku | ✅ **Live** — Stock items (kategori BB) | Otomatis dari seluruh transaksi BB — GR, produksi, subkontrak |
   | **Lap 7** | Mutasi Hasil Produksi | ✅ **Live** — Stock items (kategori FG) | Otomatis dari stok FG — diperbarui setiap FG masuk/keluar gudang |
   | **Lap 8** | Waste / Scrap | ✅ **Live** — Waste Records (status Diajukan BC 2.4 / Diverifikasi / Selesai) | Input waste di `/warehouse/waste` → ubah status ke *Diajukan BC 2.4* |

   > **Semua 8 laporan sudah live** — terisi otomatis dari transaksi yang diinput di modul lain. Tidak perlu input data secara manual di halaman laporan.

   - **"Export Semua"** → 1 file Excel, 8 sheet sekaligus (format Lampiran XXII PER-5/BC/2023)
   - Export per laporan tersedia di tiap tab dengan tombol *Export* individual
5. **Laporan Mutasi Stok** → `/reports/stock-movement`
   - Filter per material / periode
   - Rekap: Opening → Import → Produksi → Ekspor → Waste → Closing
   - Export untuk diserahkan ke DJBC
6. **Laporan Konversi Bahan Baku** → `/reports/production`
   - Rasio konversi BB → FG per WO
   - Referensi BC 2.3 (impor KITE) dan BC 3.0 (ekspor KITE)
   - Export untuk audit Bea Cukai
7. **Traceability material KITE** → `/reports/traceability`
   - Lacak satu lot: BC 2.3 → GR → WO → FG → PEB
   - Generate sertifikat keterlacakan untuk keperluan audit

---

### 👤 8. Petugas DJBC *(Read-Only)*

**Tanggung jawab:** Audit kepatuhan KITE — memeriksa laporan dan dokumen, tidak mengubah data.

> Petugas DJBC **hanya melihat**, tidak bisa membuat atau mengedit dokumen apapun.

| Akses yang Dibutuhkan | Menu | Tujuan Audit |
|----------------------|------|-------------|
| IT Inventory (8 laporan) | `/reports/kite-inventory` | Verifikasi laporan wajib PER-5/BC/2023 |
| Laporan Mutasi Stok | `/reports/stock-movement` | Rekonsiliasi stok BB dan HP |
| Laporan Konversi BB | `/reports/production` | Verifikasi rasio konversi & waste |
| Traceability KITE | `/reports/traceability` | Lacak BC 2.3 → produksi → ekspor |
| Dokumen BC 2.0 | `/purchasing/bc20` | Verifikasi dokumen impor |
| Dokumen PEB | `/logistics/peb` | Verifikasi dokumen ekspor |
| Laporan Waste | `/warehouse/waste` | Cek waste ratio vs BCLKT |
| Subkontrak KITE | `/production/subkontrak` | Cek dokumen SUBK KITE |

> **Fase berikutnya:** Direncanakan halaman khusus `/audit` untuk petugas DJBC — tampilan read-only yang lebih formal, berisi semua dokumen dan laporan dalam satu tempat tanpa tombol edit/tambah.

---

## 4. Ringkasan Modul Per User

| Modul | Admin | Sales | Purchasing | Gudang | Produksi | Keuangan | KITE | DJBC |
|-------|-------|-------|-----------|--------|----------|---------|------|------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Sales / SO | ✅ | ✅ | — | — | Lihat | — | — | — |
| Purchasing / PO | ✅ | — | ✅ | — | — | — | — | — |
| BC 2.0 | ✅ | — | ✅ | — | — | — | Lihat | ✅ |
| Gudang (stok, inbound, outbound) | ✅ | — | — | ✅ | — | — | — | — |
| Waste | ✅ | — | — | ✅ | ✅ | — | Lihat | ✅ |
| Work Order | ✅ | Lihat | — | Lihat | ✅ | — | — | — |
| Subkontrak KITE | ✅ | — | — | — | ✅ | — | Lihat | ✅ |
| PEB Ekspor | ✅ | — | — | — | — | — | ✅ | ✅ |
| Keuangan (AR/AP/Payments) | ✅ | — | — | — | — | ✅ | — | — |
| Faktur Pajak | ✅ | — | — | — | — | ✅ | — | — |
| Tax Assets | ✅ | — | — | — | — | ✅ | Lihat | — |
| IT Inventory (8 laporan) | ✅ | — | — | — | — | — | ✅ | ✅ |
| Laporan Mutasi Stok | ✅ | — | — | — | — | — | ✅ | ✅ |
| Laporan Konversi / Produksi | ✅ | — | — | — | ✅ | — | ✅ | ✅ |
| Traceability KITE | ✅ | — | — | — | — | — | ✅ | ✅ |
| Laporan Sales / Inventory | ✅ | ✅ | — | — | — | ✅ | — | — |

---

## 5. Dokumen KITE yang Dihasilkan Sistem

| Dokumen | Dibuat Oleh | Menu | Keterangan |
|---------|------------|------|------------|
| Purchase Order | Staff Purchasing | `/purchasing/po` | Dengan DPP/PPN otomatis |
| BC 2.0 | Staff Purchasing | `/purchasing/bc20/new` | Pemberitahuan Impor Barang reguler |
| BC 2.3 | (referensi eksternal) | `/reports/production` | Impor KITE — referensi di laporan konversi |
| BC 3.0 | (referensi eksternal) | `/reports/production` | Ekspor KITE — referensi di laporan konversi |
| PEB | Staff KITE | `/logistics/peb/new` | Pemberitahuan Ekspor Barang — trigger Lap 5 & 7 |
| SUBK KITE 1.1/1.2 | Staff Produksi | `/production/subkontrak` | Pengeluaran BB ke subkon (Pembebasan) — trigger Lap 3 |
| SUBK KITE 2.1/2.2 | Staff Produksi | `/production/subkontrak` | Pengeluaran BB ke subkon (Pengembalian) — trigger Lap 3 |
| FG Receipt | Staff Gudang | `/warehouse/outbound` | Penerimaan BJ dari WO — trigger Lap 4 |
| Waste / BC 2.4 | Staff Gudang | `/warehouse/waste` | Pelaporan waste ke DJBC — trigger Lap 8 |
| IT Inventory (8 laporan) | Staff KITE | `/reports/kite-inventory` | Wajib per Lampiran XXII PER-5/BC/2023 — **otomatis dari transaksi** |
| Laporan Mutasi Stok | Staff KITE | `/reports/stock-movement` | BB + FG movements, gabung data live |
| Laporan Konversi BB | Staff KITE | `/reports/production` | Rasio konversi + waste untuk audit |
| Sertifikat Traceability | Staff KITE | `/reports/traceability` | Keterlacakan lot BC 2.3 → PEB |
| Faktur Pajak | Staff Keuangan | `/finance/faktur` | PPN keluaran, upload ke e-Faktur DJP |

---

## 6. Catatan Penting KITE

### Status Otomatisasi Laporan IT Inventory

Semua 8 laporan sudah **live** — terisi otomatis dari transaksi di sistem.

| Laporan | Status | Trigger |
|---------|--------|---------|
| Lap 1 — Pemasukan BB | ✅ **Live** | Complete GR di `/warehouse/gr` |
| Lap 2 — Pemakaian BB | ✅ **Live** | Klik *Mulai Produksi* di WO detail |
| Lap 3 — BB Subkontrak | ✅ **Live** | Buat job subkontrak (item KITE) di `/production/subkontrak` |
| Lap 4 — Pemasukan HP | ✅ **Live** | Terima FG di `/warehouse/outbound` |
| Lap 5 — Pengeluaran HP | ✅ **Live** | Buat & submit PEB di `/logistics/peb/new` |
| Lap 6 — Mutasi BB | ✅ **Live** | Otomatis dari transaksi BB (GR + WO + subkontrak) |
| Lap 7 — Mutasi HP | ✅ **Live** | Otomatis dari stok FG |
| Lap 8 — Waste/Scrap | ✅ **Live** | Input waste → status *Diajukan BC 2.4* di `/warehouse/waste` |

### Aturan Operasional

- **Waste ratio** dicatat per WO dan dibandingkan batas BCLKT. Jika melebihi, sistem menampilkan alert merah — perlu pelaporan khusus ke DJBC.
- **Lot number** wajib untuk BB yang masuk via BC 2.3 (KITE/bonded zone). Untuk BC 2.0 reguler, lot bersifat opsional.
- **Kurs PEB** harus menggunakan kurs resmi BI/DJBC pada tanggal ekspor — diinput manual di form PEB.
- **IT Inventory** wajib diserahkan ke DJBC sesuai periode pelaporan (bulanan/triwulan sesuai izin KITE masing-masing perusahaan).
- **Subkontrak**: setiap pengeluaran BB ke subkontraktor wajib dilengkapi dokumen SUBK KITE **sebelum** BB keluar dari kawasan JKJ.
- **PPN Ekspor = 0%** (zero-rated) — tidak ada PPN keluaran dari penjualan ekspor. PPN masukan dari impor material untuk produk ekspor dapat di-restitusi.
- **Urutan input yang benar** untuk laporan KITE lengkap:
  1. Input BC 2.0 di `/purchasing/bc20/new` → lanjut ke Goods Receipt di `/warehouse/gr` → klik **"Complete GR & Update Stock"** → **Lap 1 & 6 update**
  2. Buat WO di `/production/wo/new` → buka detail WO → klik **"Mulai Produksi"** → **Lap 2 update**
  3. *(jika ada subkontrak)* Buat job di `/production/subkontrak` → pastikan item berlabel KITE → **Lap 3 update**
  4. Selesaikan WO → Terima FG di `/warehouse/outbound` → **Lap 4 update**
  5. Input waste di `/warehouse/waste` → ubah status ke *Diajukan BC 2.4* → **Lap 8 update**
  6. Buat & submit PEB di `/logistics/peb/new` → **Lap 5 & 7 update**
  7. Buka `/reports/kite-inventory` → **Export Semua** → serahkan ke DJBC
