# Panduan Singkat — Demo ERP JKJ
**Diperbarui:** Juli 2026

---

## Keterbatasan Versi Demo

Sebelum mulai, pahami dulu batasan sistem demo ini:

| Keterbatasan | Penjelasan |
|---|---|
| **Data tidak permanen** | Tersimpan di localStorage browser. Bersih jika browser di-clear atau pakai incognito |
| **Upload file tidak nyata** | Lampiran PO/dokumen hanya mencatat nama file — file tidak tersimpan ke server |
| **Tidak ada sinkronisasi** | Data berbeda di tiap perangkat/browser |
| **Tidak ada notifikasi** | Approval, pengiriman, dll tidak kirim email/notif |
| **Period lock belum ada** | Tidak bisa kunci periode akuntansi di versi demo |
| **Print PDF belum sempurna** | Gunakan print browser biasa — tampilan tergantung browser |

Semua keterbatasan ini **tidak ada di versi produksi** yang akan terhubung ke server dan database.

---

## Alur Kerja dari Awal sampai Laporan

Ikuti urutan ini. Kalau ada langkah yang dilewati, data tidak akan muncul di laporan.

```
1. Buat PO          → /purchasing/po → Create PO
        ↓
2. Terima Barang    → /warehouse/inbound → pilih PO → Complete GR
        ↓
        ✅ Laporan KITE Tab 1 (Pemasukan BB) otomatis terisi
        ↓
3. Buat SO          → /sales/new → isi customer, produk, qty
        ↓
4. Approve SO       → /sales → klik SO → tombol "Approve"
        ↓
5. Buat WO          → /production/wo/new → pilih SO yang sudah Approved
        ↓
6. Mulai Produksi   → /production/wo → buka WO → klik "Mulai Produksi"
        ↓
        ✅ Laporan KITE Tab 2 (Pemakaian BB) otomatis terisi
        ↓
7. Selesaikan WO    → klik "Selesai → QC" lalu "QC Lulus → Selesai"
        ↓
        ✅ SO terkait otomatis berubah ke status READY TO SHIP
        ↓
8. Input BJ         → /warehouse/outbound → Tab "Input Barang Jadi" → pilih WO
        ↓
        ✅ Laporan KITE Tab 4 (Pemasukan HP) otomatis terisi
        ↓
9. Kirim ke Cust.   → /warehouse/outbound → Tab "Kirim ke Customer" → pilih SO
        ↓
10. Buat PEB        → /logistics/peb/new → isi customer, barang, kurs
        ↓
        ✅ Laporan KITE Tab 5 & 7 otomatis terisi
        ↓
11. Lihat Laporan   → /reports/kite-inventory → Export Semua
```

---

## Hal yang Sering Membingungkan

---

### "Produk baru yang saya buat di SO tidak muncul di dropdown WO"

Ini terjadi karena SO belum di-Approve. Dropdown WO hanya menampilkan SO yang sudah berstatus **Approved** atau **In Production**.

Cara benar:
1. Buat SO → status: **Draft**
2. Buka detail SO → klik **"Approve"** → status: **Approved**
3. Baru buka form WO → SO muncul di dropdown

---

### "WO saya tidak muncul di tab Input Barang Jadi (Outbound)"

WO hanya muncul di sini kalau sudah berstatus **COMPLETED**. Harus dilalui semua langkahnya:

```
PLANNED → (klik Mulai Produksi) → IN PROGRESS
       → (klik Selesai → QC) → QC INSPECTION
       → (klik QC Lulus → Selesai) → COMPLETED ✅ muncul di Outbound
```

Tidak bisa loncat langkah.

---

### "SO saya tidak muncul di tab Kirim ke Customer (Outbound)"

SO hanya muncul di sini kalau sudah berstatus **READY TO SHIP**. Status ini otomatis berubah saat WO terkait di-klik **"QC Lulus → Selesai"**.

Jadi urutan wajibnya:
1. Selesaikan WO (QC Lulus) → SO otomatis jadi READY TO SHIP
2. Buka Outbound → Tab Kirim ke Customer → SO sudah muncul

---

### "Nomor SO yang muncul bukan yang saya ketik"

Nomor SO (SO-2026-001, SO-2026-012, dst.) **dibuat otomatis oleh sistem** — bukan diambil dari nama customer atau referensi yang Anda ketik. Yang Anda input adalah nama customer dan referensi order, bukan nomor SO.

---

### "Laporan KITE kosong padahal sudah input data"

Laporan KITE terisi **otomatis** dari aksi yang dilakukan di modul lain. Tabel di bawah menunjukkan aksi yang harus dilakukan agar setiap laporan terisi:

| Laporan | Harus klik apa? | Di mana? |
|---------|----------------|----------|
| Tab 1 — Pemasukan BB | **Complete GR** | `/warehouse/inbound` |
| Tab 2 — Pemakaian BB | **Mulai Produksi** | `/production/wo/[id]` |
| Tab 3 — BB Subkontrak | **Simpan job subkon** dengan BB ber-fasilitas KITE | `/production/subkontrak` |
| Tab 4 — Pemasukan HP | **Input BJ ke Gudang** | `/warehouse/outbound` |
| Tab 5 — Pengeluaran HP | **Submit PEB** | `/logistics/peb/new` |
| Tab 6 — Mutasi BB | Otomatis | (dari Tab 1 + 2 + 3) |
| Tab 7 — Mutasi HP | Otomatis | (dari Tab 4 + 5) |
| Tab 8 — Waste | **Input waste** → ubah status ke *Diajukan* | `/warehouse/waste` |

Tidak perlu input data di halaman laporan — cukup ikuti alur di atas.

---

### "Laporan KITE tidak bisa filter per material"

Bisa. Di halaman `/reports/kite-inventory`, di atas tabel ada dua filter:
- **Filter Tanggal**: dari — sampai
- **Filter Material**: ketik kode atau nama BB/HP → semua tab laporan ikut terfilter

---

### "File yang saya upload di PO tidak muncul lagi"

Ini keterbatasan sistem demo — sistem menyimpan nama file tapi bukan isi filenya (tidak ada server penyimpanan). Di versi produksi nanti, file akan tersimpan permanen di server.

---

### "Customer baru tidak ada di dropdown PEB"

Ada dua cara:
1. Jika customer sudah pernah diinput di SO → otomatis muncul di dropdown PEB
2. Jika belum → di dropdown PEB pilih **"+ Input nama baru..."** → ketik langsung

---

## Tips Penting Per Modul

---

### Purchasing — PO & Penerimaan Barang

- Buat PO dulu sebelum input penerimaan barang. Form Inbound akan menampilkan daftar PO yang sudah ada untuk dipilih.
- Satuan di PO sudah lengkap: KG, MTR, PCE, YRD, PRS, NPR, TNE, dan lainnya. Kalau tidak ketemu, scroll dropdown lebih jauh.
- Setelah GR selesai, klik **"Complete GR"** — ini yang memicu stok bertambah dan Laporan 1 KITE terisi.
- GR yang salah bisa diedit atau dihapus via ikon pensil/tong sampah di daftar Inbound.

---

### Sales — Sales Order

- Nama produk di SO bisa diketik bebas — tidak perlu pilih dari daftar.
- SO harus di-**Approve** dulu sebelum bisa dibuat WO.
- Setelah WO selesai dan BJ sudah dikirim, status SO akan berubah sendiri.
- Untuk melihat progress fulfillment (berapa yang sudah diproduksi, sudah dikirim, sisa): buka detail SO → lihat card **"Progress Fulfillment"** di bagian bawah. Warna hijau = target terpenuhi, kuning/merah = masih kurang.

---

### Produksi — Work Order

- Pilih SO di dropdown WO → data produk dan qty otomatis terisi.
- Untuk produk baru yang belum ada BOM-nya: setelah pilih produk, muncul bagian **"Input Bahan Baku Manual"** — isi kode BB, nama, qty per unit, dan satuan. Ini penting agar stok BB berkurang dan Laporan 2 KITE terisi.
- WO harus dilalui semua status (PLANNED → IN PROGRESS → QC INSPECTION → COMPLETED). Tidak ada yang bisa dilewati.

---

### Produksi — Subkontrak / CMT

- Pilih subkontraktor dari daftar, atau pilih **"+ Input nama baru"** kalau belum ada.
- Pastikan fasilitas BB yang dikirim dipilih **KITE** (bukan Non-KITE) agar Laporan 3 terisi.
- Penerimaan hasil CMT bisa dilakukan **berkali-kali** (parsial):
  - Kalau belum terakhir: jangan centang "Penerimaan terakhir" → bisa terima lagi nanti
  - Kalau sudah terakhir: centang "Penerimaan terakhir" → status job jadi "Hasil Diterima"

---

### Gudang — Pengeluaran BB (Issue)

- Halaman `/warehouse/issue` mencatat pengeluaran bahan baku untuk keperluan non-produksi (sampel, rusak, dll).
- Untuk hapus pengeluaran yang salah: klik ikon **tong sampah** di baris yang ingin dihapus → konfirmasi → data terhapus.
- **Catatan demo:** hapus pengeluaran hanya menghapus catatannya — stok tidak otomatis kembali. Di versi produksi ada jurnal koreksi otomatis.

---

### Gudang — Outbound

- **Tab 1 — Input Barang Jadi**: untuk terima FG dari produksi. Hanya WO berstatus COMPLETED yang muncul.
  - Penerimaan yang sudah diinput bisa diedit (qty, gudang, penerima) atau dihapus via ikon **pensil / tong sampah** di tabel riwayat.
- **Tab 2 — Kirim ke Customer**: untuk kirim FG ke customer. Hanya SO berstatus READY TO SHIP yang muncul. SO otomatis jadi READY TO SHIP setelah WO-nya selesai (QC Lulus).
  - Kolom **"Stok BJ Tersedia"** menampilkan total FG yang sudah masuk gudang untuk SO tersebut. Hijau = cukup, kuning = masih kurang dari target.

---

### Logistics — PEB

- Form PEB dimulai **kosong** — tambahkan item ekspor dengan klik **"Add Item"**.
- Isi No. NPE sesuai nomor yang diterima dari DJBC — tidak ada nomor bawaan.
- Customer yang sudah ada di SO langsung muncul di dropdown. Kalau belum, pilih **"+ Input nama baru"**.
- WO baru yang sudah dibuat langsung muncul di dropdown WO di form PEB.

---

### Laporan KITE — IT Inventory

- Buka `/reports/kite-inventory` untuk lihat semua 8 laporan.
- Gunakan filter **Tanggal** dan **Material** di bagian atas untuk mempersempit tampilan.
- Tombol **"Export Semua"** menghasilkan 1 file Excel dengan 8 sheet sekaligus (format resmi DJBC).
- Export per tab juga tersedia kalau hanya butuh 1 laporan saja.

---

## Gudang FG-A vs FG-B — Apa Bedanya?

Tidak ada perbedaan fungsional di sistem. Keduanya adalah gudang barang jadi. Pembagiannya bisa disesuaikan sendiri sesuai kebutuhan operasional, misalnya:
- **FG-A** = barang jadi untuk ekspor
- **FG-B** = barang jadi untuk pasar lokal

Sistem tidak membatasi atau membedakan keduanya.

---

## Line Produksi — Pilih yang Mana?

Pilih sesuai line fisik yang mengerjakan order tersebut (Line A, B, C, atau D). Pilihan ini hanya untuk pencatatan dan penjadwalan — tidak mempengaruhi laporan atau stok.

---

## Valuasi Stok — Di Mana?

Buka **Finance → Chart of Accounts → Tab "Valuasi Stok"** (`/finance/accounts`). Di sana terlihat nilai stok per kategori (BB / FG / WIP / Packaging) berdasarkan qty × harga satuan yang diinput saat penerimaan barang.

Untuk export ke Excel: klik tombol **"Export Excel"** di pojok kanan atas tabel valuasi. File berisi kode, nama, qty, satuan, harga satuan, dan total nilai per material.

Untuk riwayat pergerakan stok (masuk/keluar per material), buka **Laporan KITE → Tab 6 atau 7**, atau halaman **Reports → Stock Movement** (`/reports/stock-movement`). Bisa di-export ke Excel.
