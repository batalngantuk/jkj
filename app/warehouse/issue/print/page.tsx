'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { STORE_KEYS, getStore } from '@/lib/store/index'

type BPBItem = { materialCode: string; materialName: string; qty: number; satuan: string }
type BPBEntry = {
  id: string; tanggal: string; noBukti: string; tujuan: 'Produksi' | 'Subkon'
  referensi: string; items: BPBItem[]; catatan: string; status: 'Selesai'
}

const SEED: BPBEntry[] = [
  {
    id: 'BPB-2026-001', tanggal: '2026-01-22', noBukti: 'BPB-2026-001', tujuan: 'Produksi',
    referensi: 'WO-2026-001', catatan: 'Pengeluaran BB untuk produksi latex gloves', status: 'Selesai',
    items: [
      { materialCode: 'BB-HRC-001', materialName: 'Hot Rolled Coil (HRC)', qty: 5000, satuan: 'KG' },
      { materialCode: 'BB-HDPE-001', materialName: 'Polyethylene Resin HDPE', qty: 200, satuan: 'KG' }
    ]
  },
]

export default function PrintBC12Page() {
  const searchParams = useSearchParams()
  const bpbId = searchParams.get('id')
  const [bpb, setBpb] = useState<BPBEntry | null>(null)
  const didPrint = useRef(false)

  useEffect(() => {
    const all = getStore<BPBEntry>(STORE_KEYS.BPB_HISTORY, SEED)
    const found = all.find(b => b.id === bpbId) || SEED.find(b => b.id === bpbId) || null
    setBpb(found)
  }, [bpbId])

  useEffect(() => {
    if (bpb && !didPrint.current) {
      didPrint.current = true
      setTimeout(() => window.print(), 400)
    }
  }, [bpb])

  if (!bpb) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Dokumen tidak ditemukan. ID: {bpbId}</p>
        <p className="text-sm mt-2">Catatan: dokumen hanya tersedia untuk BPB yang dibuat di sesi ini.</p>
        <button onClick={() => window.close()} className="mt-4 px-4 py-2 border rounded">Tutup</button>
      </div>
    )
  }

  const totalQty = bpb.items.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #000; }
      `}</style>

      <div className="no-print flex gap-2 p-4 bg-gray-100 border-b">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Cetak</button>
        <button onClick={() => window.close()} className="px-4 py-2 border rounded text-sm">Tutup</button>
      </div>

      <div style={{ maxWidth: '210mm', margin: '0 auto', padding: '10mm', background: '#fff' }}>

        {/* Letterhead */}
        <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>PT. JKJ INDONESIA</h2>
          <p style={{ fontSize: '10px', margin: '2px 0' }}>Kawasan Industri KIIC Lot A-9, Karawang, Jawa Barat</p>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, textDecoration: 'underline' }}>
            BUKTI PENGELUARAN BAHAN BAKU (BC 1.2)
          </h3>
        </div>

        {/* Header Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px', fontSize: '11px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={{ width: '45%', padding: '2px 4px' }}>No. Bukti Pengeluaran</td><td style={{ padding: '2px 4px' }}>: <strong>{bpb.noBukti}</strong></td></tr>
              <tr><td style={{ padding: '2px 4px' }}>Tanggal</td><td style={{ padding: '2px 4px' }}>: {bpb.tanggal}</td></tr>
              <tr><td style={{ padding: '2px 4px' }}>Tujuan</td><td style={{ padding: '2px 4px' }}>: {bpb.tujuan}</td></tr>
            </tbody>
          </table>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={{ width: '50%', padding: '2px 4px' }}>Referensi WO/Subkon</td><td style={{ padding: '2px 4px' }}>: {bpb.referensi}</td></tr>
              <tr><td style={{ padding: '2px 4px' }}>Status</td><td style={{ padding: '2px 4px' }}>: {bpb.status}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>No</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Kode Material</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Nama Material</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>Satuan</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>Qty Keluar</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {bpb.items.map((item, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', fontFamily: 'monospace' }}>{item.materialCode}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px' }}>{item.materialName}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{item.satuan}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>{item.qty.toLocaleString('id-ID')}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px' }}></td>
              </tr>
            ))}
            <tr style={{ background: '#f8f8f8', fontWeight: 'bold' }}>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>Total Qty Keluar</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>{totalQty.toLocaleString('id-ID')}</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}></td>
            </tr>
          </tbody>
        </table>

        {bpb.catatan && (
          <div style={{ marginBottom: '16px', fontSize: '11px' }}>
            <strong>Catatan:</strong> {bpb.catatan}
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px', fontSize: '11px' }}>
          {['Diserahkan Oleh', 'Diterima Oleh', 'Disetujui Oleh'].map((label, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 40px 0' }}>{label}</p>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
              <p style={{ margin: 0 }}>_______________</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
