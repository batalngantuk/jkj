'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Download, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import AppLayout from '@/components/app-layout'
import { StatusBadge } from '@/components/shared/status-badge'
import { exportToExcel } from '@/lib/utils/export-excel'
import { useARInvoices } from '@/lib/store/hooks'
import type { ARInvoice } from '@/lib/mock-data/finance'

export default function ARPage() {
  const { invoices, updateInvoice } = useARInvoices()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Payment dialog state
  const [payDialog, setPayDialog] = useState(false)
  const [payTarget, setPayTarget] = useState<ARInvoice | null>(null)
  const [payForm, setPayForm] = useState({
    tanggal: '',
    nominal: '',
    kurs: '',
    metode: 'BANK_TRANSFER',
    referensi: '',
    catatan: '',
  })

  const filteredInvoices = invoices.filter((invoice: ARInvoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.soNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const totalBalance = filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0)

  const openPay = (inv: ARInvoice) => {
    setPayTarget(inv)
    setPayForm({
      tanggal: new Date().toISOString().split('T')[0],
      nominal: inv.balance.toString(),
      kurs: inv.exchangeRate ? inv.exchangeRate.toString() : '',
      metode: 'BANK_TRANSFER',
      referensi: '',
      catatan: '',
    })
    setPayDialog(true)
  }

  const savePay = () => {
    if (!payTarget) return
    const amount = parseInt(payForm.nominal.replace(/\D/g, '')) || 0
    if (amount <= 0) return
    const newPaid = payTarget.paidAmount + amount
    const newBalance = Math.max(0, payTarget.totalAmount - newPaid)
    let newStatus: ARInvoice['status'] = payTarget.status
    if (newBalance === 0) {
      newStatus = 'PAID'
    } else if (newPaid > 0) {
      newStatus = 'PARTIALLY_PAID'
    }
    updateInvoice(payTarget.id, { paidAmount: newPaid, balance: newBalance, status: newStatus })
    setPayDialog(false)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/finance">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Accounts Receivable</h1>
              <p className="text-sm text-muted-foreground">Customer invoices and payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportToExcel(filteredInvoices as unknown as Record<string, unknown>[], 'AR_Invoices_Report', 'AR Invoices')}>
              <Download className="h-4 w-4" />Export
            </Button>
            <Link href="/finance/ar/new">
              <Button className="gap-2"><Plus className="h-4 w-4" />New Invoice</Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBalance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'PAID').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'SENT' || i.status === 'PARTIALLY_PAID').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{invoices.filter(i => i.status === 'OVERDUE').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader><CardTitle>Filter Invoices</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice, customer, or SO number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
            <CardDescription>All customer invoices and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>SO Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">No invoices found</TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/finance/ar/${invoice.id}`} className="font-mono text-sm text-primary hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          invoice.invoiceType === 'Loc' ? 'border-purple-300 text-purple-700' :
                          invoice.invoiceType === 'BC2.4' ? 'border-orange-300 text-orange-700' :
                          'border-blue-300 text-blue-700'
                        }`}>
                          {invoice.invoiceType || 'BC3.0'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/sales/${invoice.soId}`} className="font-mono text-xs text-muted-foreground hover:underline">
                          {invoice.soNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{invoice.customerName}</TableCell>
                      <TableCell className="text-sm">{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell className={`text-sm ${invoice.status === 'OVERDUE' ? 'text-red-600 font-semibold' : ''}`}>
                        {formatDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell className="text-sm text-green-700">{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell className="text-sm font-semibold">{formatCurrency(invoice.balance)}</TableCell>
                      <TableCell><StatusBadge status={invoice.status} /></TableCell>
                      <TableCell>
                        {invoice.balance > 0 && invoice.status !== 'PAID' && (
                          <Button size="sm" variant="outline" className="gap-1 text-blue-700 border-blue-300 hover:bg-blue-50" onClick={() => openPay(invoice)}>
                            <Banknote className="h-3.5 w-3.5" />
                            Terima Bayar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
              {payTarget?.invoiceNumber} — {payTarget?.customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-md">
              <div>
                <p className="text-muted-foreground text-xs">Total Tagihan</p>
                <p className="font-semibold">{payTarget ? formatCurrency(payTarget.totalAmount) : '-'}</p>
                {payTarget?.currency && payTarget.currency !== 'IDR' && payTarget.originalAmount && (
                  <p className="text-xs text-blue-600">{payTarget.currency} {payTarget.originalAmount.toLocaleString('id-ID')}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sisa Piutang</p>
                <p className="font-bold text-blue-600">{payTarget ? formatCurrency(payTarget.balance) : '-'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Terima <span className="text-red-500">*</span></Label>
              <Input type="date" value={payForm.tanggal} onChange={e => setPayForm(p => ({ ...p, tanggal: e.target.value }))} />
            </div>

            {payTarget?.currency && payTarget.currency !== 'IDR' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Mata Uang Invoice</Label>
                  <div className="h-9 flex items-center px-3 rounded-md border bg-muted text-sm font-medium">{payTarget.currency}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kurs Terima ({payTarget.currency}/IDR)</Label>
                  <Input
                    type="number"
                    placeholder={payTarget.exchangeRate?.toString()}
                    value={payForm.kurs}
                    onChange={e => {
                      const k = e.target.value
                      setPayForm(p => ({
                        ...p,
                        kurs: k,
                        nominal: payTarget.originalAmount
                          ? String(Math.round(payTarget.originalAmount * (parseFloat(k) || 0)))
                          : p.nominal
                      }))
                    }}
                  />
                </div>
                {payTarget.exchangeRate && payForm.kurs && payTarget.originalAmount && (
                  <div className="col-span-2 rounded-md bg-yellow-50 border border-yellow-200 p-2 text-xs space-y-0.5">
                    <p className="text-muted-foreground">Kurs invoice: <strong>{payTarget.exchangeRate.toLocaleString('id-ID')}</strong> | Kurs terima: <strong>{parseFloat(payForm.kurs).toLocaleString('id-ID')}</strong></p>
                    {(() => {
                      const selisih = (parseFloat(payForm.kurs) - payTarget.exchangeRate) * payTarget.originalAmount
                      return selisih !== 0 ? (
                        <p className={selisih > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          Selisih kurs: {selisih > 0 ? '+' : ''}{formatCurrency(selisih)} ({selisih > 0 ? 'Untung kurs' : 'Rugi kurs'})
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
              <p className="text-xs text-muted-foreground">
                Rp {parseInt(payForm.nominal || '0').toLocaleString('id-ID')}
              </p>
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
              <Input placeholder="Misal: TRF-20260520-001" value={payForm.referensi} onChange={e => setPayForm(p => ({ ...p, referensi: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Catatan</Label>
              <Input placeholder="Catatan opsional..." value={payForm.catatan} onChange={e => setPayForm(p => ({ ...p, catatan: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setPayDialog(false)}>Batal</Button>
            <Button
              disabled={!payForm.tanggal || !payForm.nominal}
              onClick={savePay}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Banknote className="h-4 w-4" />
              Simpan Penerimaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
