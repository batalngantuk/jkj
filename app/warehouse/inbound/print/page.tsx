'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useGoodsReceipts } from '@/lib/store/useGoodsReceipts'

function PrintBC11Content() {
  const searchParams = useSearchParams()
  const grId = searchParams.get('id')
  const { receipts } = useGoodsReceipts()

  const gr = receipts.find(r => r.id === grId)
  const didPrint = useRef(false)

  useEffect(() => {
    if (gr && !didPrint.current) {
      didPrint.current = true
      setTimeout(() => window.print(), 400)
    }
  }, [gr])

  if (!gr) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Dokumen tidak ditemukan. ID: {grId}</p>
        <button onClick={() => window.close()} className="mt-4 px-4 py-2 border rounded">Tutup</button>
      </div>
    )
  }

  const totalQtyDiterima = gr.items.reduce((s, i) => s + i.qtyDiterima, 0)

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

      {/* Print button — hidden on print */}
      <div className="no-print flex gap-2 p-4 bg-gray-100 border-b">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Cetak</button>
        <button onClick={() => window.close()} className="px-4 py-2 border rounded text-sm">Tutup</button>
      </div>

      {/* Document */}
      <div style={{ maxWidth: '210mm', margin: '0 auto', padding: '10mm', background: '#fff' }}>

        {/* Letterhead */}
        <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>PT. JKJ INDONESIA</h2>
          <p style={{ fontSize: '10px', margin: '2px 0' }}>Kawasan Industri KIIC Lot A-9, Karawang, Jawa Barat</p>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, textDecoration: 'underline' }}>
            BUKTI PENERIMAAN BARANG (BC 1.1)
          </h3>
        </div>

        {/* Header Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px', fontSize: '11px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={{ width: '45%', padding: '2px 4px' }}>No. Dokumen</td><td style={{ padding: '2px 4px' }}>: <strong>{gr.id}</strong></td></tr>
              <tr><td style={{ padding: '2px 4px' }}>Tanggal Masuk</td><td style={{ padding: '2px 4px' }}>: {gr.tglMasuk}</td></tr>
              <tr><td style={{ padding: '2px 4px' }}>No. PO</td><td style={{ padding: '2px 4px' }}>: {gr.noPO}</td></tr>
              <tr><td style={{ padding: '2px 4px' }}>No. PIB</td><td style={{ padding: '2px 4px' }}>: {gr.noPIB || '-'}</td></tr>
            </tbody>
          </table>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={{ width: '50%', padding: '2px 4px' }}>Supplier</td><td style={{ padding: '2px 4px' }}>: {gr.supplier}</td></tr>
              <tr><td style={{ padding: '2px 4px' }}>No. Surat Jalan</td><td style={{ padding: '2px 4px' }}>: {gr.noSuratJalan || '-'}</td></tr>
              <tr><td style={{ padding: '2px 4px' }}>Gudang</td><td style={{ padding: '2px 4px' }}>: {gr.gudang}</td></tr>
              <tr><td style={{ padding: '2px 4px' }}>Jenis Dokumen</td><td style={{ padding: '2px 4px' }}>: {gr.jenisDoc}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>No</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Kode Barang</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Nama Barang</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>Satuan</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>Qty PO</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>Qty Diterima</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>Selisih</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {gr.items.map((item, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px' }}>{item.kode}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px' }}>{item.nama}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{item.satuan}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>{item.qtyPO.toLocaleString('id-ID')}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>{item.qtyDiterima.toLocaleString('id-ID')}</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>
                  {(item.qtyDiterima - item.qtyPO).toLocaleString('id-ID')}
                </td>
                <td style={{ border: '1px solid #000', padding: '4px 6px' }}>{item.qtyDiterima < item.qtyPO ? 'Partial' : 'Sesuai'}</td>
              </tr>
            ))}
            <tr style={{ background: '#f8f8f8', fontWeight: 'bold' }}>
              <td colSpan={5} style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>Total Diterima</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>{totalQtyDiterima.toLocaleString('id-ID')}</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 6px' }}></td>
            </tr>
          </tbody>
        </table>

        {gr.catatan && (
          <div style={{ marginBottom: '16px', fontSize: '11px' }}>
            <strong>Catatan:</strong> {gr.catatan}
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px', fontSize: '11px' }}>
          {['Dibuat Oleh', 'Diperiksa Oleh', 'Disetujui Oleh'].map((label, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 40px 0' }}>{label}</p>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
              <p style={{ margin: 0 }}>{i === 0 ? gr.penerima : '_______________'}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function PrintBC11Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat dokumen...</div>}>
      <PrintBC11Content />
    </Suspense>
  )
}
