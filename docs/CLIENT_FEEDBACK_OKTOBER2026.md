# Feedback Klien — Oktober 2026

**Sumber:** SO dan Warehouse 120926.pdf · ACC REVIEWING 30092026.pdf  
**Tanggal diterima:** 12 September 2026 (Gudang & SO) · 30 September 2026 (Akunting)  
**Diselesaikan:** 21 Oktober 2026  
**Status:** ✅ Semua permintaan Gudang & SO selesai (cetak SO: sebagian — butuh data tambahan, lihat poin 5) | Pertanyaan dijawab | Hasil pengujian menyeluruh & pertanyaan untuk Anda ada di bagian akhir

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

### A. Permintaan Anda — Gudang

---

**1. Pengeluaran bahan baku tidak bisa dicetak**

Masalah: Tombol cetak di Riwayat Pengeluaran BB tidak menghasilkan dokumen untuk sebagian besar baris.

Solusi: Semua baris riwayat pengeluaran kini bisa dicetak sebagai **Bukti Pengeluaran Bahan Baku**, termasuk pengeluaran yang terjadi otomatis saat Work Order dimulai.

*File: `app/warehouse/issue/page.tsx`, `app/warehouse/issue/print/page.tsx`*

---

**2. Satuan material benar saat input (MTR, YRD) tapi berubah menjadi PCS setelah disimpan**

Masalah: Di form pengeluaran satuan sudah benar (misal MTR), tetapi di riwayat tampil `pcs`.

Solusi: Satuan yang diinput sekarang tersimpan dan tampil sama di riwayat, di dokumen cetak, dan di Laporan KITE. Jika satuan tidak tercatat (data lama), sistem memakai satuan dari master stok.

*File: `app/warehouse/issue/page.tsx`, `lib/mock-data/bpb-seed.ts`*

---

**3. Catatan pengeluaran yang sudah disimpan tidak bisa dihapus dan diedit qty**

Masalah: Sebelum disimpan bisa diedit/dihapus, tetapi setelah disimpan dan stok ter-update, tombol edit dan hapus tidak tersedia atau tidak mengembalikan stok.

Solusi:
- **Edit qty:** stok lama dikembalikan lalu qty baru diterapkan otomatis; riwayat dan laporan ikut menyesuaikan.
- **Hapus:** stok dikembalikan penuh dan catatan pergerakan stoknya dibersihkan, sehingga Laporan KITE tidak menghitung dua kali.
- Data bertahan setelah halaman di-refresh.
- Berlaku untuk bukti pengeluaran yang dibuat manual lewat **"Buat Bukti Pengeluaran"**. Pengeluaran otomatis dari Work Order **hanya bisa dicetak**, tidak bisa diedit/dihapus dari halaman ini (koreksi lewat Work Order atau **Gudang → Penyesuaian Stok**) agar status produksi tidak menjadi tidak sinkron.

*File: `app/warehouse/issue/page.tsx`*

---

### B. Permintaan Anda — Sales Order

---

**4. Revisi qty tidak bisa setelah SO di-Approve**

Masalah: Tombol "Edit Order" hanya muncul pada status Draft.

Solusi:
- Tombol **Edit Order** kini tersedia pada status Draft, Pending Approval, Approved, dan In Production.
- Qty dan harga bisa diubah **per baris item** (SO multi-item ikut benar), plus tanggal pengiriman.
- Total qty **tidak boleh lebih kecil dari qty yang sudah dikirim**.
- Untuk SO yang sudah Approved/In Production muncul peringatan agar Work Order dan kebutuhan material disesuaikan (Work Order **tidak berubah otomatis**).
- Setiap revisi tercatat di Riwayat Aktivitas SO. (Sebelumnya catatan revisi tidak pernah tersimpan — ikut diperbaiki.)

*File: `app/sales/[id]/page.tsx`, `lib/store/useSalesOrders.ts`*

---

**5. Cetak SO diminta sesuai dokumen yang diinput (format worksheet IAN POULTER GT-205)**

Masalah: Hasil cetak hanya berisi produk, qty, harga, dan subtotal.

Solusi (sebagian):
- Cetak SO kini berformat **landscape** dengan: header (customer, No. PO, No. Order, tanggal pengiriman, status, prioritas, pembuat), tabel item + grand total, tabel **MAIN MATERIAL** (nama, spesifikasi, warna, konsumsi, satuan, penggunaan, supply Lokal/Impor — diambil dari BOM yang diinput di SO), kotak **KETERANGAN** (dari catatan SO), dan kolom tanda tangan.
- **Belum bisa:** (a) tabel qty per ukuran (#18–#22) karena SO belum punya kolom ukuran; (b) gambar/lampiran dokumen asli, karena upload file tidak tersimpan di demo. Lihat **Pertanyaan untuk Klien nomor 6**.

*File: `app/sales/[id]/page.tsx`*

---

### C. Perbaikan tambahan dari hasil pengujian (QC) menyeluruh

Saat pengujian alur kerja dari awal sampai akhir, ditemukan dan diperbaiki hal-hal berikut:

---

**6. Stok barang jadi tidak berkurang saat dikirim ke customer**

Masalah: Setelah barang jadi dikirim, stok di gudang tetap sama.

Solusi: Stok barang jadi **berkurang saat "Dispatch Pengiriman"** (tercatat sebagai pergerakan stok jenis Export, dengan nomor pengiriman sebagai referensi). Persetujuan PEB tidak mengurangi stok lagi, supaya tidak terhitung dua kali.

*File: `app/warehouse/outbound/page.tsx`*

---

**7. Produksi dan kirim BB ke subkon bisa jalan walau stok bahan tidak cukup**

Masalah: "Mulai Produksi" dan "Kirim BB ke Subkon" tidak mengecek stok; stok dibulatkan ke 0 tanpa peringatan sehingga laporan bisa tidak akurat.

Solusi: Sebelum diproses, sistem menampilkan **peringatan rinci** (kode bahan, kebutuhan, stok tersedia, atau "kode belum terdaftar di stok"). Anda bisa **batal** atau **lanjut**.

*File: `app/production/wo/[id]/page.tsx`, `app/production/subkontrak/page.tsx`, `lib/store/useStock.ts`*

---

**8. PEB baru tidak muncul di Laporan KITE Lap 5 dan Lap 7**

Masalah: PEB baru yang nomornya kebetulan sama dengan nomor pada data contoh (misal PEB-2026-002) tersaring dan tidak tampil di laporan.

Solusi: Pencocokan sekarang juga memeriksa nama pembeli, sehingga PEB baru selalu tampil.

*File: `app/reports/kite-inventory/page.tsx`*

---

**9. Laporan KITE Lap 5 memuat PEB yang baru "Submitted"**

Masalah: PEB yang belum disetujui sudah masuk laporan, tidak sesuai penjelasan sebelumnya.

Solusi: Lap 5 dan Lap 7 hanya memuat PEB berstatus **Approved** atau **Exported**. Alur: Create PEB → Approve → laporan terisi.

*File: `app/reports/kite-inventory/page.tsx`*

---

**10. Filter tanggal di Laporan KITE tidak berfungsi**

Masalah: Mengubah "Tanggal Dari/Sampai" tidak mengubah isi laporan; batas bawaan juga berhenti di 31 Des 2026.

Solusi: Filter tanggal kini bekerja untuk Lap 1, 2, 3, 4, 5, dan 8 (dan ikut ke file Export). Batas bawaan dilebarkan (2026-01-01 s/d 2099-12-31). **Lap 6 dan Lap 7** adalah laporan **saldo posisi** sehingga tidak difilter tanggal.

*File: `app/reports/kite-inventory/page.tsx`*

---

**11. Form PEB: nomor PEB dan kode barang**

Masalah: Isian "PEB Number" diabaikan (nomor selalu dibuat otomatis); kode barang item diketik bebas sehingga bisa berbeda dengan kode di stok dan membuat Lap 7 terpecah menjadi beberapa baris.

Solusi:
- Nomor PEB yang Anda isi (dari Bea Cukai) **dipakai**; jika dikosongkan, nomor dibuat otomatis.
- Kolom Material Code menampilkan **saran kode barang jadi dari stok**; memilih kode otomatis mengisi nama barang.
- Tanggal Submit/Approve PEB kini tersimpan dan tampil di detail PEB.

*File: `app/logistics/peb/new/page.tsx`, `app/logistics/peb/[id]/page.tsx`, `lib/store/usePEB.ts`*

---

**12. Alur Waste/Scrap (BC 2.4) tidak bisa dilanjutkan**

Masalah: Tombol **"Ajukan BC 2.4"** dan **"Konfirmasi Selesai"** tidak melakukan apa-apa, sehingga status waste tidak pernah maju dan tidak pernah muncul di Laporan KITE Lap 8.

Solusi: Alur kini berjalan: **Draft → Diajukan BC 2.4 → Diverifikasi BC → Selesai**. Nomor dan tanggal BC 2.4 dibuat otomatis jika belum diisi; tombol baru **"Tandai Diverifikasi BC"** ditambahkan untuk langkah tengah. Data waste muncul di Lap 8 sejak status "Diajukan BC 2.4".

*File: `app/warehouse/waste/page.tsx`, `app/reports/kite-inventory/page.tsx`*

---

**13. Laporan KITE Lap 3 memuat job subkon yang masih Draft**

Masalah: Job subkon yang bahan bakunya belum dikirim sudah tercatat sebagai pemakaian BB subkontrak.

Solusi: Lap 3 hanya memuat job yang BB-nya sudah dikirim (status BB Dikirim ke atas).

*File: `app/reports/kite-inventory/page.tsx`*

---

**14. Pembayaran AR/AP dengan nilai desimal bisa membengkak 100×**

Masalah: Kolom nominal bayar membuang titik desimal, sehingga saldo berdesimal (misal tagihan USD × kurs = 1.937,5) terbaca 19.375 saat dibayar penuh.

Solusi: Nominal desimal kini dibaca benar. Sisa kurang dari Rp 1 (pembulatan) dianggap lunas.

*File: `app/finance/ap/page.tsx`, `app/finance/ar/page.tsx`*

---

**15. Pembayaran AR/AP tidak muncul di halaman Payments**

Masalah: Halaman **Finance → Payments** hanya menampilkan data contoh; pembayaran yang Anda input dari AR/AP tidak tercatat di sana.

Solusi: Setiap pembayaran AR/AP kini tercatat (nomor pembayaran, invoice, pihak terkait, tanggal, nominal, metode, referensi, catatan) dan tampil di halaman Payments.

*File: `lib/store/usePayments.ts`, `app/finance/payments/page.tsx`*

---

**16. Perbaikan kecil lainnya**

- **Catatan PO** yang diisi di form PO kini ikut tersimpan (sebelumnya hanya tampil di cetakan).
- **Halaman AP** tidak selesai dimuat karena tautan nomor PO menuju halaman yang tidak ada; tautan kini mengarah ke daftar PO (juga di detail AP dan detail BC 2.0).
- **Format angka** disamakan (format Indonesia, mis. 2.000) di seluruh halaman agar tampilan konsisten di semua komputer.
- **Timeline status BC 2.0** di halaman detail tampil dengan benar.
- **Cetak PO** kini aman terhadap karakter khusus pada nama item/catatan.

---

## Pertanyaan & Jawaban

---

**Q1 (Gudang). Beda "Antrian PO" dengan "Input Penerimaan Baru" — sebaiknya input di mana?**

Keduanya memakai mekanisme yang sama dan data masuk ke stok serta Laporan KITE Lap 1. Perbedaannya:

| | **Antrian PO → Terima** (disarankan) | **+ Input Penerimaan Baru** |
|---|---|---|
| Dipakai untuk | Barang dari PO yang sudah ada di sistem | Barang tanpa PO terdaftar (mis. sampel, titipan, sisa) |
| Terhubung ke nomor PO | Otomatis (status PO ikut berubah) | Tidak otomatis (status PO tidak berubah) |
| Qty default | Sisa yang belum diterima | Diisi sendiri |
| Penerimaan parsial | Didukung (status PO: Partial → Received) | Tidak melacak sisa PO |
| Peringatan qty | Ada, jika melebihi sisa PO | Tidak ada |

Rekomendasi: **gunakan Antrian PO** kapan pun barang punya PO, agar sisa qty dan status PO selalu akurat.

---

**Q2 (Akunting). Export Laporan Keuangan apakah hanya Excel? Mengapa formatnya tidak seperti tampilan LK di Vercel?**

Saat ini export Laporan Keuangan **hanya tersedia dalam Excel** (satu file, beberapa sheet: Laba Rugi, Neraca, dan seterusnya). Isinya berupa tabel sederhana dua kolom (nama akun/pos dan nominal) — **bukan** tata letak yang sama dengan tampilan di layar (tanpa pengelompokan, subtotal bergaya, dan kop laporan). Belum ada export PDF.

Kami bisa menyamakan format export dengan tampilan layar (dan menambah PDF) jika Anda menyediakan **contoh format yang diinginkan** — lihat Pertanyaan untuk Klien nomor 8.

---

**Q3 (Akunting). Jika ada penerimaan/pengeluaran bahan dan penambahan barang jadi, apakah Valuasi Stok di tab Akunting ikut berubah?**

**Qty: ya.** Kolom Qty On Hand di Valuasi Stok mengikuti stok gudang secara langsung — penerimaan, pengeluaran BB, penerimaan barang jadi, pengiriman, dan penyesuaian stok semuanya langsung tercermin.

**Nilai: belum otomatis.** Harga satuan di Valuasi Stok saat ini memakai **daftar harga tetap untuk 11 kode material contoh**. Material baru (mis. dari PO baru) akan tampil dengan harga "—" dan nilai 0. Di versi produksi, nilai akan dihitung dari harga perolehan (PO/penerimaan) dengan metode penilaian yang Anda pilih — lihat Pertanyaan untuk Klien nomor 7.

---

## Hasil QC (Pengujian Menyeluruh)

Untuk memastikan sistem siap dilanjutkan ke tahap server/database, kami menjalankan pengujian otomatis di browser sungguhan (Playwright) dan pemeriksaan kode.

**Yang sudah diuji (93 pengujian, semuanya lulus):**

| Area | Yang diperiksa |
|---|---|
| Seluruh halaman | 72 halaman terbuka tanpa error |
| Gudang — Pengeluaran BB | Buat → satuan benar → cetak → edit → hapus; stok & pergerakan stok konsisten di tiap langkah |
| Sales Order | Revisi qty setelah Approved (total, riwayat), isi cetak SO |
| Alur penuh Ekspor | SO → Work Order → Mulai Produksi (stok BB turun) → QC → Terima BJ → Kirim (stok BJ turun, kirim melebihi stok ditolak) → PEB Create & Approve → Laporan KITE Lap 2, 4, 5, 7 cocok dengan transaksi |
| Pembelian | PO → terima parsial (60) → status Partial → terima sisa (40) → Received; stok benar |
| Akunting | Tagihan AP → bayar bertahap → Paid; pembayaran tercatat; saldo desimal AP dan AR |
| Subkontrak | Buat job → kirim BB (peringatan stok kurang) → terima parsial & akhir → selesai; Lap 2, 3, 4 |
| Waste | Draft → Diajukan → Diverifikasi → Selesai → muncul di Lap 8 |

**Belum tercakup pengujian otomatis:** Laporan Keuangan & Jurnal, Penjualan Lokal (BC 2.4), BC 4.0, Gudang WIP/penyimpanan sementara, laporan traceability. Area ini sudah diperiksa secara kode saja, belum secara alur lengkap.

**Catatan kesiapan pindah ke server (untuk diketahui, bukan kendala demo):**
- Demo belum memiliki **login dan hak akses per peran**; versi produksi wajib punya.
- Seluruh data bisnis di demo disimpan di browser; perlu desain database dan migrasi data awal.
- **Jurnal akuntansi masih manual** (tidak otomatis dari invoice/pembayaran).
- Perhitungan stok dan validasi akan dipindah ke server (di demo, peringatan stok kurang masih boleh dilewati).

---

## Pertanyaan untuk Klien

Beberapa hal membutuhkan keputusan bisnis dari Anda sebelum kami lanjutkan. Rekomendasi kami tercantum di setiap poin.

**1. BB sisa dari subkon (CMT):** Saat menerima hasil dari CMT, ada kolom "Qty kembali" bahan baku. Saat ini terisi otomatis sama dengan qty yang dikirim dan **tidak menambah stok BB**. Apakah BB sisa harus masuk kembali ke stok gudang BB? *Rekomendasi: ya, default kosong (0) dan diisi sesuai sisa nyata.*

**2. Penerimaan melebihi sisa PO:** Saat ini hanya muncul peringatan merah, tombol tetap aktif (sesuai permintaan sebelumnya). Apakah tetap peringatan, atau diblokir? Atau diizinkan dengan toleransi (mis. ±5%)? *Rekomendasi: peringatan + toleransi yang Anda tentukan.*

**3. Kapan stok barang jadi keluar:** Saat ini stok keluar saat **Dispatch Pengiriman**, bukan saat PEB disetujui. Apakah sesuai praktik Anda? Bagaimana untuk **penjualan lokal (BC 2.4)** — apakah stok keluar saat dokumen disetujui?

**4. Laporan KITE Lap 5:** Kami menetapkan hanya PEB **Approved/Exported** yang masuk (bukan Submitted). Apakah sudah sesuai kebijakan pelaporan Anda?

**5. Form Waste:** Pilihan Work Order di form Waste saat ini masih daftar contoh, belum terhubung ke Work Order sungguhan. Kami akan menghubungkannya — apakah ada ketentuan khusus (mis. hanya WO berstatus Completed)? Dan siapa yang menandai "Diverifikasi BC": staf JKJ yang mencatat hasil verifikasi petugas BC, atau petugas BC langsung di sistem?

**6. Cetak SO sesuai dokumen worksheet:** Agar tabel qty per ukuran (#18–#22, per sisi tangan/warna) bisa tampil seperti contoh Anda, kami perlu: (a) contoh data lengkap satu SO (ukuran apa saja, tangan kiri/kanan, warna), (b) apakah data ini diinput di form SO (kolom ukuran per item), dan (c) apakah gambar/pola sarung tangan juga harus ikut tercetak (butuh penyimpanan file di versi produksi).

**7. Valuasi stok:** Metode penilaian mana yang dipakai — rata-rata tertimbang, FIFO, atau harga PO terakhir? Apakah barang jadi dinilai dari biaya produksi (bahan + jasa subkon), dan apakah valuasi per mata uang asli atau dikonversi ke IDR?

**8. Format export Laporan Keuangan:** Mohon kirim contoh format yang diinginkan (file Excel atau PDF dari laporan Anda saat ini). Apakah perlu export PDF selain Excel?

**9. Jurnal otomatis:** Apakah invoice (AR/AP) dan pembayaran perlu membuat jurnal debit/kredit otomatis? Jika ya, mohon konfirmasi akun default (piutang, hutang, kas/bank, pendapatan, PPN, selisih kurs).

**10. Batas revisi SO:** SO kini bisa direvisi sampai status In Production. Apakah revisi setelah Approved perlu **persetujuan ulang** manager, dan sampai tahap mana revisi masih diizinkan?

**11. Hak akses (untuk versi produksi):** Mohon daftar peran dan wewenangnya — siapa yang boleh membuat, menyetujui, mengedit, dan menghapus tiap dokumen (SO, PO, WO, pengeluaran BB, PEB, invoice, pembayaran).

**12. Prioritas fitur tersisa:** Mana yang lebih dahulu dikerjakan setelah poin di atas: tampilan Work Order format worksheet (WO-3), alur subkontrak yang lebih terpandu (SK-1), jurnal otomatis, atau valuasi stok otomatis?

---

## Item Belum Selesai

---

**Cetak SO — tabel qty per ukuran dan gambar** — menunggu jawaban nomor 6 (butuh penambahan kolom data dan penyimpanan file).

**WO-3 — Tampilan detail WO format worksheet** — belum diimplementasi; tab "Lembar Kerja" digital sudah ada, tetapi belum identik dengan worksheet yang Anda upload. Dijadwalkan bersama versi produksi.

**SK-1 — Alur subkontrak lebih terpandu** — belum diimplementasi; menunggu prioritas (nomor 12).

**Valuasi stok otomatis, jurnal otomatis per invoice/pembayaran, tab Jurnal per dokumen, modul Aset Tetap & penyusutan** — fitur untuk versi produksi (lihat Q7 dan Q8 pada feedback September 2026).

---

*Feedback sebelumnya: lihat [CLIENT_FEEDBACK_SEPTEMBER2026.md](CLIENT_FEEDBACK_SEPTEMBER2026.md) (September 2026)*
