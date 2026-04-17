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
import { MOCK_PRODUCTS, MOCK_BOMS_SO } from '@/lib/mock-data/sales'
import AppLayout from '@/components/app-layout'

interface SOLine {
  id: string
  namaBarang: string       // free text — nama produk
  kodeBarang: string       // opsional
  satuan: string
  qty: number | ''
  hargaSatuan: number | ''
  catatan: string
  bomId: string            // BOM terpilih
  expanded: boolean
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
    bomId: '',
    expanded: true,
  }
}

export default function NewSalesOrderPage() {
  const router = useRouter()
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
    await new Promise(r => setTimeout(r, 800))
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

                  // BOM for this product
                  const selectedBom = line.bomId ? MOCK_BOMS_SO.find(b => b.id === line.bomId) : null

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
                                  <SelectItem value="kg">KG</SelectItem>
                                  <SelectItem value="unit">Unit</SelectItem>
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

                          {/* BOM Picker */}
                          <div className="border-t pt-3 space-y-2">
                            <Label className="text-xs text-muted-foreground">BOM (opsional — untuk planning bahan baku)</Label>
                            <Select value={line.bomId} onValueChange={v => updateLine(line.id, { bomId: v })}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Pilih BOM jika produk ini diproduksi sendiri" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— Tanpa BOM —</SelectItem>
                                {MOCK_BOMS_SO.map(b => (
                                  <SelectItem key={b.id} value={b.id}>{b.productName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {selectedBom && qty > 0 && (
                              <div className="text-xs bg-blue-50 border border-blue-200 rounded p-3 space-y-1">
                                <p className="font-semibold text-blue-800 mb-1">Estimasi Kebutuhan Bahan Baku:</p>
                                {selectedBom.items.map(item => {
                                  const needed = item.quantityPerUnit * qty
                                  const short = item.stockAvailable < needed
                                  return (
                                    <div key={item.id} className="flex justify-between items-center">
                                      <span className="text-blue-700">{item.materialName}</span>
                                      <span className={short ? 'text-red-600 font-medium' : 'text-green-700'}>
                                        {needed.toLocaleString()} {item.unit}
                                        {short ? ' ⚠ Kurang' : ' ✓'}
                                      </span>
                                    </div>
                                  )
                                })}
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

            {/* Section 3: Dokumen PO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
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
