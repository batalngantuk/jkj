// KITE IT Inventory Mock Data
// Format sesuai Lampiran XXII PER-5/BC/2023

// ─────────────────────────────────────────────
// Laporan 1: Pemasukan Bahan Baku
// ─────────────────────────────────────────────
export interface PemasukanBB {
  no: number
  tglRekam: string
  jenisDokumen: string // BC 2.0 / BC 2.4 / BC 2.5 / BC 2.8
  noDokumen: string
  tglDokumen: string
  kodeHS: string
  noSeriBarang: string
  buktiPenerimaanNo: string
  buktiPenerimaanTgl: string
  kodeBB: string
  namaBarang: string
  satuan: string
  jumlah: number
  matauang: string
  nilaiBarang: number
  gudang: string
  penerimaSubkon: string
  negaraAsal: string
}

export const MOCK_PEMASUKAN_BB: PemasukanBB[] = [
  {
    no: 1,
    tglRekam: '2026-01-20',
    jenisDokumen: 'BC 2.0',
    noDokumen: 'PIB-2026-001234',
    tglDokumen: '2026-01-18',
    kodeHS: '7208.10.00',
    noSeriBarang: '001',
    buktiPenerimaanNo: 'GR-2026-001',
    buktiPenerimaanTgl: '2026-01-20',
    kodeBB: 'BB-HRC-001',
    namaBarang: 'Hot Rolled Coil (HRC)',
    satuan: 'KG',
    jumlah: 100000,
    matauang: 'USD',
    nilaiBarang: 95000,
    gudang: 'Gudang RM-A',
    penerimaSubkon: '-',
    negaraAsal: 'CN'
  },
  {
    no: 2,
    tglRekam: '2026-01-28',
    jenisDokumen: 'BC 2.0',
    noDokumen: 'PIB-2026-001567',
    tglDokumen: '2026-01-25',
    kodeHS: '3901.20.00',
    noSeriBarang: '001',
    buktiPenerimaanNo: 'GR-2026-002',
    buktiPenerimaanTgl: '2026-01-28',
    kodeBB: 'BB-HDPE-001',
    namaBarang: 'Polyethylene Resin - HDPE Grade',
    satuan: 'KG',
    jumlah: 10000,
    matauang: 'USD',
    nilaiBarang: 18000,
    gudang: 'Gudang RM-B',
    penerimaSubkon: '-',
    negaraAsal: 'KR'
  },
  {
    no: 3,
    tglRekam: '2026-02-05',
    jenisDokumen: 'BC 2.0',
    noDokumen: 'PIB-2026-001890',
    tglDokumen: '2026-02-03',
    kodeHS: '8481.20.00',
    noSeriBarang: '001',
    buktiPenerimaanNo: 'GR-2026-003',
    buktiPenerimaanTgl: '2026-02-05',
    kodeBB: 'BB-VALVE-001',
    namaBarang: 'Industrial Ball Valves 2 inch',
    satuan: 'PCS',
    jumlah: 200,
    matauang: 'USD',
    nilaiBarang: 4400,
    gudang: 'Gudang RM-A',
    penerimaSubkon: '-',
    negaraAsal: 'JP'
  },
  {
    no: 4,
    tglRekam: '2026-02-15',
    jenisDokumen: 'BC 2.0',
    noDokumen: 'PIB-2026-002001',
    tglDokumen: '2026-02-12',
    kodeHS: '7209.15.00',
    noSeriBarang: '001',
    buktiPenerimaanNo: 'GR-2026-004',
    buktiPenerimaanTgl: '2026-02-15',
    kodeBB: 'BB-CRC-001',
    namaBarang: 'Cold Rolled Coil (CRC)',
    satuan: 'KG',
    jumlah: 50000,
    matauang: 'USD',
    nilaiBarang: 52500,
    gudang: 'Gudang RM-A',
    penerimaSubkon: '-',
    negaraAsal: 'CN'
  }
]

// ─────────────────────────────────────────────
// Laporan 2: Pemakaian Bahan Baku
// ─────────────────────────────────────────────
export interface PemakaianBB {
  no: number
  buktiPengeluaranNo: string
  buktiPengeluaranTgl: string
  kodeBarang: string
  namaBarang: string
  satuan: string
  jumlahDigunakan: number
  jumlahDisubkonkan: number
  penerimaSubkon: string
}

export const MOCK_PEMAKAIAN_BB: PemakaianBB[] = [
  {
    no: 1,
    buktiPengeluaranNo: 'BPB-2026-001',
    buktiPengeluaranTgl: '2026-01-22',
    kodeBarang: 'BB-HRC-001',
    namaBarang: 'Hot Rolled Coil (HRC)',
    satuan: 'KG',
    jumlahDigunakan: 80000,
    jumlahDisubkonkan: 0,
    penerimaSubkon: '-'
  },
  {
    no: 2,
    buktiPengeluaranNo: 'BPB-2026-002',
    buktiPengeluaranTgl: '2026-01-30',
    kodeBarang: 'BB-HDPE-001',
    namaBarang: 'Polyethylene Resin - HDPE Grade',
    satuan: 'KG',
    jumlahDigunakan: 6000,
    jumlahDisubkonkan: 2000,
    penerimaSubkon: 'PT. Subkon Plastik Jaya'
  },
  {
    no: 3,
    buktiPengeluaranNo: 'BPB-2026-003',
    buktiPengeluaranTgl: '2026-02-06',
    kodeBarang: 'BB-VALVE-001',
    namaBarang: 'Industrial Ball Valves 2 inch',
    satuan: 'PCS',
    jumlahDigunakan: 195,
    jumlahDisubkonkan: 0,
    penerimaSubkon: '-'
  },
  {
    no: 4,
    buktiPengeluaranNo: 'BPB-2026-004',
    buktiPengeluaranTgl: '2026-02-18',
    kodeBarang: 'BB-CRC-001',
    namaBarang: 'Cold Rolled Coil (CRC)',
    satuan: 'KG',
    jumlahDigunakan: 30000,
    jumlahDisubkonkan: 10000,
    penerimaSubkon: 'PT. Metal Fabrikasi Nusantara'
  }
]

// ─────────────────────────────────────────────
// Laporan 3: Pemakaian BB dalam Proses Subkontrak
// ─────────────────────────────────────────────
export interface PemakaianBBSubkon {
  no: number
  buktiPengeluaranNo: string
  buktiPengeluaranTgl: string
  kodeBarang: string
  namaBarang: string
  satuan: string
  jumlahDisubkonkan: number
  penerimaSubkon: string
}

export const MOCK_PEMAKAIAN_BB_SUBKON: PemakaianBBSubkon[] = [
  {
    no: 1,
    buktiPengeluaranNo: 'BPB-2026-002',
    buktiPengeluaranTgl: '2026-01-30',
    kodeBarang: 'BB-HDPE-001',
    namaBarang: 'Polyethylene Resin - HDPE Grade',
    satuan: 'KG',
    jumlahDisubkonkan: 2000,
    penerimaSubkon: 'PT. Subkon Plastik Jaya'
  },
  {
    no: 2,
    buktiPengeluaranNo: 'BPB-2026-004',
    buktiPengeluaranTgl: '2026-02-18',
    kodeBarang: 'BB-CRC-001',
    namaBarang: 'Cold Rolled Coil (CRC)',
    satuan: 'KG',
    jumlahDisubkonkan: 10000,
    penerimaSubkon: 'PT. Metal Fabrikasi Nusantara'
  }
]

// ─────────────────────────────────────────────
// Laporan 4: Pemasukan Hasil Produksi
// ─────────────────────────────────────────────
export interface PemasukanHP {
  no: number
  dokumenNo: string
  dokumenTgl: string
  kodeBarang: string
  namaBarang: string
  satuan: string
  jumlahDariProduksi: number
  jumlahDariSubkon: number
  gudang: string
}

export const MOCK_PEMASUKAN_HP: PemasukanHP[] = [
  {
    no: 1,
    dokumenNo: 'WO-2026-001',
    dokumenTgl: '2026-01-25',
    kodeBarang: 'FG-SCA-001',
    namaBarang: 'Steel Coil Grade A (Export Quality)',
    satuan: 'KG',
    jumlahDariProduksi: 95000,
    jumlahDariSubkon: 0,
    gudang: 'Gudang FG-A'
  },
  {
    no: 2,
    dokumenNo: 'WO-2026-002',
    dokumenTgl: '2026-02-02',
    kodeBarang: 'FG-PP-001',
    namaBarang: 'Polymer Products - Custom Grade',
    satuan: 'KG',
    jumlahDariProduksi: 6500,
    jumlahDariSubkon: 1800,
    gudang: 'Gudang FG-B'
  },
  {
    no: 3,
    dokumenNo: 'WO-2026-003',
    dokumenTgl: '2026-02-06',
    kodeBarang: 'FG-VA-001',
    namaBarang: 'Valve Assembly Units',
    satuan: 'PCS',
    jumlahDariProduksi: 195,
    jumlahDariSubkon: 0,
    gudang: 'Gudang FG-A'
  },
  {
    no: 4,
    dokumenNo: 'SUBK-KITE-1.2-2026-001',
    dokumenTgl: '2026-02-25',
    kodeBarang: 'FG-SP-001',
    namaBarang: 'Steel Panel Fabricated',
    satuan: 'KG',
    jumlahDariProduksi: 0,
    jumlahDariSubkon: 9500,
    gudang: 'Gudang FG-A'
  }
]

// ─────────────────────────────────────────────
// Laporan 5: Pengeluaran Hasil Produksi
// ─────────────────────────────────────────────
export interface PengeluaranHP {
  no: number
  pebNo: string
  pebTgl: string
  buktiPengeluaranNo: string
  buktiPengeluaranTgl: string
  pembeliPenerima: string
  negaraTujuan: string
  kodeBarang: string
  namaBarang: string
  satuan: string
  jumlah: number
  matauang: string
  nilaiBarang: number
}

export const MOCK_PENGELUARAN_HP: PengeluaranHP[] = [
  {
    no: 1,
    pebNo: 'PEB-2026-001',
    pebTgl: '2026-01-30',
    buktiPengeluaranNo: 'DO-2026-001',
    buktiPengeluaranTgl: '2026-01-30',
    pembeliPenerima: 'Nippon Steel Trading Co.',
    negaraTujuan: 'JP',
    kodeBarang: 'FG-SCA-001',
    namaBarang: 'Steel Coil Grade A (Export Quality)',
    satuan: 'KG',
    jumlah: 90000,
    matauang: 'USD',
    nilaiBarang: 108000
  },
  {
    no: 2,
    pebNo: 'PEB-2026-002',
    pebTgl: '2026-02-05',
    buktiPengeluaranNo: 'DO-2026-002',
    buktiPengeluaranTgl: '2026-02-05',
    pembeliPenerima: 'Korea Polymer Inc.',
    negaraTujuan: 'KR',
    kodeBarang: 'FG-PP-001',
    namaBarang: 'Polymer Products - Custom Grade',
    satuan: 'KG',
    jumlah: 8000,
    matauang: 'USD',
    nilaiBarang: 24000
  },
  {
    no: 3,
    pebNo: 'PEB-2026-003',
    pebTgl: '2026-02-28',
    buktiPengeluaranNo: 'DO-2026-003',
    buktiPengeluaranTgl: '2026-02-28',
    pembeliPenerima: 'PT. Konstruksi Jaya (Domestic)',
    negaraTujuan: 'ID',
    kodeBarang: 'FG-SP-001',
    namaBarang: 'Steel Panel Fabricated',
    satuan: 'KG',
    jumlah: 9500,
    matauang: 'IDR',
    nilaiBarang: 285000000
  }
]

// ─────────────────────────────────────────────
// Laporan 6: Mutasi Bahan Baku
// ─────────────────────────────────────────────
export interface MutasiBB {
  no: number
  kodeBarang: string
  namaBarang: string
  satuan: string
  saldoAwal: number
  pemasukan: number
  pengeluaran: number
  saldoAkhir: number
  gudang: string
}

export const MOCK_MUTASI_BB: MutasiBB[] = [
  {
    no: 1,
    kodeBarang: 'BB-HRC-001',
    namaBarang: 'Hot Rolled Coil (HRC)',
    satuan: 'KG',
    saldoAwal: 0,
    pemasukan: 100000,
    pengeluaran: 80000,
    saldoAkhir: 20000,
    gudang: 'Gudang RM-A'
  },
  {
    no: 2,
    kodeBarang: 'BB-HDPE-001',
    namaBarang: 'Polyethylene Resin - HDPE Grade',
    satuan: 'KG',
    saldoAwal: 0,
    pemasukan: 10000,
    pengeluaran: 8000,
    saldoAkhir: 2000,
    gudang: 'Gudang RM-B'
  },
  {
    no: 3,
    kodeBarang: 'BB-VALVE-001',
    namaBarang: 'Industrial Ball Valves 2 inch',
    satuan: 'PCS',
    saldoAwal: 0,
    pemasukan: 200,
    pengeluaran: 195,
    saldoAkhir: 5,
    gudang: 'Gudang RM-A'
  },
  {
    no: 4,
    kodeBarang: 'BB-CRC-001',
    namaBarang: 'Cold Rolled Coil (CRC)',
    satuan: 'KG',
    saldoAwal: 0,
    pemasukan: 50000,
    pengeluaran: 40000,
    saldoAkhir: 10000,
    gudang: 'Gudang RM-A'
  }
]

// ─────────────────────────────────────────────
// Laporan 7: Mutasi Hasil Produksi
// ─────────────────────────────────────────────
export interface MutasiHP {
  no: number
  kodeBarang: string
  namaBarang: string
  satuan: string
  saldoAwal: number
  pemasukan: number
  pengeluaran: number
  saldoAkhir: number
  gudang: string
}

export const MOCK_MUTASI_HP: MutasiHP[] = [
  {
    no: 1,
    kodeBarang: 'FG-SCA-001',
    namaBarang: 'Steel Coil Grade A (Export Quality)',
    satuan: 'KG',
    saldoAwal: 0,
    pemasukan: 95000,
    pengeluaran: 90000,
    saldoAkhir: 5000,
    gudang: 'Gudang FG-A'
  },
  {
    no: 2,
    kodeBarang: 'FG-PP-001',
    namaBarang: 'Polymer Products - Custom Grade',
    satuan: 'KG',
    saldoAwal: 0,
    pemasukan: 8300,
    pengeluaran: 8000,
    saldoAkhir: 300,
    gudang: 'Gudang FG-B'
  },
  {
    no: 3,
    kodeBarang: 'FG-VA-001',
    namaBarang: 'Valve Assembly Units',
    satuan: 'PCS',
    saldoAwal: 0,
    pemasukan: 195,
    pengeluaran: 0,
    saldoAkhir: 195,
    gudang: 'Gudang FG-A'
  },
  {
    no: 4,
    kodeBarang: 'FG-SP-001',
    namaBarang: 'Steel Panel Fabricated',
    satuan: 'KG',
    saldoAwal: 0,
    pemasukan: 9500,
    pengeluaran: 9500,
    saldoAkhir: 0,
    gudang: 'Gudang FG-A'
  }
]

// ─────────────────────────────────────────────
// Laporan 8: Waste/Scrap
// ─────────────────────────────────────────────
export interface WasteScrap {
  no: number
  bc24No: string
  bc24Tgl: string
  kodeBarang: string
  namaBarang: string
  satuan: string
  jumlah: number
  nilai: number
  matauang: string
  jenisDisposisi: 'Dijual' | 'Dimusnahkan'
  keterangan: string
}

export const MOCK_WASTE_SCRAP: WasteScrap[] = [
  {
    no: 1,
    bc24No: 'BC24-2026-001',
    bc24Tgl: '2026-01-27',
    kodeBarang: 'WS-HRC-001',
    namaBarang: 'Scrap HRC - Sisa Pemotongan',
    satuan: 'KG',
    jumlah: 4800,
    nilai: 2400,
    matauang: 'USD',
    jenisDisposisi: 'Dijual',
    keterangan: 'Dijual ke PT. Scrap Metal Indonesia'
  },
  {
    no: 2,
    bc24No: 'BC24-2026-002',
    bc24Tgl: '2026-02-04',
    kodeBarang: 'WS-HDPE-001',
    namaBarang: 'Scrap HDPE - Sisa Proses',
    satuan: 'KG',
    jumlah: 1700,
    nilai: 850,
    matauang: 'USD',
    jenisDisposisi: 'Dimusnahkan',
    keterangan: 'Dimusnahkan - kualitas tidak layak jual'
  },
  {
    no: 3,
    bc24No: 'BC24-2026-003',
    bc24Tgl: '2026-02-20',
    kodeBarang: 'WS-CRC-001',
    namaBarang: 'Scrap CRC - Sisa Fabrikasi',
    satuan: 'KG',
    jumlah: 500,
    nilai: 300,
    matauang: 'USD',
    jenisDisposisi: 'Dijual',
    keterangan: 'Dijual ke PT. Scrap Metal Indonesia'
  }
]
