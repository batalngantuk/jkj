'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, TrendingUp, TrendingDown, ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/components/app-layout'
import { useSalesOrders, usePurchaseOrders, usePEB, useGoodsReceipts } from '@/lib/store/hooks'
import { usePenjualanLokal } from '@/lib/store/usePenjualanLokal'
import { exportToExcelMultiSheet } from '@/lib/utils/export-excel'

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']

function fmt(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default function RekapPage() {
  const { salesOrders = [] } = useSalesOrders()
  const { orders: purchaseOrders = [] } = usePurchaseOrders()
  const { pebs = [] } = usePEB()
  const { documents: penjualanLokal = [] } = usePenjualanLokal()
  const { receipts: grReceipts = [] } = useGoodsReceipts()

  const [filterTahun, setFilterTahun] = useState('2026')
  const [filterBulan, setFilterBulan] = useState('all')

  const inPeriode = (tgl: string) => {
    if (filterBulan !== 'all') return tgl.startsWith(`${filterTahun}-${filterBulan}`)
    return tgl.startsWith(filterTahun)
  }

  // ─── Rekap Penjualan Ekspor (dari SO + PEB) ─────────────────
  const rekapPenjualanEkspor = useMemo(() => {
    return salesOrders
      .filter(so => inPeriode(so.createdAt?.slice(0, 10) || ''))
      .map(so => ({
        id: so.id,
        tanggal: so.createdAt?.slice(0, 10) || '',
        nomorDokumen: so.id,
        customer: so.customer,
        produk: so.product,
        qty: so.quantity,
        satuan: 'carton',
        nilai: so.total || 0,
        status: so.status,
        tipe: 'Ekspor',
      }))
  }, [salesOrders, filterTahun, filterBulan])

  // ─── Rekap Penjualan Lokal (dari Penjualan Lokal docs) ───────
  const rekapPenjualanLokal = useMemo(() => {
    return penjualanLokal
      .filter(pl => inPeriode(pl.tanggal))
      .map(pl => ({
        id: pl.id,
        tanggal: pl.tanggal,
        nomorDokumen: pl.nomorPL,
        customer: pl.pembeliNama,
        produk: pl.items.map(i => i.namaBarang).join(', '),
        qty: pl.items.reduce((s, i) => s + i.qty, 0),
        satuan: '-',
        nilai: pl.totalNilaiIDR,
        status: pl.status,
        tipe: 'Lokal',
      }))
  }, [penjualanLokal, filterTahun, filterBulan])

  const allPenjualan = [...rekapPenjualanEkspor, ...rekapPenjualanLokal]
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  const totalNilaiPenjualan = allPenjualan.reduce((s, r) => s + r.nilai, 0)
  const totalEkspor = rekapPenjualanEkspor.reduce((s, r) => s + r.nilai, 0)
  const totalLokal = rekapPenjualanLokal.reduce((s, r) => s + r.nilai, 0)

  // ─── Rekap Pembelian (dari PO + GR) ─────────────────────────
  const rekapPembelian = useMemo(() => {
    return purchaseOrders
      .filter(po => inPeriode(po.orderDate))
      .map(po => {
        const related = grReceipts.filter(gr => gr.noPO === po.id)
        const totalDiterima = related.reduce((s, gr) => s + gr.items.reduce((a, i) => a + i.qtyDiterima, 0), 0)
        return {
          id: po.id,
          tanggal: po.orderDate,
          nomorDokumen: po.id,
          supplier: po.supplier,
          material: po.items.map(i => i.name).join(', '),
          qty: po.items.reduce((s, i) => s + i.quantity, 0),
          qtyDiterima: totalDiterima,
          satuan: po.items[0]?.unit || '-',
          nilai: po.totalAmount || 0,
          status: po.status,
          tipe: po.poType || 'Lokal',
        }
      })
  }, [purchaseOrders, grReceipts, filterTahun, filterBulan])

  const totalNilaiPembelian = rekapPembelian.reduce((s, r) => s + r.nilai, 0)
  const totalPembelianImpor = rekapPembelian.filter(r => r.tipe === 'Impor').reduce((s, r) => s + r.nilai, 0)
  const totalPembelianLokal = rekapPembelian.filter(r => r.tipe !== 'Impor').reduce((s, r) => s + r.nilai, 0)

  function handleExport() {
    exportToExcelMultiSheet([
      {
        name: 'Penjualan',
        data: allPenjualan.map(r => ({
          Tanggal: r.tanggal, Dokumen: r.nomorDokumen, Customer: r.customer,
          Produk: r.produk, Qty: r.qty, Nilai: r.nilai, Tipe: r.tipe, Status: r.status,
        }))
      },
      {
        name: 'Pembelian',
        data: rekapPembelian.map(r => ({
          Tanggal: r.tanggal, Dokumen: r.nomorDokumen, Supplier: r.supplier,
          Material: r.material, Qty: r.qty, QtyDiterima: r.qtyDiterima, Nilai: r.nilai, Tipe: r.tipe, Status: r.status,
        }))
      },
    ], `Rekap_Penjualan_Pembelian_${filterTahun}${filterBulan !== 'all' ? `-${filterBulan}` : ''}`)
  }

  const periodeLabel = filterBulan !== 'all'
    ? `${BULAN[parseInt(filterBulan) - 1]} ${filterTahun}`
    : `Tahun ${filterTahun}`

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Rekap Penjualan & Pembelian</h1>
              <p className="text-sm text-muted-foreground">Ringkasan transaksi penjualan dan pembelian — {periodeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterTahun} onValueChange={setFilterTahun}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['2025','2026','2027'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterBulan} onValueChange={setFilterBulan}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Semua Bulan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {BULAN.map((b, i) => <SelectItem key={i} value={String(i+1).padStart(2,'0')}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Total Penjualan</p>
              </div>
              <p className="text-xl font-bold text-green-700">{fmt(totalNilaiPenjualan)}</p>
              <p className="text-xs text-muted-foreground mt-1">{allPenjualan.length} transaksi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Ekspor</p>
              <p className="text-lg font-bold">{fmt(totalEkspor)}</p>
              <p className="text-xs text-muted-foreground">{rekapPenjualanEkspor.length} SO</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-xs text-muted-foreground">Total Pembelian</p>
              </div>
              <p className="text-xl font-bold text-red-700">{fmt(totalNilaiPembelian)}</p>
              <p className="text-xs text-muted-foreground mt-1">{rekapPembelian.length} PO</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo (Jual − Beli)</p>
              <p className={`text-lg font-bold ${totalNilaiPenjualan - totalNilaiPembelian >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fmt(totalNilaiPenjualan - totalNilaiPembelian)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="penjualan">
          <TabsList>
            <TabsTrigger value="penjualan" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />Penjualan ({allPenjualan.length})
            </TabsTrigger>
            <TabsTrigger value="pembelian" className="gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />Pembelian ({rekapPembelian.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab Penjualan */}
          <TabsContent value="penjualan">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Dokumen</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Nilai</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPenjualan.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada data penjualan di periode ini</TableCell></TableRow>
                    ) : allPenjualan.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm whitespace-nowrap">{r.tanggal}</TableCell>
                        <TableCell className="font-mono text-xs">{r.nomorDokumen}</TableCell>
                        <TableCell className="text-sm">{r.customer}</TableCell>
                        <TableCell className="text-sm max-w-40 truncate">{r.produk}</TableCell>
                        <TableCell className="text-right text-sm">{r.qty.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{r.nilai > 0 ? fmt(r.nilai) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${r.tipe === 'Ekspor' ? 'border-blue-300 text-blue-700' : 'border-purple-300 text-purple-700'}`}>
                            {r.tipe}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Pembelian */}
          <TabsContent value="pembelian">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Dokumen</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Qty PO</TableHead>
                      <TableHead className="text-right">Qty Diterima</TableHead>
                      <TableHead className="text-right">Nilai</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapPembelian.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Tidak ada data pembelian di periode ini</TableCell></TableRow>
                    ) : rekapPembelian.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm whitespace-nowrap">{r.tanggal}</TableCell>
                        <TableCell className="font-mono text-xs">{r.nomorDokumen}</TableCell>
                        <TableCell className="text-sm">{r.supplier}</TableCell>
                        <TableCell className="text-sm max-w-40 truncate">{r.material}</TableCell>
                        <TableCell className="text-right text-sm">{r.qty.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right text-sm">{r.qtyDiterima.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{r.nilai > 0 ? fmt(r.nilai) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${r.tipe === 'Impor' ? 'border-orange-300 text-orange-700' : 'border-gray-300'}`}>
                            {r.tipe}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
