'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AppLayout from '@/components/app-layout'
import { useBC40 } from '@/lib/store/useBC40'
import { exportToExcel } from '@/lib/utils/export-excel'

const STATUS_COLOR: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-300',
  Submitted: 'bg-blue-100 text-blue-700 border-blue-300',
  Approved: 'bg-green-100 text-green-700 border-green-300',
}

export default function BC40ListPage() {
  const { documents } = useBC40()

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/logistics">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">BC 4.0 — Penjualan Material Lokal</h1>
              <p className="text-sm text-muted-foreground">Pemberitahuan Pemasukan Barang ke Tempat Penimbunan Berikat</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportToExcel(documents as unknown as Record<string, unknown>[], 'BC40_Report', 'BC 4.0')}>
              <Download className="h-4 w-4" />Export
            </Button>
            <Link href="/logistics/bc40/new">
              <Button className="gap-2"><Plus className="h-4 w-4" />Buat BC 4.0 Baru</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total BC 4.0</p>
              <p className="text-2xl font-bold">{documents.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{documents.filter(d => d.status === 'Draft').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{documents.filter(d => d.status === 'Approved').length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Dokumen BC 4.0 ({documents.length})</CardTitle>
            <CardDescription>Pemasukan material lokal ke dalam kawasan TPB JKJ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. BC 4.0</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Penjual</TableHead>
                  <TableHead>No. Faktur Pajak</TableHead>
                  <TableHead>Jenis Kendaraan</TableHead>
                  <TableHead className="text-right">Nilai Total (IDR)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Belum ada dokumen BC 4.0</p>
                      <Link href="/logistics/bc40/new">
                        <Button variant="outline" className="mt-3 gap-2" size="sm">
                          <Plus className="h-4 w-4" />Buat Pertama
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : documents.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono text-sm font-medium text-primary">{doc.nomorBC40}</TableCell>
                    <TableCell>{doc.tanggal}</TableCell>
                    <TableCell>{doc.penjualNama}</TableCell>
                    <TableCell className="font-mono text-xs">{doc.noFakturPajak || '—'}</TableCell>
                    <TableCell>{doc.jenisKendaraan}</TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {doc.totalNilaiIDR.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[doc.status]}`}>
                        {doc.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
