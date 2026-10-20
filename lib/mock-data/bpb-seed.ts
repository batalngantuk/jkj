export type BPBItem = { materialCode: string; materialName: string; qty: number; satuan: string }

export type BPBEntry = {
  id: string
  tanggal: string
  noBukti: string
  tujuan: 'Produksi' | 'Subkon'
  referensi: string
  items: BPBItem[]
  catatan: string
  status: 'Selesai'
}

// Data contoh (read-only) — tidak punya movement stok, jadi tidak bisa diedit/dihapus.
export const SEED_BPB: BPBEntry[] = [
  {
    id: 'BPB-2026-001', tanggal: '2026-01-22', noBukti: 'BPB-2026-001', tujuan: 'Produksi',
    referensi: 'WO-2026-001', catatan: 'Pengeluaran BB untuk produksi latex gloves',
    items: [
      { materialCode: 'RM-LATEX', materialName: 'Natural Rubber Latex', qty: 500, satuan: 'kg' },
      { materialCode: 'RM-SULFUR', materialName: 'Sulfur Dispersion', qty: 10, satuan: 'kg' },
    ], status: 'Selesai'
  },
  {
    id: 'BPB-2026-002', tanggal: '2026-01-30', noBukti: 'BPB-2026-002', tujuan: 'Subkon',
    referensi: 'SUBK-2026-001', catatan: 'Kirim BB ke PT. Subkon Plastik Jaya',
    items: [
      { materialCode: 'BB-HDPE-001', materialName: 'Polyethylene Resin - HDPE Grade', qty: 2000, satuan: 'kg' },
    ], status: 'Selesai'
  },
  {
    id: 'BPB-2026-003', tanggal: '2026-02-06', noBukti: 'BPB-2026-003', tujuan: 'Produksi',
    referensi: 'WO-2026-002', catatan: 'Pengeluaran BB untuk produksi nitrile gloves',
    items: [
      { materialCode: 'RM-NITRILE', materialName: 'Nitrile Latex', qty: 300, satuan: 'kg' },
      { materialCode: 'RM-ZINC', materialName: 'Zinc Oxide', qty: 20, satuan: 'kg' },
    ], status: 'Selesai'
  },
]

// Tag di StockMovement.notes: bpb:<noBukti>;satuan:<unit>
export function bpbNotes(noBukti: string, satuan: string) {
  return `bpb:${noBukti};satuan:${satuan}`
}
export function parseBpbTag(notes?: string) {
  return notes?.match(/bpb:([^;]+)/)?.[1]
}
export function parseSatuan(notes?: string) {
  return notes?.match(/satuan:([^;]+)/)?.[1]
}
