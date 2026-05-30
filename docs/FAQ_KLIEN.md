# FAQ — Pertanyaan Klien JKJ ERP

**Dokumen ini menjawab pertanyaan-pertanyaan operasional yang sering muncul dari penggunaan sistem.**  
**Terakhir diperbarui:** Mei 29, 2026

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

## 💼 SALES ORDER

---

### 4. SO bisa punya 2 satuan berbeda dalam 1 order? (misal: 100 pce + 50 prs)

**Bisa.** Saat membuat SO di `/sales/new`, form sudah mendukung **multi-line item**. Setiap baris punya dropdown satuan sendiri. Contoh:
- Baris 1: SYNTHETIC — 100 qty — **pce** — USD 5
- Baris 2: SYNTHETIC B — 50 qty — **prs** — USD 4.5

Keduanya tersimpan sebagai 1 SO dengan 2 item. Di daftar SO, kolom Qty akan menampilkan tiap baris secara terpisah.

---

### 5. Tombol "Edit Order" di halaman detail SO tidak bisa diklik

Sudah diperbaiki. Klik tombol **"Edit Order"** (hanya muncul untuk SO status **DRAFT**) → dialog edit terbuka dengan field:
- Qty
- Harga Satuan
- Tanggal Pengiriman

Simpan → total otomatis dihitung ulang dan history SO dicatat.

---

## 💰 KEUANGAN (AR / AP / JURNAL)

---

### 6. AR & AP — "New Invoice" itu untuk ekspor/impor atau lokal saja?

**Untuk semua jenis** — lokal, ekspor, maupun impor. Tidak ada pembatasan.

Perbedaannya ada di pilihan **Mata Uang**:
- Invoice **lokal** → pilih IDR, tidak perlu isi kurs
- Invoice **ekspor/impor** → pilih USD atau KRW → isi kurs → sistem menampilkan nilai asli + konversi IDR

Kolom "Total Amount" di daftar AP akan menampilkan tag mata uang (misal: `USD 5,000`) jika invoice bukan IDR.

---

### 7. Di dialog pembayaran AR/AP — bagaimana dengan currency dan kurs?

Saat klik tombol **"Terima Bayar"** (AR) atau **"Bayar"** (AP) untuk invoice non-IDR:

1. Sistem menampilkan mata uang invoice dan kurs saat invoice dibuat
2. Anda bisa mengisi **"Kurs Bayar/Terima"** sesuai kurs aktual pada tanggal pembayaran
3. Nominal IDR otomatis dihitung: `originalAmount × kurs bayar`
4. Sistem otomatis menampilkan **selisih kurs**:
   - Selisih positif = **untung kurs** (warna hijau)
   - Selisih negatif = **rugi kurs** (warna merah)

---

### 8. Jurnal — apa perbedaan "Kategori" dan "Akun"?

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

### 9. Tax Assets — apa itu "Available"? Apakah terhubung ke Dual Billing?

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

## 🏭 SUBKONTRAK / CMT

---

### 10. Nama subkontraktor tidak bisa input manual — di mana membuatnya?

Sekarang **bisa langsung di form buat job subkon**. Caranya:

1. Buka `/production/subkontrak` → klik **"+ Buat Job Subkontrak Baru"**
2. Di field **"Subkontraktor / CMT"**: klik dropdown
3. Pilih **"+ Input nama baru (manual)..."** (paling bawah di daftar)
4. Ketik nama CMT/subkon baru di field yang muncul
5. Nama yang diketik langsung tersimpan di record job tersebut

> Tidak ada halaman master subkontraktor yang terpisah — nama baru langsung diinput saat membuat job.

---

### 11. Di form job subkon ada section "Bahan Baku yang Dikirimkan" — wajib diisi atau tidak?

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

### 12. "Keluarkan WIP ke Proses Berikutnya" — apakah ini untuk kirim BB ke CMT?

**Tidak sepenuhnya.** Ini adalah dua hal yang berbeda:

| | Keluarkan WIP ke Proses | Kirim BB ke Subkon (di job subkon) |
|-|------------------------|-----------------------------------|
| **Untuk** | Barang **setengah jadi** (WIP): Compound Post-Mixing, Dipped Size M, dll | BB (bahan baku mentah): label, CT-0402, kain, dll |
| **Stok yang dipakai** | Stok kategori **WIP** di Gudang WIP | Stok kategori **BB** di Gudang BB |
| **Ditemukan di** | `/warehouse/wip` → dialog Keluarkan | `/production/subkontrak` → tombol "Kirim BB ke Subkon" |

**Mengapa CT-0402 / label tidak muncul di "Pilih Item WIP"?**  
Karena CT-0402 dan label adalah **Bahan Baku (BB)**, bukan WIP. Item di "Pilih Item WIP" hanya menampilkan barang yang sudah melalui proses produksi (Post-Mixing, Post-Dipping, dll). BB mentah tidak akan muncul di sana.

---

### 13. "WO / Proses Tujuan" di dialog Keluarkan WIP — apa yang diisi?

Field **"WO / Proses Tujuan"** adalah Work Order tujuan untuk **produksi internal JKJ**.

- Jika WIP dikeluarkan ke proses produksi JKJ sendiri → pilih WO yang relevan
- Jika WIP dikeluarkan ke CMT/maklon → pilih **"— Tanpa WO —"** dan isi field **"Nama Supplier / Subkon Tujuan"**

---

### 14. Input barang jadi dari CMT — di mana?

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

### 15. Apakah input barang jadi dari CMT/produksi harus menunggu semua material diinput dulu?

**Tidak.** Input barang jadi **tidak bergantung** pada apakah pengeluaran material sudah dicatat atau belum.

Sistem tidak memblokir input BJ hanya karena pengeluaran material belum lengkap diinput. Kedua proses bisa berjalan **independen** — ini untuk mengakomodasi situasi di mana penginputan gudang terlambat tapi barang jadi sudah ada secara fisik.

---

## ⚠️ WARNING / VALIDASI QTY

---

### 16. Apakah ada warning jika qty yang diinput melebihi batas?

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

### 17. Jika qty SO perlu direvisi setelah ada over-quantity — bisa?

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

### 18. Laporan IT Inventory — apakah perlu diinput ulang setiap bulan?

**Tidak perlu.** Semua 8 laporan **terisi otomatis** dari transaksi yang sudah diinput di modul lain.

Yang perlu dilakukan hanya memastikan transaksi di modul masing-masing sudah diinput dengan benar:

| Transaksi | Trigger laporan |
|-----------|----------------|
| Complete GR di `/warehouse/gr` | Lap 1 (Pemasukan BB) + Lap 6 (Mutasi BB) |
| Klik "Mulai Produksi" di WO | Lap 2 (Pemakaian BB) |
| Buat job subkon dengan item KITE | Lap 3 (BB Subkon) |
| Terima FG di `/warehouse/outbound` | Lap 4 (Pemasukan HP) |
| Submit PEB di `/logistics/peb/new` | Lap 5 (Pengeluaran HP) + Lap 7 (Mutasi HP) |
| Input waste → status "Diajukan BC 2.4" | Lap 8 (Waste/Scrap) |

Saat siap lapor ke DJBC: buka `/reports/kite-inventory` → klik **"Export Semua"** → 1 file Excel, 8 sheet.

---

*Dokumen ini akan diperbarui seiring perkembangan sistem.*  
*Untuk pertanyaan yang belum tercakup, sampaikan ke tim pengembang.*
