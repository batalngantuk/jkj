'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Truck, Package, PackageCheck, FileText, CheckCircle,
  Plus, Search, ClipboardList, Warehouse, ChevronDown, ChevronUp
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
import { useWorkOrders, useSalesOrders, useFGReceipts, useStock } from '@/lib/store/hooks'
import type { WorkOrder } from '@/lib/mock-data/production'
import type { SalesOrder } from '@/lib/mock-data/sales'

export default function OutboundPage() {
  const { workOrders } = useWorkOrders()
  const { orders: salesOrders } = useSalesOrders()
  const { receipts, createReceipt } = useFGReceipts()
  const { addStock } = useStock()

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

  // WOs that are COMPLETED and waiting FG receiving
  const receivedWoIds = new Set(receipts.map(r => r.woId))
  const woReadyForFG = workOrders.filter(wo => wo.status === 'COMPLETED' && !receivedWoIds.has(wo.id))
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
    setSelectedWO(wo)
    setFgForm({ noWO: wo.id, qtyDiterima: wo.quantity.toString(), qtyRejek: '0', gudang: 'Gudang FG-A', penerima: '', catatan: '' })
    setFgFormOpen(true)
  }

  const openShipForm = (so: SalesOrder) => {
    setSelectedSO(so)
    setShipForm({ qtyDikirim: so.quantity.toString(), noSuratJalan: '', noPEB: '', transporter: '', noKendaraan: '', supir: '', catatan: '' })
  }

  const qtyDiterima = parseInt(fgForm.qtyDiterima) || 0
  const qtyRejek = parseInt(fgForm.qtyRejek) || 0
  const qtyAcc = qtyDiterima - qtyRejek

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
              <p className="text-2xl font-bold text-primary">0</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="fg-entry">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Belum ada penerimaan BJ</TableCell>
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
                        <TableHead>Deadline</TableHead>
                        <TableHead>Prioritas</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSO.map((so) => (
                        <TableRow key={so.id}>
                          <TableCell className="font-medium text-primary">{so.id}</TableCell>
                          <TableCell>{so.customer}</TableCell>
                          <TableCell>{so.product}</TableCell>
                          <TableCell className="text-right font-medium">{so.quantity.toLocaleString()}</TableCell>
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
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Shipping History */}
          <TabsContent value="ship-history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Riwayat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tgl Kirim</TableHead>
                      <TableHead>No. SO</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>No. Surat Jalan</TableHead>
                      <TableHead>No. PEB</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Belum ada riwayat pengiriman
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
                disabled={!shipForm.qtyDikirim}
                onClick={() => setSelectedSO(null)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Truck className="h-4 w-4" />
                Dispatch Pengiriman
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}
