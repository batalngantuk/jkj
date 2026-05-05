# Laporan Revisi — Feedback Klien JKJ ERP

**Dokumen**: Response terhadap "komen program jkj.pdf"  
**Tanggal Feedback Diterima**: April 17, 2026  
**Tanggal Laporan Terakhir**: Mei 5, 2026  
**Status**: ✅ Semua item (F1–F9) selesai | ✅ Semua revisi KITE (K1–K9) selesai | ✅ Semua revisi lanjutan (M1–M5) selesai

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

_Laporan pertama dibuat: April 17, 2026_  
_Diperbarui: Mei 4, 2026 (tambah revisi KITE K1–K9)_  
_Diperbarui: Mei 5, 2026 (tambah revisi lanjutan M1–M5)_
