# Feedback Klien — September 2026

**Sumber:** komen3.docx.pdf  
**Tanggal diterima:** September 2026  
**Diselesaikan:** 11 September 2026  
**Status:** ✅ Semua bug & print fix selesai | Q1–Q8 dijawab di bawah

> **Catatan Penting — Keterbatasan Demo:**  
> Sistem yang digunakan saat ini adalah **versi demo berbasis browser**. Semua data disimpan di localStorage perangkat masing-masing dan tidak terhubung ke server. Beberapa keterbatasan yang perlu dipahami:
> - Data tidak tersimpan permanen — bisa hilang jika browser di-clear atau mode incognito
> - Upload file (lampiran PO, dokumen, foto) tidak benar-benar tersimpan
> - Tidak ada sinkronisasi antar perangkat
> - Beberapa fitur seperti period lock, approval email, dan integrasi ke sistem lain belum ada di demo
>
> Semua keterbatasan ini **tidak ada di versi produksi** yang akan terhubung ke server dan database.

---

## Masalah & Solusi

---

**1. SUBK KITE 1.1 — Tambah kolom NO SO, QTY, SATUAN per item BB**

Masalah: Form cetak SUBK KITE 1.1 (Pengeluaran BB ke Subkon) tidak menampilkan nomor SO referensi dan target qty produksi CMT.

Solusi: Ditambahkan:
- Tabel header baru: **No. SO Referensi** dan **Target Qty CMT** sebelum tabel item
- Kolom baru di tabel item: **No. SO**, **Qty Target**, **Satuan** — terisi dari data job subkon yang tersimpan

*File: `app/production/subkontrak/print-11/page.tsx`*

---

**2. SUBK KITE 1.2 — Tambah kolom NO DOKUMEN, TGL, KODE MATERIAL**

Masalah: Form cetak SUBK KITE 1.2 tidak mencantumkan nomor dokumen dan tanggal pada tabel BB Dikirim maupun tabel Hasil yang Diterima.

Solusi: Ditambahkan kolom di kedua tabel:
- **No. Dokumen** (ref. SUBK KITE 1.1 untuk tabel BB Dikirim, no. SUBK KITE 1.2 untuk tabel Hasil Diterima)
- **Tgl Kirim / Tgl Terima**
- **Kode Material** (kolom yang lebih prominentkan kode barang)

*File: `app/production/subkontrak/print-12/page.tsx`*

---

**3. AR Invoice detail — Unit price USD salah dan subtotal salah**

Masalah: Di halaman detail AR Invoice yang menggunakan mata uang USD:
- Kolom "Harga Satuan" menampilkan nilai yang dibagi dengan kurs (misalnya $10 → $0.0006) — salah
- Kolom "Subtotal" menampilkan nilai dalam foreign currency seolah-olah IDR — nilainya jauh terlalu kecil

Solusi:
- Harga satuan ditampilkan langsung dalam foreign currency (misal: `USD 10.00`)
- Subtotal dikalikan kurs terlebih dahulu sebelum ditampilkan sebagai IDR

*File: `app/finance/ar/[id]/page.tsx`*

---

**4. AR Invoice detail — PPN tidak tampil**

Masalah: Tabel item invoice tidak menampilkan kolom PPN meskipun nilai PPN sudah tersimpan.

Solusi: Ditambahkan kolom **PPN** dan kolom **Total** (subtotal + PPN) di tabel line items. Baris ringkasan di bawah tabel juga menampilkan total PPN terpisah sebelum Total Invoice.

*File: `app/finance/ar/[id]/page.tsx`*

---

**5. AP Invoice detail — Unit price, subtotal, dan PPN tidak tampil dengan benar**

Masalah dan solusi sama dengan AR Invoice (item 3 & 4 di atas), diterapkan juga ke halaman AP Invoice.

*File: `app/finance/ap/[id]/page.tsx`*

---

**6. AP Invoice form — Tipe Invoice kurang opsi "Lokal" dan "Impor (BC2.0)"**

Masalah: Dropdown Tipe Invoice di form AP/Vendor Bill tidak menyertakan tipe pembelian lokal dan impor BC2.0 yang relevan untuk AP.

Solusi: Dropdown diperbarui menjadi 4 pilihan dengan urutan yang lebih logis untuk vendor bill:
- **Lokal** (pembelian dari vendor domestik)
- **BC2.0 — Impor (KITE)** (pembelian impor dengan fasilitas KITE)
- **BC2.4 — Kawasan Berikat**
- **BC3.0 — Ekspor** (untuk kasus khusus)

Default diubah dari BC3.0 menjadi **Lokal**.

*File: `app/finance/ap/new/page.tsx`*

---

**7. PEB — Tombol Approve tidak ada setelah Submit**

Masalah: Setelah PEB di-submit (status SUBMITTED), tidak ada tombol Approve. Akibatnya status tidak bisa pindah ke APPROVED, dan Laporan KITE Tab 5 & 7 tidak pernah terisi.

Solusi: Ditambahkan tombol **"Approve"** (hijau) yang muncul saat status PEB = SUBMITTED. Klik Approve → status pindah ke APPROVED → Laporan KITE Tab 5 & 7 otomatis terisi.

Alur lengkap: **Draft → Submit → Approve → (opsional: Mark as Exported)**

*File: `app/logistics/peb/[id]/page.tsx`*

---

## Pertanyaan & Jawaban

---

**Q1. Penjualan lokal: FG lokal masuk ke mana? BB yang dijual masuk ke mana?**

**FG yang dijual ke pasar lokal:**
Gunakan menu **Logistics → Penjualan Lokal** (`/logistics/local-sales`). Transaksi ini menggunakan tipe **BC 2.4** (penjualan dari kawasan berikat ke pasar lokal dalam negeri). Nilai penjualan akan masuk ke:
- Finance → Laporan Keuangan (P&L) sebagai pendapatan
- Reports → Rekap Penjualan sebagai baris "Lokal"

**BB yang dijual/dikeluarkan dari kawasan berikat:**
Untuk BB yang dijual langsung (bukan diolah dulu), gunakan **Gudang → Pengeluaran BB** (`/warehouse/issue`) dengan catatan bahwa transaksi ini perlu dikomunikasikan ke bagian bea cukai sebagai pengeluaran non-produksi. Di versi produksi, akan ada modul khusus untuk jenis pengeluaran ini dengan laporan BC yang sesuai.

---

**Q2. Print SUBK KITE 1.1/1.2 untuk WIP subkon (barang setengah jadi) — di mana?**

Saat ini SUBK KITE 1.1 dan 1.2 tersedia di **halaman detail job subkontrak** (`/production/subkontrak`), bukan di modul terpisah untuk WIP.

Untuk job subkon yang hasilnya berupa WIP (barang setengah jadi, bukan FG):
1. Buka halaman detail job subkon yang bersangkutan
2. Pastikan nomor dokumen SUBK KITE sudah diisi (field "No. Dokumen SUBK KITE 1.1" saat kirim BB)
3. Klik tombol **"Print SUBK KITE 1.1"** (saat kirim) atau **"Print SUBK KITE 1.2"** (saat terima)

Tombol print hanya muncul jika nomor dokumen SUBK KITE sudah diisi.

---

**Q3. Gudang WIP dari subkon — apakah akan ada gudang khusus?**

Di versi demo saat ini, **belum ada gudang WIP terpisah**. Hasil subkon (WIP) masuk ke gudang FG secara default karena belum ada pembedaan tipe gudang.

Di versi produksi, rencananya akan ada:
- **Gudang BB** (bahan baku, input)
- **Gudang WIP** (barang setengah jadi, termasuk dari subkon)
- **Gudang FG** (barang jadi siap kirim)

Ini sudah dicatat sebagai **feature request untuk versi produksi**.

---

**Q4. Form "Buat Bukti Pengeluaran BB" — hanya untuk WIP yang kembali atau semua hasil subkon?**

Form **"Buat Bukti Pengeluaran BB"** di halaman Pengeluaran BB (`/warehouse/issue`) berlaku untuk **semua pengeluaran BB ke produksi atau subkon**, tidak terbatas ke WIP yang kembali. Gunakan form ini untuk:
- BB yang dikirim ke subkon untuk proses CMT
- BB yang dikeluarkan untuk produksi internal
- BB yang dikeluarkan untuk keperluan lain (dengan catatan)

Jika tujuannya adalah mencatat pengeluaran BB yang spesifik ke job subkon KITE, lebih tepat menggunakan alur **konfirmasi kirim BB** di halaman detail job subkon — yang secara otomatis mengisi Laporan 3 KITE.

---

**Q5. "Terima Hasil dari CMT" — field "Nama Produk/Barang Jadi" diisi apa?**

Field **"Nama Produk/Barang Jadi"** di form penerimaan hasil CMT diisi dengan **nama produk akhir yang dihasilkan subkon** — bukan nama material bahan baku.

Contoh:
- Jika subkon mengerjakan jahit sarung tangan dari bahan latex → isi dengan **"Sarung Tangan Latex Size M"**
- Jika subkon mengerjakan pelapisan dari bahan kimia → isi dengan **"Sarung Tangan Nitrile Coated"**

Ini berbeda dari kolom "Kode BB / Nama BB" di tabel item yang mengacu ke material yang dikirim. "Nama Produk/Barang Jadi" adalah nama output/hasil produksinya.

---

**Q6. PEB: No. SO Referensi diisi apa? BC 2.0 Reference diisi apa?**

**No. SO Referensi di PEB:**
Diisi dengan nomor Sales Order yang terkait dengan ekspor ini — misalnya `SO-2026-006`. Ini adalah referensi internal yang menghubungkan PEB ke SO asalnya. Opsional, tapi sangat disarankan untuk traceability.

**BC 2.0 Reference (field di dropdown):**
Diisi dengan nomor dokumen **PIB (Pemberitahuan Impor Barang)** atau **BC 2.0** yang relevan — yaitu dokumen saat bahan baku diimpor masuk ke kawasan berikat. Ini dibutuhkan untuk bukti bahwa BB yang diekspor berasal dari impor KITE yang sah.

Contoh: `PIB-2026-001` atau `BC2.0/2026/001`

Di versi demo, field ini diisi manual. Di versi produksi, akan ter-link otomatis ke data penerimaan impor.

---

**Q7 (ACC-Q1). Di mana bisa melihat jurnal atas transaksi invoice + pembayaran?**

Di versi demo saat ini, jurnal akuntansi **tidak ditampilkan secara eksplisit** per transaksi. Jurnal-jurnal ini ada di backend dalam bentuk logika pencatatan, tetapi belum ada halaman untuk melihat detail jurnal per invoice/pembayaran.

Yang tersedia saat ini:
- **Finance → Jurnal** (`/finance/journal`) — menampilkan daftar jurnal secara keseluruhan
- **Finance → Chart of Accounts** — menampilkan saldo akun dan valuasi stok

Di versi produksi, setiap invoice dan pembayaran akan memiliki tab **"Jurnal"** yang menampilkan detail debit/kredit, lengkap dengan kode akun, tanggal posting, dan referensi dokumen.

Ini sudah dicatat sebagai **feature request untuk versi produksi**.

---

**Q8 (ACC-Q2). Apakah bisa ditambahkan tab Depresiasi Aset Tetap?**

Tab Depresiasi Aset Tetap belum ada di versi demo. Modul Aset Tetap (Fixed Assets) adalah fitur akuntansi yang akan tersedia di versi produksi, mencakup:
- Pencatatan aset tetap (mesin, kendaraan, bangunan)
- Perhitungan depresiasi otomatis (garis lurus / saldo menurun)
- Jurnal depresiasi bulanan
- Laporan nilai buku aset

Ini sudah dicatat sebagai **feature request untuk versi produksi**.

---

## Item Belum Selesai

---

**WO-3 — View WO detail dalam format worksheet**

Permintaan: Tampilan detail Work Order dalam format worksheet/tabel yang lebih lengkap (mirip spreadsheet produksi).

Status: **Belum diimplementasi** — kompleksitas tinggi, membutuhkan desain UI yang berbeda dari halaman WO saat ini. Dijadwalkan untuk versi produksi.

---

**SK-1 — Alur subkontrak perlu diperjelas (UX improvement)**

Permintaan: Alur kerja modul subkontrak (dari buat job → kirim BB → terima hasil → selesai) perlu dibuat lebih intuitif dengan petunjuk langkah yang jelas.

Status: **Belum diimplementasi** — akan dipertimbangkan saat redesign UX modul produksi.

---

*Feedback sebelumnya: lihat CLIENT_FEEDBACK_AGUSTUS2026.md (Juli–Agustus 2026)*
