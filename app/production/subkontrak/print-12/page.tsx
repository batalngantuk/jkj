'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSubkontrak } from '@/lib/store/useSubkontrak'

function PrintSubk12Content() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { records } = useSubkontrak()
  const rec = records.find(r => r.id === id)
  const didPrint = useRef(false)

  useEffect(() => {
    if (rec && !didPrint.current) {
      didPrint.current = true
      setTimeout(() => window.print(), 400)
    }
  }, [rec])

  if (!rec) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Dokumen tidak ditemukan. ID: {id}</p>
        <button onClick={() => window.close()} className="mt-4 px-4 py-2 border rounded">Tutup</button>
      </div>
    )
  }

  const hasResult = rec.items.some(i => (i.qtyKembali ?? 0) > 0)

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 4px 6px; }
        th { background: #f0f0f0; font-weight: bold; text-align: center; }
      `}</style>

      <div className="no-print flex gap-2 p-4 bg-gray-100 border-b">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Cetak</button>
        <button onClick={() => window.close()} className="px-4 py-2 border rounded text-sm">Tutup</button>
      </div>

      <div style={{ maxWidth: '210mm', margin: '0 auto', padding: '10mm', background: '#fff' }}>

        {/* Letterhead */}
        <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>PT. JKJ INDONESIA</h2>
          <p style={{ fontSize: '9px', margin: '2px 0' }}>Kawasan Industri KIIC Lot A-9, Karawang, Jawa Barat | NPWP: 01.234.567.8-432.000</p>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0', textDecoration: 'underline' }}>
            FORMULIR SUBKONTRAK KITE 1.2
          </h3>
          <p style={{ fontSize: '10px', margin: 0 }}>Pemasukan Hasil Pengerjaan dari Subkontraktor</p>
        </div>

        {/* Header Info */}
        <table style={{ marginBottom: '12px', fontSize: '11px' }}>
          <colgroup>
            <col style={{ width: '30%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}><b>No. Dokumen SUBK KITE</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>: {rec.subkKiteTerimaNo}</td>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Tanggal Penerimaan</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>: {rec.subkKiteTerimaTgl || rec.tglSelesaiAktual || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Ref. SUBK KITE 1.1</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>: {rec.subkKiteKirimNo}</td>
              <td style={{ border: 'none', padding: '2px 0' }}><b>No. Job Subkontrak</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>: {rec.id}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Nama Subkontraktor</b></td>
              <td colSpan={3} style={{ border: 'none', padding: '2px 0' }}>: {rec.namaSubkon}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Alamat</b></td>
              <td colSpan={3} style={{ border: 'none', padding: '2px 0' }}>: {rec.alamatSubkon}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}><b>NPWP Subkontraktor</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>: {rec.npwpSubkon}</td>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Jenis Kegiatan</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>: CMT / Makloon</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Deskripsi Pekerjaan</b></td>
              <td colSpan={3} style={{ border: 'none', padding: '2px 0' }}>: {rec.deskripsiPekerjaan}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Tgl Selesai Aktual</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>: {rec.tglSelesaiAktual || '-'}</td>
              <td style={{ border: 'none', padding: '2px 0' }}><b>Lama Pengerjaan Aktual</b></td>
              <td style={{ border: 'none', padding: '2px 0' }}>
                : {rec.tglSelesaiAktual && rec.subkKiteKirimTgl && rec.subkKiteKirimTgl !== '-'
                  ? `${Math.ceil((new Date(rec.tglSelesaiAktual).getTime() - new Date(rec.subkKiteKirimTgl).getTime()) / 86400000)} hari`
                  : '-'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* BB Dikirim (reference) */}
        <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>Bahan Baku yang Dikirim (Ref. SUBK KITE 1.1):</p>
        <table style={{ marginBottom: '12px', fontSize: '10px' }}>
          <thead>
            <tr>
              <th style={{ width: '4%' }}>No.</th>
              <th style={{ width: '14%' }}>Kode Barang</th>
              <th>Nama Bahan Baku/Penolong</th>
              <th style={{ width: '10%' }}>Satuan</th>
              <th style={{ width: '14%' }}>Qty Dikirim</th>
            </tr>
          </thead>
          <tbody>
            {rec.items.filter(i => i.isKITE).map((item, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>{i + 1}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '9px' }}>{item.kodeBB}</td>
                <td>{item.namaBB}</td>
                <td style={{ textAlign: 'center' }}>{item.satuanBB}</td>
                <td style={{ textAlign: 'right' }}>{item.qtyKirim.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Hasil Diterima */}
        <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>Hasil Pengerjaan yang Diterima:</p>
        <table style={{ marginBottom: '16px', fontSize: '10px' }}>
          <thead>
            <tr>
              <th style={{ width: '4%' }}>No.</th>
              <th style={{ width: '14%' }}>Kode Barang</th>
              <th>Nama Barang Hasil</th>
              <th style={{ width: '10%' }}>Satuan</th>
              <th style={{ width: '14%' }}>Qty Diterima</th>
              <th style={{ width: '14%' }}>Kondisi</th>
            </tr>
          </thead>
          <tbody>
            {hasResult
              ? rec.items.filter(i => (i.qtyKembali ?? 0) > 0).map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '9px' }}>{item.kodeBB}</td>
                  <td>{item.namaBB}</td>
                  <td style={{ textAlign: 'center' }}>{item.satuanBB}</td>
                  <td style={{ textAlign: 'right' }}>{(item.qtyKembali ?? 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>Baik</td>
                </tr>
              ))
              : <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>Belum ada hasil diterima</td></tr>
            }
            {[...Array(Math.max(0, 5 - rec.items.filter(i => (i.qtyKembali ?? 0) > 0).length))].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td style={{ height: '20px' }}>&nbsp;</td>
                <td /><td /><td /><td /><td />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature */}
        <table style={{ fontSize: '11px', marginTop: '24px' }}>
          <colgroup>
            <col style={{ width: '33%' }} />
            <col style={{ width: '33%' }} />
            <col style={{ width: '34%' }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: 'none', textAlign: 'center', padding: '2px' }}>Disiapkan oleh,</td>
              <td style={{ border: 'none', textAlign: 'center', padding: '2px' }}>Disetujui oleh,</td>
              <td style={{ border: 'none', textAlign: 'center', padding: '2px' }}>Diserahkan oleh (Subkon),</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '40px 2px 2px', textAlign: 'center', borderTop: '1px solid #000' }}>
                (Kepala Gudang FG)
              </td>
              <td style={{ border: 'none', padding: '40px 2px 2px', textAlign: 'center', borderTop: '1px solid #000' }}>
                (Manager Produksi)
              </td>
              <td style={{ border: 'none', padding: '40px 2px 2px', textAlign: 'center', borderTop: '1px solid #000' }}>
                ({rec.namaSubkon})
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '8px', color: '#666', marginTop: '16px', textAlign: 'center' }}>
          Dokumen ini dibuat berdasarkan PER-5/BC/2023 — KITE Subkontrak | {rec.subkKiteTerimaNo}
        </p>
      </div>
    </>
  )
}

export default function PrintSubk12Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat dokumen...</div>}>
      <PrintSubk12Content />
    </Suspense>
  )
}
