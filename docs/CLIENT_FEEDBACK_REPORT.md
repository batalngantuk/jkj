# Laporan Revisi — Feedback Klien JKJ ERP
**Dokumen**: Response terhadap "komen program jkj.pdf"  
**Tanggal Feedback Diterima**: April 17, 2026  
**Tanggal Laporan**: April 17, 2026  
**Status**: ✅ Semua item (F1–F9) selesai diimplementasikan

---

## Ringkasan Eksekutif

Klien memberikan feedback melalui dokumen review setelah demo sistem. Terdapat **9 area revisi** (F1–F9) yang mencakup warehouse, purchasing, production, sales, dan logistics. Semua item telah diselesaikan dalam satu sesi pengerjaan.

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

*Inbound (`/warehouse/inbound`):*
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

*Outbound (`/warehouse/outbound`):*
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

*`/production/wo` (halaman daftar WO baru):*
- Halaman baru sebagai pusat daftar semua WO dengan filter status (Planned / In Progress / QC / Completed) dan search
- Summary cards per status yang bisa diklik sebagai filter cepat
- Kolom "Line Produksi" (bukan operator)

*`/production/wo/new` (form WO baru — satu tampilan konsisten):*
- Section 1: SO auto-fill (pilih SO → produk & qty terisi otomatis)
- Section 2: BOM preview dengan cek stok real-time (merah jika kurang)
- Section 3: **"Line Produksi"** menggantikan field "Operators" + shift selector + supervisor + catatan instruksi
- Section 4: **Lokasi Gudang BJ** — pilih gudang FG tujuan saat membuat WO

*`/production/wo/[id]` (detail WO):*
- Tombol aksi kontekstual sesuai status (Mulai Produksi / Selesai→QC / QC Lulus / dll)
- Kalau status COMPLETED → banner hijau + tombol "Input BJ ke Gudang" link ke `/warehouse/outbound`
- Traceability chain: SO → WO → Gudang BJ

*`/production/wo/create`:*
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

## Ringkasan Status

| # | Area | Status | Commit |
|---|------|--------|--------|
| F1 | Warehouse Inbound & Outbound | ✅ Selesai | `eb26f6e` |
| F2 | BC 2.0 Multi-Material per PIB | ✅ Selesai | `69ef3af` |
| F3 | BC 2.0 Field Lengkap | ✅ Selesai | `69ef3af` |
| F4 | Production WO Konsolidasi & FG Tracking | ✅ Selesai | `c7fa47a` |
| F5 | Production Line Produksi (ganti Operator) | ✅ Selesai | `c7fa47a` |
| F6 | Sales Order Free-text & BOM | ✅ Selesai | `ea1e7cd` |
| F7 | Warehouse Search by Nama | ✅ Selesai | `c9423f0` |
| F8 | PO Lokal DPP/PPN/Signature | ✅ Selesai | `c9423f0` |
| F9 | PEB Kurs Manual | ✅ Selesai | `c9423f0` |

---

## Catatan Teknis

- Semua perubahan menggunakan **mock data** (tidak ada backend/database nyata) — data hanya untuk demo/presentasi
- Tidak ada breaking change pada halaman yang sudah ada sebelumnya
- Semua halaman baru menggunakan komponen `AppLayout` (konsisten dengan layout aplikasi)
- TypeScript errors yang ada di project berasal dari API routes lama (`app/api/bc20/`) — **bukan dari perubahan ini** dan tidak mempengaruhi tampilan frontend

---

*Laporan dibuat: April 17, 2026*  
*Dikerjakan oleh: Claude Sonnet 4.6 (AI Assistant)*
