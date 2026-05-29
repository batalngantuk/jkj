'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Printer, RefreshCw, Paperclip, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AppLayout from '@/components/app-layout'
import { useSuppliers } from '@/lib/store/useSuppliers'
import { usePurchaseOrders } from '@/lib/store/usePurchaseOrders'

interface POItem {
  id: number
  materialCode: string
  name: string
  qty: number
  unit: string
  price: number
}

interface Attachment {
  name: string
  size: number
  type: string
}

const PPN_RATE = 0.12
const DPP_FACTOR = 11 / 12

const CURRENCY_DEFAULTS: Record<string, number> = {
  IDR: 1,
  USD: 15500,
  KRW: 11,
}

export default function CreatePOPage() {
  const router = useRouter()
  const { suppliers } = useSuppliers()
  const { orders, createOrder } = usePurchaseOrders()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState<POItem[]>([{ id: 1, materialCode: '', name: '', qty: 0, unit: '', price: 0 }])
  const [loading, setLoading] = useState(false)
  const [poType, setPoType] = useState<'Lokal' | 'Impor'>('Lokal')
  const [supplier, setSupplier] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [currency, setCurrency] = useState<'IDR' | 'USD' | 'KRW'>('IDR')
  const [exchangeRate, setExchangeRate] = useState(15500)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showPrint, setShowPrint] = useState(false)

  const generatePoNumber = () => {
    const year = new Date().getFullYear()
    const nums = orders.map(o => {
      const m = (o.poNumber || o.id).match(/(\d+)$/)
      return m ? parseInt(m[1]) : 0
    })
    const next = Math.max(0, ...nums) + 1
    setPoNumber(`PO-${year}-${String(next).padStart(3, '0')}`)
  }

  useEffect(() => {
    generatePoNumber()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length])

  const handleCurrencyChange = (val: string) => {
    const curr = val as 'IDR' | 'USD' | 'KRW'
    setCurrency(curr)
    if (curr !== 'IDR') setExchangeRate(CURRENCY_DEFAULTS[curr])
  }

  const addItem = () => {
    setItems([...items, { id: items.length + 1, materialCode: '', name: '', qty: 0, unit: '', price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof POItem, value: string | number) => {
    const newItems = [...items]
    // @ts-ignore
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [
      ...prev,
      ...files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    ])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const rate = currency === 'IDR' ? 1 : exchangeRate
  const subtotalFx = items.reduce((acc, item) => acc + item.qty * item.price, 0)
  const subtotalIdr = Math.round(subtotalFx * rate)
  const dpp = Math.round(subtotalIdr * DPP_FACTOR)
  const ppn = Math.round(dpp * PPN_RATE)
  const grandTotalCalc = Math.round(dpp * (1 + PPN_RATE))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    createOrder({
      poNumber,
      poType,
      supplier,
      currency,
      exchangeRate: currency === 'IDR' ? undefined : exchangeRate,
      items: items.map(item => ({
        code: item.materialCode || item.name.toUpperCase().replace(/\s+/g, '-').slice(0, 12),
        name: item.name,
        quantity: item.qty,
        unit: item.unit,
        unitPrice: item.price,
        total: item.qty * item.price,
      })),
      totalAmount: grandTotalCalc,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: deliveryDate || new Date().toISOString().split('T')[0],
      status: 'APPROVED',
      paymentStatus: 'UNPAID',
      attachments,
    })
    setLoading(false)
    router.push('/purchasing/po')
  }

  const currencySymbol = currency === 'IDR' ? 'Rp' : currency
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) return
    const html = `<!DOCTYPE html>
<html><head><title>Purchase Order ${poNumber}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
  h2 { margin: 0; font-size: 18px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid #333; padding-bottom: 12px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
  .meta div { padding: 4px 0; }
  .label { color: #666; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f0f0f0; border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-size: 11px; }
  td { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; }
  .summary { margin-left: auto; width: 280px; }
  .summary-row { display: flex; justify-content: space-between; padding: 3px 0; }
  .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; border-top: 1px solid #333; padding-top: 6px; margin-top: 4px; }
  .signatures { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 48px; }
  .sig-box { border: 1px solid #ccc; padding: 8px; text-align: center; }
  .sig-space { height: 60px; }
  .sig-label { font-size: 10px; color: #666; }
  @media print { button { display: none; } }
</style></head>
<body>
<div class="header">
  <div><h2>PT. JKJ Indonesia</h2><div class="label">PURCHASE ORDER</div></div>
  <div style="text-align:right"><b style="font-size:16px">${poNumber || '-'}</b><br/><span class="label">${today}</span></div>
</div>
<div class="meta">
  <div><div class="label">Tipe PO</div><b>${poType}</b></div>
  <div><div class="label">Supplier</div><b>${supplier || '-'}</b></div>
  <div><div class="label">Tanggal Pengiriman</div><b>${deliveryDate || '-'}</b></div>
  <div><div class="label">Mata Uang</div><b>${currency}</b>${currency !== 'IDR' ? ` (Kurs: ${exchangeRate.toLocaleString('id-ID')})` : ''}</div>
</div>
<table>
  <thead><tr><th>#</th><th>Kode Material</th><th>Nama Item</th><th>Qty</th><th>Satuan</th><th style="text-align:right">Harga Satuan</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>
    ${items.map((item, i) => `<tr>
      <td>${i + 1}</td>
      <td>${item.materialCode || '-'}</td>
      <td>${item.name || '-'}</td>
      <td>${item.qty}</td>
      <td>${item.unit}</td>
      <td style="text-align:right">${currencySymbol} ${item.price.toLocaleString('id-ID')}</td>
      <td style="text-align:right">${currencySymbol} ${(item.qty * item.price).toLocaleString('id-ID')}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="summary">
  ${currency !== 'IDR' ? `<div class="summary-row"><span>Subtotal (${currency})</span><span>${currency} ${subtotalFx.toLocaleString('id-ID')}</span></div>` : ''}
  <div class="summary-row"><span>Subtotal (IDR)</span><span>Rp ${subtotalIdr.toLocaleString('id-ID')}</span></div>
  <div class="summary-row"><span>DPP (×11/12)</span><span>Rp ${dpp.toLocaleString('id-ID')}</span></div>
  <div class="summary-row"><span>PPN 12%</span><span>Rp ${ppn.toLocaleString('id-ID')}</span></div>
  <div class="total-row"><span>Total Tagihan</span><span>Rp ${grandTotalCalc.toLocaleString('id-ID')}</span></div>
</div>
${notes ? `<div style="margin-top:16px"><div class="label">Catatan</div><div>${notes}</div></div>` : ''}
<div class="signatures">
  ${['Purchase', 'Accounting', 'Manager', 'Direktur Utama'].map(role => `<div class="sig-box"><div class="sig-label">${role}</div><div class="sig-space"></div><div class="sig-label">Nama &amp; Tanggal</div></div>`).join('')}
</div>
<div style="margin-top:16px;text-align:center">
  <button onclick="window.print()" style="padding:8px 24px;background:#333;color:#fff;border:none;cursor:pointer;border-radius:4px">🖨️ Cetak</button>
</div>
</body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/purchasing/po">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Buat Purchase Order</h1>
                <p className="text-sm text-muted-foreground">Draft PO untuk pembelian lokal / impor</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />Cetak Preview
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Header */}
            <Card>
              <CardHeader><CardTitle>Detail Order</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label>No. PO</Label>
                  <div className="flex gap-2">
                    <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="PO-2026-001" className="flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={generatePoNumber} title="Auto-generate">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipe PO</Label>
                  <Select value={poType} onValueChange={v => setPoType(v as 'Lokal' | 'Impor')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lokal">Lokal</SelectItem>
                      <SelectItem value="Impor">Impor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={supplier} onValueChange={setSupplier}>
                    <SelectTrigger><SelectValue placeholder="Pilih Supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Pengiriman</Label>
                  <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Mata Uang</Label>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR — Rupiah</SelectItem>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                      <SelectItem value="KRW">KRW — Korean Won</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currency !== 'IDR' ? (
                  <div className="space-y-2">
                    <Label>Kurs {currency} / IDR</Label>
                    <Input type="number" value={exchangeRate} onChange={e => setExchangeRate(parseFloat(e.target.value) || 1)} placeholder={currency === 'USD' ? '15500' : '11'} />
                    <p className="text-xs text-muted-foreground">1 {currency} = {exchangeRate.toLocaleString('id-ID')} IDR</p>
                  </div>
                ) : <div />}

                <div className="space-y-2 col-span-2">
                  <Label>Catatan</Label>
                  <Textarea placeholder="Instruksi tambahan..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>Item Pembelian</CardTitle>
                <Button type="button" size="sm" onClick={addItem} className="gap-2">
                  <Plus className="h-4 w-4" /> Tambah Item
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Kode Material</TableHead>
                      <TableHead className="w-[28%]">Nama Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead className="text-right">Harga Satuan ({currencySymbol})</TableHead>
                      <TableHead className="text-right">Total ({currencySymbol})</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input placeholder="RM-001" value={item.materialCode} onChange={e => updateItem(index, 'materialCode', e.target.value)} className="w-28" />
                        </TableCell>
                        <TableCell>
                          <Input placeholder="Nama barang" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" placeholder="0" value={item.qty || ''} onChange={e => updateItem(index, 'qty', parseFloat(e.target.value) || 0)} className="w-20" />
                        </TableCell>
                        <TableCell>
                          <Select value={item.unit} onValueChange={v => updateItem(index, 'unit', v)}>
                            <SelectTrigger className="w-24"><SelectValue placeholder="Satuan" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="pcs">pcs</SelectItem>
                              <SelectItem value="prs">prs</SelectItem>
                              <SelectItem value="ctn">ctn</SelectItem>
                              <SelectItem value="liter">liter</SelectItem>
                              <SelectItem value="unit">unit</SelectItem>
                              <SelectItem value="roll">roll</SelectItem>
                              <SelectItem value="yard">yard (yd)</SelectItem>
                              <SelectItem value="sf">sf</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" placeholder="0" value={item.price || ''} onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)} className="w-32 text-right" />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(item.qty * item.price).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          {items.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeItem(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="p-4 bg-muted/20 border-t">
                  <div className="flex justify-end">
                    <div className="space-y-1.5 text-sm w-80">
                      {currency !== 'IDR' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal ({currency})</span>
                          <span className="font-medium">{currency} {subtotalFx.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal (IDR)</span>
                        <span className="font-medium">Rp {subtotalIdr.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DPP <span className="text-xs">(×11/12)</span></span>
                        <span className="font-medium">Rp {dpp.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PPN 12% (dari DPP)</span>
                        <span className="font-medium">Rp {ppn.toLocaleString('id-ID')}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-bold">
                        <span>Total Tagihan (IDR)</span>
                        <span className="text-primary">Rp {grandTotalCalc.toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        DPP = Total × 11/12 | PPN = DPP × 12%
                        {currency !== 'IDR' && ` | Kurs ${currency}: ${exchangeRate.toLocaleString('id-ID')}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* P4: Attachment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />Lampiran / Attachment
                </CardTitle>
                <CardDescription>Upload gambar, PDF, atau dokumen pendukung PO</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4" />Pilih File
                </Button>
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">{attachments.length} file terlampir</p>
                  </div>
                )}
                {attachments.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Belum ada lampiran</p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href="/purchasing/po">
                <Button type="button" variant="outline">Batalkan</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-primary min-w-[150px]">
                {loading ? 'Menyimpan...' : 'Submit untuk Persetujuan'}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </AppLayout>
  )
}
