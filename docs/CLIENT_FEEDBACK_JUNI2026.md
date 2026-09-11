# Feedback Klien — Juni 2026

**Sumber:** komen (3).pdf  
**Tanggal diterima:** 02 Juni 2026  
**Diselesaikan:** 26 Juni 2026  
**Status:** ✅ Semua selesai

---

## Masalah & Solusi

---

**1. Buka invoice AR/AP → halaman tidak ditemukan (404)**

Masalah: Klik nomor invoice di halaman AR atau AP langsung error, halaman kosong.

Solusi: Halaman detail invoice sudah dibuat. Sekarang klik nomor invoice → muncul ringkasan tagihan (total, sudah dibayar, sisa), daftar item, dan tombol untuk catat pembayaran.

---

**2. Selisih kurs tidak terlihat di dialog pembayaran AR/AP**

Masalah: Waktu catat pembayaran invoice USD, tidak ada kolom kurs dan tidak terlihat untung/rugi kurs.

Solusi: Dialog pembayaran sekarang menampilkan mata uang invoice, kolom kurs aktual saat bayar, nominal IDR otomatis dihitung, dan selisih kurs (hijau = untung, merah = rugi).

---

**3. Data tidak muncul setelah disimpan (supplier, PO, penerimaan barang)**

Masalah: Supplier baru yang sudah disimpan tidak muncul lagi. PO yang sudah dibuat hilang setelah pindah halaman. Penerimaan barang yang sudah diinput tidak kelihatan.

Solusi: Diperbaiki di semua modul. Sekarang data selalu terbaca langsung dari penyimpanan setiap kali halaman dibuka, tidak hilang lagi.

---

**4. Qty dan nilai di BC 4.0 tidak bisa diisi, tidak ada kolom berat**

Masalah: Di form BC 4.0, kolom qty dan nilai tidak bisa diketik. Tidak ada kolom berat bersih.

Solusi: Kolom qty dan nilai sudah bisa diisi. Kolom Berat Bersih (Kg) sudah ditambahkan.

---

**5. Kirim bahan baku ke subkon hanya bisa 1 kali**

Masalah: Setelah kirim BB pertama, tidak ada lagi tombol untuk kirim BB berikutnya ke subkon yang sama.

Solusi: Sekarang ada tombol "Kirim BB Tambahan" yang muncul untuk pengiriman ke-2 dan seterusnya. Status job berubah ke "Dalam Proses" saat ada pengiriman tambahan.

---

**6. Terima hasil CMT — yang tampil daftar BB, bukan form input barang jadi**

Masalah: Waktu klik "Terima Hasil dari CMT", yang tampil hanya daftar bahan baku yang dikirim, bukan tempat input berapa barang jadi yang diterima.

Solusi: Di dialog sekarang ada bagian khusus "Produk Jadi yang Diterima" — bisa isi nama produk, qty, dan satuan barang jadi yang kembali dari CMT.

---

**7. Satuan TNE, PCE, ST, FTK, KGM belum ada**

Masalah: Beberapa satuan yang dibutuhkan untuk subkon dan material gudang tidak tersedia di dropdown.

Solusi: Semua satuan yang diminta sudah ditambahkan di seluruh form yang relevan (subkontrak, gudang, PO, penjualan, PEB, BC 4.0).

---

**8. Belum ada form untuk penjualan material ke pembeli lokal**

Masalah: Tidak ada dokumen/form khusus untuk mencatat penjualan material dari kawasan berikat ke pembeli dalam negeri.

Solusi: Modul baru dibuat di menu Logistics → Penjualan Material Lokal. Form mencakup data pembeli, kendaraan pengangkut, dan detail barang (kode, nama, HS code, satuan, qty, berat, harga, nilai). Bisa disimpan sebagai Draft atau langsung Submit.

---

## Pertanyaan & Jawaban

---

**Q: Pengeluaran material gudang ke produksi dan CMT — ada di mana?**

Di halaman Gudang → WIP. Ada dua tombol:
- "Terima dari Produksi" → untuk catat WIP yang masuk dari proses sebelumnya
- "Keluarkan ke Proses" → untuk keluarkan WIP ke proses produksi berikutnya atau ke CMT

Untuk bahan baku (bukan WIP) yang dikirim ke CMT, gunakan menu Produksi → Subkontrak → buka job → klik "Kirim BB ke Subkon".

---

**Q: Work Order dibuat setelah Sales Order? "Produk" di WO itu apa?**

Alurnya:
1. Sales input SO
2. Manager approve SO
3. Staff Produksi buka detail SO → klik "Buat Work Order" di pojok kanan
4. WO otomatis terisi dari SO (produk, qty)

"Produk" di WO = nama barang jadi yang akan dibuat, misalnya "Nitrile Size M". Bukan nama bahan bakunya.

---

**Q: WO ada di halaman SO dan di halaman Production — harus buat di keduanya?**

Tidak, cukup satu kali. Buat dari salah satu tempat saja:
- Dari detail SO → klik "Buat Work Order" (lebih mudah, otomatis terhubung ke SO)
- Atau dari menu Produksi → Work Orders → klik "+ Buat WO Baru"

Hasilnya sama.

---

**Q: Material yang disubkon dan kembali jadi bahan setengah jadi — masuk laporan KITE nomor berapa?**

- Saat BB dikirim ke CMT → masuk **Laporan 3** (Pemakaian BB Subkontrak)
- Saat hasil CMT diterima sebagai WIP/bahan setengah jadi → masuk **Laporan 6** (Mutasi Bahan Baku)
- Saat hasil CMT diterima sebagai barang jadi → masuk **Laporan 4** (Pemasukan Hasil Produksi)

Semua tercatat otomatis saat klik "Kirim BB ke Subkon" dan "Terima Hasil dari CMT" di menu Subkontrak.

---

**Q: Form waste tidak ada kolom No. BC 2.4, tanggal, harga, dan mata uang — di mana?**

Kolom No. BC 2.4 dan tanggal sudah ada di bagian atas form waste, selalu muncul.

Kolom harga dan mata uang hanya muncul jika Disposisi dipilih "Dijual". Jika pilih "Dimusnahkan", kolom harga tidak perlu diisi dan tidak ditampilkan.

---

**Q: Di halaman SO dan Production sama-sama ada pembuatan WO — ini membingungkan**

Ini memang dua pintu masuk yang berbeda tapi hasilnya sama. Rekomendasinya: selalu buat WO dari halaman detail SO supaya referensi SO langsung terhubung otomatis dan tidak perlu input ulang.

---

*Untuk pertanyaan lain, lihat juga FAQ_KLIEN.md yang lebih lengkap.*
