'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard, Download, Filter, CheckCircle, AlertCircle,
  Clock, DollarSign, ArrowRight
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

const MOCK_BILLINGS = [
  {
    bc20Id: '1', bcNumber: 'PIB-2026-001', supplier: 'Baosteel', importDate: '2026-02-28',
    cifValue: 950000000, cifCurrency: 'USD', cifUSD: 61290,
    vendor: { amount: 950000000, dueDate: '2026-03-29', status: 'PAID', paidDate: '2026-03-20', paidAmount: 950000000, ref: 'TRF-2026-0301' },
    tax: { beaMasuk: 47500000, ppn: 108185000, pph22: 27312500, total: 182997500, dueDate: '2026-03-02', status: 'PAID', paidDate: '2026-03-01', ref: 'TAX-2026-0301' },
  },
  {
    bc20Id: '2', bcNumber: 'PIB-2026-002', supplier: 'POSCO', importDate: '2026-03-06',
    cifValue: 1200000000, cifCurrency: 'USD', cifUSD: 77419,
    vendor: { amount: 1200000000, dueDate: '2026-04-05', status: 'PENDING', paidDate: null, paidAmount: 0, ref: null },
    tax: { beaMasuk: 60000000, ppn: 136400000, pph22: 34500000, total: 230900000, dueDate: '2026-03-09', status: 'PAID', paidDate: '2026-03-08', ref: 'TAX-2026-0308' },
  },
  {
    bc20Id: '3', bcNumber: 'PIB-2026-003', supplier: 'Nippon Steel', importDate: '2026-03-10',
    cifValue: 850000000, cifCurrency: 'USD', cifUSD: 54839,
    vendor: { amount: 850000000, dueDate: '2026-04-09', status: 'PENDING', paidDate: null, paidAmount: 0, ref: null },
    tax: { beaMasuk: 42500000, ppn: 96745000, pph22: 24437500, total: 163682500, dueDate: '2026-03-14', status: 'OVERDUE', paidDate: null, ref: null },
  },
  {
    bc20Id: '4', bcNumber: 'PIB-2026-004', supplier: 'JFE Steel', importDate: '2026-03-12',
    cifValue: 720000000, cifCurrency: 'USD', cifUSD: 46452,
    vendor: { amount: 720000000, dueDate: '2026-04-11', status: 'PENDING', paidDate: null, paidAmount: 0, ref: null },
    tax: { beaMasuk: 36000000, ppn: 81840000, pph22: 20700000, total: 138540000, dueDate: '2026-03-15', status: 'OVERDUE', paidDate: null, ref: null },
  },
  {
    bc20Id: '5', bcNumber: 'PIB-2026-005', supplier: 'Hyundai Steel', importDate: '2026-03-13',
    cifValue: 530000000, cifCurrency: 'USD', cifUSD: 34194,
    vendor: { amount: 530000000, dueDate: '2026-04-12', status: 'PENDING', paidDate: null, paidAmount: 0, ref: null },
    tax: { beaMasuk: 26500000, ppn: 60335000, pph22: 15237500, total: 102072500, dueDate: '2026-03-16', status: 'PENDING', paidDate: null, ref: null },
  },
]

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
const formatMillions = (v: number) =>
  v >= 1e9 ? `Rp ${(v / 1e9).toFixed(2)}M` : `Rp ${(v / 1e6).toFixed(1)}jt`

const STATUS_VENDOR: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Lunas', color: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Belum Bayar', color: 'bg-yellow-100 text-yellow-700' },
  OVERDUE: { label: 'Jatuh Tempo!', color: 'bg-red-100 text-red-700' },
  PARTIAL: { label: 'Sebagian', color: 'bg-orange-100 text-orange-700' },
}
const STATUS_TAX: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Lunas', color: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Belum Bayar', color: 'bg-yellow-100 text-yellow-700' },
  OVERDUE: { label: '⚠ OVERDUE', color: 'bg-red-100 text-red-700' },
}

export default function DualBillingReportPage() {
  const [period, setPeriod] = useState('2026-03')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const totalCIF = MOCK_BILLINGS.reduce((s, b) => s + b.cifValue, 0)
  const totalVendorPending = MOCK_BILLINGS.filter(b => b.vendor.status !== 'PAID').reduce((s, b) => s + b.vendor.amount, 0)
  const totalVendorPaid = MOCK_BILLINGS.filter(b => b.vendor.status === 'PAID').reduce((s, b) => s + b.vendor.paidAmount, 0)
  const totalTaxPending = MOCK_BILLINGS.filter(b => b.tax.status !== 'PAID').reduce((s, b) => s + b.tax.total, 0)
  const totalTaxPaid = MOCK_BILLINGS.filter(b => b.tax.status === 'PAID').reduce((s, b) => s + b.tax.total, 0)
  const overdueCount = MOCK_BILLINGS.filter(b => b.tax.status === 'OVERDUE').length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dual Billing Reconciliation</h1>
            <p className="text-muted-foreground mt-1">
              Rekonsiliasi pembayaran vendor & pajak BC 2.0
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-800">
                {overdueCount} Tax Payment Overdue — Barang TIDAK dapat dikeluarkan dari bea cukai!
              </p>
              <p className="text-sm text-red-600">Segera lakukan pembayaran pajak impor (Bea Masuk + PPN + PPh 22)</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4 items-end">
              <div>
                <Label className="text-xs">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-01">Jan 2026</SelectItem>
                    <SelectItem value="2026-02">Feb 2026</SelectItem>
                    <SelectItem value="2026-03">Mar 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    <SelectItem value="PENDING">Belum Bayar</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="PAID">Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm">Apply</Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-6">
          {/* Vendor Summary */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Vendor Billing (CIF)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
                  <p className="text-lg font-bold text-green-700">{formatMillions(totalVendorPaid)}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded">
                  <p className="text-xs text-muted-foreground">Belum Dibayar</p>
                  <p className="text-lg font-bold text-yellow-700">{formatMillions(totalVendorPending)}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Pembayaran selesai</span>
                  <span>{((totalVendorPaid / totalCIF) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(totalVendorPaid / totalCIF) * 100} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                Total CIF: {formatIDR(totalCIF)}
              </p>
            </CardContent>
          </Card>

          {/* Tax Summary */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tax Billing (Bea Masuk + PPN + PPh 22)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
                  <p className="text-lg font-bold text-green-700">{formatMillions(totalTaxPaid)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <p className="text-xs text-muted-foreground">Belum Dibayar</p>
                  <p className="text-lg font-bold text-red-700">{formatMillions(totalTaxPending)}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Pembayaran selesai</span>
                  <span>{(((totalTaxPaid) / (totalTaxPaid + totalTaxPending)) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(totalTaxPaid / (totalTaxPaid + totalTaxPending)) * 100} className="h-2" />
              </div>
              <p className="text-xs text-red-600 font-medium">
                {overdueCount} tagihan OVERDUE — barang diblokir bea cukai!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Dual Billing per BC 2.0</CardTitle>
            <CardDescription>Setiap BC 2.0 menghasilkan 2 tagihan: Vendor (CIF) + Pajak (Bea Masuk + PPN + PPh 22)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {MOCK_BILLINGS.map((b, idx) => {
                const vCfg = STATUS_VENDOR[b.vendor.status]
                const tCfg = STATUS_TAX[b.tax.status]
                return (
                  <div key={b.bc20Id} className={`border-b p-4 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    {/* BC 2.0 Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/purchasing/bc20/${b.bc20Id}`}>
                          <span className="font-bold text-blue-600 hover:underline">{b.bcNumber}</span>
                        </Link>
                        <span className="text-muted-foreground">—</span>
                        <span className="font-medium">{b.supplier}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(b.importDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <span className="text-sm font-medium">CIF: {formatIDR(b.cifValue)}</span>
                    </div>

                    {/* Two Billing Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Vendor Billing */}
                      <div className={`p-3 rounded-lg border ${b.vendor.status === 'PAID' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-blue-700">VENDOR PAYMENT</p>
                          <Badge className={`text-xs ${vCfg.color}`}>{vCfg.label}</Badge>
                        </div>
                        <p className="text-lg font-bold">{formatIDR(b.vendor.amount)}</p>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <p>Jatuh tempo: {new Date(b.vendor.dueDate).toLocaleDateString('id-ID')}</p>
                          {b.vendor.paidDate && (
                            <p className="text-green-700">
                              ✓ Bayar: {new Date(b.vendor.paidDate).toLocaleDateString('id-ID')} ({b.vendor.ref})
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tax Billing */}
                      <div className={`p-3 rounded-lg border ${b.tax.status === 'PAID' ? 'bg-green-50 border-green-200' : b.tax.status === 'OVERDUE' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-red-700">TAX PAYMENT (URGENT)</p>
                          <Badge className={`text-xs ${tCfg.color}`}>{tCfg.label}</Badge>
                        </div>
                        <p className="text-lg font-bold">{formatIDR(b.tax.total)}</p>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <div className="flex gap-3">
                            <span>BM: {formatMillions(b.tax.beaMasuk)}</span>
                            <span>PPN: {formatMillions(b.tax.ppn)}</span>
                            <span>PPh22: {formatMillions(b.tax.pph22)}</span>
                          </div>
                          <p>Jatuh tempo: {new Date(b.tax.dueDate).toLocaleDateString('id-ID')}</p>
                          {b.tax.paidDate && (
                            <p className="text-green-700">
                              ✓ Bayar: {new Date(b.tax.paidDate).toLocaleDateString('id-ID')} ({b.tax.ref})
                            </p>
                          )}
                          {b.tax.status !== 'PAID' && (
                            <Link href={`/purchasing/bc20/${b.bc20Id}`}>
                              <Button size="sm" variant="destructive" className="mt-1 h-6 text-xs">
                                Bayar Sekarang <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Total Summary */}
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total CIF (Vendor)</p>
                <p className="text-lg font-bold">{formatIDR(totalCIF)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pajak</p>
                <p className="text-lg font-bold">{formatIDR(totalTaxPaid + totalTaxPending)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Cash Outflow</p>
                <p className="text-lg font-bold text-red-700">
                  {formatIDR(totalCIF + totalTaxPaid + totalTaxPending)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rasio Pajak / CIF</p>
                <p className="text-lg font-bold">
                  {(((totalTaxPaid + totalTaxPending) / totalCIF) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
