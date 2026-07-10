# Feedback Klien — Juli 2026

**Sumber:** Pertanyaan.pdf  
**Tanggal diterima:** 10 Juli 2026  
**Diselesaikan:** 11 Juli 2026  
**Status:** ✅ Semua selesai

---

## Masalah & Solusi

---

**1. Laporan KITE Pemasukan BB — nomor dokumen tampil nomor PO, bukan nomor GR**

Masalah: Di Laporan 1 (Pemasukan Bahan Baku), kolom nomor dokumen menampilkan nomor PO (misal PO-2026-001), padahal yang seharusnya tampil adalah nomor penerimaan barang (GR).

Solusi: Laporan sekarang membaca langsung dari data penerimaan barang (GR). Nomor dokumen yang tampil adalah nomor PIB (untuk impor BC 2.0) atau nomor PO (untuk pembelian lokal) sesuai jenis dokumennya.

---

**2. Laporan KITE Pemasukan BB — satuan semua tampil KG**

Masalah: Semua baris di Laporan 1 menampilkan satuan KG, padahal user sudah input PCE, YRD, dan satuan lain saat penerimaan barang.

Solusi: Satuan sekarang diambil langsung dari data penerimaan barang per item, sehingga setiap baris menampilkan satuan yang sebenarnya diinput.

---

**3. Laporan KITE Pemasukan BB — pembelian lokal tampil sebagai USD**

Masalah: Baris yang berasal dari PO lokal (IDR) ikut tampil dengan mata uang USD di Laporan 1.

Solusi: Mata uang sekarang ditentukan berdasarkan jenis dokumen: BC 2.0 → USD, PO Lokal → IDR.

---

**4. Dialog Kirim BB ke Subkon — tidak ada kolom satuan**

Masalah: Di dialog pengiriman bahan baku ke subkontraktor, hanya tampil kode dan qty. Tidak ada kolom satuan sehingga tidak jelas satuannya apa.

Solusi: Kolom satuan sudah ditambahkan, termasuk pilihan satuan lengkap (KG, MTR, PCE, YRD, PRS, NPR, TNE, dan lainnya). Detail BB yang dikirim juga ditampilkan lebih rapi dengan nama, kode, qty, dan satuan.

---

**5. Nomor seri di laporan BB semuanya 001**

Masalah: Kolom nomor seri barang di Laporan 1 semua menampilkan 001, tidak increment per item.

Solusi: Nomor seri sekarang di-generate secara berurutan per dokumen penerimaan (001, 002, 003, dst.).

---

**6. Form Penjualan Lokal — kolom qty terlalu sempit**

Masalah: Di form Penjualan Material Lokal, kolom qty terlalu sempit sehingga angka yang panjang terpotong dan tidak kelihatan penuh.

Solusi: Lebar kolom qty sudah diperlebar.

---

**7. Dropdown Produk di form WO tidak mencerminkan SO baru yang dibuat**

Masalah: Di form buat Work Order, dropdown "Produk" hanya menampilkan produk-produk bawaan sistem (Latex Size M, Nitrile, dll). Produk dari SO baru yang dibuat user (misal "vellusy") tidak muncul.

Solusi: Dropdown sekarang menggabungkan produk bawaan dengan semua produk unik yang ada di Sales Order yang sudah dibuat. Produk baru dari SO langsung muncul sebagai pilihan di WO.

---

**8. Laporan KITE dan Mutasi BB — belum bisa filter per material**

Masalah: Filter di halaman Laporan KITE hanya bisa per tanggal. Tidak ada cara untuk lihat laporan satu material saja.

Solusi: Ditambahkan kolom filter "Material" di atas semua tabel laporan. Bisa ketik kode atau nama material untuk filter semua laporan sekaligus.

---

**9. Warehouse inventory — search tidak menampilkan stok dari GR yang baru diinput**

Masalah: Setelah input penerimaan barang baru di Inbound, material baru tidak muncul saat dicari di halaman Warehouse.

Solusi: Halaman Warehouse sekarang menggabungkan data stok awal dengan stok dari semua GR yang sudah diinput. Material baru langsung bisa dicari setelah GR disimpan.

---

**10. Tidak bisa edit atau hapus GR yang salah input**

Masalah: Setelah penerimaan barang (GR) disimpan, tidak ada tombol untuk mengubah atau menghapus jika ada yang salah.

Solusi: Ditambahkan tombol edit (pensil) dan hapus (tong sampah) di setiap baris GR. Edit bisa mengubah header GR (tanggal, supplier, nomor dokumen, gudang). Hapus dengan konfirmasi terlebih dahulu.

---

**11. Satuan BOM di SO masih kurang: YRD, NPR, PRS, dan lainnya**

Masalah: Di form Sales Order bagian BOM, beberapa satuan yang dibutuhkan belum tersedia di dropdown, antara lain YRD, NPR, PRS, PCE, TNE, KGM, FTK, MTR, ST.

Solusi: Semua satuan yang diminta sudah ditambahkan di BOM SO, form Kirim BB Subkon, dan seluruh form yang relevan.

---

**12. Terima hasil CMT hanya bisa 1 kali**

Masalah: Setelah klik "Terima Hasil dari CMT" sekali, tombol tidak muncul lagi. Tidak bisa input penerimaan parsial atau cicilan dari subkon.

Solusi: Sekarang ada checkbox "Penerimaan terakhir" di dialog terima:
- Jika dicentang → status job berubah ke "Hasil Diterima" (selesai)
- Jika tidak dicentang → status tetap "Dalam Proses", dan tombol "Terima Lagi (Parsial)" muncul untuk input penerimaan berikutnya

---

**13. Laporan KITE Tab 4 dan Tab 7 tidak update setelah terima hasil CMT**

Masalah: Setelah input penerimaan barang jadi dari CMT, Laporan 4 (Pemasukan HP) dan Laporan 7 (Mutasi) tidak bertambah datanya.

Solusi: Saat "Terima Hasil dari CMT" dikonfirmasi, sistem sekarang otomatis mencatat masuknya barang jadi ke Laporan 4 dan pergerakan stok ke Laporan 7.

---

**14. Tidak bisa input customer baru langsung dari form PEB**

Masalah: Di form PEB, dropdown customer hanya menampilkan customer yang sudah ada. Jika customer belum pernah diinput, tidak bisa langsung tambah dari sini.

Solusi: Ditambahkan opsi "+ Input nama baru..." di dropdown customer PEB. Jika dipilih, muncul kolom teks untuk mengetik nama customer baru langsung di form PEB.

---

**15. WO dan SO yang baru dibuat tidak muncul di dropdown PEB**

Masalah: Di form PEB, dropdown SO/WO tidak menampilkan order-order yang baru saja dibuat user (misal JAPCOBA01 tidak tampil).

Solusi: Dropdown SO di PEB sekarang mengambil data langsung dari store yang aktif, sehingga semua SO dan WO yang sudah dibuat langsung muncul sebagai pilihan.

---

**16. Tidak ada field Nomor Pendaftaran di form Penjualan Lokal**

Masalah: Form Penjualan Material Lokal tidak memiliki kolom untuk Nomor Pendaftaran.

Solusi: Field "No. Pendaftaran" sudah ditambahkan di bagian Informasi Dokumen. Nomor ini juga ikut ter-export ke file Excel.

---

**17. SO yang sudah selesai produksi tidak muncul di tab Kirim ke Customer (Outbound)**

Masalah: Setelah WO selesai (QC Lulus), Sales Order terkait tidak muncul di tab "Kirim ke Customer" di halaman Outbound/Shipping.

Solusi: Sekarang saat WO di-klik "QC Lulus → Selesai", sistem otomatis mengubah status SO terkait menjadi "READY TO SHIP", sehingga langsung muncul di antrian pengiriman.

---

**18. Work Order tanpa BOM tidak bisa deduct stok bahan baku**

Masalah: Untuk produk baru yang belum ada BOM-nya, saat klik "Mulai Produksi" di WO, stok BB tidak berkurang dan Laporan 2 KITE tidak terisi.

Solusi: Di form buat WO baru, jika produk tidak memiliki BOM, sekarang muncul bagian "Input Bahan Baku Manual" di mana user bisa ketik kode BB, nama, qty per unit, dan satuan. Data ini disimpan di WO dan digunakan untuk deduct stok saat produksi dimulai.

---

## Pertanyaan & Jawaban

---

**Q1. No SO yang muncul SO-2026-012, padahal saya input JAPCOBA01 — apakah nomor otomatis?**

Ya, nomor SO di-generate otomatis oleh sistem menggunakan format SO-TAHUN-URUTAN (misal SO-2026-012). Nama yang diinput di kolom "Customer" atau "Referensi" adalah data terpisah — bukan nomor SO. JAPCOBA01 tersimpan sebagai ID internal atau referensi order, bukan sebagai nomor dokumen SO.

---

**Q2. Gudang FG-A vs FG-B bedanya apa?**

Keduanya adalah gudang barang jadi (Finished Goods). Perbedaannya bisa ditentukan sendiri sesuai kebutuhan operasional, misalnya:
- FG-A: barang jadi yang siap ekspor (sudah QC lulus, menunggu PEB)
- FG-B: barang jadi untuk pasar lokal atau dalam proses hold QC

Saat ini sistem tidak membedakan perlakuannya — pembagian ini hanya untuk keperluan pencatatan lokasi fisik.

---

**Q3. Di Penugasan Produksi, Line Produksi dipilih Line A atau B — apa bedanya?**

Line produksi adalah penanda jalur produksi fisik yang mengerjakan WO tersebut (misal Line A = jalur dipping, Line B = jalur packing). Pilih sesuai line yang memang mengerjakan order tersebut. Tidak ada pengaruh ke perhitungan atau laporan — ini murni untuk tracking dan penjadwalan.

---

**Q4. Valuasi stok — apakah terhubung ke laporan stock movement? Export lewat mana?**

Nilai stok saat ini dihitung dari qty × harga per unit yang diinput di form penerimaan barang (GR). Pergerakan stok (stock movement) tercatat otomatis setiap ada:
- Penerimaan GR (masuk)
- Mulai produksi / kirim BB subkon (keluar)
- Terima hasil CMT / produksi (masuk sebagai FG)
- Export via PEB (keluar)

Untuk export laporan stock movement, buka **Laporan KITE → Tab 7 (Mutasi)** → klik tombol Export Excel di pojok kanan atas.

---

**Q5. Form Penjualan Lokal — "Nomor Pendaftaran" masuk ke kolom yang mana?**

Nomor Pendaftaran sudah ditambahkan sebagai field tersendiri di bagian **Informasi Dokumen** (baris yang sama dengan No. Kontrak). Saat export Excel, nomor ini masuk ke kolom "No. Pendaftaran" di baris header dokumen.

---

*Untuk pertanyaan lain, lihat juga FAQ_KLIEN.md yang lebih lengkap.*
