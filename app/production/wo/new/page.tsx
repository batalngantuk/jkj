'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { MOCK_PRODUCTS } from '@/lib/mock-data/sales'
import { MOCK_PRODUCTION_LINES, MOCK_BOMS } from '@/lib/mock-data/production'
import { useSalesOrders, useWorkOrders } from '@/lib/store/hooks'
import type { SalesOrder } from '@/lib/mock-data/sales'

const SHIFTS = [
  { value: 'Shift 1', time: '06:00 – 14:00' },
  { value: 'Shift 2', time: '14:00 – 22:00' },
  { value: 'Shift 3', time: '22:00 – 06:00' },
]

const FG_LOCATIONS = [
  'Gudang FG-A',
  'Gudang FG-B',
  'Gudang Sementara',
]

function CreateWOForm({ soId }: { soId: string | null }) {
  const router = useRouter()
  const { orders: salesOrders } = useSalesOrders()
  const { createWorkOrder } = useWorkOrders()
  const [isLoading, setIsLoading] = useState(false)

  // Build product list: MOCK hardcoded + unique products from SO store
  const soProductNames = [...new Set(
    salesOrders
      .filter((s: SalesOrder) => s.product)
      .map((s: SalesOrder) => s.product as string)
  )]
  const allProducts = [
    ...MOCK_PRODUCTS,
    ...soProductNames
      .filter(name => !MOCK_PRODUCTS.find(p => p.name === name))
      .map(name => ({ id: name, name, stock: 0, unit: 'cartons', type: 'Custom' as const })),
  ]

  // Section 1: Order Info
  const [selectedSo, setSelectedSo] = useState(soId || '')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Section 2: BOM — auto-filled from product
  const [showBom, setShowBom] = useState(true)

  // Section 3: Production Assignment
  const [selectedLine, setSelectedLine] = useState('')
  const [shift, setShift] = useState('Shift 1')
  const [supervisor, setSupervisor] = useState('')
  const [catatan, setCatatan] = useState('')

  // Section 4: FG Location
  const [fgLocation, setFgLocation] = useState('Gudang FG-A')

  // Auto-fill product when SO selected
  React.useEffect(() => {
    if (selectedSo && selectedSo !== 'manual') {
      const so = salesOrders.find((s: SalesOrder) => s.id === selectedSo)
      if (so) {
        const prod = allProducts.find(p => p.name === so.product)
        setSelectedProduct(prod ? prod.id : (so.product || ''))
        setQuantity(so.quantity?.toString() || '')
        if (so.priority) setPriority(so.priority)
      }
    }
  }, [selectedSo, salesOrders])

  const selectedProductData = allProducts.find(p => p.id === selectedProduct)
  const bom = MOCK_BOMS.find(b => b.productId === selectedProduct)
  const qty = parseInt(quantity) || 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const line = MOCK_PRODUCTION_LINES.find(l => l.id === selectedLine)
    createWorkOrder({
      soNumber: selectedSo,
      product: selectedProductData?.name || '',
      quantity: qty,
      startDate,
      endDate,
      status: 'PLANNED',
      priority: priority as 'Normal' | 'Urgent',
      line: line?.name || selectedLine,
      progress: 0,
      bomId: bom?.id || '',
    })
    setTimeout(() => {
      setIsLoading(false)
      router.push('/production/wo')
    }, 400)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Section 1: Order Information */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
          <h2 className="font-semibold">Informasi Order</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Sales Order (opsional)</Label>
            <Select value={selectedSo} onValueChange={setSelectedSo}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih SO atau buat manual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (Tanpa SO)</SelectItem>
                {salesOrders.filter((s: SalesOrder) => s.status === 'APPROVED' || s.status === 'IN PRODUCTION').map(so => (
                  <SelectItem key={so.id} value={so.id}>
                    {so.id} — {so.customer} ({so.product})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Pilih SO untuk auto-fill produk &amp; qty</p>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Produk <span className="text-red-500">*</span></Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {allProducts.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Qty (carton) <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              placeholder="e.g. 1000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
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

          <div className="space-y-2">
            <Label>Tanggal Mulai</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Tanggal Selesai (Est.)</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Section 2: BOM Preview */}
      {selectedProduct && (
        <div className="bg-card rounded-lg border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
              <h2 className="font-semibold">Bill of Materials (BOM)</h2>
              {bom && <Badge variant="outline" className="text-xs ml-2">Auto-load dari produk</Badge>}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowBom(v => !v)}>
              {showBom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {showBom && (
            bom ? (
              <div className="rounded border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Kode Material</TableHead>
                      <TableHead className="text-xs">Nama Material</TableHead>
                      <TableHead className="text-right text-xs">Per Carton</TableHead>
                      <TableHead className="text-right text-xs">Total Kebutuhan</TableHead>
                      <TableHead className="text-right text-xs">Stok Tersedia</TableHead>
                      <TableHead className="text-center text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bom.items.map(item => {
                      const totalNeeded = item.quantityPerUnit * qty
                      const isShort = item.stockAvailable < totalNeeded
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs">{item.code}</TableCell>
                          <TableCell className="text-sm">{item.materialName}</TableCell>
                          <TableCell className="text-right text-sm">{item.quantityPerUnit} {item.unit}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {qty > 0 ? `${totalNeeded.toLocaleString()} ${item.unit}` : '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm">{item.stockAvailable.toLocaleString()} {item.unit}</TableCell>
                          <TableCell className="text-center">
                            {isShort && qty > 0 ? (
                              <div className="flex items-center justify-center gap-1 text-red-600">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">Kurang</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 text-green-600">
                                <Check className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">OK</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">BOM belum tersedia untuk produk ini.</p>
            )
          )}
        </div>
      )}

      {/* Section 3: Production Assignment */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
          <h2 className="font-semibold">Penugasan Produksi</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Line Produksi <span className="text-red-500">*</span></Label>
            <Select value={selectedLine} onValueChange={setSelectedLine}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih line produksi" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PRODUCTION_LINES.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                    {l.status === 'Running' && (
                      <span className="ml-2 text-xs text-yellow-600">(Sedang berjalan: {l.currentWo})</span>
                    )}
                    {l.status === 'Idle' && (
                      <span className="ml-2 text-xs text-green-600">(Tersedia)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Shift</Label>
            <div className="flex gap-4">
              {SHIFTS.map(s => (
                <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shift"
                    value={s.value}
                    checked={shift === s.value}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{s.value} <span className="text-muted-foreground">({s.time})</span></span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Supervisor / PIC</Label>
            <Input
              placeholder="Nama supervisor yang bertanggung jawab"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Catatan Instruksi</Label>
            <Textarea
              placeholder="Instruksi khusus untuk line produksi, spesifikasi produk, dll..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Section 4: FG Location */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
          <h2 className="font-semibold">Lokasi Barang Jadi</h2>
        </div>

        <div className="space-y-2 max-w-xs">
          <Label>Gudang Tujuan Barang Jadi</Label>
          <Select value={fgLocation} onValueChange={setFgLocation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FG_LOCATIONS.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Stok BJ akan masuk ke gudang ini setelah WO selesai dan diterima via Warehouse → Outbound.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/production/wo">
          <Button type="button" variant="outline">Batal</Button>
        </Link>
        <Button type="button" variant="outline">Simpan Draft</Button>
        <Button
          type="submit"
          disabled={isLoading || !selectedProduct || !quantity || !selectedLine}
          className="gap-2"
        >
          {isLoading ? 'Membuat WO...' : 'Buat Work Order'}
        </Button>
      </div>
    </form>
  )
}

function SuspenseWrapper() {
  const searchParams = useSearchParams()
  const soId = searchParams.get('so')
  return <CreateWOForm soId={soId} />
}

export default function NewWorkOrderPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="flex items-center gap-4">
            <Link href="/production/wo">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Buat Work Order Baru</h1>
              <p className="text-sm text-muted-foreground">Inisiasi perintah produksi baru</p>
            </div>
          </div>

          <Suspense fallback={<div className="p-4 text-muted-foreground">Memuat form...</div>}>
            <SuspenseWrapper />
          </Suspense>

        </div>
      </div>
    </AppLayout>
  )
}
