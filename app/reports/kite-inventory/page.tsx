'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Shield, Calendar, FileText, Package, Factory, ArrowUpDown, Trash2 } from 'lucide-react'
import AppLayout from '@/components/app-layout'
import {
  MOCK_PEMASUKAN_BB,
  MOCK_PEMAKAIAN_BB,
  MOCK_PEMAKAIAN_BB_SUBKON,
  MOCK_PEMASUKAN_HP,
  MOCK_PENGELUARAN_HP,
  MOCK_MUTASI_BB,
  MOCK_MUTASI_HP,
  MOCK_WASTE_SCRAP
} from '@/lib/mock-data/kite-inventory'
import { exportToExcel, exportToExcelMultiSheet } from '@/lib/utils/export-excel'

function formatNumber(n: number) {
  return n.toLocaleString('id-ID')
}

function formatCurrency(n: number, currency: string) {
  if (currency === 'IDR') return `Rp ${n.toLocaleString('id-ID')}`
  return `${currency} ${n.toLocaleString('en-US')}`
}

export default function KiteInventoryPage() {
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-12-31')

  const handleExportSemua = () => {
    exportToExcelMultiSheet([
      { name: '1-Pemasukan BB', data: MOCK_PEMASUKAN_BB as unknown as Record<string, unknown>[] },
      { name: '2-Pemakaian BB', data: MOCK_PEMAKAIAN_BB as unknown as Record<string, unknown>[] },
      { name: '3-Pemakaian BB Subkon', data: MOCK_PEMAKAIAN_BB_SUBKON as unknown as Record<string, unknown>[] },
      { name: '4-Pemasukan HP', data: MOCK_PEMASUKAN_HP as unknown as Record<string, unknown>[] },
      { name: '5-Pengeluaran HP', data: MOCK_PENGELUARAN_HP as unknown as Record<string, unknown>[] },
      { name: '6-Mutasi BB', data: MOCK_MUTASI_BB as unknown as Record<string, unknown>[] },
      { name: '7-Mutasi HP', data: MOCK_MUTASI_HP as unknown as Record<string, unknown>[] },
      { name: '8-Waste Scrap', data: MOCK_WASTE_SCRAP as unknown as Record<string, unknown>[] },
    ], `KITE_IT_Inventory_${dateFrom}_sd_${dateTo}`)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">Laporan IT Inventory KITE</h1>
              <Badge variant="outline" className="gap-1.5 border-blue-400 text-blue-700 bg-blue-50">
                <Shield className="h-3 w-3" />
                DJBC Read Access
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              8 Laporan Wajib sesuai Lampiran XXII PER-5/BC/2023 — Real-time IT Inventory
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExportSemua}>
            <Download className="h-4 w-4" />
            Export Semua
          </Button>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-end gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tanggal Dari</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tanggal Sampai</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button variant="secondary" className="gap-2">
                <Calendar className="h-4 w-4" />
                Terapkan Filter
              </Button>
              <p className="text-xs text-muted-foreground ml-auto self-center">
                Data ditampilkan real-time sesuai transaksi sistem
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 8 Tabs */}
        <Tabs defaultValue="lap1" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto gap-1">
            <TabsTrigger value="lap1" className="text-xs px-2 py-1.5 whitespace-nowrap">1. Pemasukan BB</TabsTrigger>
            <TabsTrigger value="lap2" className="text-xs px-2 py-1.5 whitespace-nowrap">2. Pemakaian BB</TabsTrigger>
            <TabsTrigger value="lap3" className="text-xs px-2 py-1.5 whitespace-nowrap">3. BB Subkontrak</TabsTrigger>
            <TabsTrigger value="lap4" className="text-xs px-2 py-1.5 whitespace-nowrap">4. Pemasukan HP</TabsTrigger>
            <TabsTrigger value="lap5" className="text-xs px-2 py-1.5 whitespace-nowrap">5. Pengeluaran HP</TabsTrigger>
            <TabsTrigger value="lap6" className="text-xs px-2 py-1.5 whitespace-nowrap">6. Mutasi BB</TabsTrigger>
            <TabsTrigger value="lap7" className="text-xs px-2 py-1.5 whitespace-nowrap">7. Mutasi HP</TabsTrigger>
            <TabsTrigger value="lap8" className="text-xs px-2 py-1.5 whitespace-nowrap">8. Waste/Scrap</TabsTrigger>
          </TabsList>

          {/* ── Laporan 1: Pemasukan Bahan Baku ── */}
          <TabsContent value="lap1">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Laporan Pemasukan Bahan Baku
                  </CardTitle>
                  <CardDescription>Pencatatan setiap bahan baku yang masuk berdasarkan dokumen impor</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_PEMASUKAN_BB as unknown as Record<string,unknown>[], 'Lap1_Pemasukan_BB', 'Pemasukan BB')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>Tgl Rekam</TableHead>
                        <TableHead>Jenis Dokumen</TableHead>
                        <TableHead>No Dokumen</TableHead>
                        <TableHead>Tgl Dokumen</TableHead>
                        <TableHead>Kode HS</TableHead>
                        <TableHead>No Seri</TableHead>
                        <TableHead>Bukti Penerimaan No</TableHead>
                        <TableHead>Tgl Penerimaan</TableHead>
                        <TableHead>Kode BB</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Mata Uang</TableHead>
                        <TableHead className="text-right">Nilai Barang</TableHead>
                        <TableHead>Gudang</TableHead>
                        <TableHead>Penerima Subkon</TableHead>
                        <TableHead>Negara Asal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PEMASUKAN_BB.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.tglRekam}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{row.jenisDokumen}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">{row.noDokumen}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.tglDokumen}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeHS}</TableCell>
                          <TableCell className="text-center">{row.noSeriBarang}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">{row.buktiPenerimaanNo}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.buktiPenerimaanTgl}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBB}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right font-medium">{formatNumber(row.jumlah)}</TableCell>
                          <TableCell className="text-center">{row.matauang}</TableCell>
                          <TableCell className="text-right">{formatNumber(row.nilaiBarang)}</TableCell>
                          <TableCell>{row.gudang}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{row.penerimaSubkon}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">{row.negaraAsal}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_PEMASUKAN_BB.length} record ditemukan</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Laporan 2: Pemakaian Bahan Baku ── */}
          <TabsContent value="lap2">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-green-600" />
                    Laporan Pemakaian Bahan Baku
                  </CardTitle>
                  <CardDescription>Pengeluaran bahan baku ke produksi dan/atau ke subkontraktor</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_PEMAKAIAN_BB as unknown as Record<string,unknown>[], 'Lap2_Pemakaian_BB', 'Pemakaian BB')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>Bukti Pengeluaran No</TableHead>
                        <TableHead>Tgl Pengeluaran</TableHead>
                        <TableHead>Kode Barang</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Jml Digunakan</TableHead>
                        <TableHead className="text-right">Jml Disubkonkan</TableHead>
                        <TableHead>Penerima Subkon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PEMAKAIAN_BB.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="font-mono text-xs">{row.buktiPengeluaranNo}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.buktiPengeluaranTgl}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right font-medium">{formatNumber(row.jumlahDigunakan)}</TableCell>
                          <TableCell className="text-right">
                            {row.jumlahDisubkonkan > 0
                              ? <span className="font-medium text-orange-600">{formatNumber(row.jumlahDisubkonkan)}</span>
                              : <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{row.penerimaSubkon}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_PEMAKAIAN_BB.length} record ditemukan</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Laporan 3: Pemakaian BB Subkontrak ── */}
          <TabsContent value="lap3">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Laporan Pemakaian BB dalam Proses Subkontrak
                  </CardTitle>
                  <CardDescription>Bahan baku KITE yang dikirim ke perusahaan subkontraktor</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_PEMAKAIAN_BB_SUBKON as unknown as Record<string,unknown>[], 'Lap3_Pemakaian_BB_Subkon', 'Pemakaian BB Subkon')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>Bukti Pengeluaran No</TableHead>
                        <TableHead>Tgl Pengeluaran</TableHead>
                        <TableHead>Kode Barang</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Jml Disubkonkan</TableHead>
                        <TableHead>Penerima Subkon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PEMAKAIAN_BB_SUBKON.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="font-mono text-xs">{row.buktiPengeluaranNo}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.buktiPengeluaranTgl}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right font-medium text-orange-600">{formatNumber(row.jumlahDisubkonkan)}</TableCell>
                          <TableCell className="text-sm">{row.penerimaSubkon}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_PEMAKAIAN_BB_SUBKON.length} record ditemukan</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Laporan 4: Pemasukan Hasil Produksi ── */}
          <TabsContent value="lap4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Laporan Pemasukan Hasil Produksi
                  </CardTitle>
                  <CardDescription>Barang jadi masuk gudang dari produksi sendiri maupun dari subkontraktor</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_PEMASUKAN_HP as unknown as Record<string,unknown>[], 'Lap4_Pemasukan_HP', 'Pemasukan HP')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>No Dokumen</TableHead>
                        <TableHead>Tgl Dokumen</TableHead>
                        <TableHead>Kode Barang</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Jml dari Produksi</TableHead>
                        <TableHead className="text-right">Jml dari Subkon</TableHead>
                        <TableHead>Gudang</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PEMASUKAN_HP.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="font-mono text-xs">{row.dokumenNo}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.dokumenTgl}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right font-medium">
                            {row.jumlahDariProduksi > 0 ? formatNumber(row.jumlahDariProduksi) : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.jumlahDariSubkon > 0
                              ? <span className="font-medium text-orange-600">{formatNumber(row.jumlahDariSubkon)}</span>
                              : <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell>{row.gudang}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_PEMASUKAN_HP.length} record ditemukan</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Laporan 5: Pengeluaran Hasil Produksi ── */}
          <TabsContent value="lap5">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Laporan Pengeluaran Hasil Produksi
                  </CardTitle>
                  <CardDescription>Barang jadi keluar melalui PEB (ekspor) maupun penjualan domestik</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_PENGELUARAN_HP as unknown as Record<string,unknown>[], 'Lap5_Pengeluaran_HP', 'Pengeluaran HP')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>No PEB</TableHead>
                        <TableHead>Tgl PEB</TableHead>
                        <TableHead>Bukti Pengeluaran No</TableHead>
                        <TableHead>Tgl Pengeluaran</TableHead>
                        <TableHead>Pembeli / Penerima</TableHead>
                        <TableHead>Negara Tujuan</TableHead>
                        <TableHead>Kode Barang</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Mata Uang</TableHead>
                        <TableHead className="text-right">Nilai Barang</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PENGELUARAN_HP.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="font-mono text-xs">{row.pebNo}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.pebTgl}</TableCell>
                          <TableCell className="font-mono text-xs">{row.buktiPengeluaranNo}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.buktiPengeluaranTgl}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm">{row.pembeliPenerima}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">{row.negaraTujuan}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right font-medium">{formatNumber(row.jumlah)}</TableCell>
                          <TableCell className="text-center">{row.matauang}</TableCell>
                          <TableCell className="text-right">{formatNumber(row.nilaiBarang)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_PENGELUARAN_HP.length} record ditemukan</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Laporan 6: Mutasi Bahan Baku ── */}
          <TabsContent value="lap6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-teal-600" />
                    Laporan Mutasi Bahan Baku
                  </CardTitle>
                  <CardDescription>Posisi saldo bahan baku: saldo awal, pemasukan, pengeluaran, saldo akhir</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_MUTASI_BB as unknown as Record<string,unknown>[], 'Lap6_Mutasi_BB', 'Mutasi BB')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>Kode Barang</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Saldo Awal</TableHead>
                        <TableHead className="text-right text-green-700">Pemasukan</TableHead>
                        <TableHead className="text-right text-red-700">Pengeluaran</TableHead>
                        <TableHead className="text-right font-bold">Saldo Akhir</TableHead>
                        <TableHead>Gudang</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_MUTASI_BB.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right">{formatNumber(row.saldoAwal)}</TableCell>
                          <TableCell className="text-right text-green-700 font-medium">+{formatNumber(row.pemasukan)}</TableCell>
                          <TableCell className="text-right text-red-700 font-medium">-{formatNumber(row.pengeluaran)}</TableCell>
                          <TableCell className="text-right font-bold text-lg">{formatNumber(row.saldoAkhir)}</TableCell>
                          <TableCell>{row.gudang}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_MUTASI_BB.length} item bahan baku</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Laporan 7: Mutasi Hasil Produksi ── */}
          <TabsContent value="lap7">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-purple-600" />
                    Laporan Mutasi Hasil Produksi
                  </CardTitle>
                  <CardDescription>Posisi saldo barang jadi: saldo awal, pemasukan, pengeluaran, saldo akhir</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_MUTASI_HP as unknown as Record<string,unknown>[], 'Lap7_Mutasi_HP', 'Mutasi HP')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>Kode Barang</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Saldo Awal</TableHead>
                        <TableHead className="text-right text-green-700">Pemasukan</TableHead>
                        <TableHead className="text-right text-red-700">Pengeluaran</TableHead>
                        <TableHead className="text-right font-bold">Saldo Akhir</TableHead>
                        <TableHead>Gudang</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_MUTASI_HP.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right">{formatNumber(row.saldoAwal)}</TableCell>
                          <TableCell className="text-right text-green-700 font-medium">+{formatNumber(row.pemasukan)}</TableCell>
                          <TableCell className="text-right text-red-700 font-medium">-{formatNumber(row.pengeluaran)}</TableCell>
                          <TableCell className="text-right font-bold text-lg">{formatNumber(row.saldoAkhir)}</TableCell>
                          <TableCell>{row.gudang}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_MUTASI_HP.length} item hasil produksi</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Laporan 8: Waste/Scrap ── */}
          <TabsContent value="lap8">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    Laporan Waste / Scrap
                  </CardTitle>
                  <CardDescription>Sisa bahan baku yang dikeluarkan melalui BC 2.4 (dijual atau dimusnahkan)</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(MOCK_WASTE_SCRAP as unknown as Record<string,unknown>[], 'Lap8_Waste_Scrap', 'Waste Scrap')}>
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>No BC 2.4</TableHead>
                        <TableHead>Tgl BC 2.4</TableHead>
                        <TableHead>Kode Barang</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Mata Uang</TableHead>
                        <TableHead className="text-right">Nilai</TableHead>
                        <TableHead>Disposisi</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_WASTE_SCRAP.map(row => (
                        <TableRow key={row.no}>
                          <TableCell className="text-center">{row.no}</TableCell>
                          <TableCell className="font-mono text-xs">{row.bc24No}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.bc24Tgl}</TableCell>
                          <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.namaBarang}</TableCell>
                          <TableCell className="text-center">{row.satuan}</TableCell>
                          <TableCell className="text-right font-medium">{formatNumber(row.jumlah)}</TableCell>
                          <TableCell className="text-center">{row.matauang}</TableCell>
                          <TableCell className="text-right">{formatNumber(row.nilai)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={row.jenisDisposisi === 'Dijual' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {row.jenisDisposisi}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{row.keterangan}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">Total Waste</p>
                    <p className="text-lg font-bold">{formatNumber(MOCK_WASTE_SCRAP.reduce((s, r) => s + r.jumlah, 0))}</p>
                    <p className="text-xs text-muted-foreground">unit (berbagai satuan)</p>
                  </div>
                  <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                    <p className="text-xs text-muted-foreground">Dijual</p>
                    <p className="text-lg font-bold text-green-700">
                      {MOCK_WASTE_SCRAP.filter(r => r.jenisDisposisi === 'Dijual').length} transaksi
                    </p>
                  </div>
                  <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                    <p className="text-xs text-muted-foreground">Dimusnahkan</p>
                    <p className="text-lg font-bold text-red-700">
                      {MOCK_WASTE_SCRAP.filter(r => r.jenisDisposisi === 'Dimusnahkan').length} transaksi
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{MOCK_WASTE_SCRAP.length} record ditemukan</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer note */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Sistem IT Inventory KITE</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Laporan ini bersifat real-time sesuai PER-5/BC/2023. Pejabat Kanwil/DJBC memiliki hak akses baca
                  melalui e-Monitoring SKP. Data diperbarui secara otomatis dari setiap transaksi di modul sistem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
