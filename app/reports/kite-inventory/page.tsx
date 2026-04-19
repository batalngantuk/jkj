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
  MOCK_WASTE_SCRAP,
  type PemasukanBB,
  type PemakaianBB,
  type PemakaianBBSubkon,
  type PemasukanHP,
  type PengeluaranHP,
  type MutasiBB,
  type MutasiHP,
  type WasteScrap,
} from '@/lib/mock-data/kite-inventory'
import { exportToExcel, exportToExcelMultiSheet } from '@/lib/utils/export-excel'
import { useFGReceipts, usePEB, useWaste, useStock, useSubkontrak } from '@/lib/store/hooks'

function formatNumber(n: number) {
  return n.toLocaleString('id-ID')
}

function formatCurrency(n: number, currency: string) {
  if (currency === 'IDR') return `Rp ${n.toLocaleString('id-ID')}`
  return `${currency} ${n.toLocaleString('en-US')}`
}

export default function KiteInventoryPage() {
  const { receipts } = useFGReceipts()
  const { pebs } = usePEB()
  const { records: wasteRecords } = useWaste()
  const { stock, movements } = useStock()
  const { records: subkonRecords } = useSubkontrak()

  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-12-31')

  // Lap 1: Pemasukan BB — seed + live GR/IMPORT movements (BB category)
  const livePemasukanBB: PemasukanBB[] = movements
    .filter(m => (m.transactionType === 'IMPORT' || m.transactionType === 'LOCAL_PURCHASE') && m.quantityIn > 0)
    .filter(m => !MOCK_PEMASUKAN_BB.find(s => s.buktiPenerimaanNo === m.referenceNumber))
    .map((m, i) => ({
      no: MOCK_PEMASUKAN_BB.length + i + 1,
      tglRekam: m.date,
      jenisDokumen: m.transactionType === 'IMPORT' ? 'BC 2.0' : 'Faktur Lokal',
      noDokumen: m.referenceNumber,
      tglDokumen: m.date,
      kodeHS: '-',
      noSeriBarang: '001',
      buktiPenerimaanNo: m.referenceNumber,
      buktiPenerimaanTgl: m.date,
      kodeBB: m.materialCode,
      namaBarang: m.materialName,
      satuan: 'kg',
      jumlah: m.quantityIn,
      matauang: 'USD',
      nilaiBarang: 0,
      gudang: 'Gudang BB-1',
      penerimaSubkon: '-',
      negaraAsal: '-',
    }))
  const allPemasukanBB = [...MOCK_PEMASUKAN_BB, ...livePemasukanBB]

  // Lap 2: Pemakaian BB — seed + live PRODUCTION_OUT movements
  const livePemakaianBB: PemakaianBB[] = movements
    .filter(m => m.transactionType === 'PRODUCTION_OUT' && m.quantityOut > 0)
    .filter(m => !MOCK_PEMAKAIAN_BB.find(s => s.buktiPengeluaranNo === m.referenceNumber))
    .map((m, i) => ({
      no: MOCK_PEMAKAIAN_BB.length + i + 1,
      buktiPengeluaranNo: m.referenceNumber,
      buktiPengeluaranTgl: m.date,
      kodeBarang: m.materialCode,
      namaBarang: m.materialName,
      satuan: 'kg',
      jumlahDigunakan: m.quantityOut,
      jumlahDisubkonkan: 0,
      penerimaSubkon: '-',
    }))
  const allPemakaianBB = [...MOCK_PEMAKAIAN_BB, ...livePemakaianBB]

  // Lap 3: Pemakaian BB Subkontrak — seed + live subkon records (KITE items)
  const livePemakaianBBSubkon: PemakaianBBSubkon[] = subkonRecords
    .filter(r => !MOCK_PEMAKAIAN_BB_SUBKON.find(s => s.buktiPengeluaranNo === r.subkKiteKirimNo))
    .flatMap((r, ri) =>
      r.items
        .filter(item => item.isKITE)
        .map((item, ii) => ({
          no: MOCK_PEMAKAIAN_BB_SUBKON.length + ri + ii + 1,
          buktiPengeluaranNo: r.subkKiteKirimNo === '-' ? r.id : r.subkKiteKirimNo,
          buktiPengeluaranTgl: r.subkKiteKirimTgl === '-' ? r.jobTgl : r.subkKiteKirimTgl,
          kodeBarang: item.kodeBB,
          namaBarang: item.namaBB,
          satuan: item.satuanBB,
          jumlahDisubkonkan: item.qtyKirim,
          penerimaSubkon: r.namaSubkon,
        }))
    )
  const allPemakaianBBSubkon = [...MOCK_PEMAKAIAN_BB_SUBKON, ...livePemakaianBBSubkon]

  // Lap 6: Mutasi BB — seed + live stock (BB category)
  const liveMutasiBB: MutasiBB[] = stock
    .filter(s => s.category === 'BB')
    .filter(s => !MOCK_MUTASI_BB.find(m => m.kodeBarang === s.materialCode))
    .map((s, i) => ({
      no: MOCK_MUTASI_BB.length + i + 1,
      kodeBarang: s.materialCode,
      namaBarang: s.materialName,
      satuan: s.unit,
      saldoAwal: 0,
      pemasukan: s.qtyOnHand + (s.qtyReserved || 0),
      pengeluaran: s.qtyReserved || 0,
      saldoAkhir: s.qtyAvailable,
      gudang: s.location,
    }))
  const allMutasiBB = [...MOCK_MUTASI_BB, ...liveMutasiBB]

  // Lap 4: Pemasukan HP — seed + FG receipts dari live store
  const livePemasukanHP: PemasukanHP[] = receipts.map((r, i) => ({
    no: MOCK_PEMASUKAN_HP.length + i + 1,
    dokumenNo: r.woId,
    dokumenTgl: r.tanggal,
    kodeBarang: r.productName.replace(/\s+/g, '-').toUpperCase(),
    namaBarang: r.productName,
    satuan: r.unit,
    jumlahDariProduksi: r.qtyReceived - r.qtyReject,
    jumlahDariSubkon: 0,
    gudang: r.gudangTujuan,
  }))
  const allPemasukanHP = [...MOCK_PEMASUKAN_HP, ...livePemasukanHP]

  // Lap 5: Pengeluaran HP — seed + PEB exported dari live store
  const livePengeluaranHP: PengeluaranHP[] = pebs
    .filter(p => p.status === 'EXPORTED' || p.status === 'SUBMITTED' || p.status === 'APPROVED')
    .filter(p => !MOCK_PENGELUARAN_HP.find(m => m.pebNo === p.pebNumber))
    .flatMap((p, pi) =>
      p.items.map((item, ii) => ({
        no: MOCK_PENGELUARAN_HP.length + pi + ii + 1,
        pebNo: p.pebNumber,
        pebTgl: p.documentDate,
        buktiPengeluaranNo: `DO-LIVE-${pi + 1}`,
        buktiPengeluaranTgl: p.exportDate,
        pembeliPenerima: p.customerName,
        negaraTujuan: p.destinationCountry,
        kodeBarang: item.materialCode,
        namaBarang: item.materialName,
        satuan: item.uom,
        jumlah: item.quantity,
        matauang: p.currency,
        nilaiBarang: item.totalPrice,
      }))
    )
  const allPengeluaranHP = [...MOCK_PENGELUARAN_HP, ...livePengeluaranHP]

  // Lap 7: Mutasi HP — seed + live stock (FG category)
  const liveMutasiHP: MutasiHP[] = stock
    .filter(s => s.category === 'FG')
    .filter(s => !MOCK_MUTASI_HP.find(m => m.kodeBarang === s.materialCode))
    .map((s, i) => ({
      no: MOCK_MUTASI_HP.length + i + 1,
      kodeBarang: s.materialCode,
      namaBarang: s.materialName,
      satuan: s.unit,
      saldoAwal: 0,
      pemasukan: s.qtyOnHand + (s.qtyReserved || 0),
      pengeluaran: s.qtyReserved || 0,
      saldoAkhir: s.qtyAvailable,
      gudang: s.location,
    }))
  const allMutasiHP = [...MOCK_MUTASI_HP, ...liveMutasiHP]

  // Lap 8: Waste Scrap — seed + live waste (status Selesai / Diajukan BC 2.4)
  const liveWasteScrap: WasteScrap[] = wasteRecords
    .filter(w => w.status === 'Diajukan BC 2.4' || w.status === 'Diverifikasi BC' || w.status === 'Selesai')
    .filter(w => !MOCK_WASTE_SCRAP.find(m => m.bc24No === w.bc24No))
    .map((w, i) => ({
      no: MOCK_WASTE_SCRAP.length + i + 1,
      bc24No: w.bc24No || `BC24-LIVE-${i + 1}`,
      bc24Tgl: w.bc24Tgl || w.woDate,
      kodeBarang: w.kodeBB,
      namaBarang: w.namaBB,
      satuan: w.satuan,
      jumlah: w.wasteQty,
      nilai: w.nilaiWaste,
      matauang: w.matauang,
      jenisDisposisi: (w.disposisi === 'Dijual' ? 'Dijual' : 'Dimusnahkan') as 'Dijual' | 'Dimusnahkan',
      keterangan: w.catatan || w.disposisi,
    }))
  const allWasteScrap = [...MOCK_WASTE_SCRAP, ...liveWasteScrap]

  const handleExportSemua = () => {
    exportToExcelMultiSheet([
      { name: '1-Pemasukan BB', data: allPemasukanBB as unknown as Record<string, unknown>[] },
      { name: '2-Pemakaian BB', data: allPemakaianBB as unknown as Record<string, unknown>[] },
      { name: '3-Pemakaian BB Subkon', data: allPemakaianBBSubkon as unknown as Record<string, unknown>[] },
      { name: '4-Pemasukan HP', data: allPemasukanHP as unknown as Record<string, unknown>[] },
      { name: '5-Pengeluaran HP', data: allPengeluaranHP as unknown as Record<string, unknown>[] },
      { name: '6-Mutasi BB', data: allMutasiBB as unknown as Record<string, unknown>[] },
      { name: '7-Mutasi HP', data: allMutasiHP as unknown as Record<string, unknown>[] },
      { name: '8-Waste Scrap', data: allWasteScrap as unknown as Record<string, unknown>[] },
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allPemasukanBB as unknown as Record<string,unknown>[], 'Lap1_Pemasukan_BB', 'Pemasukan BB')}>
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
                      {allPemasukanBB.map(row => (
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
                <p className="text-xs text-muted-foreground mt-3">{allPemasukanBB.length} record ditemukan</p>
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allPemakaianBB as unknown as Record<string,unknown>[], 'Lap2_Pemakaian_BB', 'Pemakaian BB')}>
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
                      {allPemakaianBB.map(row => (
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
                <p className="text-xs text-muted-foreground mt-3">{allPemakaianBB.length} record ditemukan</p>
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allPemakaianBBSubkon as unknown as Record<string,unknown>[], 'Lap3_Pemakaian_BB_Subkon', 'Pemakaian BB Subkon')}>
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
                      {allPemakaianBBSubkon.map(row => (
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
                <p className="text-xs text-muted-foreground mt-3">{allPemakaianBBSubkon.length} record ditemukan</p>
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allPemasukanHP as unknown as Record<string,unknown>[], 'Lap4_Pemasukan_HP', 'Pemasukan HP')}>
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
                      {allPemasukanHP.map(row => (
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
                <p className="text-xs text-muted-foreground mt-3">{allPemasukanHP.length} record ditemukan</p>
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allPengeluaranHP as unknown as Record<string,unknown>[], 'Lap5_Pengeluaran_HP', 'Pengeluaran HP')}>
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
                      {allPengeluaranHP.map(row => (
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
                <p className="text-xs text-muted-foreground mt-3">{allPengeluaranHP.length} record ditemukan</p>
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allMutasiBB as unknown as Record<string,unknown>[], 'Lap6_Mutasi_BB', 'Mutasi BB')}>
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
                      {allMutasiBB.map(row => (
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
                <p className="text-xs text-muted-foreground mt-3">{allMutasiBB.length} item bahan baku</p>
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allMutasiHP as unknown as Record<string,unknown>[], 'Lap7_Mutasi_HP', 'Mutasi HP')}>
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
                      {allMutasiHP.map(row => (
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
                <p className="text-xs text-muted-foreground mt-3">{allMutasiHP.length} item hasil produksi</p>
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => exportToExcel(allWasteScrap as unknown as Record<string,unknown>[], 'Lap8_Waste_Scrap', 'Waste Scrap')}>
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
                      {allWasteScrap.map(row => (
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
                    <p className="text-lg font-bold">{formatNumber(allWasteScrap.reduce((s, r) => s + r.jumlah, 0))}</p>
                    <p className="text-xs text-muted-foreground">unit (berbagai satuan)</p>
                  </div>
                  <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                    <p className="text-xs text-muted-foreground">Dijual</p>
                    <p className="text-lg font-bold text-green-700">
                      {allWasteScrap.filter(r => r.jenisDisposisi === 'Dijual').length} transaksi
                    </p>
                  </div>
                  <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                    <p className="text-xs text-muted-foreground">Dimusnahkan</p>
                    <p className="text-lg font-bold text-red-700">
                      {allWasteScrap.filter(r => r.jenisDisposisi === 'Dimusnahkan').length} transaksi
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{allWasteScrap.length} record ditemukan</p>
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
