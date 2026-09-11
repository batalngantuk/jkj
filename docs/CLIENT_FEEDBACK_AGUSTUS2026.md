# Feedback Klien — Agustus 2026

**Sumber:** Komen2 (2).pdf  
**Tanggal diterima:** 13 Agustus 2026  
**Diselesaikan:** 13 Agustus 2026  
**Status:** ✅ Semua item selesai (kecuali WO-3 yang kompleks)

> **Catatan Penting — Keterbatasan Demo:**  
> Sistem yang digunakan saat ini adalah **versi demo berbasis browser**. Semua data disimpan di localStorage perangkat masing-masing dan tidak terhubung ke server. Beberapa keterbatasan yang perlu dipahami:
> - Data tidak tersimpan permanen — bisa hilang jika browser di-clear atau mode incognito
> - Upload file (lampiran, dokumen) tidak benar-benar tersimpan — hanya nama file yang tercatat
> - Tidak ada sinkronisasi antar perangkat
> - Jurnal otomatis, period lock, approval email, dan integrasi pajak belum ada di demo
>
> Semua keterbatasan ini **tidak ada di versi produksi** yang akan terhubung ke server dan database.

---

## Masalah & Solusi

---

**1. AR/AP Invoice — tidak tersimpan setelah submit**

Masalah: Form AR Invoice dan AP Invoice baru tidak menyimpan data ke daftar setelah diklik Submit.

Solusi: Perbaikan dilakukan pada mekanisme penyimpanan form. Invoice sekarang langsung muncul di daftar dengan nomor yang di-generate otomatis setelah submit.

---

**2. Inbound — tidak ada peringatan jika qty melebihi sisa PO (parsial)**

Masalah: Saat menerima sebagian barang dari PO yang sudah pernah diterima sebelumnya (parsial), tidak ada informasi berapa sisa yang masih kurang dan tidak ada peringatan jika input qty melebihi sisa.

Solusi: Dialog penerimaan di tab Antrian PO sekarang menampilkan tiga info per item:
- **Qty Dipesan** — total dari PO
- **Sudah Diterima** — akumulasi dari penerimaan sebelumnya (muncul jika > 0)
- **Qty Diterima** — input dengan label "(sisa: N)" dan border merah jika melebihi sisa

Default input otomatis terisi dengan sisa yang belum diterima.

---

**3. Pengeluaran BB — referensi WO tidak muncul di riwayat**

Masalah: Saat produksi dimulai dari WO, BB otomatis dikeluarkan dari gudang, tetapi riwayat di Warehouse → Pengeluaran BB tidak menampilkan referensi WO tersebut.

Solusi: Riwayat pengeluaran sekarang menggabungkan dua sumber: entri manual BPB dan pengeluaran otomatis dari stock movement (tipe PRODUCTION_OUT). Keduanya ditampilkan dalam satu tabel dengan referensi WO atau job subkon yang jelas.

---

**4. BOM — tidak bisa diedit setelah WO dibuat atau setelah Enter**

Masalah (WO-1 & WO-4): Tombol "Edit BOM" hanya muncul untuk WO berstatus PLANNED. Jika WO sudah berjalan atau jika item BOM tidak sengaja disimpan dengan qty 0, BOM tidak bisa diubah. Selain itu, filter penyimpanan membuang item yang qty-nya masih 0 meski kode dan nama sudah diisi.

Solusi:
- Tombol "Edit BOM" kini tersedia di semua status WO (bukan hanya PLANNED) selama BOM belum ada
- Filter simpan BOM tidak lagi membutuhkan qty > 0 — cukup kode dan nama diisi

---

**5. GR — tidak bisa edit item dan qty yang sudah diterima**

Masalah (OB-1): Setelah penerimaan barang (GR) tersimpan, tidak ada cara untuk mengoreksi qty diterima per item jika ada kesalahan input.

Solusi: Ditambahkan tombol **Edit** (pensil) di setiap baris GR di Warehouse → Inbound. Dialog edit menampilkan tabel item yang bisa diubah: kode barang, nama barang, satuan, dan qty diterima. Perubahan tersimpan ke store.

---

**6. Hapus GR / Pengeluaran BB — stok tidak dikembalikan**

Masalah (OB-2 bagian 1): Menghapus penerimaan GR atau pengeluaran BB hanya menghapus catatan transaksinya, stok di gudang tidak otomatis dikembalikan/dikurangi kembali.

Solusi:
- **Hapus GR**: stok BB otomatis dikurangi kembali (deduct) per item sebelum catatan dihapus
- **Hapus Pengeluaran BB**: stok BB otomatis dikembalikan (add back) per item sebelum catatan dihapus

---

**7. Pengeluaran BB — tidak bisa edit qty setelah tersimpan**

Masalah (OB-2 bagian 2): Setelah pengeluaran BB tersimpan, tidak ada cara untuk mengoreksi qty per item jika ada kesalahan.

Solusi: Ditambahkan tombol **Edit** (pensil) di riwayat pengeluaran BB (hanya untuk entri yang dibuat manual, bukan dari WO otomatis). Dialog edit menampilkan tabel qty per item yang bisa diubah. Saat disimpan, stok lama di-reverse lalu stok baru diterapkan otomatis.

---

**8. Print Form Sub Kite 1.1 dan 1.2**

Masalah (F3 & F4): Tidak ada cara untuk mencetak dokumen SUBK KITE 1.1 (bukti pengeluaran BB ke subkon) dan SUBK KITE 1.2 (bukti penerimaan hasil dari subkon).

Solusi: Tombol **Print SUBK KITE 1.1** dan **Print SUBK KITE 1.2** sekarang muncul di footer dialog detail Job Subkontrak (muncul hanya jika nomor dokumen sudah ada). Halaman print mencakup: header perusahaan, info subkontraktor, jenis kegiatan CMT, lama pengerjaan, daftar item, dan kolom tanda tangan tiga pihak.

---

**9. Invoice — tipe tidak lengkap dan unit price tidak bisa desimal**

Masalah (AC-1): Pilihan tipe invoice di AR dan AP tidak mencakup semua jenis dokumen yang dipakai. Selain itu, unit price tidak bisa diisi nilai desimal (misal 1.25 USD).

Solusi:
- Pilihan tipe invoice: **BC3.0** (Ekspor) / **Loc** (Lokal) / **BC2.4** (Kawasan Berikat) — dengan badge warna berbeda
- Input unit price kini mendukung nilai desimal (`step="any"`)

---

**10. Tax Payment — error saat mencatat pembayaran pajak**

Masalah (AC-4): Tombol "Pay Tax" di halaman BC 2.0 menghasilkan error karena route API mencoba mengakses database (Prisma) yang tidak ada di versi demo.

Solusi: Mekanisme pembayaran pajak diubah ke local state — tidak lagi memanggil API. Pembayaran dicatat di browser, status berubah ke TAX_PAID, banner sukses muncul dengan detail pembayaran (nominal, tanggal, metode, referensi), dan tombol "Pay Tax" disembunyikan setelah berhasil.

---

**11. KITE Lap 2 — kolom penerima subkon kosong**

Masalah: Di Laporan KITE Lap 2 (Pemakaian BB ke Subkontrak), kolom "Penerima Subkon" selalu kosong meski data job subkon sudah ada.

Solusi: Saat BB dikirim ke subkon (klik "Kirim BB ke Subkon"), sekarang dibuat stock movement `PRODUCTION_OUT` dengan referensi ID job subkon. KITE Lap 2 mencocokkan movement ini dengan data job subkon dan menampilkan nama CMT di kolom penerima.

---

**12. KITE Lap 7 — Mutasi HP tidak update setelah buat PEB**

Masalah: Setelah membuat PEB baru, Laporan KITE Lap 7 (Mutasi HP) tidak menampilkan pengeluaran dari PEB tersebut.

Solusi: Penyebabnya adalah kode barang di kolom pemasukan HP (dibentuk dari nama produk) dan pengeluaran HP (dari materialCode di PEB) tidak cocok. Diperbaiki dengan menggabungkan semua kode dari kedua sumber — Lap 7 sekarang menampilkan baris untuk setiap kode barang yang punya pemasukan dan/atau pengeluaran, meskipun kode-nya berbeda format.

---

**13. BJ parsial — WO hilang dari daftar setelah penerimaan pertama**

Masalah (item 7): Setelah input penerimaan BJ parsial dari WO, WO tersebut tidak lagi muncul saat ingin input penerimaan kedua.

Solusi:
- Kolom "Sudah Diterima" dan "Sisa" ditambahkan di tabel WO list — bisa langsung lihat progress per WO
- Form input BJ tidak lagi auto-fill dengan sisa penuh — user harus isi sendiri qty yang diterima, sehingga WO tidak terlanjur ditandai selesai

---

**14. Kirim ke customer — bisa melebihi stok BJ tersedia**

Masalah (item 8): Tidak ada validasi saat mengisi qty pengiriman yang melebihi stok barang jadi yang ada di gudang.

Solusi: Tombol "Dispatch Pengiriman" kini disabled jika qty yang diisi melebihi stok BJ tersedia. Info stok tersedia (dan kekurangan) ditampilkan di atas form sebelum user mengisi qty kirim.

---

**15. Rekap Penjualan & Pembelian tidak ada**

Masalah (AC-3): Tidak ada halaman yang merangkum semua transaksi penjualan dan pembelian dalam satu tempat untuk keperluan rekonsiliasi.

Solusi: Halaman **Reports → Rekap Penjualan & Pembelian** sudah tersedia. Fitur:
- Tab terpisah: Penjualan (Ekspor + Lokal) dan Pembelian (PO + GR)
- Filter periode (tahun + bulan)
- Export Excel multi-sheet
- Summary cards: total penjualan, total pembelian, saldo

---

**16. Hapus PEB — tidak ada tombol hapus**

Masalah (SK-2): Di halaman daftar PEB, tidak ada cara untuk menghapus dokumen PEB yang salah dibuat.

Solusi: Ditambahkan tombol **Hapus** (ikon tong sampah) di setiap baris PEB berstatus **Draft** atau **Cancelled**. Muncul konfirmasi sebelum data dihapus. PEB yang sudah Submitted/Approved tidak bisa dihapus langsung.

---

## Pertanyaan & Jawaban

---

**Q1. SO yang dikerjakan sebagian di JKJ, sebagian di beberapa CMT — bagaimana alurnya?**

Rekomendasi: buat **1 SO utama** dengan total qty keseluruhan, lalu buat job subkon per CMT dan WO untuk sisa yang dikerjakan sendiri — semuanya referensi ke SO yang sama di field catatan/referensi.

Detail lengkap:
1. Buat SO utama (misal: SO JKJ00126 = 10.000 PCE)
2. Buat job subkon per CMT di Produksi → Subkontrak, isi referensi SO = SO JKJ00126
3. Buat WO untuk bagian yang dikerjakan sendiri, isi referensi SO yang sama
4. Bagian yang belum pasti → belum perlu dibuat WO/job subkon

Nomor SO tidak bisa dibuat duplikat di sistem (auto-generate). Gunakan field **Referensi** atau **Catatan** untuk mencatat nomor SO operasional jika berbeda.

---

**Q2. Hapus pengeluaran BB — stok tidak kembali, di mana bisa koreksi manual?**

Sejak sesi ini, hapus pengeluaran BB otomatis mengembalikan stok (lihat poin 6 di atas).

Jika ada selisih stok yang perlu dikoreksi manual karena alasan lain: gunakan **Warehouse → Penyesuaian Stok** — pilih material, input qty aktual, sistem menghitung selisih dan mencatat koreksi.

---

**Q5. Penjualan material lokal (BC 2.4) — masuk laporan KITE mana?**

Secara konsep: penjualan lokal dari kawasan berikat masuk ke **Laporan 5 (Pengeluaran HP)** bersama PEB, karena keduanya adalah pengeluaran barang jadi dari kawasan berikat.

Di versi demo saat ini: penjualan lokal belum terhubung otomatis ke laporan KITE — hanya muncul di P&L dan halaman Rekap Penjualan. Integrasi ke KITE Lap 5 akan ada di versi produksi.

---

**Q6. Input penerimaan material — pakai cara 1 (manual) atau cara 2 (Antrian PO)?**

Kedua cara memanggil mekanisme yang sama dan data masuk ke laporan KITE Lap 1.

Rekomendasi: **Cara 2 (Tab Antrian PO → Terima)** karena:
- Terhubung ke nomor PO secara otomatis
- Ada info sisa qty dan peringatan over-qty (lihat poin 2 di atas)
- Data lebih akurat untuk rekonsiliasi

Cara 1 (+ Input Penerimaan Barang) cocok untuk penerimaan yang tidak terkait PO terdaftar di sistem.

---

**Q9. Alur PEB dari awal sampai selesai? Laporan Mutasi HP belum update setelah buat PEB.**

Alur PEB:
1. Logistics → PEB → klik "+ Create PEB"
2. Isi semua field: PEB Number, NPE Number, Customer, Export Details, item barang
3. Klik **"Save Draft"** → status Draft
4. Klik **"Submit"** → status Submitted
5. Klik **"Approve"** → status Approved → **Lap 5 (Pengeluaran HP) dan Lap 7 (Mutasi HP) otomatis terupdate**

Penting: laporan KITE hanya terupdate setelah status PEB **Approved** (bukan hanya Submitted).

Bug Mutasi HP tidak update setelah PEB sudah diperbaiki di sesi ini (lihat poin 12 di atas).

---

**Q10. Penjualan material lokal — No. SO Referensi diisi apa? Tidak muncul di laporan.**

No. SO Referensi: opsional — isi nomor SO jika penjualan ini terkait SO tertentu. Bisa dikosongkan.

Jika tidak muncul di laporan keuangan: pastikan dokumen sudah berstatus **Approved** (bukan Draft). Buka detail dokumen penjualan lokal → klik tombol "Approve" → setelah status berubah ke Approved, nilai akan muncul di Finance → Laporan Keuangan sebagai komponen pendapatan dan di Rekap Penjualan sebagai baris "Lokal".

---

**Q12. Alur subkontrak/CMT dari awal sampai selesai — masih belum jelas**

Alur lengkap:

**Langkah 1 — Buat Job Subkon**
- Produksi → Subkontrak → "+ Buat Job Subkontrak Baru"
- Isi: nama CMT, referensi SO, qty BJ target, deskripsi, estimasi BB yang dikirim
- Simpan → status **Draft**

**Langkah 2 — Kirim BB ke CMT**
- Buka detail job subkon → klik "Kirim BB ke Subkon"
- Isi tanggal pengiriman, No. Surat Jalan, No. SUBK KITE 1.1
- Klik "Konfirmasi Kirim BB" → status **BB Dikirim** → KITE Lap 3 otomatis tercatat
- Print SUBK KITE 1.1 dari footer dialog detail

**Langkah 3 — Terima Hasil dari CMT**
- Buka detail job subkon → klik "Terima Hasil dari CMT"
- Isi tanggal terima, No. Surat Jalan masuk, No. SUBK KITE 1.2, qty BJ diterima, qty BB kembali
- Centang "Ini penerimaan terakhir" jika job selesai
- Klik konfirmasi → jika terakhir: status **Hasil Diterima** → KITE Lap 4 tercatat
- Print SUBK KITE 1.2 dari footer dialog detail

---

**Q13. Hapus PEB — di mana tombolnya?**

Di halaman **Logistics → PEB** (daftar PEB): PEB berstatus **Draft** atau **Cancelled** memiliki tombol hapus (ikon tong sampah) di sebelah kanan. Muncul konfirmasi sebelum data dihapus.

PEB berstatus Submitted, Approved, atau Exported tidak bisa dihapus langsung — di versi produksi akan memerlukan approval supervisor dan jurnal koreksi otomatis.

---

## Item Belum Selesai

---

**WO-3 — View detail WO sama dengan format worksheet yang di-upload**

Permintaan: tampilan detail WO di sistem sama persis dengan soft file lembar kerja yang di-upload.

Kondisi saat ini: tab "Lembar Kerja" digital sudah ada di detail WO, berisi checklist langkah produksi dengan input operator per langkah.

Batasan demo: file yang di-upload tidak benar-benar tersimpan (tidak ada server), sehingga tidak bisa ditampilkan ulang. Di versi produksi, file akan tersimpan di server dan bisa ditampilkan di halaman detail.

---

*Feedback sebelumnya: lihat [CLIENT_FEEDBACK_JULI2026_2.md](CLIENT_FEEDBACK_JULI2026_2.md) (Juli sesi 2)*
