'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Banknote, FileText, Calendar, User, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AppLayout from '@/components/app-layout'
import { StatusBadge } from '@/components/shared/status-badge'
import { useARInvoices } from '@/lib/store/hooks'
import type { ARInvoice } from '@/lib/mock-data/finance'

export default function ARDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { invoices, updateInvoice } = useARInvoices()
  const invoice = invoices.find((inv: ARInvoice) => inv.id === id)

  const [payDialog, setPayDialog] = useState(false)
  const [payForm, setPayForm] = useState({ tanggal: '', nominal: '', kurs: '', metode: 'BANK_TRANSFER', referensi: '', catatan: '' })

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

  if (!invoice) {
    return (
      <AppLayout>
        <div className="p-6 space-y-4">
          <Link href="/finance/ar"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Kembali ke AR</Button></Link>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Invoice tidak ditemukan. ID: <code className="font-mono text-sm bg-muted px-1 rounded">{id}</code>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const isUSD = invoice.currency && invoice.currency !== 'IDR'

  function openPay() {
    if (!invoice) return
    setPayForm({
      tanggal: new Date().toISOString().split('T')[0],
      nominal: invoice.balance.toString(),
      kurs: invoice.exchangeRate ? invoice.exchangeRate.toString() : '',
      metode: 'BANK_TRANSFER',
      referensi: '',
      catatan: '',
    })
    setPayDialog(true)
  }

  function savePay() {
    if (!invoice) return
    const amount = parseInt(payForm.nominal.replace(/\D/g, '')) || 0
    if (amount <= 0) return
    const newPaid = invoice.paidAmount + amount
    const newBalance = Math.max(0, invoice.totalAmount - newPaid)
    let newStatus: ARInvoice['status'] = invoice.status
    if (newBalance === 0) newStatus = 'PAID'
    else if (newPaid > 0) newStatus = 'PARTIALLY_PAID'
    updateInvoice(invoice.id, { paidAmount: newPaid, balance: newBalance, status: newStatus })
    setPayDialog(false)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/finance/ar">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
                <StatusBadge status={invoice.status} />
                {isUSD && (
                  <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                    {invoice.currency}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
            </div>
          </div>
          {invoice.balance > 0 && invoice.status !== 'PAID' && (
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openPay}>
              <Banknote className="h-4 w-4" />
              Catat Penerimaan Bayar
            </Button>
          )}
          {invoice.status === 'PAID' && (
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              LUNAS
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Tagihan</p>
              <p className="text-xl font-bold">{formatIDR(invoice.totalAmount)}</p>
              {isUSD && invoice.originalAmount && (
                <p className="text-xs text-blue-600 mt-0.5">{invoice.currency} {invoice.originalAmount.toLocaleString('id-ID')} @ {invoice.exchangeRate?.toLocaleString('id-ID')}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
              <p className="text-xl font-bold text-green-700">{formatIDR(invoice.paidAmount)}</p>
            </CardContent>
          </Card>
          <Card className={invoice.balance > 0 ? 'border-orange-200' : ''}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Sisa Piutang</p>
              <p className={`text-xl font-bold ${invoice.balance > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                {formatIDR(invoice.balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Info */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Informasi Invoice</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{invoice.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Sales Order Referensi</p>
                  <Link href={`/sales/${invoice.soId}`} className="font-medium text-primary hover:underline font-mono">
                    {invoice.soNumber}
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal Invoice</p>
                  <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Jatuh Tempo</p>
                  <p className={`font-medium ${invoice.status === 'OVERDUE' ? 'text-red-600' : ''}`}>
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>
              {isUSD && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Mata Uang Invoice</p>
                    <p className="font-medium">{invoice.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kurs Invoice</p>
                    <p className="font-medium">1 {invoice.currency} = Rp {invoice.exchangeRate?.toLocaleString('id-ID')}</p>
                  </div>
                </>
              )}
              {invoice.fakturPajakNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">No. Faktur Pajak</p>
                  <p className="font-medium font-mono">{invoice.fakturPajakNumber}</p>
                </div>
              )}
              {invoice.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        {invoice.lineItems && invoice.lineItems.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Item Invoice</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        {isUSD && invoice.originalAmount
                          ? `${invoice.currency} ${(item.unitPrice / (invoice.exchangeRate || 1)).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`
                          : formatIDR(item.unitPrice)
                        }
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatIDR(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30 font-semibold">
                    <TableCell colSpan={3} className="text-right">Total</TableCell>
                    <TableCell className="text-right">{formatIDR(invoice.totalAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={payDialog} onOpenChange={setPayDialog}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-blue-600" />
              Catat Penerimaan Pembayaran
            </DialogTitle>
            <DialogDescription>
              {invoice.invoiceNumber} — {invoice.customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-md">
              <div>
                <p className="text-xs text-muted-foreground">Total Tagihan</p>
                <p className="font-semibold">{formatIDR(invoice.totalAmount)}</p>
                {isUSD && invoice.originalAmount && (
                  <p className="text-xs text-blue-600">{invoice.currency} {invoice.originalAmount.toLocaleString('id-ID')}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sisa Piutang</p>
                <p className="font-bold text-blue-600">{formatIDR(invoice.balance)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Terima <span className="text-red-500">*</span></Label>
              <Input type="date" value={payForm.tanggal} onChange={e => setPayForm(p => ({ ...p, tanggal: e.target.value }))} />
            </div>

            {isUSD && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Mata Uang Invoice</Label>
                  <div className="h-9 flex items-center px-3 rounded-md border bg-muted text-sm font-medium">{invoice.currency}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kurs Terima ({invoice.currency}/IDR)</Label>
                  <Input
                    type="number"
                    placeholder={invoice.exchangeRate?.toString()}
                    value={payForm.kurs}
                    onChange={e => {
                      const k = e.target.value
                      setPayForm(p => ({
                        ...p,
                        kurs: k,
                        nominal: invoice.originalAmount
                          ? String(Math.round(invoice.originalAmount * (parseFloat(k) || 0)))
                          : p.nominal
                      }))
                    }}
                  />
                </div>
                {invoice.exchangeRate && payForm.kurs && invoice.originalAmount && (
                  <div className="col-span-2 rounded-md bg-yellow-50 border border-yellow-200 p-2 text-xs space-y-0.5">
                    <p className="text-muted-foreground">Kurs invoice: <strong>{invoice.exchangeRate.toLocaleString('id-ID')}</strong> | Kurs terima: <strong>{parseFloat(payForm.kurs).toLocaleString('id-ID')}</strong></p>
                    {(() => {
                      const selisih = (parseFloat(payForm.kurs) - invoice.exchangeRate) * invoice.originalAmount
                      return selisih !== 0 ? (
                        <p className={selisih > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          Selisih kurs: {selisih > 0 ? '+' : ''}{formatIDR(selisih)} ({selisih > 0 ? 'Untung kurs' : 'Rugi kurs'})
                        </p>
                      ) : <p className="text-green-600">Tidak ada selisih kurs</p>
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Nominal Diterima (IDR) <span className="text-red-500">*</span></Label>
              <Input
                placeholder="0"
                value={payForm.nominal}
                onChange={e => setPayForm(p => ({ ...p, nominal: e.target.value.replace(/\D/g, '') }))}
              />
              <p className="text-xs text-muted-foreground">Rp {parseInt(payForm.nominal || '0').toLocaleString('id-ID')}</p>
            </div>

            <div className="space-y-2">
              <Label>Metode Penerimaan</Label>
              <Select value={payForm.metode} onValueChange={v => setPayForm(p => ({ ...p, metode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
                  <SelectItem value="CASH">Tunai</SelectItem>
                  <SelectItem value="CHECK">Cek / Giro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>No. Referensi / Bukti Transfer</Label>
              <Input placeholder="Misal: TRF-20260602-001" value={payForm.referensi} onChange={e => setPayForm(p => ({ ...p, referensi: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Catatan</Label>
              <Input placeholder="Catatan opsional..." value={payForm.catatan} onChange={e => setPayForm(p => ({ ...p, catatan: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setPayDialog(false)}>Batal</Button>
            <Button disabled={!payForm.tanggal || !payForm.nominal} onClick={savePay} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Banknote className="h-4 w-4" />
              Simpan Penerimaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
