# Laporan Revisi — Feedback Klien JKJ ERP

**Dokumen**: Response terhadap "komen program jkj.pdf"  
**Tanggal Feedback Diterima**: April 17, 2026  
**Tanggal Laporan Terakhir**: Mei 19, 2026  
**Status**: ✅ Semua item (F1–F9) selesai | ✅ Semua revisi KITE (K1–K9) selesai | ✅ Semua revisi lanjutan (M1–M5) selesai | ✅ Batch 3 (B1–B3, P1–P5, S1–S3, E1, A1–A4, W1) — semua selesai

---

## Ringkasan Eksekutif

Klien memberikan feedback melalui dokumen review setelah demo sistem. Terdapat **9 area revisi** (F1–F9) yang mencakup warehouse, purchasing, production, sales, dan logistics — semua selesai April 2026.

Pada sesi lanjutan pertama (Mei 2026), dilakukan **9 revisi tambahan khusus KITE** (K1–K9) mencakup modul akunting, laporan KITE, PO tipe, BC 2.0 fields, subkontrak, warehouse, dan UX — semua selesai.

Pada sesi lanjutan kedua (Mei 2026), dilakukan **5 revisi baru** (M1–M5) mencakup traceability bahan baku, BOM manual di SO, penyimpanan WIP, cancel PO + stok sementara — semua selesai.

---

## Detail Feedback & Respons

---

### F1 — Warehouse: Form Input Inbound & Outbound

**Komentar Klien:**

> Menu Warehouse Inbound & Outbound tidak memiliki form input apapun. Tidak ditemukan di mana dan bagaimana cara menginput barang yang masuk maupun barang jadi yang sudah di Gudang barang jadi dan sudah dieksport.

**Yang Diminta:**

- Form input material masuk (Inbound): nama material, surat tanda terima, tanggal masuk, referensi PO/PIB
- Form input barang jadi keluar (Outbound): link ke WO selesai, tanggal, tujuan
- Dashboard warehouse lebih dari sekadar tampilkan stok

**Update yang Dilakukan:**

_Inbound (`/warehouse/inbound`):_

- Tambah tab **"Riwayat Penerimaan"** — histori semua GR (Goods Receipt)
- Tambah tab **"Antrian PO"** — daftar PO yang menunggu penerimaan barang
- Tambah tombol **"Input Penerimaan Baru"** dengan form lengkap:
  - Jenis dokumen: BC 2.0 / PO Lokal / Subkontrak / Transfer / Lainnya
  - Field PIB muncul otomatis jika jenis BC 2.0 dipilih
  - Input supplier/pengirim (free-text)
  - Tanggal masuk, no. surat jalan, no. kendaraan
  - Gudang tujuan (RM-A, RM-B, FG-A, FG-B, Sementara)
  - Nama penerima / checker
  - Multi-line material: kode, nama, satuan, qty dipesan vs diterima, kondisi, keterangan
  - Warning otomatis jika qty diterima < qty dipesan

_Outbound (`/warehouse/outbound`):_

- Tab **"Input Barang Jadi"** — daftar WO yang COMPLETED menunggu serah terima ke gudang BJ. Setiap WO ada tombol "Terima ke Gudang" dengan form: qty diterima, qty rejek, gudang FG tujuan, penerima
- Tab **"Riwayat BJ Masuk"** — histori penerimaan FG dari WO
- Tab **"Kirim ke Customer"** — antrian SO siap kirim + form pengiriman (no. surat jalan, PEB, transporter, kendaraan, supir)
- Tab **"Riwayat Pengiriman"** — histori shipment lengkap dengan link PEB

**Commit:** `eb26f6e`

---

### F2 & F3 — BC 2.0: Multi-Material per PIB & Field Lengkap

**Komentar Klien:**

> 1 dokumen PIB hanya bisa diisi 1 material, tidak fleksibel. Banyak field penting hilang seperti kode material, berat material, kurs (nilai tukar), dan harga per satuan bahan baku.

**Yang Diminta:**

- 1 PIB bisa input banyak material (line items)
- Input bebas — tidak harus dari dropdown master data
- Field tambahan: Kode Material, Berat Material, Kurs, Harga per satuan BB

**Update yang Dilakukan (`/purchasing/bc20/new`):**

- Form dirombak total menjadi **multi-material per PIB** menggunakan collapsible accordion per material line
- Setiap line item memiliki field: kode barang, nama barang, HS Code (free-text), negara asal, satuan, berat (kg), jumlah, harga satuan
- **Kalkulasi otomatis per line**: nilai CIF, bea masuk (lookup dari HS prefix), PPN impor (11%), PPh 22 (2.5%), landed cost per satuan (alokasi proporsional dari freight)
- **Kurs/currency** diisi satu kali di header, berlaku untuk semua line
- Summary table di bawah merangkum semua material dalam satu PIB
- Supplier diubah dari dropdown menjadi **free-text input**
- Hapus dependency pada komponen HSCodeSelector dan master data dropdown

**Commit:** `69ef3af` (BC 2.0 form rewrite)

---

### F4 & F5 — Production: WO Konsisten, Line Produksi, Tracking Lokasi FG

**Komentar Klien:**

> Ada 2 tampilan Work Order yang berbeda — membingungkan. Field "Operator" tidak relevan untuk kebutuhan kami. Setelah WO selesai, tidak jelas barang jadi ada di mana.

**Yang Diminta:**

- Konsolidasi tampilan WO menjadi satu yang konsisten
- Ganti field "Operator" menjadi "Line Produksi"
- Tambah informasi lokasi/gudang FG setelah WO selesai

**Update yang Dilakukan:**

_`/production/wo` (halaman daftar WO baru):_

- Halaman baru sebagai pusat daftar semua WO dengan filter status (Planned / In Progress / QC / Completed) dan search
- Summary cards per status yang bisa diklik sebagai filter cepat
- Kolom "Line Produksi" (bukan operator)

_`/production/wo/new` (form WO baru — satu tampilan konsisten):_

- Section 1: SO auto-fill (pilih SO → produk & qty terisi otomatis)
- Section 2: BOM preview dengan cek stok real-time (merah jika kurang)
- Section 3: **"Line Produksi"** menggantikan field "Operators" + shift selector + supervisor + catatan instruksi
- Section 4: **Lokasi Gudang BJ** — pilih gudang FG tujuan saat membuat WO

_`/production/wo/[id]` (detail WO):_

- Tombol aksi kontekstual sesuai status (Mulai Produksi / Selesai→QC / QC Lulus / dll)
- Kalau status COMPLETED → banner hijau + tombol "Input BJ ke Gudang" link ke `/warehouse/outbound`
- Traceability chain: SO → WO → Gudang BJ

_`/production/wo/create`:_

- Redirect otomatis ke `/production/wo/new` (menghilangkan duplikasi halaman)

**Commit:** `c7fa47a`

---

### F6 — Sales Order: Master Data Fleksibel & BOM di SO

**Komentar Klien:**

> Tidak ada halaman untuk edit/tambah master data. Nama produk menggunakan nama produk JKJ, seharusnya bisa input nama produk buyer. BOM tidak ditemukan di Sales Order.

**Yang Diminta:**

- Nama produk di SO bisa free-text (nama dari buyer)
- BOM bisa diisi langsung di Sales Order

**Update yang Dilakukan (`/sales/new`):**

- **Customer**: dari dropdown menjadi free-text — ketik langsung nama buyer tanpa perlu ada di master data
- **Multi-line item** dengan collapsible accordion per produk:
  - Nama produk **free-text** sesuai PO customer (tidak terikat nama produk JKJ)
  - Kode produk opsional
  - Qty, satuan, harga satuan, catatan per item
- **BOM per item**: setiap line bisa dipilih BOM yang sesuai → muncul estimasi kebutuhan bahan baku + warning stok kurang
- Currency (USD/EUR/IDR) + kurs, auto-hitung total IDR
- Detail page SO: tombol "Buat Work Order" langsung dari SO yang sudah APPROVED; link ke WO terkait diambil dari data nyata (bukan hardcode)

**Commit:** `ea1e7cd`

---

### F7 — Warehouse: Pencarian Bahan Baku by Nama

**Komentar Klien:**

> Pencarian bahan baku di gudang hanya bisa by kode. Tidak bisa mencari menggunakan nama material.

**Yang Diminta:**

- Search/filter bahan baku menggunakan nama di halaman warehouse

**Update yang Dilakukan (`/warehouse`):**

- Search bar fungsional: cari by **nama**, kode, atau lokasi gudang secara bersamaan
- Filter dropdown **kategori**: Raw Material / Work in Progress / Finished Goods / Spare Part
- Filter dropdown **status**: In Stock / Low Stock / Critical / Overstock
- Counter "Menampilkan X dari Y item" muncul saat filter/search aktif

**Commit:** `c9423f0`

---

### F8 — Purchasing Lokal: DPP/PPN & Blok Tanda Tangan

**Komentar Klien:**

> Dokumen pembelian lokal tidak lengkap untuk keperluan print. Tidak ada kolom DPP, PPN 12%, dan tabel tanda tangan.

**Yang Diminta:**

- Kolom DPP: TOTAL × 11/12
- Kolom PPN: 12%
- Tabel tanda tangan (Purchase, Accounting, Manager, Direktur Utama) saat print

**Update yang Dilakukan (`/purchasing/po/create`):**

- **DPP** = Subtotal × 11/12 — kalkulasi otomatis
- **PPN 12%** = DPP × 12% — kalkulasi otomatis
- **Total Tagihan** = DPP + PPN — ditampilkan di bawah tabel item
- Formula dijelaskan: "DPP = Total × 11/12 | PPN = DPP × 12%"
- Tombol **"Preview Tanda Tangan"** → tampilkan blok 4 kolom: Purchase / Accounting / Manager / Direktur Utama
- Blok tanda tangan dirancang untuk tercetak di bagian bawah dokumen PO

**Commit:** `c9423f0`

---

### F9 — Export/PEB: Kurs Manual pada Tanggal Ekspor

**Komentar Klien:**

> Tidak ada kolom input kurs (nilai tukar) pada tanggal ekspor di form PEB. Nilai ekspor seharusnya terhitung otomatis dari qty × harga × kurs.

**Yang Diminta:**

- Field input kurs (USD/IDR) pada tanggal ekspor
- Nilai ekspor otomatis dari qty × harga × kurs

**Update yang Dilakukan (`/logistics/peb/new`):**

- Field kurs diberi label **"Kurs [mata uang]/IDR pada Tanggal Ekspor"** — eksplisit menyebut tanggal ekspor
- Catatan: "Sesuai kurs BI/DJBC pada tanggal ekspor"
- Preview nilai FOB real-time: `USD xxx = Rp xxx` — terhitung langsung saat item atau kurs diubah
- Nilai IDR diperbarui otomatis setiap kali qty, harga satuan, atau kurs berubah

**Commit:** `c9423f0`

---

## Ringkasan Status — Revisi F1–F9 (April 2026)

| #   | Area                                      | Status     | Commit    |
| --- | ----------------------------------------- | ---------- | --------- |
| F1  | Warehouse Inbound & Outbound              | ✅ Selesai | `eb26f6e` |
| F2  | BC 2.0 Multi-Material per PIB             | ✅ Selesai | `69ef3af` |
| F3  | BC 2.0 Field Lengkap                      | ✅ Selesai | `69ef3af` |
| F4  | Production WO Konsolidasi & FG Tracking   | ✅ Selesai | `c7fa47a` |
| F5  | Production Line Produksi (ganti Operator) | ✅ Selesai | `c7fa47a` |
| F6  | Sales Order Free-text & BOM               | ✅ Selesai | `ea1e7cd` |
| F7  | Warehouse Search by Nama                  | ✅ Selesai | `c9423f0` |
| F8  | PO Lokal DPP/PPN/Signature                | ✅ Selesai | `c9423f0` |
| F9  | PEB Kurs Manual                           | ✅ Selesai | `c9423f0` |

---

## Revisi KITE — K1–K9 (Mei 2026)

Revisi lanjutan setelah demo kedua, fokus pada fitur spesifik KITE dan kelengkapan operasional.

---

### K1 — Modul Akunting (Jurnal Kas/Bank & Laporan Keuangan)

**Yang Diminta:** Modul keuangan perlu pencatatan jurnal kas/bank dan laporan keuangan standar.

**Update yang Dilakukan:**

- **Jurnal Umum** (`/finance/journal`) — form input jurnal manual (tanggal, keterangan, multi-line debit/kredit, tipe: Kas Masuk / Kas Keluar / Jurnal Umum)
- **Saldo Akun** (`/finance/accounts`) — tampilan saldo real-time semua akun dari jurnal
- **4 Laporan Keuangan** (`/finance/reports`):
  - Laporan Laba Rugi — revenue vs COGS vs expenses → net profit/loss
  - Neraca (Balance Sheet) — assets, liabilities, equity
  - Arus Kas — operating, investing, financing activities
  - Rekap Jurnal — semua entri jurnal per periode dengan filter

Data semua laporan keuangan diambil langsung dari `useJournal` dan `useAccounts` (localStorage store).

**Commit:** `9c90e71`

---

### K2 — PO Lokal vs Impor: Tipe Badge & Selector

**Yang Diminta:** Perlu bisa membedakan PO untuk pembelian lokal vs impor.

**Update yang Dilakukan:**

- Tambah field `poType: 'Lokal' | 'Impor'` ke interface `PurchaseOrder`
- **List PO** (`/purchasing/po`) — kolom "Tipe" baru dengan badge: hijau untuk Lokal, biru untuk Impor
- **Form buat PO baru** (`/purchasing/po/create`) — dropdown "Tipe PO" (Lokal/Impor) sebagai field pertama

---

### K3 — BC 2.0: Nomor Pendaftaran & Tanggal Dokumen

**Yang Diminta:** Form BC 2.0 tidak memiliki field Nomor Pendaftaran dan Tanggal Dokumen PIB.

**Update yang Dilakukan:**

- **Form BC 2.0 baru** (`/purchasing/bc20/new`) — tambah 2 field di info grid:
  - "Nomor Pendaftaran" (text input)
  - "Tanggal Dokumen" (date input)
- **Detail BC 2.0** (`/purchasing/bc20/[id]`) — tampilkan kedua field di card Document Info

---

### K4 — Subkontrak: Hanya SUBK KITE 1.1/1.2

**Yang Diminta:** Fasilitas subkontrak di JKJ hanya menggunakan skema Pembebasan (1.1/1.2), bukan Pengembalian (2.1/2.2).

**Update yang Dilakukan:**

- Interface `Subkontrak` — hapus `'SUBK KITE 2.1'` dan `'SUBK KITE 2.2'` dari tipe
- **Halaman subkontrak** (`/production/subkontrak`) — field Fasilitas menjadi read-only "Pembebasan (SUBK KITE 1.1/1.2)", hapus dropdown pilihan
- Info teks diperbarui: "SUBK KITE 1.1 = pengeluaran BB ke subkon | SUBK KITE 1.2 = pemasukan hasil dari subkon"

---

### K5 — 8 Laporan IT Inventory Wired ke Data Live

**Yang Diminta:** 8 laporan wajib KITE harus terisi otomatis dari transaksi di sistem, tidak perlu input ulang.

**Update yang Dilakukan (`/reports/kite-inventory`):**

- Lap 1 (Pemasukan BB) — live dari `useStock` movements IMPORT/GR
- Lap 2 (Pemakaian BB) — live dari `useStock` movements PRODUCTION_OUT
- Lap 3 (Pemakaian BB Subkon) — live dari `useSubkontrak` records
- Lap 4 (Pemasukan HP) — live dari `useFGReceipts`
- Lap 5 (Pengeluaran HP) — live dari `usePEB` (status Submitted/Approved/Exported)
- Lap 6 (Mutasi BB) — live dari `useStock` + computed saldo BB
- Lap 7 (Mutasi HP) — live dari `useStock` + computed saldo FG
- Lap 8 (Waste/Scrap) — live dari `useWaste`

Tombol "Export Semua" → 1 file Excel 8 sheet (format Lampiran XXII PER-5/BC/2023).

**Commit:** `4f9c8d7` / `1101336`

---

### K6 — Gudang WIP & Hasil Subkon Tersendiri

**Yang Diminta:** Perlu tampilan terpisah untuk stok WIP dan barang hasil subkontrak di halaman gudang.

**Update yang Dilakukan (`/warehouse`):**

- Tambah section **Gudang WIP** — tabel live dari `useStock` filter kategori WIP, kolom: Kode Material, Nama, Qty On Hand, Qty Reserved, Qty Available, Satuan, Lokasi, Last Update
- Tambah section **Gudang Hasil Subkon** — tabel live dari `useSubkontrak` filter status Hasil Diterima/Selesai, kolom: Job No, Subkontraktor, Deskripsi, Tgl Selesai, Material Dikirim, Status

---

### K7 — Surat Jalan Ekspor di Gudang Outbound

**Yang Diminta:** Perlu bisa membuat dan melihat Surat Jalan Ekspor dari halaman outbound gudang.

**Update yang Dilakukan:**

- **Store baru `useShipments`** (`lib/store/useShipments.ts`) — localStorage persistence, interface `Shipment` (tanggal, noSuratJalan, soId, customer, items, noPEB, transporter, noKendaraan, supir, status)
- **Tab "Surat Jalan Ekspor"** di `/warehouse/outbound` — tabel live dari `useShipments` dengan 9 kolom, tombol Export Excel
- Tombol Dispatch di "Kirim ke Customer" → panggil `createShipment()`, auto-generate nomor `SJ-EXP-YYYY-NNN`, pindah ke tab Surat Jalan

---

### K8 — Rename "Lot Number" → "Kode Barang"

**Yang Diminta:** Label "Lot Number" tidak sesuai terminologi internal JKJ — seharusnya "Kode Barang".

**Update yang Dilakukan (label UI saja, data tidak berubah):**

- `/reports/stock-movement` — header kolom "Lot Number" → "Kode Barang"
- `/reports/traceability` — SelectItem, label "Lot Number:" → "Kode Barang:"
- `/reports/traceability-bc20` — SelectItems dan label "Lot Number (RM/FG)" → "Kode Barang (RM/FG)"
- `/logistics/peb/new` dan `/logistics/peb/[id]` — label "FG Lot Number" → "Kode Barang FG"

---

### K9 — Filter Fasilitas (KITE vs Non-KITE) di Gudang

**Yang Diminta:** Stok gudang perlu bisa difilter antara barang berfasilitas KITE dan Non-KITE.

**Update yang Dilakukan:**

- Tambah field `fasilitas: 'KITE' | 'Non-KITE'` ke interface `InventoryItem` (mock data) dan `StockItem` (store)
- **Halaman Gudang** (`/warehouse`) — tambah filter dropdown "Fasilitas" (Semua / KITE / Non-KITE) + kolom "Fasilitas" dengan badge di tabel inventori

---

## Ringkasan Status — Revisi KITE K1–K9 (Mei 2026)

| #  | Area                                      | Status     |
| -- | ----------------------------------------- | ---------- |
| K1 | Modul Akunting (Jurnal + Laporan Keuangan) | ✅ Selesai |
| K2 | PO Lokal/Impor — badge & selector         | ✅ Selesai |
| K3 | BC 2.0 — Nomor Pendaftaran & Tgl Dokumen  | ✅ Selesai |
| K4 | Subkon — hanya SUBK KITE 1.1/1.2         | ✅ Selesai |
| K5 | 8 Laporan IT Inventory — live data        | ✅ Selesai |
| K6 | Gudang WIP & Hasil Subkon tersendiri      | ✅ Selesai |
| K7 | Surat Jalan Ekspor di Outbound            | ✅ Selesai |
| K8 | Rename Lot Number → Kode Barang           | ✅ Selesai |
| K9 | Filter Fasilitas KITE/Non-KITE di Gudang  | ✅ Selesai |

---

## Revisi Lanjutan — M1–M5 (Mei 2026)

Revisi batch kedua bulan Mei 2026, fokus pada traceability, inventory WIP, dan workflow cancel PO.

---

### M1 — BOM Manual di Sales Order

**Yang Diminta:** BOM di form SO sebelumnya berupa dropdown pilih dari daftar — kurang fleksibel. Perlu input manual bahan baku langsung per PO customer.

**Update yang Dilakukan (`/sales/new`):**

- Hapus BOM picker (dropdown) dari tiap line item SO
- Ganti dengan **Section 3 "Kebutuhan Material (BOM)"** — tabel input manual dengan kolom: No, Nama Material, Spesifikasi, Warna, Konsumsi, Satuan, Penggunaan, Asal Material (Lokal/Impor)
- Section bisa disembunyikan/ditampilkan (collapsible)
- Tambah/hapus baris material secara dinamis
- Data BOM disimpan bersama SO (`bomItems[]` pada interface `SalesOrder`)
- Tambah interface `BOMItem` di `lib/mock-data/sales.ts`

**Commit:** `ecea732`

---

### M2 — Traceability Bahan Baku: Trace FG → RM → PO → Status Bayar

**Yang Diminta:** Dari produk jadi (misal sarung tangan A), bisa melihat bahan baku apa yang dipakai, dokumen PO pembeliannya, dan status pembayaran bahan baku tersebut.

**Update yang Dilakukan (`/reports/material-usage` — Tab "Trace Produk Jadi"):**

- Halaman baru dengan 2 tab
- **Tab 1 — "Trace Produk Jadi"**: pilih FG/WO dari daftar → tampil chain: BC 2.0 → GR → WO → Lot FG → PEB
- Tabel bahan baku yang digunakan: Material, Kode, Qty Pakai, Harga Satuan, **Total Nilai**, No. PO, Supplier, **Status Bayar** (Lunas/Partial/Belum)
- Ringkasan bawah: total sudah dibayar vs belum/partial vs total keseluruhan
- Data nilai bahan baku diambil dari `materialsUsed[]` di `TraceabilityRecord`
- Tambah field `materialsUsed: MaterialUsed[]` ke interface `TraceabilityRecord`
- Tambah PO-2026-004 (Nitrile Latex, Global Chemicals, PARTIAL) ke mock PO

**Commit:** `dc323b6`

---

### M3 — Pemakaian Bahan Baku: RM → FG + Nilai

**Yang Diminta:** Dari suatu bahan baku, bisa melihat digunakan untuk produk jadi apa saja, berapa kuantiti FG yang dihasilkan, dan berapa nilai bahan tersebut.

**Update yang Dilakukan (`/reports/material-usage` — Tab "Pemakaian Bahan Baku"):**

- **Tab 2 — "Pemakaian Bahan Baku"**: pilih bahan baku dari dropdown → tampil semua FG yang menggunakannya
- Tabel: Produk FG, WO, Lot FG, Qty FG, **Qty Bahan Dipakai**, **Nilai Bahan**, Tanggal Produksi, PEB
- Ringkasan bawah: total qty RM terpakai, total FG diproduksi, total nilai terpakai (semua dalam 3 card)
- Helper functions baru: `getTracesByMaterial()` dan `getAllMaterials()` di `traceability.ts`
- Menu sidebar: "Traceability Bahan Baku" ditambah di bawah "Material Traceability"

**Commit:** `dc323b6`

---

### M4 — Gudang WIP: Penyimpanan Bahan Setengah Jadi

**Yang Diminta:** Perlu sistem penyimpanan tersendiri untuk bahan setengah jadi (misal kain setelah di-printing), terpisah dari bahan baku mentah dan produk jadi.

**Update yang Dilakukan (`/warehouse/wip`):**

- Halaman baru **Gudang WIP** dengan:
  - Stats: total item WIP, qty tersedia, qty direservasi
  - Tabel stok WIP: kode, nama, qty on hand / reserved / available, satuan, lokasi, fasilitas, status
- **Form "Terima dari Produksi"** — input: nama barang setengah jadi, kode (opsional), tahap proses (Post-Mixing / Post-Dipping / Post-Leaching / Post-Vulcanizing / Post-Stripping / dll), qty, satuan, lokasi, referensi WO
- **Form "Keluarkan ke Proses Berikutnya"** — pilih item WIP, lihat saldo tersedia, input qty (validasi tidak boleh melebihi tersedia), link ke WO tujuan
- Riwayat transaksi WIP IN / WIP OUT
- Tambah 2 transaction types baru di `useStock`: `WIP_IN` dan `WIP_OUT`
- Tambah 3 seed WIP items: Latex Compound (Post-Mixing), Sarung Tangan Dipped Size M, Nitrile Compound (Post-Mixing)
- Menu sidebar: "Gudang WIP" ditambah di bawah Outbound

**Commit:** `cb8795c`

---

### M5 — Cancel PO + Stok Sementara + Rilis untuk Ekspor

**Yang Diminta:** Ketika PO di-cancel setelah barang sudah diterima, barang harus tersimpan sementara dan bisa dikeluarkan lagi untuk ekspor jika ada permintaan serupa.

**Update yang Dilakukan:**

_Halaman PO (`/purchasing/po`):_
- Tambah tombol **Cancel** (ikon X merah) per PO — hanya muncul jika status bukan CANCELLED
- Dialog konfirmasi cancel:
  - Info PO (nomor, supplier, total, status saat ini)
  - Warning kuning jika status RECEIVED/PARTIAL: "barang sudah diterima"
  - Checkbox **"Pindahkan barang ke stok sementara"** — muncul hanya jika barang sudah diterima
  - Pilih lokasi penyimpanan (Gudang Sementara A/B, Gudang WIP-1/2)
  - Input alasan cancel
- Setelah konfirmasi: PO status → `CANCELLED` atau `CANCELLED_WITH_STOCK` (badge oranye jika ada stok)

_Halaman Stok Sementara (`/warehouse/temp-storage`):_
- Halaman baru dengan 2 tab:
  - **"Dalam Penyimpanan"**: tabel semua item dari PO dibatalkan — material, qty, nilai, lokasi, asal PO, supplier, tgl cancel, alasan + tombol **"Rilis"**
  - **"Sudah Dirilis"**: riwayat barang yang sudah dikeluarkan ke SO/PEB
- Dialog **Rilis**: input no. SO/PEB tujuan + qty (validasi ≤ tersedia) → status jadi RELEASED

_Support files:_
- Store baru `lib/store/useTempStorage.ts` — localStorage-backed, interface `TempStorageItem`
- Tambah `TEMP_STORAGE` ke `STORE_KEYS` di `lib/store/index.ts`
- Tambah `CANCELLED_WITH_STOCK` ke status PurchaseOrder
- Update `StatusBadge`: CANCELLED → merah, CANCELLED_WITH_STOCK → oranye
- Menu sidebar: "Stok Sementara" ditambah di bawah Gudang WIP

**Commit:** `1164e16`

---

## Ringkasan Status — Revisi Lanjutan M1–M5 (Mei 2026)

| #  | Area                                          | Status     | Commit    |
| -- | --------------------------------------------- | ---------- | --------- |
| M1 | BOM manual input di form Sales Order          | ✅ Selesai | `ecea732` |
| M2 | Traceability FG → RM → PO → Status Bayar      | ✅ Selesai | `dc323b6` |
| M3 | Pemakaian Bahan Baku RM → FG + Nilai          | ✅ Selesai | `dc323b6` |
| M4 | Gudang WIP — penyimpanan bahan setengah jadi  | ✅ Selesai | `cb8795c` |
| M5 | Cancel PO → Stok Sementara → Rilis Ekspor     | ✅ Selesai | `1164e16` |

---

## Catatan Teknis

- Semua perubahan menggunakan **mock data** (tidak ada backend/database nyata) — data hanya untuk demo/presentasi
- Tidak ada breaking change pada halaman yang sudah ada sebelumnya
- Semua halaman baru menggunakan komponen `AppLayout` (konsisten dengan layout aplikasi)
- TypeScript errors yang ada di project berasal dari API routes lama (`app/api/bc20/`) — **bukan dari perubahan ini** dan tidak mempengaruhi tampilan frontend
- Rename "Lot Number" → "Kode Barang" hanya pada label UI — field name internal (`lotNumber`) tidak diubah untuk menjaga kompatibilitas data

---

---

## Revisi Batch 3 — B/P/S/E/A (Mei 2026)

Feedback ketiga dari klien diterima 16/05/2026. Terdapat **16 item** dari dua sumber — Notes Purchasing dan Mb Santi — mencakup bug kritis, fitur Purchasing yang belum lengkap, revisi alur Subkontrak, tambahan field PEB, dan pengembangan modul Akunting.

---

### GRUP B — Bug Kritis (Data Tidak Tersimpan / Tidak Tampil)

---

#### B1 — Supplier Baru Tidak Tersimpan

**Komentar Klien:**

> Buat supplier baru ketika sudah di-save tidak tersimpan.

**Yang Diminta:**

- Supplier yang baru dibuat harus langsung tersimpan dan muncul di daftar supplier
- Setelah save, data supplier tampil di list tanpa perlu refresh manual

**Update yang Dilakukan:**

- Buat store baru `lib/store/useSuppliers.ts` — localStorage-backed dengan `STORE_KEYS.SUPPLIERS`
- Halaman `/purchasing/suppliers` dirombak: gunakan `useSuppliers()` hook (bukan mock data statis)
- Form "Tambah Supplier Baru" di halaman yang sama (bukan halaman terpisah) langsung memanggil `createSupplier()` → list otomatis refresh tanpa reload
- Halaman `/purchasing/suppliers/new` diarahkan ke form inline di list page
- **Commit:** `4ca6f5c` (Sprint 1)

---

#### B2 — PO Setelah Submit Tidak Tampil

**Komentar Klien:**

> Hasil dari submit persetujuan Purchase tidak muncul. Untuk purchase order setelah submit untuk persetujuan juga ingin melihat data yang baru diinput tidak terlihat.

**Yang Diminta:**

- Setelah PO disubmit untuk persetujuan, data PO tersebut langsung terlihat di daftar PO dengan status yang sesuai

**Update yang Dilakukan:**

- Buat store baru `lib/store/usePurchaseOrders.ts` — localStorage-backed dengan `STORE_KEYS.PURCHASE_ORDERS`
- Halaman `/purchasing/po` menggunakan `usePurchaseOrders()` hook agar list reaktif
- Form `/purchasing/po/create` memanggil `createPurchaseOrder()` langsung ke store → PO langsung muncul di list dengan status DRAFT/APPROVED
- **Commit:** `4ca6f5c` (Sprint 1)

---

#### B3 — Penerimaan Material Tidak Terlihat Setelah Save

**Komentar Klien:**

> Untuk gudang pada saat penerimaan material bahan baku ketika sudah disimpan tidak terlihat inputannya.

**Yang Diminta:**

- Input penerimaan bahan baku yang sudah disimpan harus langsung tampil di riwayat penerimaan gudang

**Update yang Dilakukan:**

- Buat store baru `lib/store/useGoodsReceipts.ts` — localStorage-backed dengan `STORE_KEYS.GR`
- Halaman `/warehouse/inbound` menggunakan `useGoodsReceipts()` hook — riwayat GR tampil reaktif setelah save
- Form penerimaan memanggil `createGoodsReceipt()` → data langsung muncul di tab "Riwayat Penerimaan" tanpa reload
- **Commit:** `4ca6f5c` (Sprint 1)

---

### GRUP P — Purchasing: Fitur Hilang / Belum Lengkap

---

#### P1 — Purchase Order: Mata Uang USD (Multi-Currency)

**Komentar Klien:**

> Untuk purchase order mata uang USD belum ada.

**Yang Diminta:**

- Field mata uang di form PO: IDR, USD, KRW (minimal)
- Nilai PO ditampilkan dalam mata uang asal + konversi IDR menggunakan kurs yang diinput

**Update yang Dilakukan:**

- Tambah dropdown **"Mata Uang"** (IDR/USD/KRW) di form PO `/purchasing/po/create`
- Tambah field **"Kurs ke IDR"** yang muncul otomatis jika bukan IDR (default: USD=15.500, KRW=11)
- Harga satuan diinput dalam mata uang asal; total dihitung × kurs → disimpan sebagai IDR
- List PO (`/purchasing/po`) menampilkan tag `[USD]` atau `[KRW]` di kolom Total Amount jika bukan IDR
- **Commit:** `4ca6f5c` (Sprint 2)

---

#### P2 — Purchase Order: Kode Material / Kode Barang

**Komentar Klien:**

> Untuk purchase order belum ada kode material / kode barang.

**Yang Diminta:**

- Kolom kode material / kode barang di line item Purchase Order
- Bisa diisi manual atau dipilih dari daftar material yang sudah ada

**Update yang Dilakukan:**

- Tambah kolom **"Kode Material"** di tabel line items form PO (`/purchasing/po/create`) — free-text, input bebas
- Tambah field `code` ke interface item di `PurchaseOrder`
- **Commit:** `4ca6f5c` (Sprint 2)

---

#### P3 — Purchase Order: Kolom Nomor PO

**Komentar Klien:**

> Pada saat buat PO material tidak ada kolom untuk mengisi nomor PO nya. Jika nomor PO material otomatis berurutan, minta bisa ditambahkan untuk nomor PO nya, dikarenakan saat input data masuk gudang yang dicari material ini berasal dari PO mana.

**Yang Diminta:**

- Nomor PO tampil di form dan bisa dilihat oleh bagian gudang
- Jika auto-increment, nomor tetap ditampilkan di form agar bisa direferensikan saat penerimaan barang di gudang

**Update yang Dilakukan:**

- Tambah field **"No. PO"** di form buat PO dengan tombol `↻` untuk auto-generate (format: `PO-YYYY-NNN` urutan dari PO terakhir)
- No. PO bisa diedit manual jika perlu
- Tambah field `poNumber` ke interface `PurchaseOrder`
- List PO (`/purchasing/po`) — kolom "No. PO" menampilkan `poNumber` jika ada, fallback ke `id`
- **Commit:** `4ca6f5c` (Sprint 2)

---

#### P4 — Purchase Order: Upload Gambar / Attachment

**Komentar Klien:**

> Add images pada kolom Purchase Order belum ada.

**Yang Diminta:**

- Fitur upload gambar atau attachment dokumen pada form Purchase Order

**Update yang Dilakukan:**

- Tambah card **"Lampiran"** di form PO (`/purchasing/po/create`) dengan tombol "Pilih File"
- Mendukung upload multiple file (PDF, gambar) — tersimpan sebagai metadata (nama, ukuran, tipe) di localStorage
- Daftar lampiran tampil di bawah tombol: ikon, nama file, ukuran, tombol hapus per file
- Tambah field `attachments?: Array<{name, size, type}>` ke interface `PurchaseOrder`
- **Commit:** `4ca6f5c` (Sprint 3)

---

#### P5 — Purchase Order: Print Preview

**Komentar Klien:**

> Print preview Form Purchase apakah bisa?

**Yang Diminta:**

- Tombol Print Preview di halaman detail PO
- Tampilan print-friendly: header perusahaan, tabel item, kolom harga, tanda tangan

**Update yang Dilakukan:**

- Tambah tombol **"Cetak Preview"** di form PO (`/purchasing/po/create`)
- Klik membuka tab/window baru dengan dokumen PO lengkap dalam format cetak:
  - Header: nama perusahaan, logo, alamat, No. PO, tanggal, supplier
  - Tabel item: kode, nama, qty, satuan, harga satuan, total
  - Baris DPP, PPN 12%, Grand Total
  - Blok tanda tangan 4 kolom: Purchasing / Accounting / Manager / Direktur Utama
- Menggunakan `window.open()` + `document.write()` — tidak menginterupsi tampilan utama
- **Commit:** `4ca6f5c` (Sprint 3)

---

### GRUP S — Subkontrak: Revisi Alur

---

#### S1 — Form Subkontrak: Kolom Qty, No SO, Satuan

**Komentar Klien:**

> Pada saat pembuatan subkontrak tidak ada qty, no SO, dan satuan yang akan di-subkonkan.

**Yang Diminta:**

- Tambah kolom di form pembuatan job subkontrak: Qty yang disubkonkan, No SO referensi, Satuan

**Update yang Dilakukan:**

- Tambah field **"No. SO Referensi"** di form buat job subkontrak (`/production/subkontrak`)
- Redesign form BB items: dari tabel sempit menjadi **card per item** dengan layout 2-baris — baris 1: Kode BB + Nama Bahan; baris 2: Qty + Satuan + Fasilitas (KITE/Non-KITE)
- Form dialog menggunakan `max-w-2xl` agar tidak cramped
- Tambah field `noSO?: string` ke interface `SubkonRecord`
- **Commit:** `4ca6f5c` (Sprint 3)

---

#### S2 — Kirim BB ke Subkon Tidak Bisa

**Komentar Klien:**

> Buat nama subkon dimana? Pada saat pengeluaran material subkon apakah di daftar menu job subkon, jika iya (untuk kirim BB subkon tidak bisa).

**Yang Diminta:**

- Alur kirim bahan baku ke subkontraktor dari menu Job Subkon harus berfungsi
- Perlu ada field nama subkontraktor yang bisa diisi / dipilih saat membuat job subkon

**Update yang Dilakukan:**

- Tombol **"Kirim BB ke Subkon"** di halaman `/production/subkontrak` (untuk job berstatus Draft) sekarang membuka dialog konfirmasi kirim
- Dialog input: No. Surat Jalan, No. SUBK KITE 1.1, Tanggal Kirim
- Setelah konfirmasi: status job berubah ke "BB Dikirim", field `suratJalanNo`, `subkKiteKirimNo`, `subkKiteKirimTgl` otomatis terisi
- Nama subkontraktor bisa dipilih dari dropdown master data (`MOCK_SUBKON_MASTER`) atau diisi bebas saat buat job baru
- **Commit:** `4ca6f5c` (Sprint 3)

---

#### S3 — WIP "Keluarkan ke Proses": Tidak Ada Nama Supplier

**Komentar Klien:**

> Pengeluaran material yang disubkonkan apakah di gudang WIP di menu keluarkan ke proses itu? Jika iya tidak ada nama supplier-nya. Atau menu ini dipakai untuk mengeluarkan material ke produksi.

**Klarifikasi dari Klien (19/05/2026):**

Menu "Keluarkan ke Proses" di Gudang WIP dipakai untuk **keduanya** — pengeluaran ke CMT/maklon (subkontrak) maupun pengeluaran ke produksi JKJ sendiri. Ini adalah satu menu terpadu.

**Yang Diminta:**

- Tambah field **"Tujuan Pengeluaran"**: dropdown pilihan antara `Produksi Internal` / `CMT` / `Maklon`
- Jika dipilih `CMT` atau `Maklon`: muncul field nama supplier / subkontraktor (wajib diisi)
- Jika dipilih `Produksi Internal`: field supplier disembunyikan

**Update yang Dilakukan:**

- Tambah field **"Tujuan Pengeluaran"** di dialog "Keluarkan ke Proses" (`/warehouse/wip`): dropdown dengan opsi `Produksi Internal` / `CMT` / `Maklon`
- Jika dipilih `CMT` atau `Maklon`: muncul field **"Nama Supplier / Subkon Tujuan"** (wajib diisi, free-text)
- Jika dipilih `Produksi Internal`: field supplier disembunyikan secara otomatis (conditional rendering)
- State `keluarForm` ditambah field `supplier: ''` untuk menyimpan nilai nama supplier
- **Commit:** `4ca6f5c` (Sprint 4)

---

### GRUP E — PEB: Field Tambahan

---

#### E1 — PEB: No Invoice dan Tanggal Invoice

**Komentar Klien:**

> Di PEB tidak ada No Invoice dan tanggal invoice.

**Yang Diminta:**

- Tambah field "No Invoice" dan "Tanggal Invoice" di form PEB
- Field ini penting untuk dokumen ekspor yang lengkap

**Update yang Dilakukan:**

- Tambah field **"No Invoice"** dan **"Tanggal Invoice"** di form buat PEB (`/logistics/peb/new`) — ditampilkan di section dokumen header bersama No. PEB dan Tanggal Ekspor
- Kedua field ditampilkan pula di halaman detail PEB (`/logistics/peb/[id]`)
- Tambah field `noInvoice?: string` dan `tglInvoice?: string` ke interface `PEBDocument`
- **Commit:** `4ca6f5c` (Sprint 4)

---

### GRUP A — Akunting: Pengembangan Modul

---

#### A1 — AR/AP: Input Pembayaran & Detail View

**Komentar Klien:**

> Tidak diketemukan icon untuk menginput pembayaran hutang / penerimaan piutang, tidak bisa melihat detail pembayaran hutang piutangnya, hanya ada icon untuk input new invoice.

**Yang Diminta:**

- Tombol / icon untuk **input pembayaran** di halaman AR (penerimaan piutang) dan AP (pembayaran hutang)
- Bisa melihat **detail pembayaran** per invoice: tanggal bayar, jumlah, sisa outstanding
- Tampilan terpisah antara: input invoice baru vs record pembayaran

**Update yang Dilakukan:**

- Halaman **AR** (`/finance/ar`): tambah tombol **"Terima Bayar"** (biru) per baris invoice — hanya muncul jika `balance > 0 && status !== 'PAID'`
- Halaman **AP** (`/finance/ap`): tambah tombol **"Bayar"** (hijau) per baris invoice — hanya muncul jika `balance > 0 && status !== 'PAID'`
- Dialog input pembayaran (sama di AR dan AP):
  - Field: Tanggal Pembayaran, Nominal Dibayar (pre-fill dari `balance`), Metode (Transfer Bank / Kas / Cek / Giro), No. Referensi, Catatan
  - Kalkulasi otomatis: `newPaid = paidAmount + amount`, `newBalance = max(0, total - newPaid)`
  - Status otomatis: `PAID` jika `newBalance = 0`; `PARTIALLY_PAID` (AR) / `SCHEDULED` (AP) jika ada sisa
- Kolom **"Aksi"** baru ditambahkan di tabel AR (colSpan 10) dan AP (colSpan 11)
- Fungsi `updateInvoice` ditambahkan ke `useARInvoices` dan `useAPInvoices`
- **Commit:** `4ca6f5c` (Sprint 4)

---

#### A2 — Transaksi: Kolom Mata Uang (USD, KRW)

**Komentar Klien:**

> Penginputan transaksi: tidak ada kolom currencynya, padahal sebagian transaksi menggunakan USD dan KRW.

**Yang Diminta:**

- Tambah field mata uang di form input transaksi kas/bank
- Minimal: IDR, USD, KRW
- Tampilkan nilai asli + nilai IDR (dari kurs yang diinput)

**Update yang Dilakukan:**

- Halaman AP (`/finance/ap`): tambah 3 field opsional ke interface `APInvoice` — `currency?: 'IDR' | 'USD' | 'KRW'`, `exchangeRate?: number`, `originalAmount?: number`
- Kolom **"Total Amount"** di tabel AP menampilkan nilai asli + tag mata uang jika bukan IDR (contoh: `USD 5,000` → ditampilkan dengan badge mata uang)
- Konstanta `CURRENCY_SYMBOL` memetakan IDR → `Rp`, USD → `$`, KRW → `₩`
- Nilai yang disimpan ke store tetap dalam IDR (originalAmount × exchangeRate)
- **Commit:** `4ca6f5c` (Sprint 4)

---

#### A3 — Chart of Accounts: Form Input Akun Baru

**Komentar Klien:**

> Penginputan Akun: akun yang diinput belum ada tempatnya, hanya ada saldo akun, tambahkan untuk icon penambahan akun.

**Yang Diminta:**

- Tambah tombol / form untuk **menambah akun baru** di halaman Chart of Accounts / Saldo Akun
- Saat ini halaman hanya menampilkan saldo akun yang sudah ada — perlu bisa tambah akun baru secara manual

**Update yang Dilakukan:**

- Buat store baru **`lib/store/useChartOfAccounts.ts`** — localStorage-backed, interface `AkunCOA` (id, kode, nama, tipe, subTipe, keterangan), seed 49 akun standar (1xxx–5xxx)
- Halaman `/finance/accounts` dirombak menjadi **3 tab**:
  - Tab **"Saldo Awal"** — konten existing tidak berubah
  - Tab **"Bagan Akun"** — tabel CoA lengkap dengan:
    - Filter dropdown per tipe (Semua / Aset / Kewajiban / Ekuitas / Pendapatan / Beban)
    - Search by kode atau nama akun
    - Form inline tambah akun baru: kode, nama, tipe, subTipe (opsional), keterangan (opsional)
    - Tombol hapus per baris (tidak bisa hapus akun yang di-seed)
  - Tab **"Valuasi Stok"** — lihat A4
- Ekspor `useChartOfAccounts` dan type `AkunCOA`, `AkunTipe` dari `lib/store/hooks.ts`
- **Commit:** `4ca6f5c` (Sprint 4)

---

#### A4 — Stock Valuation di Tab Akunting dan Reports

**Komentar Klien:**

> STOCK: untuk melihat stock bahan & barang (qty, nilai satuan dan total nilai barang) belum ada di tab acc, atau memang letaknya bukan di tab acc?

**Klarifikasi dari Klien (19/05/2026):**

Stock valuation perlu ada di **dua tempat**:
1. **Tab Akunting** — ringkasan nilai inventori (card/widget) untuk gambaran cepat
2. **Tab Reports** — laporan lengkap yang bisa difilter per kategori, per material, dan di-export

**Yang Diminta:**

- Di `/finance` (tab Akunting): card/widget "Nilai Inventori" — total nilai RM, WIP, FG secara ringkas
- Di `/reports` (tab Reports): halaman laporan Stock Valuation lengkap — kolom: kode, nama, kategori, qty on hand, nilai satuan, total nilai; bisa filter & export Excel

**Update yang Dilakukan:**

- Tab **"Valuasi Stok"** ditambahkan di halaman `/finance/accounts` (tab ke-3 dari A3)
- Menampilkan stok dari `useStock()` yang dikelompokkan per kategori: Bahan Baku (BB) / Barang Jadi (FG) / WIP / Packaging
- Setiap item: kode material, nama, qty on hand, harga satuan (hardcoded `HARGA_SATUAN`), **total nilai** (qty × harga)
- Subtotal nilai per kategori + **Grand Total** seluruh inventori
- Konstanta `HARGA_SATUAN` memetakan kode material ke harga (contoh: RM-LATEX → Rp 15.000/kg, FG-LATEX-M → Rp 85.000/pcs)
- **Commit:** `4ca6f5c` (Sprint 4)

---

### GRUP W — Warehouse Outbound

---

#### W1 — Input Hasil Barang Jadi di Outbound Belum Bisa

**Komentar Klien:**

> Belum bisa input hasil barang jadi di warehouse outbound (mungkin karena proses sebelumnya belum selesai jadi belum tampil).

**Yang Diminta:**

- Form input barang jadi ke Warehouse Outbound harus bisa digunakan
- Kemungkinan besar bergantung pada perbaikan B3 (penerimaan material tidak tampil)

**Catatan:** Periksa dulu apakah ini resolved setelah B3 diperbaiki.

**Update yang Dilakukan:**

- **Root cause**: Tab "Input Barang Jadi" kosong karena satu-satunya WO COMPLETED (`WO-2026-003`) sudah ada di seed `useFGReceipts` — filter `wo.status === 'COMPLETED' && !receivedWoIds.has(wo.id)` menghasilkan list kosong
- **Fix**: Tambah `WO-2026-004` ke `MOCK_WORK_ORDERS` (`lib/mock-data/production.ts`) — status COMPLETED, belum ada di seed FGReceipts — sehingga WO tersebut muncul di antrian "Input Barang Jadi"
- Tab "Input Barang Jadi" sekarang menampilkan WO-2026-004 (Latex Size M, 1.500 karton, Line B) dengan tombol "Terima ke Gudang"
- **Commit:** `4ca6f5c` (Sprint 4)

---

## Ringkasan Status — Revisi Batch 3 (Mei 2026)

| #  | Area                                              | Prioritas | Status     |
| -- | ------------------------------------------------- | --------- | ---------- |
| B1 | Supplier baru tidak tersimpan                     | Kritis    | ✅ Selesai (`4ca6f5c`) |
| B2 | PO setelah submit tidak tampil                    | Kritis    | ✅ Selesai (`4ca6f5c`) |
| B3 | Penerimaan material tidak terlihat setelah save   | Kritis    | ✅ Selesai (`4ca6f5c`) |
| P1 | PO multi-currency (USD, KRW)                      | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| P2 | PO kode material / kode barang                    | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| P3 | PO nomor PO (kolom + visibility ke gudang)        | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| P4 | PO upload gambar / attachment                     | Sedang    | ✅ Selesai (`4ca6f5c`) |
| P5 | PO print preview                                  | Sedang    | ✅ Selesai (`4ca6f5c`) |
| S1 | Subkontrak: tambah qty, no SO, satuan             | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| S2 | Subkontrak: kirim BB ke subkon tidak bisa         | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| S3 | WIP keluarkan ke proses: field Tujuan + nama supplier (CMT/Maklon/Internal) | Sedang | ✅ Selesai (`4ca6f5c`) |
| E1 | PEB: tambah No Invoice & Tanggal Invoice          | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| A1 | AR/AP: input pembayaran & detail view             | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| A2 | Transaksi: kolom mata uang (USD, KRW)             | Tinggi    | ✅ Selesai (`4ca6f5c`) |
| A3 | Chart of Accounts: form input akun baru           | Sedang    | ✅ Selesai (`4ca6f5c`) |
| A4 | Stock valuation: widget di tab Akunting + laporan lengkap di Reports | Sedang | ✅ Selesai (`4ca6f5c`) |
| W1 | Warehouse Outbound: input BJ                      | Sedang    | ✅ Selesai (`4ca6f5c`) |

---

_Laporan pertama dibuat: April 17, 2026_  
_Diperbarui: Mei 4, 2026 (tambah revisi KITE K1–K9)_  
_Diperbarui: Mei 5, 2026 (tambah revisi lanjutan M1–M5)_  
_Diperbarui: Mei 19, 2026 (tambah revisi Batch 3 B1–B3, P1–P5, S1–S3, E1, A1–A4, W1)_  
_Diperbarui: Mei 20, 2026 (tandai semua Batch 3 selesai — commit 4ca6f5c)_
