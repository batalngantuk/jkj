# FAQ — Pertanyaan Klien JKJ ERP

**Dokumen ini menjawab pertanyaan-pertanyaan operasional yang sering muncul dari penggunaan sistem.**  
**Terakhir diperbarui:** 13 Agustus 2026

---

## Daftar Pertanyaan (Klik untuk Langsung ke Jawaban)

### Purchasing & PO
1. [Lampiran PO tidak muncul setelah di-approved — di mana?](#1-filelampiranpotidakmuncul)
2. [Satuan "prs", "mtr", "sf", "yard", "tne", "pce" — di mana tambahnya?](#2-satuanprs-mtr-sf)
3. [Revisi qty PO yang sudah berjalan — bisa?](#3-revisi-qty-po)
4. [Terima barang dari PO — pakai cara mana? Cara 1 vs Cara 2?](#4-cara1-vs-cara2-penerimaan)
5. [GR yang salah — bisa diedit atau dihapus?](#5-edit-hapus-gr)

### Sales Order
6. [SO bisa punya 2 satuan berbeda dalam 1 order?](#6-so-2-satuan)
7. [Tombol "Edit Order" tidak bisa diklik](#7-edit-order-so)

### Keuangan (AR / AP / Jurnal)
8. [AR & AP — tipe invoice apa saja? BC3.0, Loc, BC2.4?](#8-tipe-invoice)
9. [AR & AP — "New Invoice" untuk ekspor/impor atau lokal saja?](#9-new-invoice-mata-uang)
10. [Dialog pembayaran AR/AP — bagaimana dengan currency dan kurs?](#10-dialog-pembayaran-kurs)
11. [Jurnal — apa perbedaan "Kategori" dan "Akun"?](#11-jurnal-kategori-akun)
12. [Tax Assets — apa itu "Available"? Apakah terhubung ke Dual Billing?](#12-tax-assets-available)
13. [Penjualan material lokal tidak muncul di laporan keuangan](#13-penjualan-lokal-laporan)

### Subkontrak / CMT
14. [Nama subkontraktor tidak bisa input manual — di mana?](#14-nama-subkon-manual)
15. [Section "Bahan Baku yang Dikirimkan" di form job subkon — wajib diisi?](#15-bb-form-job-subkon)
16. ["Keluarkan WIP ke Proses" — apakah ini untuk kirim BB ke CMT?](#16-keluarkan-wip-vs-kirim-subkon)
17. ["WO / Proses Tujuan" di Keluarkan WIP — apa yang diisi?](#17-wo-proses-tujuan)
18. [Input barang jadi dari CMT — di mana?](#18-input-bj-dari-cmt)
19. [Input BJ harus menunggu semua material diinput dulu?](#19-input-bj-tidak-tunggu-material)
20. [Print dokumen SUBK KITE 1.1 dan 1.2 — di mana?](#20-print-subk-kite)

### Warning / Validasi Qty
21. [Apakah ada warning jika qty melebihi batas?](#21-warning-qty)
22. [Jika qty SO perlu direvisi setelah over-quantity — bisa?](#22-revisi-qty-so)

### Laporan KITE
23. [Laporan IT Inventory — perlu diinput ulang setiap bulan?](#23-it-inventory-otomatis)
24. [Laporan Mutasi HP (Lap 7) tidak update setelah buat PEB](#24-mutasi-hp-peb)

### Produksi & Work Order
25. [Pengeluaran material gudang ke produksi dan CMT — di mana?](#25-pengeluaran-material)
26. [Work Order — dibuat setelah SO? Apa itu "Produk" di WO?](#26-wo-setelah-so)
27. [WO ada di Sales Order dan di Production — harus buat di keduanya?](#27-wo-di-so-vs-production)
28. [Material subkon kembali jadi WIP — masuk laporan KITE nomor berapa?](#28-material-subkon-kite)
29. [BOM tidak bisa diedit setelah WO dibuat atau salah klik Enter](#29-edit-bom-wo)

### Logistics & PEB
30. [Form penjualan material lokal (BC 4.0) — di mana?](#30-bc40-di-mana)
31. [Alur PEB dari awal sampai laporan KITE terisi — bagaimana?](#31-alur-peb)
32. [Hapus PEB yang salah dibuat — bisa?](#32-hapus-peb)

### Gudang — Pengeluaran BB
33. [Pengeluaran BB yang salah — bisa diedit atau dihapus?](#33-edit-hapus-pengeluaran-bb)

### Waste
34. [Di form waste — di mana field No. BC 2.4 dan Mata Uang?](#34-waste-bc24-matauang)

### Troubleshooting
35. [Dialog form tidak bisa di-scroll / konten terpotong](#35-dialog-scroll)

---

## 📦 PURCHASING & PURCHASE ORDER

---

### 1. File/lampiran yang diupload di PO tidak muncul setelah di-approved — di mana lihatnya?

File lampiran **tersimpan** di sistem, tapi tidak ditampilkan di dalam form PO setelah disimpan. Cara melihatnya:

1. Buka `/purchasing/po` (daftar PO)
2. Cari PO yang bersangkutan
3. Di kolom **Aksi** paling kanan, cari ikon **📎 (paperclip)** dengan badge angka merah kecil
4. Klik ikon tersebut → daftar lampiran (nama file, ukuran, tipe) akan muncul

> **Catatan:** File yang terupload hanya menyimpan metadata (nama, ukuran, tipe). File asli tidak tersimpan di server — ini adalah batasan sistem demo saat ini.

---

### 2. Satuan "prs", "mtr", "sf", "yard" di mana tambahnya?

Satuan-satuan ini **sudah tersedia** di semua form yang relevan — tidak perlu menambah master satuan secara terpisah.

| Form | Satuan yang tersedia |
|------|---------------------|
| SO (line item) | Carton, Box, Pcs, **Prs**, KG, Unit, Roll, **Yard (yd)**, **SF** |
| PO create (item) | kg, pcs, **prs**, ctn, liter, unit, roll, **yard (yd)**, **sf** |
| SO BOM material | kg, gram, liter, pcs, **prs**, m, m², roll, unit, **yard**, **sf** |
| Subkontrak BB | KG, **MTR**, LITER, PCS, ROLL, CTN, **YARD**, **SF** |
| WIP Terima | kg, **mtr**, batch, liter, pcs, ctn, roll, **sf**, **yard** |

Jika dalam 1 PO ada item dengan satuan berbeda (misal: item 1 = prs, item 2 = pcs) — **bisa**, karena setiap baris item punya dropdown satuan sendiri.

---

### 3. Revisi qty PO yang sudah berjalan — bisa tidak?

**Bisa.** Caranya:

1. Buka `/purchasing/po`
2. Cari PO yang ingin direvisi (status harus **APPROVED** atau **PARTIAL**)
3. Klik ikon **pensil kuning** di kolom Aksi
4. Dialog revisi muncul: tampil semua item + input qty baru per item + kolom alasan revisi
5. Klik **"Simpan Revisi"** → total PO otomatis dihitung ulang

---

### 4. Terima barang dari PO — pakai cara mana? Cara 1 vs Cara 2?

Ada dua cara input penerimaan barang (GR):

| | Cara 1 — "+ Input Penerimaan Barang" | Cara 2 — Tab Antrian PO → Terima |
|---|---|---|
| Cocok untuk | Penerimaan yang tidak terkait PO terdaftar | Penerimaan dari PO yang sudah ada di sistem |
| Terhubung ke PO | ❌ Input bebas | ✅ Otomatis tahu nomor PO |
| Info sisa parsial | ❌ Tidak ada | ✅ Tampil qty sudah diterima + sisa |
| Warning over qty | ❌ Tidak ada | ✅ Border merah + keterangan sisa |
| Masuk KITE Lap 1 | ✅ Ya | ✅ Ya |

**Rekomendasi:** gunakan **Cara 2 (Antrian PO → Terima)** untuk semua penerimaan dari PO terdaftar — lebih akurat dan ada validasi parsial.

---

### 5. GR yang salah — bisa diedit atau dihapus?

**Bisa keduanya.**

- **Edit**: klik ikon **pensil** di baris GR di daftar Inbound → dialog edit terbuka → ubah qty diterima per item → simpan
- **Hapus**: klik ikon **tong sampah** → konfirmasi → GR terhapus dan **stok otomatis dikurangi kembali**

---

## 💼 SALES ORDER

---

### 6. SO bisa punya 2 satuan berbeda dalam 1 order? (misal: 100 pce + 50 prs)

**Bisa.** Saat membuat SO di `/sales/new`, form sudah mendukung **multi-line item**. Setiap baris punya dropdown satuan sendiri. Contoh:
- Baris 1: SYNTHETIC — 100 qty — **pce** — USD 5
- Baris 2: SYNTHETIC B — 50 qty — **prs** — USD 4.5

Keduanya tersimpan sebagai 1 SO dengan 2 item. Di daftar SO, kolom Qty akan menampilkan tiap baris secara terpisah.

---

### 7. Tombol "Edit Order" di halaman detail SO tidak bisa diklik

Sudah diperbaiki. Klik tombol **"Edit Order"** (hanya muncul untuk SO status **DRAFT**) → dialog edit terbuka dengan field:
- Qty
- Harga Satuan
- Tanggal Pengiriman

Simpan → total otomatis dihitung ulang dan history SO dicatat.

---

## 💰 KEUANGAN (AR / AP / JURNAL)

---

### 8. AR & AP — tipe invoice apa saja? Apa bedanya BC3.0, Loc, dan BC2.4?

Setiap invoice AR/AP punya pilihan **tipe dokumen**:

| Tipe | Nama | Digunakan untuk |
|------|------|----------------|
| **BC3.0** | Ekspor | Invoice penjualan ke luar negeri (ekspor) |
| **Loc** | Lokal | Invoice penjualan/pembelian dalam negeri biasa |
| **BC2.4** | Kawasan Berikat | Invoice penjualan material dari kawasan berikat ke pembeli lokal |

Tipe ini hanya untuk penandaan dokumen — tidak mempengaruhi kalkulasi otomatis saat ini. Pilih sesuai jenis transaksi agar rekap laporan akurat.

---

### 9. AR & AP — "New Invoice" itu untuk ekspor/impor atau lokal saja?

**Untuk semua jenis** — lokal, ekspor, maupun impor. Tidak ada pembatasan.

Perbedaannya ada di pilihan **Mata Uang**:
- Invoice **lokal** → pilih IDR, tidak perlu isi kurs
- Invoice **ekspor/impor** → pilih USD atau KRW → isi kurs → sistem menampilkan nilai asli + konversi IDR

Kolom "Total Amount" di daftar AP akan menampilkan tag mata uang (misal: `USD 5,000`) jika invoice bukan IDR.

---

### 10. Di dialog pembayaran AR/AP — bagaimana dengan currency dan kurs?

Saat klik tombol **"Terima Bayar"** (AR) atau **"Bayar"** (AP) untuk invoice non-IDR:

1. Sistem menampilkan mata uang invoice dan kurs saat invoice dibuat
2. Anda bisa mengisi **"Kurs Bayar/Terima"** sesuai kurs aktual pada tanggal pembayaran
3. Nominal IDR otomatis dihitung: `originalAmount × kurs bayar`
4. Sistem otomatis menampilkan **selisih kurs**:
   - Selisih positif = **untung kurs** (warna hijau)
   - Selisih negatif = **rugi kurs** (warna merah)

---

### 11. Jurnal — apa perbedaan "Kategori" dan "Akun"?

Ini adalah **2 hal yang berbeda**:

| | Kategori | Akun Lawan |
|-|----------|-----------|
| **Apa** | Jenis transaksi secara umum | Akun spesifik dari Chart of Accounts |
| **Pilihan** | 3 opsi: Penerimaan Kas/Bank / Pengeluaran Kas/Bank / Transaksi Umum | 49 akun COA (dikelompokkan: Aset, Kewajiban, Ekuitas, Pendapatan, Beban) |
| **Contoh** | Pengeluaran Kas/Bank | 5-0100 — Beban Gaji & Tunjangan |

**Cara input jurnal dengan benar:**
1. Pilih **Kategori** (misal: Pengeluaran Kas/Bank)
2. Pilih **Akun Kas/Bank**: Kas atau Bank (akun yang berkurang/bertambah)
3. Pilih **Akun Lawan**: akun dari COA yang menjadi offset (misal: Beban Gaji)
4. Isi Mata Uang (IDR/USD/KRW) + Kurs jika transaksi valas
5. Isi Nominal + Keterangan

---

### 12. Tax Assets — apa itu "Available"? Apakah terhubung ke Dual Billing?

**Penjelasan "Available":**

Tax Assets (PPN Import dan PPh 22) adalah **kredit pajak** yang sudah dibayar ke Bea Cukai saat impor. Status "AVAILABLE" berarti kredit ini **sudah dibayar tapi belum digunakan** untuk mengoffset kewajiban pajak lainnya.

- **PPN Import (Available)** = bisa digunakan untuk mengoffset PPN Keluaran (dari penjualan domestik) di laporan rekonsiliasi bulanan
- **PPh 22 Import (Available)** = bisa dikreditkan saat bayar PPh Badan tahunan

**Cara mencatat pemakaian** → `/finance/tax-assets`:
1. Klik tombol **"Catat Pemakaian"** pada baris asset yang ingin digunakan
2. Isi: tanggal, jumlah yang dipakai, keterangan (misal: "Offset PPN Keluaran Mei 2026")
3. Simpan → saldo Available berkurang, riwayat pemakaian tercatat

**Koneksi ke Dual Billing:**  
Saat ini koneksinya masih **manual** — tidak otomatis. Alurnya:
1. Bayar PPh 22 via Dual Billing BC 2.0 (di `/finance/ap/dual-billing`)
2. Setelah dibayar, catat secara manual di Tax Assets dengan klik "Catat Pemakaian"
3. Referensikan ke nomor BC 2.0 yang bersangkutan di kolom Keterangan

---

### 13. Penjualan material lokal tidak muncul di laporan keuangan

Pastikan dokumen penjualan lokal sudah berstatus **Approved** (bukan Draft):

1. Buka **Logistics → Penjualan Lokal** → cari dokumen yang bersangkutan
2. Buka detail → klik tombol **"Approve"**
3. Setelah status berubah ke Approved, nilai akan muncul di:
   - **Finance → Laporan Keuangan (P&L)** sebagai baris "Penjualan Material Lokal (BC 2.4)"
   - **Reports → Rekap Penjualan** sebagai baris dengan tipe "Lokal"

---

## 🏭 SUBKONTRAK / CMT

---

### 14. Nama subkontraktor tidak bisa input manual — di mana membuatnya?

Sekarang **bisa langsung di form buat job subkon**. Caranya:

1. Buka `/production/subkontrak` → klik **"+ Buat Job Subkontrak Baru"**
2. Di field **"Subkontraktor / CMT"**: klik dropdown
3. Pilih **"+ Input nama baru (manual)..."** (paling bawah di daftar)
4. Ketik nama CMT/subkon baru di field yang muncul
5. Nama yang diketik langsung tersimpan di record job tersebut

> Tidak ada halaman master subkontraktor yang terpisah — nama baru langsung diinput saat membuat job.

---

### 15. Di form job subkon ada section "Bahan Baku yang Dikirimkan" — wajib diisi atau tidak?

**Tidak wajib, tapi dianjurkan diisi sebagai estimasi/rencana.**

Penjelasan perbedaan dua tempat:

| | BB di Form Job Subkon | Keluarkan WIP ke Proses |
|-|-----------------------|------------------------|
| **Tujuan** | Mencatat **rencana/estimasi** BB yang akan dikirim ke CMT | Mencatat **pengeluaran aktual fisik** dari stok WIP |
| **Kapan** | Saat membuat job (di awal) | Saat BB benar-benar keluar dari gudang |
| **Sumber data** | Input manual | Dari stok WIP yang ada di sistem |
| **Wajib?** | Tidak wajib | Tidak wajib |

**Rekomendasi alur CMT yang benar:**
1. Buat job subkon → isi estimasi BB (opsional)
2. Kirim BB ke CMT → klik **"Kirim BB ke Subkon"** di detail job (status Draft)
3. BB fisik keluar dari gudang → catat di **Gudang WIP** (jika BB adalah WIP) atau di Gudang Inbound (jika BB langsung dari stok BB)
4. Terima hasil dari CMT → klik **"Terima Hasil dari CMT"** di detail job

---

### 16. "Keluarkan WIP ke Proses Berikutnya" — apakah ini untuk kirim BB ke CMT?

**Tidak sepenuhnya.** Ini adalah dua hal yang berbeda:

| | Keluarkan WIP ke Proses | Kirim BB ke Subkon (di job subkon) |
|-|------------------------|-----------------------------------|
| **Untuk** | Barang **setengah jadi** (WIP): Compound Post-Mixing, Dipped Size M, dll | BB (bahan baku mentah): label, CT-0402, kain, dll |
| **Stok yang dipakai** | Stok kategori **WIP** di Gudang WIP | Stok kategori **BB** di Gudang BB |
| **Ditemukan di** | `/warehouse/wip` → dialog Keluarkan | `/production/subkontrak` → tombol "Kirim BB ke Subkon" |

**Mengapa CT-0402 / label tidak muncul di "Pilih Item WIP"?**  
Karena CT-0402 dan label adalah **Bahan Baku (BB)**, bukan WIP. Item di "Pilih Item WIP" hanya menampilkan barang yang sudah melalui proses produksi (Post-Mixing, Post-Dipping, dll). BB mentah tidak akan muncul di sana.

---

### 17. "WO / Proses Tujuan" di dialog Keluarkan WIP — apa yang diisi?

Field **"WO / Proses Tujuan"** adalah Work Order tujuan untuk **produksi internal JKJ**.

- Jika WIP dikeluarkan ke proses produksi JKJ sendiri → pilih WO yang relevan
- Jika WIP dikeluarkan ke CMT/maklon → pilih **"— Tanpa WO —"** dan isi field **"Nama Supplier / Subkon Tujuan"**

---

### 18. Input barang jadi dari CMT — di mana?

Di halaman **Subkontrak** → detail job yang bersangkutan:

1. Buka `/production/subkontrak`
2. Klik job CMT yang sudah selesai (status: BB Dikirim atau Dalam Proses)
3. Klik tombol hijau **"Terima Hasil dari CMT"**
4. Isi dialog:
   - Tanggal terima
   - No. Surat Jalan masuk
   - No. SUBK KITE 1.2
   - Qty kembali per item
5. Klik **"Konfirmasi Terima Hasil CMT"** → status job → `Hasil Diterima`

---

### 19. Apakah input barang jadi dari CMT/produksi harus menunggu semua material diinput dulu?

**Tidak.** Input barang jadi **tidak bergantung** pada apakah pengeluaran material sudah dicatat atau belum.

Sistem tidak memblokir input BJ hanya karena pengeluaran material belum lengkap diinput. Kedua proses bisa berjalan **independen** — ini untuk mengakomodasi situasi di mana penginputan gudang terlambat tapi barang jadi sudah ada secara fisik.

---

### 20. Print dokumen SUBK KITE 1.1 dan 1.2 — di mana tombolnya?

Tombol print ada di **footer dialog detail Job Subkontrak**:

1. Buka **Produksi → Subkontrak** → klik job yang sudah ada nomor dokumennya
2. Di footer dialog detail, cari tombol:
   - **Print SUBK KITE 1.1** — muncul jika No. SUBK KITE 1.1 (pengiriman BB) sudah diisi
   - **Print SUBK KITE 1.2** — muncul jika No. SUBK KITE 1.2 (penerimaan hasil) sudah diisi
3. Klik → halaman print terbuka di tab baru → klik **Print** atau **Ctrl+P**

Jika tombol tidak muncul, pastikan nomor dokumen sudah diisi saat konfirmasi kirim BB / terima hasil CMT.

---

## ⚠️ WARNING / VALIDASI QTY

---

### 21. Apakah ada warning jika qty yang diinput melebihi batas?

Ya, sistem menampilkan warning di beberapa titik:

| Lokasi | Warning |
|--------|---------|
| Inbound penerimaan | ⚠️ Merah jika qty diterima **> qty dipesan** di PO |
| Inbound penerimaan | ⚠️ Oranye jika qty diterima **< qty dipesan** (kekurangan) |
| Outbound Input BJ | ⚠️ Oranye jika qty accepted **> qty WO** |
| Outbound Kirim ke Customer | ⚠️ Merah jika qty dikirim **> qty SO** |
| PEB (pilih SO referensi) | ⚠️ Oranye jika total PEB **> qty SO** referensi |
| Gudang WIP keluarkan | ⚠️ Merah jika qty dikeluarkan **> stok tersedia** |

Semua warning **bersifat informatif** — tidak memblokir. User tetap bisa lanjut setelah membaca warning.

---

### 22. Jika qty SO perlu direvisi setelah ada over-quantity — bisa?

**Bisa**, dengan 2 cara:

**Cara 1 — Edit SO langsung (status DRAFT):**
1. Buka `/sales/[id]` → klik tombol **"Edit Order"**
2. Ubah Qty dan/atau Harga Satuan
3. Simpan → total dihitung ulang

**Cara 2 — Jika SO sudah melewati DRAFT:**  
Hubungi Admin/Manager untuk approval revisi SO. Admin bisa mengubah status SO dan melakukan edit ulang sesuai kebutuhan.

---

## 📊 LAPORAN KITE

---

### 23. Laporan IT Inventory — apakah perlu diinput ulang setiap bulan?

**Tidak perlu.** Semua 8 laporan **terisi otomatis** dari transaksi yang sudah diinput di modul lain.

Yang perlu dilakukan hanya memastikan transaksi di modul masing-masing sudah diinput dengan benar:

| Transaksi | Trigger laporan |
|-----------|----------------|
| Complete GR di `/warehouse/inbound` | Lap 1 (Pemasukan BB) + Lap 6 (Mutasi BB) |
| Klik "Mulai Produksi" di WO | Lap 2 (Pemakaian BB) |
| Konfirmasi "Kirim BB ke Subkon" | Lap 3 (BB Subkon) |
| Terima FG di `/warehouse/outbound` | Lap 4 (Pemasukan HP) |
| **Approve** PEB di `/logistics/peb/[id]` | Lap 5 (Pengeluaran HP) + Lap 7 (Mutasi HP) |
| Input waste → status "Diajukan BC 2.4" | Lap 8 (Waste/Scrap) |

> **Penting:** Lap 5 dan Lap 7 hanya terupdate setelah PEB berstatus **Approved** — bukan hanya Submitted.

Saat siap lapor ke DJBC: buka `/reports/kite-inventory` → klik **"Export Semua"** → 1 file Excel, 8 sheet.

---

### 24. Laporan Mutasi HP (Lap 7) tidak update setelah membuat PEB — kenapa?

Dua hal yang perlu dicek:

1. **Status PEB harus Approved** — bukan Draft atau Submitted. Buka detail PEB → klik **"Approve"** → baru laporan terupdate.
2. **Kode barang di PEB harus konsisten** — Lap 7 mencocokkan kode barang di Pemasukan HP (dari penerimaan FG) dengan kode di Pengeluaran HP (dari PEB). Jika kode berbeda (misal: nama produk di FG berbeda dengan materialCode di PEB), baris akan tetap muncul tapi dengan saldo yang tidak cocok.

Jika setelah Approve masih tidak muncul, cek ulang kode barang di item PEB — pastikan sama dengan kode yang dipakai saat input FG ke gudang.

---

## ⚙️ PRODUKSI & WORK ORDER

---

### 25. Pengeluaran material gudang ke produksi dan CMT — di mana?

Ada **dua tombol berbeda** di halaman Gudang WIP (`/warehouse/wip`):

| Tombol | Fungsi |
|--------|--------|
| **"Terima dari Produksi"** | Mencatat **masuknya** WIP dari proses produksi sebelumnya ke gudang WIP |
| **"Keluarkan ke Proses"** | Mencatat **keluarnya** WIP ke proses produksi berikutnya atau ke CMT |

Untuk mengeluarkan material ke produksi atau CMT: klik **"Keluarkan ke Proses"** → pilih WIP item → isi qty → isi tujuan (pilih WO atau isi nama CMT secara manual).

> **Catatan:** Tombol ini untuk WIP (bahan setengah jadi). Untuk BB (bahan baku) ke CMT, gunakan menu **Produksi → Subkontrak** → buka job → "Kirim BB ke Subkon".

---

### 26. Work Order — apakah dibuat setelah Sales Order? Apa itu "Produk" di WO?

**Alur yang benar:**
1. Sales menerima order → buat SO di `/sales/new`
2. Manager approve SO
3. Staff Produksi membuka SO yang sudah approved → klik tombol **"Buat Work Order"** (di pojok kanan detail SO)
4. WO otomatis terisi: SO reference, produk dari SO, target qty
5. Isi tanggal mulai/selesai, pilih Line Produksi, pilih Gudang BJ tujuan (FG-A atau FG-B)

**"Produk" di WO = nama produk jadi** yang akan diproduksi. Contoh: `Latex Size M`, `Nitrile Size S`, dll. Ini bukan material, tapi nama finished goods-nya.

**Gudang FG-A vs FG-B:** Pilih sesuai lokasi fisik gudang barang jadi di pabrik. FG-A dan FG-B adalah dua ruangan/area gudang yang berbeda.

---

### 27. WO ada di Sales Order dan di Production — apakah harus dibuat di keduanya?

**Tidak, cukup satu kali.** Ada 2 cara membuat WO yang hasilnya sama:

| Cara | Di mana |
|------|---------|
| Cara 1 (direkomendasikan) | Buka detail SO → klik **"Buat Work Order"** — WO langsung terhubung ke SO tersebut |
| Cara 2 | Buka `/production/work-orders` → klik **"+ Buat WO Baru"** → isi SO reference secara manual |

Pilih salah satu. WO yang muncul di `/production/work-orders` adalah daftar semua WO dari kedua cara di atas.

---

### 28. Material subkon kembali jadi bahan setengah jadi — masuk laporan KITE nomor berapa?

Tergantung pada **jenis barang yang kembali dari CMT**:

| Kondisi | Masuk laporan KITE |
|---------|-------------------|
| BB dikirim ke CMT (keluar dari gudang JKJ) | **Lap 3** (BB Subkontrak — Keluar) |
| Hasil CMT kembali sebagai **WIP** (bahan setengah jadi) | **Lap 6** (Mutasi BB — Masuk WIP) |
| Hasil CMT kembali sebagai **FG** (barang jadi siap ekspor) | **Lap 4** (Pemasukan HP / Barang Jadi) |

Alur pencatatannya:
1. Saat dikirim ke CMT → klik "Kirim BB ke Subkon" di job subkon → otomatis catat Lap 3
2. Saat terima hasil dari CMT → klik "Terima Hasil dari CMT" → otomatis catat Lap 4 atau Lap 6 tergantung kategori item yang diterima

---

### 29. BOM tidak bisa diedit setelah WO dibuat atau salah klik Enter — bagaimana?

Tombol **"Edit BOM"** tersedia di halaman detail WO selama BOM belum terdaftar (field BOM masih kosong):

- Tersedia di **semua status WO** — tidak hanya status PLANNED
- Berguna jika BOM tidak sengaja disimpan kosong (salah klik Enter sebelum mengisi qty)

Caranya:
1. Buka detail WO (`/production/wo/[id]`)
2. Cari section BOM → jika belum ada, tombol **"Edit BOM"** muncul
3. Tambah/isi item BOM → klik **"Simpan BOM"**

Jika BOM sudah tersimpan dengan isi yang salah: hapus item yang salah satu per satu, lalu simpan ulang.

---

## 🚢 LOGISTICS & PEB

---

### 30. Form penjualan material lokal (BC 4.0) — di mana?

Tersedia di menu **Logistics → BC 4.0** (`/logistics/bc40`).

Klik **"Buat BC 4.0 Baru"** untuk membuka form yang mencakup:
- Nomor dan tanggal BC 4.0
- Kantor Pabean
- Data Penjual (NPWP, nama, alamat)
- Dokumen pendukung (No. Faktur Pajak, Packing List, Kontrak)
- Data pengangkutan (jenis kendaraan, no. polisi, surat jalan)
- Data barang (multi-baris: HS code, nama barang, satuan, qty, harga, nilai IDR)

Form ini serupa dengan PEB tapi untuk pemasukan barang dari dalam negeri (lokal) ke kawasan TPB.

---

### 31. Alur PEB dari awal sampai laporan KITE terisi — bagaimana?

1. **Logistics → PEB → "+ Create PEB"** — isi semua field: PEB Number, NPE Number, customer, item barang
2. Klik **"Save Draft"** → status Draft (bisa diedit)
3. Klik **"Submit"** → status Submitted
4. Klik **"Approve"** → status Approved → **Lap 5 (Pengeluaran HP) dan Lap 7 (Mutasi HP) otomatis terisi**

> **Penting:** Laporan KITE hanya terupdate setelah status **Approved** — bukan hanya Submitted.

---

### 32. Hapus PEB yang salah dibuat — bisa?

**Bisa**, untuk PEB berstatus **Draft** atau **Cancelled**:

1. Buka **Logistics → PEB** (daftar PEB)
2. Cari PEB yang ingin dihapus
3. Klik ikon **tong sampah** di sebelah kanan baris → konfirmasi → PEB terhapus

PEB berstatus Submitted/Approved/Exported tidak bisa dihapus langsung — perlu proses pembatalan terpisah.

---

## 🗑️ GUDANG — PENGELUARAN BB

---

### 33. Pengeluaran BB yang salah — bisa diedit atau dihapus?

**Bisa keduanya** (untuk pengeluaran yang dibuat manual):

- **Edit**: klik ikon **pensil** di baris riwayat → dialog edit terbuka → ubah qty per material → simpan. Stok lama otomatis di-reverse, stok baru langsung diterapkan.
- **Hapus**: klik ikon **tong sampah** → konfirmasi → catatan terhapus dan **stok otomatis dikembalikan**.

Catatan: untuk pengeluaran otomatis dari WO (saat "Mulai Produksi"), tombol edit tidak tersedia — koreksi dilakukan via **Warehouse → Penyesuaian Stok**.

---

## 🗑️ WASTE

---

### 34. Di form "Ajukan Waste Baru" — di mana field No. BC 2.4 dan Mata Uang?

**Field No. BC 2.4 dan Tanggal BC 2.4:**

Kedua field ini **selalu muncul** di bagian atas form, di atas field Disposisi. Tidak bergantung pada pilihan disposisi apapun.

**Field Mata Uang dan Nilai Waste:**

Field ini **hanya muncul** ketika Disposisi dipilih **"Dijual"**. Jika disposisi bukan Dijual (misal: Dimusnahkan), field nilai dan mata uang tidak ditampilkan.

Saat disposisi = Dijual:
1. Isi **Nama Pembeli**
2. Pilih **Mata Uang** dari dropdown (IDR / USD / KRW)
3. Isi **Nilai Waste** (nominal sesuai mata uang yang dipilih)

---

## 🔧 TROUBLESHOOTING

---

### 35. Dialog form tidak bisa di-scroll / konten terpotong atas dan bawah

Sudah diperbaiki di **semua dialog** berikut:
- Dialog "Terima Bayar" di Finance → AR
- Dialog "Bayar" di Finance → AP
- Dialog "Ajukan Waste Baru" di Warehouse → Waste

Jika dialog masih tampak terpotong:
1. Coba **refresh halaman** (F5 atau Ctrl+R) — bisa jadi browser melakukan cache versi lama
2. Pastikan browser tidak dalam zoom > 100% — zoom yang besar bisa membuat konten melebihi layar
3. Coba **scroll di dalam dialog** (bukan scroll halaman utama) — kursor/jari harus berada di dalam area dialog

> **Catatan teknis:** Perbaikan dilakukan dengan menambahkan `max-height: 90vh` + `overflow-y: auto` pada konten dialog, sehingga dialog memiliki scrollbar internal dan tidak terpotong di layar apapun.

---

*Dokumen ini akan diperbarui seiring perkembangan sistem.*  
*Untuk pertanyaan yang belum tercakup, sampaikan ke tim pengembang.*
