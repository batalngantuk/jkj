'use client'

import Link from 'next/link'
import { ArrowLeft, Plus, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { usePenjualanLokal } from '@/lib/store/usePenjualanLokal'
import { exportToExcel } from '@/lib/utils/export-excel'

const statusColor: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Submitted: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
}

export default function PenjualanLokalListPage() {
  const { documents } = usePenjualanLokal()

  const handleExport = () => {
    exportToExcel(
      documents.map(d => ({
        'No. Dokumen': d.nomorPL,
        'Tanggal': d.tanggal,
        'Pembeli': d.pembeliNama,
        'NPWP Pembeli': d.pembeliNPWP,
        'No. Invoice': d.noInvoice || '-',
        'No. SO Ref': d.noSORef || '-',
        'No. Pendaftaran': d.noPendaftaran || '-',
        'Total Nilai (IDR)': d.totalNilaiIDR,
        'Status': d.status,
        'Catatan': d.catatan || '-',
      })),
      'Penjualan_Material_Lokal',
      'Penjualan Material Lokal'
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/logistics">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Penjualan Material Lokal</h1>
            <p className="text-sm text-muted-foreground">
              Dokumen penjualan material/barang dari Kawasan Berikat ke pembeli domestik
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Link href="/logistics/penjualan-lokal/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Dokumen Baru
            </Button>
          </Link>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Dokumen</p>
              <p className="text-2xl font-bold">{documents.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Draft / Submitted</p>
              <p className="text-2xl font-bold text-yellow-600">
                {documents.filter(d => d.status !== 'Approved').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'Approved').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Daftar Dokumen Penjualan Lokal
            </CardTitle>
            <CardDescription>
              Dokumen pengeluaran barang dari TPB ke pasar domestik
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Belum ada dokumen</p>
                <p className="text-sm mt-1">Klik "Buat Dokumen Baru" untuk mulai</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Dokumen</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pembeli</TableHead>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>No. SO Ref</TableHead>
                    <TableHead className="text-right">Total Nilai (IDR)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-sm font-semibold text-primary">
                        {doc.nomorPL}
                      </TableCell>
                      <TableCell>{doc.tanggal}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{doc.pembeliNama}</p>
                          {doc.pembeliNPWP && (
                            <p className="text-xs text-muted-foreground">NPWP: {doc.pembeliNPWP}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {doc.noInvoice || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.noSORef || '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rp {doc.totalNilaiIDR.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[doc.status]}`}>
                          {doc.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
