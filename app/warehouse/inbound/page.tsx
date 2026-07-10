'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, Package, Truck, Calendar,
  FileText, Plus, Search, ClipboardList, ChevronDown, ChevronUp, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Pencil, Trash2 as Trash } from 'lucide-react'
import AppLayout from '@/components/app-layout'
import type { PurchaseOrder } from '@/lib/mock-data/purchasing'
import { useGoodsReceipts, type GoodsReceipt } from '@/lib/store/useGoodsReceipts'
import { useStock } from '@/lib/store/useStock'
import { usePurchaseOrders } from '@/lib/store/usePurchaseOrders'

interface MaterialLineGR {
  id: string
  kodeBarang: string
  namaBarang: string
  satuan: string
  qtyDipesan: string
  qtyDiterima: string
  kondisi: string
  keterangan: string
}

function newLineGR(): MaterialLineGR {
  return {
    id: crypto.randomUUID(),
    kodeBarang: '', namaBarang: '', satuan: 'KG',
    qtyDipesan: '', qtyDiterima: '', kondisi: 'Baik', keterangan: ''
  }
}

export default function InboundPage() {
  const { receipts, createReceipt, updateReceipt, deleteReceipt } = useGoodsReceipts()
  const { addStock } = useStock()
  const { orders: allPOs } = usePurchaseOrders()
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)

  // Manual form state
  const [jenisDoc, setJenisDoc] = useState('')
  const [noRefDoc, setNoRefDoc] = useState('')
  const [noPIB, setNoPIB] = useState('')
  const [supplier, setSupplier] = useState('')
  const [tglMasuk, setTglMasuk] = useState('')
  const [noSuratJalan, setNoSuratJalan] = useState('')
  const [noKendaraan, setNoKendaraan] = useState('')
  const [gudang, setGudang] = useState('')
  const [penerima, setPenerima] = useState('')
  const [catatan, setCatatan] = useState('')
  const [lines, setLines] = useState<MaterialLineGR[]>([newLineGR()])
  const [expandedLine, setExpandedLine] = useState<string | null>(lines[0]?.id)

  // State edit/hapus GR
  const [deleteTarget, setDeleteTarget] = useState<GoodsReceipt | null>(null)
  const [editTarget, setEditTarget] = useState<GoodsReceipt | null>(null)
  const [editSupplier, setEditSupplier] = useState('')
  const [editNoPIB, setEditNoPIB] = useState('')
  const [editTgl, setEditTgl] = useState('')
  const [editGudang, setEditGudang] = useState('')
  const [editPenerima, setEditPenerima] = useState('')
  const [editSJ, setEditSJ] = useState('')
  const [editCatatan, setEditCatatan] = useState('')

  function openEdit(gr: GoodsReceipt) {
    setEditTarget(gr)
    setEditSupplier(gr.supplier)
    setEditNoPIB(gr.noPIB)
    setEditTgl(gr.tglMasuk)
    setEditGudang(gr.gudang)
    setEditPenerima(gr.penerima)
    setEditSJ(gr.noSuratJalan)
    setEditCatatan(gr.catatan || '')
  }

  function saveEdit() {
    if (!editTarget) return
    updateReceipt(editTarget.id, {
      supplier: editSupplier,
      noPIB: editNoPIB,
      tglMasuk: editTgl,
      gudang: editGudang,
      penerima: editPenerima,
      noSuratJalan: editSJ,
      catatan: editCatatan,
    })
    setEditTarget(null)
  }

  // State untuk dialog terima dari PO
  const [poSuratJalan, setPoSuratJalan] = useState('')
  const [poKendaraan, setPoKendaraan] = useState('')
  const [poTanggal, setPoTanggal] = useState('')
  const [poGudang, setPoGudang] = useState('')
  const [poPenerima, setPoPenerima] = useState('')
  const [poQtyReceived, setPoQtyReceived] = useState<Record<string, number>>({})

  const incomingPOs = allPOs.filter(po =>
    po.status === 'APPROVED' || po.status === 'PARTIAL'
  )

  function updateLine(id: string, field: keyof MaterialLineGR, value: string) {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function addLine() {
    const nl = newLineGR()
    setLines(prev => [...prev, nl])
    setExpandedLine(nl.id)
  }

  function removeLine(id: string) {
    if (lines.length === 1) return
    setLines(prev => prev.filter(l => l.id !== id))
  }

  function resetManualForm() {
    setJenisDoc(''); setNoRefDoc(''); setNoPIB(''); setSupplier('')
    setTglMasuk(''); setNoSuratJalan(''); setNoKendaraan('')
    setGudang(''); setPenerima(''); setCatatan('')
    const nl = newLineGR()
    setLines([nl]); setExpandedLine(nl.id)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/warehouse">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Inbound / Receiving</h1>
              <p className="text-sm text-muted-foreground">Penerimaan material masuk — dari BC 2.0, PO lokal, atau pengiriman lainnya</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => { resetManualForm(); setShowManualForm(true) }}>
            <Plus className="h-4 w-4" />
            Input Penerimaan Baru
          </Button>
        </div>

        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Riwayat Penerimaan
            </TabsTrigger>
            <TabsTrigger value="antrian" className="gap-2">
              <Truck className="h-4 w-4" />
              Antrian PO ({incomingPOs.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Riwayat GR ── */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Goods Receipt (GR)</CardTitle>
                <CardDescription>Semua penerimaan material yang sudah diinput</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>No. GR</TableHead>
                      <TableHead>Tgl Masuk</TableHead>
                      <TableHead>Jenis Dok</TableHead>
                      <TableHead>No PIB / Referensi</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Gudang</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map(gr => (
                      <TableRow key={gr.id} className="cursor-pointer hover:bg-muted/30">
                        <TableCell className="font-mono text-xs font-medium">{gr.id}</TableCell>
                        <TableCell className="whitespace-nowrap">{gr.tglMasuk}</TableCell>
                        <TableCell>
                          <Badge variant={gr.jenisDoc === 'BC 2.0' ? 'default' : 'secondary'} className="text-xs">
                            {gr.jenisDoc}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {gr.noPIB !== '-' ? gr.noPIB : gr.noPO}
                        </TableCell>
                        <TableCell className="text-sm">{gr.supplier}</TableCell>
                        <TableCell>
                          {gr.items.map((item, i) => (
                            <div key={i}>
                              <p className="text-sm font-medium">{item.nama}</p>
                              <p className="text-xs text-muted-foreground">{item.kode} · {item.qtyDiterima.toLocaleString('id-ID')} {item.satuan}</p>
                            </div>
                          ))}
                        </TableCell>
                        <TableCell className="text-sm">{gr.gudang}</TableCell>
                        <TableCell className="text-sm">{gr.penerima}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-xs bg-green-600">{gr.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600 hover:text-blue-800" onClick={() => openEdit(gr)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(gr)}>
                              <Trash className="h-3.5 w-3.5" />
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

          {/* ── Tab 2: Antrian PO ── */}
          <TabsContent value="antrian">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Purchase Orders Menunggu Penerimaan
                </CardTitle>
                <CardDescription>PO yang sudah disetujui dan menunggu pengiriman dari supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>No. PO</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Est. Tiba</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomingPOs.map(po => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono text-xs font-medium">{po.id}</TableCell>
                        <TableCell className="text-sm">{po.supplier}</TableCell>
                        <TableCell className="text-sm">
                          {po.items.map(i => i.name).join(', ').substring(0, 40)}
                          {po.items.length > 1 ? '...' : ''}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">{po.expectedDelivery}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{po.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" className="gap-1" onClick={() => setSelectedPO(po)}>
                            <Package className="h-3 w-3" />
                            Terima
                          </Button>
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

      {/* ── Dialog: Input Penerimaan Manual ── */}
      <Dialog open={showManualForm} onOpenChange={v => { if (!v) { setShowManualForm(false); resetManualForm() } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Input Penerimaan Material
            </DialogTitle>
            <DialogDescription>
              Catat material yang masuk — dari BC 2.0, PO lokal, atau pengiriman langsung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Jenis & Referensi Dokumen */}
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Referensi Dokumen
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Jenis Dokumen <span className="text-red-500">*</span></Label>
                  <Select value={jenisDoc} onValueChange={setJenisDoc}>
                    <SelectTrigger><SelectValue placeholder="Pilih jenis..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BC 2.0">BC 2.0 (Impor Reguler)</SelectItem>
                      <SelectItem value="PO Lokal">PO Lokal</SelectItem>
                      <SelectItem value="Subkontrak">Hasil Subkontrak</SelectItem>
                      <SelectItem value="Transfer">Transfer Antar Gudang</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">No. Referensi (PO/SO)</Label>
                  <Input value={noRefDoc} onChange={e => setNoRefDoc(e.target.value)} placeholder="cth: PO-2026-005" />
                </div>
                {jenisDoc === 'BC 2.0' && (
                  <div className="space-y-1">
                    <Label className="text-xs">No. PIB / BC 2.0 <span className="text-red-500">*</span></Label>
                    <Input value={noPIB} onChange={e => setNoPIB(e.target.value)} placeholder="cth: PIB-2026-001234" />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Info Pengiriman */}
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" /> Informasi Pengiriman
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Supplier / Pengirim <span className="text-red-500">*</span></Label>
                  <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Nama supplier atau pengirim" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tanggal Masuk <span className="text-red-500">*</span></Label>
                  <Input type="date" value={tglMasuk} onChange={e => setTglMasuk(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">No. Surat Jalan</Label>
                  <Input value={noSuratJalan} onChange={e => setNoSuratJalan(e.target.value)} placeholder="cth: SJ-2026-010" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">No. Kendaraan</Label>
                  <Input value={noKendaraan} onChange={e => setNoKendaraan(e.target.value)} placeholder="cth: B 1234 XY" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gudang Tujuan <span className="text-red-500">*</span></Label>
                  <Select value={gudang} onValueChange={setGudang}>
                    <SelectTrigger><SelectValue placeholder="Pilih gudang..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gudang RM-A">Gudang RM-A (Bahan Baku)</SelectItem>
                      <SelectItem value="Gudang RM-B">Gudang RM-B (Bahan Baku)</SelectItem>
                      <SelectItem value="Gudang FG-A">Gudang FG-A (Barang Jadi)</SelectItem>
                      <SelectItem value="Gudang FG-B">Gudang FG-B (Barang Jadi)</SelectItem>
                      <SelectItem value="Gudang Sementara">Gudang Sementara</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Penerima</Label>
                  <Input value={penerima} onChange={e => setPenerima(e.target.value)} placeholder="Nama penerima di gudang" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Material Lines */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" /> Daftar Material Diterima
                </p>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addLine}>
                  <Plus className="h-3 w-3" />
                  Tambah Material
                </Button>
              </div>

              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={line.id} className="border rounded-lg overflow-hidden">
                    {/* Line header */}
                    <div
                      className="flex items-center justify-between px-3 py-2 bg-muted/30 cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedLine(expandedLine === line.id ? null : line.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs w-6 h-6 rounded-full flex items-center justify-center p-0">{idx + 1}</Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {line.namaBarang || <span className="text-muted-foreground italic">Material {idx + 1}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {line.kodeBarang && `${line.kodeBarang} · `}
                            {line.qtyDiterima && `Diterima: ${line.qtyDiterima} ${line.satuan}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {lines.length > 1 && (
                          <Button
                            type="button" variant="ghost" size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={e => { e.stopPropagation(); removeLine(line.id) }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        {expandedLine === line.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Line form */}
                    {expandedLine === line.id && (
                      <div className="p-3 grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Kode Material</Label>
                          <Input value={line.kodeBarang} onChange={e => updateLine(line.id, 'kodeBarang', e.target.value)} placeholder="cth: BB-HRC-001" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">Nama Material <span className="text-red-500">*</span></Label>
                          <Input value={line.namaBarang} onChange={e => updateLine(line.id, 'namaBarang', e.target.value)} placeholder="Nama lengkap material" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Satuan</Label>
                          <Select value={line.satuan} onValueChange={v => updateLine(line.id, 'satuan', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="KG">KG</SelectItem>
                              <SelectItem value="TON">TON</SelectItem>
                              <SelectItem value="PCS">PCS</SelectItem>
                              <SelectItem value="MTR">MTR</SelectItem>
                              <SelectItem value="LTR">LTR</SelectItem>
                              <SelectItem value="SET">SET</SelectItem>
                              <SelectItem value="YARD">YARD</SelectItem>
                              <SelectItem value="SF">SF</SelectItem>
                              <SelectItem value="TNE">TNE</SelectItem>
                              <SelectItem value="PCE">PCE</SelectItem>
                              <SelectItem value="ST">ST</SelectItem>
                              <SelectItem value="FTK">FTK</SelectItem>
                              <SelectItem value="KGM">KGM</SelectItem>
                              <SelectItem value="SHT">SHT (Sheet)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Qty Dipesan</Label>
                          <Input type="number" value={line.qtyDipesan} onChange={e => updateLine(line.id, 'qtyDipesan', e.target.value)} placeholder="0" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Qty Diterima <span className="text-red-500">*</span></Label>
                          <Input type="number" value={line.qtyDiterima} onChange={e => updateLine(line.id, 'qtyDiterima', e.target.value)} placeholder="0" />
                          {line.qtyDipesan && line.qtyDiterima && parseFloat(line.qtyDiterima) < parseFloat(line.qtyDipesan) && (
                            <p className="text-xs text-orange-600">⚠ Kurang dari pesanan: {(parseFloat(line.qtyDipesan) - parseFloat(line.qtyDiterima)).toLocaleString('id-ID')} {line.satuan}</p>
                          )}
                          {line.qtyDipesan && line.qtyDiterima && parseFloat(line.qtyDiterima) > parseFloat(line.qtyDipesan) && (
                            <p className="text-xs text-red-600 font-medium">⚠ MELEBIHI pesanan: +{(parseFloat(line.qtyDiterima) - parseFloat(line.qtyDipesan)).toLocaleString('id-ID')} {line.satuan}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Kondisi</Label>
                          <Select value={line.kondisi} onValueChange={v => updateLine(line.id, 'kondisi', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Baik">Baik</SelectItem>
                              <SelectItem value="Rusak Sebagian">Rusak Sebagian</SelectItem>
                              <SelectItem value="Rusak Semua">Rusak Semua</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">Keterangan</Label>
                          <Input value={line.keterangan} onChange={e => updateLine(line.id, 'keterangan', e.target.value)} placeholder="Catatan kondisi barang (opsional)" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Catatan */}
            <div className="space-y-1">
              <Label className="text-xs">Catatan Penerimaan</Label>
              <Textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2} placeholder="Catatan tambahan (opsional)" />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowManualForm(false); resetManualForm() }}>Batal</Button>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={!jenisDoc || !supplier || !tglMasuk || !gudang}
              onClick={() => {
                createReceipt({
                  tglMasuk,
                  noPIB: noPIB || '-',
                  noPO: noRefDoc || '-',
                  supplier,
                  jenisDoc,
                  items: lines.map(l => ({
                    kode: l.kodeBarang,
                    nama: l.namaBarang,
                    satuan: l.satuan,
                    qtyPO: Number(l.qtyDipesan) || 0,
                    qtyDiterima: Number(l.qtyDiterima) || 0,
                  })),
                  gudang,
                  penerima,
                  noSuratJalan,
                  noKendaraan,
                  catatan,
                  status: 'Selesai',
                })
                lines.forEach(l => {
                  const qty = Number(l.qtyDiterima) || 0
                  if (qty > 0 && l.kodeBarang) {
                    addStock(l.kodeBarang, l.namaBarang, qty, noRefDoc || jenisDoc, 'GR', 'BB', l.satuan, gudang)
                  }
                })
                setShowManualForm(false)
                resetManualForm()
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Konfirmasi Penerimaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Receive dari PO ── */}
      <Dialog open={!!selectedPO} onOpenChange={open => !open && setSelectedPO(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terima Pengiriman — {selectedPO?.id}</DialogTitle>
            <DialogDescription>{selectedPO?.supplier}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-3">
              <p className="font-semibold text-sm border-b pb-2">Detail Pengiriman</p>
              <div className="space-y-2">
                <Label className="text-xs">No. Surat Jalan</Label>
                <Input placeholder="cth: SJ-2026-010" value={poSuratJalan} onChange={e => setPoSuratJalan(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">No. Kendaraan</Label>
                <Input placeholder="cth: B 1234 XY" value={poKendaraan} onChange={e => setPoKendaraan(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tanggal Diterima</Label>
                <Input type="date" value={poTanggal} onChange={e => setPoTanggal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Gudang Tujuan</Label>
                <Select value={poGudang} onValueChange={setPoGudang}>
                  <SelectTrigger><SelectValue placeholder="Pilih gudang..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gudang RM-A">Gudang RM-A</SelectItem>
                    <SelectItem value="Gudang RM-B">Gudang RM-B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Penerima</Label>
                <Input placeholder="Nama penerima di gudang" value={poPenerima} onChange={e => setPoPenerima(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-sm border-b pb-2">Item yang Diterima</p>
              <div className="space-y-3 max-h-64 overflow-auto pr-1">
                {selectedPO?.items.map((item, idx) => (
                  <div key={idx} className="bg-muted/20 p-3 rounded-lg border">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-xs font-mono bg-white px-1 rounded border">{item.code}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-end">
                      <div>
                        <span className="text-xs text-muted-foreground block">Dipesan</span>
                        <span className="font-bold text-sm">{item.quantity.toLocaleString()} {item.unit}</span>
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Qty Diterima</Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            defaultValue={item.quantity}
                            className="h-8 text-sm"
                            onChange={e => setPoQtyReceived(prev => ({ ...prev, [item.code]: Number(e.target.value) }))}
                          />
                          <span className="text-xs text-muted-foreground">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPO(null)}>Batal</Button>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => {
                if (!selectedPO) return
                const today = poTanggal || new Date().toISOString().split('T')[0]
                createReceipt({
                  tglMasuk: today,
                  noPIB: '-',
                  noPO: selectedPO.id,
                  supplier: selectedPO.supplier,
                  jenisDoc: selectedPO.poType === 'Impor' ? 'BC 2.0' : 'PO Lokal',
                  items: selectedPO.items.map(item => ({
                    kode: item.code,
                    nama: item.name,
                    satuan: item.unit,
                    qtyPO: item.quantity,
                    qtyDiterima: poQtyReceived[item.code] ?? item.quantity,
                  })),
                  gudang: poGudang || 'Gudang RM-A',
                  penerima: poPenerima,
                  noSuratJalan: poSuratJalan,
                  noKendaraan: poKendaraan,
                  status: 'Selesai',
                })
                selectedPO.items.forEach(item => {
                  const qty = poQtyReceived[item.code] ?? item.quantity
                  addStock(item.code, item.name, qty, selectedPO.id, 'GR', 'BB', item.unit, poGudang || 'Gudang RM-A')
                })
                setSelectedPO(null)
                setPoSuratJalan(''); setPoKendaraan(''); setPoTanggal(''); setPoGudang(''); setPoPenerima(''); setPoQtyReceived({})
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Konfirmasi Penerimaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Hapus GR ── */}
      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus GR?</DialogTitle>
            <DialogDescription>
              Yakin hapus <span className="font-mono font-semibold">{deleteTarget?.id}</span>?<br />
              Stok yang sudah ditambahkan dari GR ini <strong>tidak otomatis dikurangi</strong>. Lakukan penyesuaian stok manual jika diperlukan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => { if (deleteTarget) { deleteReceipt(deleteTarget.id); setDeleteTarget(null) } }}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Edit GR (header only) ── */}
      <Dialog open={!!editTarget} onOpenChange={v => { if (!v) setEditTarget(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit GR — <span className="font-mono">{editTarget?.id}</span></DialogTitle>
            <DialogDescription>Perubahan pada data header saja. Item dan qty tidak dapat diubah di sini.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input value={editSupplier} onChange={e => setEditSupplier(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>No. PIB</Label>
              <Input value={editNoPIB} onChange={e => setEditNoPIB(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tgl Masuk</Label>
              <Input type="date" value={editTgl} onChange={e => setEditTgl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Gudang</Label>
              <Input value={editGudang} onChange={e => setEditGudang(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Penerima</Label>
              <Input value={editPenerima} onChange={e => setEditPenerima(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>No. Surat Jalan</Label>
              <Input value={editSJ} onChange={e => setEditSJ(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Catatan</Label>
              <Input value={editCatatan} onChange={e => setEditCatatan(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Batal</Button>
            <Button onClick={saveEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
