'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, PackageOpen, Factory, Building2, CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import AppLayout from '@/components/app-layout'
import { useStock, useWorkOrders, useSubkontrak } from '@/lib/store/hooks'
import { exportToExcel } from '@/lib/utils/export-excel'

interface IssueItem {
  id: string
  materialCode: string
  materialName: string
  qtyRequest: number | ''
  qtyIssued: number | ''
  satuan: string
  keterangan: string
}

function newItem(): IssueItem {
  return { id: crypto.randomUUID(), materialCode: '', materialName: '', qtyRequest: '', qtyIssued: '', satuan: 'kg', keterangan: '' }
}

function formatIDR(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }

type HistoryEntry = {
  id: string
  tanggal: string
  noBukti: string
  tujuan: 'Produksi' | 'Subkon'
  referensi: string
  items: { materialCode: string; materialName: string; qty: number; satuan: string }[]
  catatan: string
  status: 'Selesai'
}

const SEED_HISTORY: HistoryEntry[] = [
  {
    id: 'BPB-2026-001', tanggal: '2026-01-22', noBukti: 'BPB-2026-001', tujuan: 'Produksi',
    referensi: 'WO-2026-001', catatan: 'Pengeluaran BB untuk produksi latex gloves',
    items: [
      { materialCode: 'RM-LATEX', materialName: 'Natural Rubber Latex', qty: 500, satuan: 'kg' },
      { materialCode: 'RM-SULFUR', materialName: 'Sulfur Dispersion', qty: 10, satuan: 'kg' },
    ], status: 'Selesai'
  },
  {
    id: 'BPB-2026-002', tanggal: '2026-01-30', noBukti: 'BPB-2026-002', tujuan: 'Subkon',
    referensi: 'SUBK-2026-001', catatan: 'Kirim BB ke PT. Subkon Plastik Jaya',
    items: [
      { materialCode: 'BB-HDPE-001', materialName: 'Polyethylene Resin - HDPE Grade', qty: 2000, satuan: 'kg' },
    ], status: 'Selesai'
  },
  {
    id: 'BPB-2026-003', tanggal: '2026-02-06', noBukti: 'BPB-2026-003', tujuan: 'Produksi',
    referensi: 'WO-2026-002', catatan: 'Pengeluaran BB untuk produksi nitrile gloves',
    items: [
      { materialCode: 'RM-NITRILE', materialName: 'Nitrile Latex', qty: 300, satuan: 'kg' },
      { materialCode: 'RM-ZINC', materialName: 'Zinc Oxide', qty: 20, satuan: 'kg' },
    ], status: 'Selesai'
  },
]

export default function WarehouseIssuePage() {
  const { stock, deductStock } = useStock()
  const { workOrders } = useWorkOrders()
  const { records: subkonRecords } = useSubkontrak()

  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY)
  const [showForm, setShowForm] = useState(false)
  const [tujuan, setTujuan] = useState<'Produksi' | 'Subkon'>('Produksi')
  const [referensi, setReferensi] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [catatan, setCatatan] = useState('')
  const [items, setItems] = useState<IssueItem[]>([newItem()])
  const [submitted, setSubmitted] = useState(false)

  const bbStock = stock.filter(s => s.category === 'BB' || s.category === 'Packaging')

  function updateItem(id: string, patch: Partial<IssueItem>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  function selectMaterial(itemId: string, code: string) {
    const found = bbStock.find(s => s.materialCode === code)
    if (found) updateItem(itemId, { materialCode: found.materialCode, materialName: found.materialName, satuan: found.unit })
  }

  function handleSubmit() {
    const validItems = items.filter(i => i.materialCode && Number(i.qtyIssued) > 0)
    if (!validItems.length || !referensi) return

    const noBukti = `BPB-${new Date().getFullYear()}-${String(history.length + 1).padStart(3, '0')}`

    validItems.forEach(i => {
      deductStock(i.materialCode, Number(i.qtyIssued), referensi, tujuan === 'Produksi' ? 'WO' : 'SUBKON', 'PRODUCTION_OUT')
    })

    const entry: HistoryEntry = {
      id: noBukti, tanggal, noBukti, tujuan, referensi, catatan, status: 'Selesai',
      items: validItems.map(i => ({ materialCode: i.materialCode, materialName: i.materialName, qty: Number(i.qtyIssued), satuan: i.satuan }))
    }
    setHistory(prev => [entry, ...prev])
    setSubmitted(true)
  }

  function resetForm() {
    setTujuan('Produksi'); setReferensi(''); setCatatan('')
    setItems([newItem()]); setSubmitted(false)
  }

  const totalBukti = history.length
  const totalKeProduksi = history.filter(h => h.tujuan === 'Produksi').length
  const totalKeSubkon = history.filter(h => h.tujuan === 'Subkon').length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/warehouse">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <PackageOpen className="h-6 w-6 text-orange-500" />
                Pengeluaran Bahan Baku
              </h1>
              <p className="text-sm text-muted-foreground">Keluarkan BB dari gudang ke produksi atau ke subkontraktor</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportToExcel(history as unknown as Record<string, unknown>[], 'Pengeluaran_BB', 'Pengeluaran BB')}>
              <Download className="h-4 w-4" />Export
            </Button>
            <Button className="gap-2" onClick={() => { resetForm(); setShowForm(true) }}>
              <Plus className="h-4 w-4" />Buat Bukti Pengeluaran
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-orange-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Bukti Pengeluaran</p>
              <p className="text-2xl font-bold text-orange-700">{totalBukti}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Factory className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-muted-foreground">Ke Produksi</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalKeProduksi}</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-muted-foreground">Ke Subkon</p>
              </div>
              <p className="text-2xl font-bold text-purple-700">{totalKeSubkon}</p>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pengeluaran BB</CardTitle>
            <CardDescription>Semua bukti pengeluaran bahan baku dari gudang</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>No Bukti</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs font-medium">{h.noBukti}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{h.tanggal}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs gap-1 ${h.tujuan === 'Produksi' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-purple-300 text-purple-700 bg-purple-50'}`}>
                        {h.tujuan === 'Produksi' ? <Factory className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {h.tujuan}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{h.referensi}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {h.items.map((item, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {item.materialCode} — {item.qty.toLocaleString()} {item.satuan}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-40 truncate">{h.catatan}</TableCell>
                    <TableCell>
                      <Badge className="text-xs bg-green-100 text-green-800 border-green-300" variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />Selesai
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada pengeluaran</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); resetForm() } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-orange-500" />
              Buat Bukti Pengeluaran Bahan Baku
            </DialogTitle>
            <DialogDescription>Keluarkan material dari gudang ke produksi atau subkontraktor</DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-lg font-semibold">Pengeluaran BB Berhasil Dicatat</p>
              <p className="text-sm text-muted-foreground">Stok gudang sudah diperbarui otomatis</p>
              <div className="flex justify-center gap-3 mt-4">
                <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>Tutup</Button>
                <Button onClick={() => { resetForm() }}>Buat Pengeluaran Baru</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Tanggal <span className="text-red-500">*</span></Label>
                  <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Tujuan Pengeluaran <span className="text-red-500">*</span></Label>
                  <Tabs value={tujuan} onValueChange={v => { setTujuan(v as 'Produksi' | 'Subkon'); setReferensi('') }}>
                    <TabsList className="w-full">
                      <TabsTrigger value="Produksi" className="flex-1 gap-1.5">
                        <Factory className="h-3.5 w-3.5" />Ke Produksi (WO)
                      </TabsTrigger>
                      <TabsTrigger value="Subkon" className="flex-1 gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />Ke Subkontraktor
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Referensi {tujuan === 'Produksi' ? 'Work Order' : 'Job Subkon'} <span className="text-red-500">*</span></Label>
                <Select value={referensi} onValueChange={setReferensi}>
                  <SelectTrigger>
                    <SelectValue placeholder={tujuan === 'Produksi' ? 'Pilih Work Order...' : 'Pilih Job Subkon...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {tujuan === 'Produksi'
                      ? workOrders.filter(w => ['PLANNED', 'IN PROGRESS'].includes(w.status)).map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.id} — {w.product}</SelectItem>
                        ))
                      : subkonRecords.filter(s => ['Draft', 'BB Dikirim', 'Dalam Proses'].includes(s.status)).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.id} — {s.namaSubkon}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Material yang Dikeluarkan</Label>
                  <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setItems(prev => [...prev, newItem()])}>
                    <Plus className="h-3.5 w-3.5" />Tambah Baris
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Material</TableHead>
                        <TableHead className="w-32">Qty Request</TableHead>
                        <TableHead className="w-32">Qty Issued</TableHead>
                        <TableHead className="w-20">Satuan</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => {
                        const stockInfo = bbStock.find(s => s.materialCode === item.materialCode)
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Select value={item.materialCode} onValueChange={v => selectMaterial(item.id, v)}>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Pilih material..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {bbStock.map(s => (
                                    <SelectItem key={s.materialCode} value={s.materialCode}>
                                      {s.materialCode} — {s.materialName} ({s.qtyAvailable.toLocaleString()} {s.unit})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {stockInfo && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Stok tersedia: <span className={stockInfo.qtyAvailable < (Number(item.qtyIssued) || 0) ? 'text-red-600 font-medium' : 'text-green-700'}>
                                    {stockInfo.qtyAvailable.toLocaleString()} {stockInfo.unit}
                                  </span>
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm"
                                type="number"
                                placeholder="0"
                                value={item.qtyRequest}
                                onChange={e => updateItem(item.id, { qtyRequest: e.target.value === '' ? '' : Number(e.target.value) })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className={`h-8 text-sm ${stockInfo && Number(item.qtyIssued) > stockInfo.qtyAvailable ? 'border-red-400' : ''}`}
                                type="number"
                                placeholder="0"
                                value={item.qtyIssued}
                                onChange={e => updateItem(item.id, { qtyIssued: e.target.value === '' ? '' : Number(e.target.value) })}
                              />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{item.satuan}</span>
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm"
                                placeholder="Keterangan..."
                                value={item.keterangan}
                                onChange={e => updateItem(item.id, { keterangan: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                                disabled={items.length === 1}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Catatan</Label>
                <Textarea placeholder="Keterangan tambahan..." value={catatan} onChange={e => setCatatan(e.target.value)} rows={2} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>Batal</Button>
                <Button
                  disabled={!referensi || !items.some(i => i.materialCode && Number(i.qtyIssued) > 0)}
                  onClick={handleSubmit}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Simpan & Update Stok
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
