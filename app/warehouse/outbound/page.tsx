'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Truck, Package, PackageCheck, FileText, CheckCircle,
  Search, ClipboardList, Warehouse, Download, AlertTriangle, Pencil, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import AppLayout from '@/components/app-layout'
import { useWorkOrders, useSalesOrders, useFGReceipts, useStock, useShipments } from '@/lib/store/hooks'
import { exportToExcel } from '@/lib/utils/export-excel'
import type { WorkOrder } from '@/lib/mock-data/production'
import type { SalesOrder } from '@/lib/mock-data/sales'
import type { FGReceipt } from '@/lib/store/hooks'

export default function OutboundPage() {
  const { workOrders } = useWorkOrders()
  const { orders: salesOrders } = useSalesOrders()
  const { receipts, createReceipt, updateReceipt, deleteReceipt } = useFGReceipts()
  const { addStock } = useStock()
  const { shipments, createShipment } = useShipments()

  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null)
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null)
  const [fgFormOpen, setFgFormOpen] = useState(false)
  const [searchFG, setSearchFG] = useState('')
  const [searchSO, setSearchSO] = useState('')

  // FG form state
  const [fgForm, setFgForm] = useState({
    noWO: '', qtyDiterima: '', qtyRejek: '0',
    gudang: 'Gudang FG-A', penerima: '', catatan: ''
  })

  // Shipping form state
  const [shipForm, setShipForm] = useState({
    qtyDikirim: '', noSuratJalan: '', noPEB: '',
    transporter: '', noKendaraan: '', supir: '', catatan: ''
  })

  // WOs that are COMPLETED and still need FG receiving (allow parsial — only exclude if fully received)
  const woReadyForFG = workOrders.filter(wo => {
    if (wo.status !== 'COMPLETED') return false
    const totalReceived = receipts.filter(r => r.woId === wo.id).reduce((s, r) => s + r.qtyReceived, 0)
    return totalReceived < wo.quantity
  })
  const filteredWO = woReadyForFG.filter(wo =>
    wo.id.toLowerCase().includes(searchFG.toLowerCase()) ||
    wo.product.toLowerCase().includes(searchFG.toLowerCase())
  )

  // SOs ready to ship
  const soReadyToShip = salesOrders.filter((so: SalesOrder) =>
    so.status === 'READY TO SHIP' || so.status === 'IN PRODUCTION'
  )
  const filteredSO = soReadyToShip.filter((so: SalesOrder) =>
    so.id.toLowerCase().includes(searchSO.toLowerCase()) ||
    so.customer.toLowerCase().includes(searchSO.toLowerCase())
  )

  const openFGForm = (wo: WorkOrder) => {
    const alreadyReceived = receipts.filter(r => r.woId === wo.id).reduce((s, r) => s + r.qtyReceived, 0)
    const remaining = Math.max(0, wo.quantity - alreadyReceived)
    setSelectedWO(wo)
    setFgForm({ noWO: wo.id, qtyDiterima: remaining.toString(), qtyRejek: '0', gudang: 'Gudang FG-A', penerima: '', catatan: '' })
    setFgFormOpen(true)
  }

  const [activeTab, setActiveTab] = useState('fg-entry')

  // FGR edit/delete state
  const [editFGR, setEditFGR] = useState<FGReceipt | null>(null)
  const [editFGRForm, setEditFGRForm] = useState({ qtyReceived: '', qtyReject: '', gudangTujuan: '', penerima: '' })
  const [deleteFGRId, setDeleteFGRId] = useState<string | null>(null)

  function openEditFGR(r: FGReceipt) {
    setEditFGR(r)
    setEditFGRForm({ qtyReceived: String(r.qtyReceived), qtyReject: String(r.qtyReject), gudangTujuan: r.gudangTujuan, penerima: r.penerima })
  }
  function saveEditFGR() {
    if (!editFGR) return
    updateReceipt(editFGR.id, {
      qtyReceived: parseFloat(editFGRForm.qtyReceived) || editFGR.qtyReceived,
      qtyReject: parseFloat(editFGRForm.qtyReject) || 0,
      gudangTujuan: editFGRForm.gudangTujuan,
      penerima: editFGRForm.penerima,
    })
    setEditFGR(null)
  }

  const openShipForm = (so: SalesOrder) => {
    const soWoIds = new Set(workOrders.filter((w: WorkOrder) => w.soNumber === so.id).map((w: WorkOrder) => w.id))
    const avail = receipts.filter(r => soWoIds.has(r.woId)).reduce((s, r) => s + r.qtyReceived, 0)
    const defaultQty = avail > 0 ? Math.min(avail, so.quantity) : so.quantity
    setSelectedSO(so)
    setShipForm({ qtyDikirim: defaultQty.toString(), noSuratJalan: '', noPEB: '', transporter: '', noKendaraan: '', supir: '', catatan: '' })
  }

  const qtyDiterima = parseInt(fgForm.qtyDiterima) || 0
  const qtyRejek = parseInt(fgForm.qtyRejek) || 0
  const qtyAcc = qtyDiterima - qtyRejek

  // For selected SO shipping dialog — FG availability
  const selectedSOWoIds = selectedSO
    ? new Set(workOrders.filter((w: WorkOrder) => w.soNumber === selectedSO.id).map((w: WorkOrder) => w.id))
    : new Set<string>()
  const selectedSOFGAvail = selectedSO
    ? receipts.filter(r => selectedSOWoIds.has(r.woId)).reduce((s, r) => s + r.qtyReceived, 0)
    : 0

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        <div className="flex items-center gap-4">
          <Link href="/warehouse">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Outbound / Shipping</h1>
            <p className="text-sm text-muted-foreground">Penerimaan barang jadi dari produksi &amp; pengiriman ke customer</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">WO Selesai — Belum Diterima</p>
              <p className="text-2xl font-bold text-yellow-600">{woReadyForFG.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">SO Siap Kirim</p>
              <p className="text-2xl font-bold text-blue-600">{soReadyToShip.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">FG Receipt Bulan Ini</p>
              <p className="text-2xl font-bold text-green-600">{receipts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Shipment Bulan Ini</p>
              <p className="text-2xl font-bold text-primary">{shipments.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fg-entry" className="gap-2">
              <Package className="h-4 w-4" />
              Input Barang Jadi
            </TabsTrigger>
            <TabsTrigger value="fg-history">
              <ClipboardList className="h-4 w-4 mr-1" />
              Riwayat BJ Masuk
            </TabsTrigger>
            <TabsTrigger value="shipping">
              <Truck className="h-4 w-4 mr-1" />
              Kirim ke Customer
            </TabsTrigger>
            <TabsTrigger value="ship-history">
              <FileText className="h-4 w-4 mr-1" />
              Riwayat Pengiriman
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: FG Entry from WO */}
          <TabsContent value="fg-entry" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Work Order Selesai — Menunggu Input ke Gudang BJ
                </CardTitle>
                <CardDescription>
                  WO yang sudah selesai produksi. Terima barang jadi ke gudang untuk memperbarui stok.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari WO atau produk..."
                    className="pl-8"
                    value={searchFG}
                    onChange={(e) => setSearchFG(e.target.value)}
                  />
                </div>

                {/* Info: BJ dari CMT/Subkon */}
                <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">BJ dari CMT / Subkontrak?</p>
                    <p className="text-blue-700 text-xs mt-0.5">
                      Daftar ini hanya menampilkan WO produksi internal yang sudah selesai.
                      Untuk menerima hasil dari CMT/subkon, gunakan menu{' '}
                      <Link href="/production/subkontrak" className="underline font-medium">Produksi → Subkontrak</Link>
                      {' '}→ buka job → klik <strong>"Terima Hasil dari CMT"</strong>.
                    </p>
                    <p className="text-blue-700 text-xs mt-1">
                      WO baru muncul di sini setelah statusnya berubah ke <strong>COMPLETED</strong> di menu Produksi → Work Orders.
                    </p>
                  </div>
                </div>

                {filteredWO.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <PackageCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>Semua WO sudah diterima ke gudang</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. WO</TableHead>
                        <TableHead>No. SO</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Qty Produksi</TableHead>
                        <TableHead>Tanggal Selesai</TableHead>
                        <TableHead>Line</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWO.map((wo) => (
                        <TableRow key={wo.id}>
                          <TableCell className="font-medium text-primary">{wo.id}</TableCell>
                          <TableCell className="text-muted-foreground">{wo.soNumber}</TableCell>
                          <TableCell>{wo.product}</TableCell>
                          <TableCell className="text-right font-medium">{wo.quantity.toLocaleString()}</TableCell>
                          <TableCell>{wo.endDate}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{wo.line}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => openFGForm(wo)} className="gap-1">
                              <Warehouse className="h-3.5 w-3.5" />
                              Terima ke Gudang
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: FG Receipt History */}
          <TabsContent value="fg-history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Riwayat Penerimaan Barang Jadi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tgl Masuk</TableHead>
                      <TableHead>No. WO</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Qty Diterima</TableHead>
                      <TableHead className="text-right">Qty Rejek</TableHead>
                      <TableHead>Gudang</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Belum ada penerimaan BJ</TableCell>
                      </TableRow>
                    ) : receipts.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-primary">{r.id}</TableCell>
                        <TableCell>{r.tanggal}</TableCell>
                        <TableCell className="text-muted-foreground">{r.woId}</TableCell>
                        <TableCell>{r.productName}</TableCell>
                        <TableCell className="text-right font-medium">{r.qtyReceived.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {r.qtyReject > 0 ? (
                            <span className="text-red-600 font-medium">{r.qtyReject}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>{r.gudangTujuan}</TableCell>
                        <TableCell>{r.penerima}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditFGR(r)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setDeleteFGRId(r.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: SO Shipping Queue */}
          <TabsContent value="shipping" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Antrian Pengiriman ke Customer
                </CardTitle>
                <CardDescription>
                  Sales Order yang siap dikirim. Pastikan stok BJ mencukupi sebelum proses pengiriman.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari SO atau customer..."
                    className="pl-8"
                    value={searchSO}
                    onChange={(e) => setSearchSO(e.target.value)}
                  />
                </div>

                {filteredSO.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada SO dalam antrian pengiriman</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. SO</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Qty SO</TableHead>
                        <TableHead className="text-right">Stok BJ Tersedia</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Prioritas</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSO.map((so) => {
                        const soWoIds = new Set(workOrders.filter((w: WorkOrder) => w.soNumber === so.id).map((w: WorkOrder) => w.id))
                        const fgAvail = receipts.filter(r => soWoIds.has(r.woId)).reduce((s, r) => s + r.qtyReceived, 0)
                        const fgCount = receipts.filter(r => soWoIds.has(r.woId)).length
                        return (
                        <TableRow key={so.id}>
                          <TableCell className="font-medium text-primary">{so.id}</TableCell>
                          <TableCell>{so.customer}</TableCell>
                          <TableCell>{so.product}</TableCell>
                          <TableCell className="text-right font-medium">{so.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className={fgAvail >= so.quantity ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{fgAvail.toLocaleString()}</span>
                            {fgCount > 1 && <span className="text-xs text-muted-foreground ml-1">({fgCount}x)</span>}
                          </TableCell>
                          <TableCell className={so.priority === 'Urgent' ? 'text-red-600 font-medium' : ''}>
                            {so.deliveryDate}
                          </TableCell>
                          <TableCell>
                            {so.priority === 'Urgent' ? (
                              <Badge variant="destructive">Urgent</Badge>
                            ) : (
                              <Badge variant="secondary">Normal</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => openShipForm(so)} className="gap-1">
                              <Truck className="h-3.5 w-3.5" />
                              Proses Kirim
                            </Button>
                          </TableCell>
                        </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Shipping History — Surat Jalan Ekspor */}
          <TabsContent value="ship-history" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Surat Jalan Ekspor
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => exportToExcel(
                      shipments.map(s => ({
                        'No. Surat Jalan': s.noSuratJalan,
                        'Tanggal': s.tanggal,
                        'No. SO': s.soId,
                        'Customer': s.customer,
                        'Produk': s.items.map(i => i.productName).join(', '),
                        'Qty Dikirim': s.items.reduce((a, i) => a + i.qtyDikirim, 0),
                        'No. PEB': s.noPEB || '-',
                        'Transporter': s.transporter || '-',
                        'No. Kendaraan': s.noKendaraan || '-',
                        'Supir': s.supir || '-',
                        'Status': s.status,
                        'Catatan': s.catatan || '-',
                      })),
                      'Surat_Jalan_Ekspor',
                      'Surat Jalan Ekspor'
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {shipments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>Belum ada surat jalan ekspor</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>No. Surat Jalan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead>No. PEB</TableHead>
                        <TableHead>Transporter</TableHead>
                        <TableHead>Kendaraan</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipments.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs font-semibold text-primary">{s.noSuratJalan}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm">{s.tanggal}</TableCell>
                          <TableCell className="text-sm font-medium">{s.customer}</TableCell>
                          <TableCell>
                            {s.items.map((item, i) => (
                              <div key={i}>
                                <p className="text-sm">{item.productName}</p>
                              </div>
                            ))}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {s.items.reduce((a, i) => a + i.qtyDikirim, 0).toLocaleString('id-ID')}
                            <span className="text-xs text-muted-foreground ml-1">{s.items[0]?.unit}</span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {s.noPEB ? (
                              <span className="text-blue-700">{s.noPEB}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{s.transporter || '—'}</TableCell>
                          <TableCell className="font-mono text-xs">{s.noKendaraan || '—'}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              s.status === 'Terima Dikonfirmasi'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {s.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FG Entry Dialog */}
        <Dialog open={fgFormOpen} onOpenChange={setFgFormOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Input Barang Jadi ke Gudang
              </DialogTitle>
              <DialogDescription>
                {selectedWO?.id} — {selectedWO?.product}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-md">
                <div>
                  <p className="text-muted-foreground">No. SO</p>
                  <p className="font-medium">{selectedWO?.soNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Qty Produksi</p>
                  <p className="font-bold">{selectedWO?.quantity.toLocaleString()} carton</p>
                </div>
                {selectedWO && (() => {
                  const prev = receipts.filter(r => r.woId === selectedWO.id).reduce((s, r) => s + r.qtyReceived, 0)
                  const remaining = selectedWO.quantity - prev
                  return prev > 0 ? (
                    <>
                      <div>
                        <p className="text-muted-foreground">Sudah Diterima</p>
                        <p className="font-medium text-green-600">{prev.toLocaleString()} carton</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sisa</p>
                        <p className="font-bold text-amber-600">{remaining.toLocaleString()} carton</p>
                      </div>
                    </>
                  ) : null
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qty Diterima <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={fgForm.qtyDiterima}
                    onChange={(e) => setFgForm(p => ({ ...p, qtyDiterima: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qty Rejek / QC Fail</Label>
                  <Input
                    type="number"
                    value={fgForm.qtyRejek}
                    onChange={(e) => setFgForm(p => ({ ...p, qtyRejek: e.target.value }))}
                  />
                </div>
              </div>

              {qtyAcc > 0 && (
                <div className="text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                  <span className="text-green-700 font-medium">Qty Diterima (accepted): {qtyAcc.toLocaleString()} carton</span>
                  {qtyRejek > 0 && (
                    <span className="text-red-600 ml-3">({qtyRejek} rejek)</span>
                  )}
                </div>
              )}
              {selectedWO && qtyAcc > selectedWO.quantity && (
                <div className="text-sm bg-orange-50 border border-orange-200 rounded px-3 py-2 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  <span className="text-orange-700 font-medium">
                    ⚠ Qty diterima ({qtyAcc.toLocaleString()}) melebihi qty WO ({selectedWO.quantity.toLocaleString()} carton). Periksa kembali sebelum menyimpan.
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Gudang Tujuan</Label>
                <Select value={fgForm.gudang} onValueChange={(v) => setFgForm(p => ({ ...p, gudang: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gudang FG-A">Gudang FG-A</SelectItem>
                    <SelectItem value="Gudang FG-B">Gudang FG-B</SelectItem>
                    <SelectItem value="Gudang Sementara">Gudang Sementara</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Penerima / Checker</Label>
                <Input
                  placeholder="Nama petugas gudang"
                  value={fgForm.penerima}
                  onChange={(e) => setFgForm(p => ({ ...p, penerima: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  placeholder="Catatan kondisi barang, hasil QC, dll..."
                  value={fgForm.catatan}
                  onChange={(e) => setFgForm(p => ({ ...p, catatan: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFgFormOpen(false)}>Batal</Button>
              <Button
                disabled={!fgForm.qtyDiterima || !fgForm.penerima}
                onClick={() => {
                  if (!selectedWO) return
                  const qtyRec = parseInt(fgForm.qtyDiterima) || 0
                  const qtyRej = parseInt(fgForm.qtyRejek) || 0
                  createReceipt({
                    woId: selectedWO.id,
                    woNumber: selectedWO.id,
                    soNumber: selectedWO.soNumber,
                    productName: selectedWO.product,
                    qtyProduced: selectedWO.quantity,
                    qtyReceived: qtyRec,
                    qtyReject: qtyRej,
                    unit: 'carton',
                    wasteQty: qtyRej,
                    wasteRatio: selectedWO.quantity > 0 ? qtyRej / selectedWO.quantity : 0,
                    gudangTujuan: fgForm.gudang,
                    penerima: fgForm.penerima,
                    tanggal: new Date().toISOString().split('T')[0],
                    status: 'Diterima',
                  })
                  addStock(
                    selectedWO.product.replace(/\s+/g, '-').toUpperCase(),
                    selectedWO.product,
                    qtyRec - qtyRej,
                    selectedWO.id,
                    'FG_RECEIPT',
                    'FG',
                    'carton',
                    fgForm.gudang,
                  )
                  setFgFormOpen(false)
                }}
                className="gap-2"
              >
                <PackageCheck className="h-4 w-4" />
                Simpan Penerimaan BJ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SO Shipping Dialog */}
        <Dialog open={!!selectedSO} onOpenChange={(open) => !open && setSelectedSO(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Proses Pengiriman
              </DialogTitle>
              <DialogDescription>
                {selectedSO?.id} — {selectedSO?.customer}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-md">
                <div>
                  <p className="text-muted-foreground">Produk</p>
                  <p className="font-medium">{selectedSO?.product}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Qty SO</p>
                  <p className="font-bold">{selectedSO?.quantity.toLocaleString()} carton</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qty Dikirim <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={shipForm.qtyDikirim}
                    onChange={(e) => setShipForm(p => ({ ...p, qtyDikirim: e.target.value }))}
                  />
                  {selectedSO && Number(shipForm.qtyDikirim) > selectedSO.quantity && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      ⚠ Melebihi qty SO ({selectedSO.quantity.toLocaleString()} carton). Pertimbangkan revisi SO.
                    </p>
                  )}
                  {selectedSOFGAvail > 0 && Number(shipForm.qtyDikirim) > selectedSOFGAvail && (
                    <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Stok BJ di gudang hanya {selectedSOFGAvail.toLocaleString()} — qty kirim melebihi stok tersedia.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>No. Surat Jalan</Label>
                  <Input
                    placeholder="SJ-OUT-2026-xxx"
                    value={shipForm.noSuratJalan}
                    onChange={(e) => setShipForm(p => ({ ...p, noSuratJalan: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>No. PEB (Pemberitahuan Ekspor Barang)</Label>
                <Input
                  placeholder="Isi jika sudah ada dokumen PEB"
                  value={shipForm.noPEB}
                  onChange={(e) => setShipForm(p => ({ ...p, noPEB: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Lihat <Link href="/logistics/peb" className="text-primary underline">Logistics → PEB</Link> untuk input dokumen ekspor
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Transporter</Label>
                  <Input
                    placeholder="Nama perusahaan/armada"
                    value={shipForm.transporter}
                    onChange={(e) => setShipForm(p => ({ ...p, transporter: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. Kendaraan</Label>
                  <Input
                    placeholder="B 1234 XX"
                    value={shipForm.noKendaraan}
                    onChange={(e) => setShipForm(p => ({ ...p, noKendaraan: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nama Supir</Label>
                <Input
                  placeholder="Nama supir"
                  value={shipForm.supir}
                  onChange={(e) => setShipForm(p => ({ ...p, supir: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  placeholder="Instruksi khusus, kondisi barang, dll..."
                  value={shipForm.catatan}
                  onChange={(e) => setShipForm(p => ({ ...p, catatan: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSO(null)}>Batal</Button>
              <Button
                disabled={!shipForm.qtyDikirim || !selectedSO}
                onClick={() => {
                  if (!selectedSO) return
                  createShipment({
                    tanggal: new Date().toISOString().split('T')[0],
                    soId: selectedSO.id,
                    soNumber: selectedSO.poNumber,
                    customer: selectedSO.customer,
                    items: [{ productName: selectedSO.product, qtyDikirim: parseInt(shipForm.qtyDikirim) || 0, unit: 'carton' }],
                    noPEB: shipForm.noPEB,
                    transporter: shipForm.transporter,
                    noKendaraan: shipForm.noKendaraan,
                    supir: shipForm.supir,
                    catatan: shipForm.catatan,
                    status: 'Dikirim',
                  })
                  setSelectedSO(null)
                  setActiveTab('ship-history')
                }}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Truck className="h-4 w-4" />
                Dispatch Pengiriman
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit FGR Dialog */}
        <Dialog open={!!editFGR} onOpenChange={v => !v && setEditFGR(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Penerimaan BJ — {editFGR?.id}</DialogTitle>
              <DialogDescription>{editFGR?.productName} · WO: {editFGR?.woId}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Qty Diterima</Label>
                  <Input type="number" value={editFGRForm.qtyReceived} onChange={e => setEditFGRForm(p => ({ ...p, qtyReceived: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qty Rejek</Label>
                  <Input type="number" value={editFGRForm.qtyReject} onChange={e => setEditFGRForm(p => ({ ...p, qtyReject: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Gudang Tujuan</Label>
                <Select value={editFGRForm.gudangTujuan} onValueChange={v => setEditFGRForm(p => ({ ...p, gudangTujuan: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Gudang FG-A', 'Gudang FG-B', 'Gudang Sementara'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Penerima</Label>
                <Input value={editFGRForm.penerima} onChange={e => setEditFGRForm(p => ({ ...p, penerima: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditFGR(null)}>Batal</Button>
              <Button onClick={saveEditFGR}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete FGR Confirm */}
        <Dialog open={!!deleteFGRId} onOpenChange={v => !v && setDeleteFGRId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Hapus Penerimaan BJ?</DialogTitle>
              <DialogDescription>Data penerimaan akan dihapus dari riwayat. Stok FG tidak akan otomatis dikurangi kembali.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteFGRId(null)}>Batal</Button>
              <Button variant="destructive" onClick={() => { if (deleteFGRId) { deleteReceipt(deleteFGRId); setDeleteFGRId(null) } }}>Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}
