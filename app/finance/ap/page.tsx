'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Download, CreditCard } from 'lucide-react'
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
import { useAPInvoices } from '@/lib/store/hooks'
import type { APInvoice } from '@/lib/mock-data/finance'

const CURRENCY_SYMBOL: Record<string, string> = { IDR: 'Rp', USD: '$', KRW: '₩' }

export default function APPage() {
  const { invoices, updateInvoice } = useAPInvoices()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Payment dialog state
  const [payDialog, setPayDialog] = useState(false)
  const [payTarget, setPayTarget] = useState<APInvoice | null>(null)
  const [payForm, setPayForm] = useState({
    tanggal: '',
    nominal: '',
    kurs: '',
    metode: 'BANK_TRANSFER',
    referensi: '',
    catatan: '',
  })

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number, currency?: string) => {
    if (currency && currency !== 'IDR') {
      return `${CURRENCY_SYMBOL[currency] ?? currency} ${amount.toLocaleString('id-ID')}`
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const totalBalance = filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0)

  const openPay = (inv: APInvoice) => {
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
    const newStatus: APInvoice['status'] = newBalance === 0 ? 'PAID' : 'SCHEDULED'
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
              <h1 className="text-2xl font-bold text-foreground">Accounts Payable</h1>
              <p className="text-sm text-muted-foreground">Vendor bills and payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportToExcel(filteredInvoices as unknown as Record<string, unknown>[], 'AP_Invoices_Report', 'AP Invoices')}>
              <Download className="h-4 w-4" />Export
            </Button>
            <Link href="/finance/ap/new">
              <Button className="gap-2"><Plus className="h-4 w-4" />New Bill</Button>
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
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</div>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'VERIFIED' || i.status === 'APPROVED').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'DRAFT').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader><CardTitle>Filter Bills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice, vendor, or PO number..."
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
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Bills ({filteredInvoices.length})</CardTitle>
            <CardDescription>All vendor invoices and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Vendor Invoice</TableHead>
                  <TableHead>PO Reference</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>BC 2.3</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">No bills found</TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/finance/ap/${invoice.id}`} className="font-mono text-sm text-primary hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{invoice.vendorInvoiceNumber}</TableCell>
                      <TableCell>
                        <Link href={`/purchasing/po/${invoice.poId}`} className="font-mono text-xs text-muted-foreground hover:underline">
                          {invoice.poNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{invoice.vendorName}</TableCell>
                      <TableCell className="text-sm">{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell className="text-sm">{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="text-sm font-medium">
                        <div>{formatCurrency(invoice.totalAmount)}</div>
                        {invoice.currency && invoice.currency !== 'IDR' && invoice.originalAmount && (
                          <div className="text-xs text-blue-600 font-normal">
                            {CURRENCY_SYMBOL[invoice.currency]}{invoice.originalAmount.toLocaleString('id-ID')} {invoice.currency}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-red-700">{formatCurrency(invoice.balance)}</TableCell>
                      <TableCell>
                        {invoice.bc20Number ? (
                          <Link href={`/purchasing/bc20/${invoice.bc20Id}`} className="font-mono text-xs text-blue-600 hover:underline">
                            {invoice.bc20Number}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell><StatusBadge status={invoice.status} /></TableCell>
                      <TableCell>
                        {invoice.balance > 0 && invoice.status !== 'PAID' && (
                          <Button size="sm" variant="outline" className="gap-1 text-green-700 border-green-300 hover:bg-green-50" onClick={() => openPay(invoice)}>
                            <CreditCard className="h-3.5 w-3.5" />
                            Bayar
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Catat Pembayaran Hutang
            </DialogTitle>
            <DialogDescription>
              {payTarget?.invoiceNumber} — {payTarget?.vendorName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-md">
              <div>
                <p className="text-muted-foreground text-xs">Total Tagihan</p>
                <p className="font-semibold">{payTarget ? formatCurrency(payTarget.totalAmount) : '-'}</p>
                {payTarget?.currency && payTarget.currency !== 'IDR' && payTarget.originalAmount && (
                  <p className="text-xs text-blue-600">{CURRENCY_SYMBOL[payTarget.currency]}{payTarget.originalAmount.toLocaleString('id-ID')} {payTarget.currency}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sisa Hutang</p>
                <p className="font-bold text-red-600">{payTarget ? formatCurrency(payTarget.balance) : '-'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Bayar <span className="text-red-500">*</span></Label>
              <Input type="date" value={payForm.tanggal} onChange={e => setPayForm(p => ({ ...p, tanggal: e.target.value }))} />
            </div>

            {/* Currency & Kurs — hanya tampil jika invoice non-IDR */}
            {payTarget?.currency && payTarget.currency !== 'IDR' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Mata Uang Invoice</Label>
                  <div className="h-9 flex items-center px-3 rounded-md border bg-muted text-sm font-medium">{payTarget.currency}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kurs Bayar ({payTarget.currency}/IDR)</Label>
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
                    <p className="text-muted-foreground">Kurs invoice: <strong>{payTarget.exchangeRate.toLocaleString('id-ID')}</strong> | Kurs bayar: <strong>{parseFloat(payForm.kurs).toLocaleString('id-ID')}</strong></p>
                    {(() => {
                      const selisih = (payTarget.exchangeRate - parseFloat(payForm.kurs)) * payTarget.originalAmount
                      return selisih !== 0 ? (
                        <p className={selisih > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          Selisih kurs: {selisih > 0 ? '+' : ''}{formatCurrency(selisih)} ({selisih > 0 ? 'Rugi kurs' : 'Untung kurs'})
                        </p>
                      ) : <p className="text-green-600">Tidak ada selisih kurs</p>
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Nominal Bayar (IDR) <span className="text-red-500">*</span></Label>
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
              <Label>Metode Pembayaran</Label>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog(false)}>Batal</Button>
            <Button
              disabled={!payForm.tanggal || !payForm.nominal}
              onClick={savePay}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4" />
              Simpan Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
