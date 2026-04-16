// Subkontrak KITE Mock Data
// Format dokumen sesuai PER-5/BC/2023

export type SubkonStatus = 'Draft' | 'BB Dikirim' | 'Dalam Proses' | 'Hasil Diterima' | 'Selesai'

export interface SubkonItem {
  kodeBB: string
  namaBB: string
  satuanBB: string
  qtyKirim: number       // BB dikirim ke subkon
  qtyKembali?: number    // hasil produk dari subkon
  satuanHP?: string
  isKITE: boolean        // apakah BB ini dari fasilitas KITE
}

export interface FeeJasa {
  invoiceNo: string
  invoiceTgl: string
  nilaiJasa: number
  matauang: string
  status: 'Belum Dibayar' | 'Sudah Dibayar'
}

export interface SubkonRecord {
  id: string
  // Subkontraktor
  namaSubkon: string
  alamatSubkon: string
  npwpSubkon: string

  // Job
  jobNo: string
  jobTgl: string
  deskripsiPekerjaan: string
  targetSelesai: string
  tglSelesaiAktual: string

  // Dokumen SUBK KITE
  // 1.1/2.1 = pengeluaran BB ke subkon
  // 1.2/2.2 = pemasukan hasil dari subkon
  subkKiteKirimNo: string   // SUBK KITE 1.1 atau 2.1
  subkKiteKirimTgl: string
  subkKiteKirimJenis: 'SUBK KITE 1.1' | 'SUBK KITE 2.1'
  subkKiteTerimaNo: string  // SUBK KITE 1.2 atau 2.2
  subkKiteTerimaTgl: string
  subkKiteTerimaJenis: 'SUBK KITE 1.2' | 'SUBK KITE 2.2'

  // Surat Jalan
  suratJalanNo: string
  suratJalanTgl: string

  // Items
  items: SubkonItem[]

  // Fee Jasa
  feeJasa: FeeJasa

  // Status
  status: SubkonStatus
  catatan: string
}

export const MOCK_SUBKON_RECORDS: SubkonRecord[] = [
  {
    id: 'SUBK-2026-001',
    namaSubkon: 'PT. Subkon Plastik Jaya',
    alamatSubkon: 'Jl. Industri Raya No. 12, Cikarang, Bekasi',
    npwpSubkon: '01.234.567.8-901.000',
    jobNo: 'JOB-SUBK-2026-001',
    jobTgl: '2026-01-29',
    deskripsiPekerjaan: 'Proses ekstrusi dan pembentukan produk polimer HDPE grade khusus',
    targetSelesai: '2026-02-10',
    tglSelesaiAktual: '2026-02-08',
    subkKiteKirimNo: 'SUBK-1.1-2026-001',
    subkKiteKirimTgl: '2026-01-30',
    subkKiteKirimJenis: 'SUBK KITE 1.1',
    subkKiteTerimaNo: 'SUBK-1.2-2026-001',
    subkKiteTerimaTgl: '2026-02-09',
    subkKiteTerimaJenis: 'SUBK KITE 1.2',
    suratJalanNo: 'SJ-2026-001',
    suratJalanTgl: '2026-01-30',
    items: [
      {
        kodeBB: 'BB-HDPE-001',
        namaBB: 'Polyethylene Resin - HDPE Grade',
        satuanBB: 'KG',
        qtyKirim: 2000,
        qtyKembali: 1800,
        satuanHP: 'KG',
        isKITE: true
      }
    ],
    feeJasa: {
      invoiceNo: 'INV-SUBK-2026-001',
      invoiceTgl: '2026-02-10',
      nilaiJasa: 15000000,
      matauang: 'IDR',
      status: 'Sudah Dibayar'
    },
    status: 'Selesai',
    catatan: 'Pekerjaan selesai lebih awal dari target. Kualitas OK.'
  },
  {
    id: 'SUBK-2026-002',
    namaSubkon: 'PT. Metal Fabrikasi Nusantara',
    alamatSubkon: 'Jl. Raya Bekasi KM 25, Cakung, Jakarta Timur',
    npwpSubkon: '02.345.678.9-012.000',
    jobNo: 'JOB-SUBK-2026-002',
    jobTgl: '2026-02-17',
    deskripsiPekerjaan: 'Pemotongan dan pembentukan (fabrication) Cold Rolled Coil menjadi panel baja',
    targetSelesai: '2026-03-05',
    tglSelesaiAktual: '2026-02-28',
    subkKiteKirimNo: 'SUBK-1.1-2026-002',
    subkKiteKirimTgl: '2026-02-18',
    subkKiteKirimJenis: 'SUBK KITE 1.1',
    subkKiteTerimaNo: 'SUBK-1.2-2026-002',
    subkKiteTerimaTgl: '2026-02-28',
    subkKiteTerimaJenis: 'SUBK KITE 1.2',
    suratJalanNo: 'SJ-2026-002',
    suratJalanTgl: '2026-02-18',
    items: [
      {
        kodeBB: 'BB-CRC-001',
        namaBB: 'Cold Rolled Coil (CRC)',
        satuanBB: 'KG',
        qtyKirim: 10000,
        qtyKembali: 9500,
        satuanHP: 'KG',
        isKITE: true
      },
      {
        kodeBB: 'BB-LOCAL-001',
        namaBB: 'Cat Primer Anti Karat (Lokal)',
        satuanBB: 'LITER',
        qtyKirim: 200,
        qtyKembali: 200,
        satuanHP: 'LITER',
        isKITE: false
      }
    ],
    feeJasa: {
      invoiceNo: 'INV-SUBK-2026-002',
      invoiceTgl: '2026-03-01',
      nilaiJasa: 45000000,
      matauang: 'IDR',
      status: 'Sudah Dibayar'
    },
    status: 'Selesai',
    catatan: 'Mix material KITE (CRC) dan non-KITE (cat lokal). Hasil diterima lengkap.'
  },
  {
    id: 'SUBK-2026-003',
    namaSubkon: 'PT. Presisi Komponen Indonesia',
    alamatSubkon: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi',
    npwpSubkon: '03.456.789.0-123.000',
    jobNo: 'JOB-SUBK-2026-003',
    jobTgl: '2026-03-10',
    deskripsiPekerjaan: 'Proses stamping dan assembly komponen baja presisi untuk ekspor',
    targetSelesai: '2026-03-25',
    tglSelesaiAktual: '-',
    subkKiteKirimNo: 'SUBK-1.1-2026-003',
    subkKiteKirimTgl: '2026-03-11',
    subkKiteKirimJenis: 'SUBK KITE 1.1',
    subkKiteTerimaNo: '-',
    subkKiteTerimaTgl: '-',
    subkKiteTerimaJenis: 'SUBK KITE 1.2',
    suratJalanNo: 'SJ-2026-003',
    suratJalanTgl: '2026-03-11',
    items: [
      {
        kodeBB: 'BB-HRC-001',
        namaBB: 'Hot Rolled Coil (HRC)',
        satuanBB: 'KG',
        qtyKirim: 15000,
        isKITE: true
      }
    ],
    feeJasa: {
      invoiceNo: '-',
      invoiceTgl: '-',
      nilaiJasa: 0,
      matauang: 'IDR',
      status: 'Belum Dibayar'
    },
    status: 'Dalam Proses',
    catatan: 'BB sudah dikirim, menunggu hasil dari subkon.'
  },
  {
    id: 'SUBK-2026-004',
    namaSubkon: 'PT. Teknik Unggul Mandiri',
    alamatSubkon: 'Jl. Pahlawan No. 88, Sidoarjo, Jawa Timur',
    npwpSubkon: '04.567.890.1-234.000',
    jobNo: 'JOB-SUBK-2026-004',
    jobTgl: '2026-03-20',
    deskripsiPekerjaan: 'Pelapisan (coating) dan finishing produk komponen ekspor',
    targetSelesai: '2026-04-10',
    tglSelesaiAktual: '-',
    subkKiteKirimNo: '-',
    subkKiteKirimTgl: '-',
    subkKiteKirimJenis: 'SUBK KITE 1.1',
    subkKiteTerimaNo: '-',
    subkKiteTerimaTgl: '-',
    subkKiteTerimaJenis: 'SUBK KITE 1.2',
    suratJalanNo: '-',
    suratJalanTgl: '-',
    items: [
      {
        kodeBB: 'BB-HRC-001',
        namaBB: 'Hot Rolled Coil (HRC)',
        satuanBB: 'KG',
        qtyKirim: 8000,
        isKITE: true
      },
      {
        kodeBB: 'BB-LOCAL-002',
        namaBB: 'Bahan Coating (Lokal)',
        satuanBB: 'KG',
        qtyKirim: 500,
        isKITE: false
      }
    ],
    feeJasa: {
      invoiceNo: '-',
      invoiceTgl: '-',
      nilaiJasa: 0,
      matauang: 'IDR',
      status: 'Belum Dibayar'
    },
    status: 'Draft',
    catatan: 'Draft - belum dikirim ke subkon.'
  }
]

export const SUBKON_STATUS_STEPS: SubkonStatus[] = [
  'Draft',
  'BB Dikirim',
  'Dalam Proses',
  'Hasil Diterima',
  'Selesai'
]

export const SUBKON_STATUS_CONFIG: Record<SubkonStatus, { color: string; bg: string; border: string }> = {
  'Draft':          { color: 'text-gray-700',   bg: 'bg-gray-100',  border: 'border-gray-300' },
  'BB Dikirim':     { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-300' },
  'Dalam Proses':   { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  'Hasil Diterima': { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300' },
  'Selesai':        { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300' },
}

// Master data subkontraktor untuk dropdown form
export const MOCK_SUBKON_MASTER = [
  { id: 'SK-001', nama: 'PT. Subkon Plastik Jaya', npwp: '01.234.567.8-901.000' },
  { id: 'SK-002', nama: 'PT. Metal Fabrikasi Nusantara', npwp: '02.345.678.9-012.000' },
  { id: 'SK-003', nama: 'PT. Presisi Komponen Indonesia', npwp: '03.456.789.0-123.000' },
  { id: 'SK-004', nama: 'PT. Teknik Unggul Mandiri', npwp: '04.567.890.1-234.000' },
]
