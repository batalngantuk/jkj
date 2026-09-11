# Feedback Klien — Juli 2026 (Sesi 2)

**Sumber:** KOMEN..pdf  
**Tanggal diterima:** 24 Juli 2026  
**Diselesaikan:** 24 Juli 2026  
**Status:** ✅ Semua fitur selesai

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

**1. Tidak bisa melihat progress SO secara keseluruhan (berapa yang sudah diproduksi, sudah dikirim, sisa)**

Masalah: Di halaman detail Sales Order, tidak ada ringkasan progress — apakah target qty sudah terpenuhi dari produksi, berapa yang sudah dikirim ke customer, dan berapa yang masih kurang.

Solusi: Ditambahkan card **"Progress Fulfillment"** di halaman detail SO. Menampilkan tiga data sekaligus:
- **Target Qty SO** — qty yang dipesan customer
- **BJ Sudah Masuk Gudang** — total FG receipt dari semua WO yang terkait SO ini
- **Sudah Dikirim ke Customer** — total qty dari semua shipment SO ini

Lengkap dengan tabel rincian setiap penerimaan FG (tanggal, qty, gudang). Warna hijau jika target sudah terpenuhi, kuning/merah jika masih kurang.

---

**2. Tidak jelas berapa stok BJ tersedia untuk SO di tab Kirim ke Customer**

Masalah: Di tab "Kirim ke Customer" (Warehouse → Outbound), baris SO tidak menampilkan berapa barang jadi yang sudah masuk gudang. Tidak bisa langsung tahu apakah SO sudah siap dikirim atau belum.

Solusi: Ditambahkan kolom **"Stok BJ Tersedia"** di tabel antrian pengiriman. Angka berwarna hijau jika stok sudah cukup untuk memenuhi qty SO, kuning jika masih kurang. Jika ada lebih dari satu penerimaan FG parsial, ditampilkan juga jumlah penerimaannya (misal: 1.200 (3x)).

---

**3. Tidak bisa hapus atau edit pengeluaran bahan baku yang salah**

Masalah: Setelah input pengeluaran material BB (Warehouse → Issue), tidak ada cara untuk mengoreksi atau menghapus jika ada yang salah input.

Solusi: Ditambahkan tombol **hapus** (ikon tong sampah) di setiap baris riwayat pengeluaran BB. Muncul konfirmasi sebelum data dihapus.

> **Catatan Demo:** Di versi demo, hapus pengeluaran menghapus catatan transaksinya, tetapi stok tidak otomatis dikembalikan karena tidak ada jurnal reversing. Di versi produksi, penghapusan akan otomatis membuat jurnal koreksi stok.

---

**4. Tidak bisa edit atau hapus penerimaan BJ yang salah (FG Receipt)**

Masalah: Setelah input penerimaan barang jadi ke gudang (tab "Input BJ ke Gudang"), tidak ada tombol untuk mengubah qty, gudang tujuan, atau penerima jika ada yang salah.

Solusi: Ditambahkan tombol **edit** (pensil) dan **hapus** (tong sampah) di setiap baris riwayat penerimaan BJ:
- Edit: bisa ubah qty diterima, qty reject, gudang tujuan, dan penerima
- Hapus: dengan konfirmasi terlebih dahulu

> **Catatan Demo:** Perubahan qty di edit FG Receipt tidak otomatis mengupdate progress di SO detail — perlu refresh halaman untuk melihat angka terbaru.

---

**5. Tidak ada cara export laporan valuasi stok ke Excel**

Masalah: Di halaman Finance → Akuntansi → Valuasi Stok, data tampil di layar tapi tidak bisa diexport. Laporan ini dibutuhkan untuk keperluan audit dan laporan keuangan.

Solusi: Ditambahkan tombol **"Export Excel"** di pojok kanan tabel valuasi stok. File Excel berisi: kategori, kode material, nama material, fasilitas, qty on hand, satuan, harga satuan (Rp), total nilai (Rp), dan lokasi gudang.

---

## Pertanyaan & Jawaban

---

**Q1. Kalau satu SO ada produk JKJ dan produk CMT sekaligus — perlu 2 SO atau bisa 1?**

Perlu **2 SO terpisah**. Ini karena alur status SO berbeda antara produksi JKJ dan subkontrak CMT:
- SO produksi JKJ: statusnya mengikuti WO (PLANNED → IN PRODUCTION → READY TO SHIP → COMPLETED)
- SO subkontrak CMT: statusnya mengikuti job subkon (BB Dikirim → Dalam Proses → Hasil Diterima → Selesai)

Jika digabung dalam 1 SO, status tidak bisa mencerminkan kedua alur sekaligus dan laporan KITE akan sulit dipetakan. **Buat 2 SO terpisah** untuk produk JKJ dan produk CMT, meski customer-nya sama.

---

**Q2. Kalau qty di shipment salah, di mana bisa revisi?**

Di versi demo saat ini, **belum ada fitur edit shipment** yang sudah tersimpan. Langkah yang bisa dilakukan:
1. Buka **Warehouse → Outbound → tab "Riwayat Pengiriman"**
2. Catat nomor shipment yang salah
3. Untuk koreksi di demo: buat shipment baru dengan catatan "koreksi dari SHP-xxx"

> **Catatan Demo:** Fitur edit dan void shipment adalah keterbatasan versi demo. Di versi produksi, akan ada tombol "Void/Koreksi Shipment" yang membuat jurnal pembalikan otomatis.

---

**Q3. SO status Approved — qty masih bisa diubah?**

**Bisa**, selama WO belum dimulai (status WO masih PLANNED). Caranya:
1. Buka halaman detail SO yang sudah APPROVED
2. Klik tombol **"Edit Order"**
3. Ubah qty, simpan

Jika WO sudah IN PROGRESS (produksi sudah jalan), mengubah qty SO tidak direkomendasikan karena deduction stok BB sudah terjadi. Koordinasikan dulu dengan tim produksi.

---

**Q4. Lampiran PO — bisa muncul di print preview?**

**Tidak bisa di versi demo.** Sistem demo hanya menyimpan nama file di localStorage, bukan file aslinya. Saat halaman dibuka ulang atau dicetak, file tidak bisa ditampilkan karena tidak ada server penyimpanan.

Di versi produksi, lampiran PO akan diupload ke server dan bisa ditampilkan di print preview maupun diunduh kembali oleh siapapun yang memiliki akses.

---

**Q5. Apakah ada fitur period locking inventory (kunci periode agar tidak bisa input transaksi di tanggal lama)?**

**Belum ada di versi demo.** Period locking adalah fitur akuntansi yang akan tersedia di versi produksi. Fungsinya: setelah periode (misalnya bulan lalu) ditutup, tidak bisa lagi membuat transaksi dengan tanggal di periode tersebut — mencegah perubahan laporan yang sudah final.

Ini sudah dicatat sebagai **feature request untuk versi produksi**.

---

## Catatan — Keterbatasan Demo yang Sering Ditanyakan

---

**L1. Data hilang setelah browser ditutup / tab dibuka baru**

Data di demo tersimpan di localStorage browser yang sedang dipakai. Jika browser di-clear cache, buka incognito, atau pindah ke browser lain, data tidak akan ada. **Ini normal di versi demo.** Di versi produksi, semua data tersimpan di database server dan bisa diakses dari mana saja.

---

**L2. Fitur upload file tidak benar-benar menyimpan file**

Tombol upload di form PO, GR, dan dokumen lain di versi demo hanya mencatat nama file — file aslinya tidak diunggah ke mana-mana. Ini keterbatasan demo yang tidak ada server. Di produksi, file diunggah ke server dan bisa diakses, diunduh, dan ditampilkan di print preview.

---

**L3. Print preview tidak bisa langsung dicetak ke PDF dengan tampilan rapi**

Di versi demo, print preview menggunakan fungsi print browser biasa. Tampilan bisa berbeda tergantung browser dan printer yang dipakai. Di versi produksi, dokumen (PO, Invoice, PEB, Laporan) akan di-generate sebagai PDF server-side dengan template yang konsisten.

---

**L4. Tidak ada notifikasi atau email approval**

Alur approval (PO menunggu disetujui, SO perlu konfirmasi) di demo dilakukan manual dengan klik tombol langsung — tidak ada notifikasi email atau in-app. Di versi produksi, sistem akan mengirim notifikasi ke user yang relevan saat ada transaksi yang menunggu persetujuan.

---

*Feedback sebelumnya: lihat CLIENT_FEEDBACK_JULI2026.md (sesi 1) dan CLIENT_FEEDBACK_JUNI2026.md*
