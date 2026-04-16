// Waste Management Mock Data
// Sisa bahan baku KITE yang harus dipertanggungjawabkan via BC 2.4

export type WasteStatus = 'Draft' | 'Diajukan BC 2.4' | 'Diverifikasi BC' | 'Selesai'
export type WasteDisposisi = 'Dijual' | 'Dimusnahkan' | '-'

export interface WasteRecord {
  id: string
  // Sumber
  woNumber: string
  woDate: string
  kodeBB: string
  namaBB: string
  satuan: string

  // Kuantitas
  bbMasuk: number        // dari GR
  bbTerpakai: number     // ke produksi
  wasteQty: number       // selisih = bbMasuk - bbTerpakai
  wasteRatioBCLKT: number // % max waste yg diizinkan
  wasteRatioAktual: number // % waste aktual

  // BC 2.4
  bc24No: string
  bc24Tgl: string
  status: WasteStatus

  // Disposisi
  disposisi: WasteDisposisi
  pembeli: string
  nilaiWaste: number
  matauang: string

  // Verifikasi BC
  tglVerifikasi: string
  petugasBC: string
  catatan: string
}

export const MOCK_WASTE_RECORDS: WasteRecord[] = [
  {
    id: 'WM-001',
    woNumber: 'WO-2026-001',
    woDate: '2026-01-25',
    kodeBB: 'BB-HRC-001',
    namaBB: 'Hot Rolled Coil (HRC)',
    satuan: 'KG',
    bbMasuk: 100000,
    bbTerpakai: 95200,
    wasteQty: 4800,
    wasteRatioBCLKT: 5.0,
    wasteRatioAktual: 4.8,
    bc24No: 'BC24-2026-001',
    bc24Tgl: '2026-01-27',
    status: 'Selesai',
    disposisi: 'Dijual',
    pembeli: 'PT. Scrap Metal Indonesia',
    nilaiWaste: 2400,
    matauang: 'USD',
    tglVerifikasi: '2026-01-26',
    petugasBC: 'Pejabat BC - Sdr. Hendra',
    catatan: 'Waste sesuai batas BCLKT, disetujui untuk dijual'
  },
  {
    id: 'WM-002',
    woNumber: 'WO-2026-002',
    woDate: '2026-02-02',
    kodeBB: 'BB-HDPE-001',
    namaBB: 'Polyethylene Resin - HDPE Grade',
    satuan: 'KG',
    bbMasuk: 10000,
    bbTerpakai: 8300,
    wasteQty: 1700,
    wasteRatioBCLKT: 15.0,
    wasteRatioAktual: 17.0,
    bc24No: 'BC24-2026-002',
    bc24Tgl: '2026-02-04',
    status: 'Selesai',
    disposisi: 'Dimusnahkan',
    pembeli: '-',
    nilaiWaste: 0,
    matauang: 'USD',
    tglVerifikasi: '2026-02-03',
    petugasBC: 'Pejabat BC - Sdr. Hendra',
    catatan: 'Waste melebihi BCLKT (17% > 15%), perlu penjelasan tambahan. Disetujui musnahkan.'
  },
  {
    id: 'WM-003',
    woNumber: 'WO-2026-003',
    woDate: '2026-02-06',
    kodeBB: 'BB-VALVE-001',
    namaBB: 'Industrial Ball Valves 2 inch',
    satuan: 'PCS',
    bbMasuk: 200,
    bbTerpakai: 195,
    wasteQty: 5,
    wasteRatioBCLKT: 3.0,
    wasteRatioAktual: 2.5,
    bc24No: 'BC24-2026-003',
    bc24Tgl: '2026-02-08',
    status: 'Diverifikasi BC',
    disposisi: 'Dijual',
    pembeli: 'PT. Scrap Metal Indonesia',
    nilaiWaste: 110,
    matauang: 'USD',
    tglVerifikasi: '2026-02-07',
    petugasBC: 'Pejabat BC - Sdr. Rizal',
    catatan: 'Sedang proses pengeluaran fisik'
  },
  {
    id: 'WM-004',
    woNumber: 'WO-2026-004',
    woDate: '2026-02-20',
    kodeBB: 'BB-CRC-001',
    namaBB: 'Cold Rolled Coil (CRC)',
    satuan: 'KG',
    bbMasuk: 50000,
    bbTerpakai: 49500,
    wasteQty: 500,
    wasteRatioBCLKT: 2.0,
    wasteRatioAktual: 1.0,
    bc24No: 'BC24-2026-004',
    bc24Tgl: '2026-02-22',
    status: 'Diajukan BC 2.4',
    disposisi: 'Dijual',
    pembeli: 'PT. Logam Bekas Nusantara',
    nilaiWaste: 300,
    matauang: 'USD',
    tglVerifikasi: '-',
    petugasBC: '-',
    catatan: 'Menunggu jadwal verifikasi lapangan'
  },
  {
    id: 'WM-005',
    woNumber: 'WO-2026-005',
    woDate: '2026-03-01',
    kodeBB: 'BB-HRC-001',
    namaBB: 'Hot Rolled Coil (HRC)',
    satuan: 'KG',
    bbMasuk: 80000,
    bbTerpakai: 76500,
    wasteQty: 3500,
    wasteRatioBCLKT: 5.0,
    wasteRatioAktual: 4.375,
    bc24No: '-',
    bc24Tgl: '-',
    status: 'Draft',
    disposisi: '-',
    pembeli: '-',
    nilaiWaste: 0,
    matauang: 'USD',
    tglVerifikasi: '-',
    petugasBC: '-',
    catatan: 'Waste baru dicatat, belum diajukan ke BC'
  }
]

export const STATUS_CONFIG: Record<WasteStatus, { color: string; bg: string; border: string }> = {
  'Draft':           { color: 'text-gray-700',   bg: 'bg-gray-100',   border: 'border-gray-300' },
  'Diajukan BC 2.4': { color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-300' },
  'Diverifikasi BC': { color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-300' },
  'Selesai':         { color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-300' },
}

export const WASTE_STATUS_STEPS: WasteStatus[] = [
  'Draft',
  'Diajukan BC 2.4',
  'Diverifikasi BC',
  'Selesai'
]
