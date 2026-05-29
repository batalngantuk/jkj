'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileUpload } from '@/components/shared/file-upload'
import AppLayout from '@/components/app-layout'
import { useSalesOrders } from '@/lib/store/hooks'
import type { BOMItem } from '@/lib/mock-data/sales'

interface SOLine {
  id: string
  namaBarang: string
  kodeBarang: string
  satuan: string
  qty: number | ''
  hargaSatuan: number | ''
  catatan: string
  expanded: boolean
}

function newBOMItem(no: number): BOMItem {
  return { id: crypto.randomUUID(), no, namaMaterial: '', spesifikasi: '', warna: '', konsumsi: '', satuan: 'kg', penggunaan: '', asalMaterial: '' }
}

function newLine(): SOLine {
  return {
    id: crypto.randomUUID(),
    namaBarang: '',
    kodeBarang: '',
    satuan: 'carton',
    qty: '',
    hargaSatuan: '',
    catatan: '',
    expanded: true,
  }
}

export default function NewSalesOrderPage() {
  const router = useRouter()
  const { createOrder } = useSalesOrders()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Header fields
  const [customer, setCustomer] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [currency, setCurrency] = useState('USD')
  const [kurs, setKurs] = useState('16000')
  const [notes, setNotes] = useState('')

  // Line items
  const [lines, setLines] = useState<SOLine[]>([newLine()])
  // BOM manual
  const [bomItems, setBomItems] = useState<BOMItem[]>([newBOMItem(1)])
  const [showBOM, setShowBOM] = useState(false)

  const updateBOMItem = (id: string, patch: Partial<BOMItem>) =>
    setBomItems(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  const removeBOMItem = (id: string) =>
    setBomItems(prev => prev.filter(b => b.id !== id).map((b, i) => ({ ...b, no: i + 1 })))
  const addBOMItem = () =>
    setBomItems(prev => [...prev, newBOMItem(prev.length + 1)])

  const updateLine = (id: string, updates: Partial<SOLine>) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const removeLine = (id: string) => {
    if (lines.length === 1) return
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const totalIDR = lines.reduce((sum, l) => {
    const qty = Number(l.qty) || 0
    const harga = Number(l.hargaSatuan) || 0
    const kursNum = Number(kurs) || 1
    return sum + (currency === 'IDR' ? qty * harga : qty * harga * kursNum)
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    createOrder({
      poNumber,
      customer,
      product: lines.map(l => l.namaBarang).join(', '),
      quantity: lines.reduce((s, l) => s + (Number(l.qty) || 0), 0),
      unitPrice: Number(lines[0]?.hargaSatuan) || 0,
      total: totalIDR,
      deliveryDate,
      status: 'DRAFT',
      progress: 0,
      priority: priority as 'Normal' | 'Urgent',
      createdBy: 'Sales Admin',
      notes,
      bomItems: bomItems.filter(b => b.namaMaterial),
    })
    router.push('/sales')
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="flex items-center gap-4">
            <Link href="/sales">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Buat Sales Order Baru</h1>
              <p className="text-sm text-muted-foreground">Input order dari PO customer</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Header SO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  Informasi Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Customer / Pembeli <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. PT. Medika Prima Indonesia"
                      value={customer}
                      onChange={e => setCustomer(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Ketik langsung — tidak harus ada di master data</p>
                  </div>
                  <div className="space-y-2">
                    <Label>No. PO Customer <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. PO/ABC/2026/001"
                      value={poNumber}
                      onChange={e => setPoNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Pengiriman <span className="text-red-500">*</span></Label>
                    <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioritas</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Mata Uang</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="IDR">IDR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {currency !== 'IDR' && (
                    <div className="space-y-2">
                      <Label>Kurs ke IDR</Label>
                      <Input
                        type="number"
                        value={kurs}
                        onChange={e => setKurs(e.target.value)}
                        placeholder="e.g. 16000"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                    Item / Produk yang Dipesan
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setLines(prev => [...prev, newLine()])}
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lines.map((line, idx) => {
                  const qty = Number(line.qty) || 0
                  const harga = Number(line.hargaSatuan) || 0
                  const kursNum = Number(kurs) || 1
                  const subtotalIDR = currency === 'IDR' ? qty * harga : qty * harga * kursNum

                  return (
                    <div key={line.id} className="border rounded-lg overflow-hidden">
                      {/* Line header */}
                      <div
                        className="flex items-center justify-between px-4 py-2 bg-muted/40 cursor-pointer"
                        onClick={() => updateLine(line.id, { expanded: !line.expanded })}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-muted-foreground w-5">#{idx + 1}</span>
                          <span className="font-medium text-sm">
                            {line.namaBarang || <span className="text-muted-foreground italic">Belum diisi</span>}
                          </span>
                          {qty > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {qty.toLocaleString()} {line.satuan}
                              {harga > 0 && ` × ${currency} ${harga.toLocaleString()}`}
                            </span>
                          )}
                          {subtotalIDR > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Rp {subtotalIDR.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lines.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700"
                              onClick={e => { e.stopPropagation(); removeLine(line.id) }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {line.expanded
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          }
                        </div>
                      </div>

                      {/* Line detail */}
                      {line.expanded && (
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                              <Label>Nama Produk / Barang <span className="text-red-500">*</span></Label>
                              <Input
                                placeholder="e.g. Nitrile Gloves Size M, Natural Rubber Latex..."
                                value={line.namaBarang}
                                onChange={e => updateLine(line.id, { namaBarang: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground">Ketik bebas sesuai nama di PO customer</p>
                            </div>

                            <div className="space-y-2">
                              <Label>Kode Produk (opsional)</Label>
                              <Input
                                placeholder="e.g. NIT-M, LAT-S"
                                value={line.kodeBarang}
                                onChange={e => updateLine(line.id, { kodeBarang: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Satuan</Label>
                              <Select value={line.satuan} onValueChange={v => updateLine(line.id, { satuan: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="carton">Carton</SelectItem>
                                  <SelectItem value="box">Box</SelectItem>
                                  <SelectItem value="pcs">Pcs</SelectItem>
                                  <SelectItem value="prs">Prs</SelectItem>
                                  <SelectItem value="kg">KG</SelectItem>
                                  <SelectItem value="unit">Unit</SelectItem>
                                  <SelectItem value="roll">Roll</SelectItem>
                                  <SelectItem value="yard">Yard (yd)</SelectItem>
                                  <SelectItem value="sf">SF</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Qty <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={line.qty}
                                onChange={e => updateLine(line.id, { qty: e.target.value === '' ? '' : Number(e.target.value) })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Harga Satuan ({currency}) <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={line.hargaSatuan}
                                onChange={e => updateLine(line.id, { hargaSatuan: e.target.value === '' ? '' : Number(e.target.value) })}
                              />
                            </div>

                            {subtotalIDR > 0 && (
                              <div className="col-span-2 bg-muted/30 rounded p-2 text-sm">
                                <span className="text-muted-foreground">Subtotal: </span>
                                <span className="font-semibold">
                                  {currency !== 'IDR' && `${currency} ${(qty * harga).toLocaleString()} = `}
                                  Rp {subtotalIDR.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>


                          <div className="space-y-2">
                            <Label>Catatan untuk item ini</Label>
                            <Input
                              placeholder="Spesifikasi tambahan, warna, packaging khusus, dll..."
                              value={line.catatan}
                              onChange={e => updateLine(line.id, { catatan: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Total summary */}
                {lines.length > 0 && (
                  <div className="flex justify-end mt-2">
                    <div className="text-right space-y-1">
                      {currency !== 'IDR' && (
                        <p className="text-sm text-muted-foreground">
                          {currency} {lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.hargaSatuan) || 0), 0).toLocaleString()}
                          {' '}× kurs {Number(kurs).toLocaleString()}
                        </p>
                      )}
                      <p className="text-lg font-bold">
                        Total: Rp {totalIDR.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 3: BOM Manual */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                    Kebutuhan Material (BOM)
                  </CardTitle>
                  <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowBOM(v => !v)}>
                    {showBOM ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showBOM ? 'Sembunyikan' : 'Tampilkan'}
                  </Button>
                </div>
                <CardDescription>Input manual kebutuhan bahan baku per PO — No, Nama Material, Spesifikasi, Warna, Konsumsi, Satuan, Penggunaan, Asal Material</CardDescription>
              </CardHeader>
              {showBOM && (
                <CardContent className="space-y-3">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>Nama Material</TableHead>
                          <TableHead>Spesifikasi</TableHead>
                          <TableHead>Warna</TableHead>
                          <TableHead className="w-28">Konsumsi</TableHead>
                          <TableHead className="w-24">Satuan</TableHead>
                          <TableHead>Penggunaan</TableHead>
                          <TableHead className="w-28">Asal Material</TableHead>
                          <TableHead className="w-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bomItems.map(b => (
                          <TableRow key={b.id}>
                            <TableCell className="text-center text-sm text-muted-foreground">{b.no}</TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm min-w-36"
                                placeholder="Nama material..."
                                value={b.namaMaterial}
                                onChange={e => updateBOMItem(b.id, { namaMaterial: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm min-w-28"
                                placeholder="Spec..."
                                value={b.spesifikasi}
                                onChange={e => updateBOMItem(b.id, { spesifikasi: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm w-24"
                                placeholder="Warna..."
                                value={b.warna}
                                onChange={e => updateBOMItem(b.id, { warna: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm w-24"
                                type="number"
                                placeholder="0"
                                value={b.konsumsi}
                                onChange={e => updateBOMItem(b.id, { konsumsi: e.target.value === '' ? '' : Number(e.target.value) })}
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={b.satuan} onValueChange={v => updateBOMItem(b.id, { satuan: v })}>
                                <SelectTrigger className="h-8 text-sm w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {['kg', 'gram', 'liter', 'pcs', 'prs', 'm', 'm²', 'roll', 'unit', 'yard', 'sf'].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm min-w-32"
                                placeholder="Penggunaan..."
                                value={b.penggunaan}
                                onChange={e => updateBOMItem(b.id, { penggunaan: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={b.asalMaterial} onValueChange={v => updateBOMItem(b.id, { asalMaterial: v as 'Lokal' | 'Impor' })}>
                                <SelectTrigger className="h-8 text-sm w-24">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Lokal">Lokal</SelectItem>
                                  <SelectItem value="Impor">Impor</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                onClick={() => removeBOMItem(b.id)}
                                disabled={bomItems.length === 1}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addBOMItem}>
                    <Plus className="h-4 w-4" />Tambah Baris Material
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Section 4: Dokumen PO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                  Dokumen PO Customer
                </CardTitle>
                <CardDescription>Upload scan / foto PO dari customer (opsional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  onFileSelect={() => {}}
                  label="Customer PO (PDF/JPG/PNG, maks 5MB)"
                  maxSizeMB={5}
                />
                <div className="space-y-2">
                  <Label>Catatan Umum</Label>
                  <Textarea
                    placeholder="Instruksi khusus dari customer, syarat pengiriman, dll..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/sales">
                <Button type="button" variant="outline">Batal</Button>
              </Link>
              <Button type="button" variant="outline">Simpan Draft</Button>
              <Button
                type="submit"
                disabled={isSubmitting || !customer || !poNumber || !deliveryDate}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Membuat SO...' : 'Buat Sales Order'}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </AppLayout>
  )
}
