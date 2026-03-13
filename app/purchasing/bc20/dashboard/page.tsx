'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  FileText, DollarSign, AlertCircle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Package, Ship, ArrowRight,
  CreditCard, PiggyBank, BarChart2, RefreshCw, Bell
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

// Mock data
const DASHBOARD_DATA = {
  // Summary KPIs
  bc20Active: { count: 8, value: 4250000000 },
  taxPending: { count: 3, amount: 487500000 }, // RED ALERT
  customsReleasedThisMonth: { count: 5, value: 2100000000 },
  totalDutiesPaidYTD: 1236000000,

  // Recent BC 2.0 Documents
  recentBC20: [
    {
      id: '1', bcNumber: 'PIB-2026-003', supplier: 'Nippon Steel Corp',
      cifValue: 850000000, status: 'TAX_PAYMENT_PENDING', taxDueDate: '2026-03-14',
      beaMasuk: 42500000, ppn: 96745000, pph22: 24437500, totalDuties: 163682500,
      importDate: '2026-03-10',
    },
    {
      id: '2', bcNumber: 'PIB-2026-002', supplier: 'POSCO',
      cifValue: 1200000000, status: 'CUSTOMS_RELEASED', taxDueDate: '2026-03-08',
      beaMasuk: 60000000, ppn: 136400000, pph22: 34500000, totalDuties: 230900000,
      importDate: '2026-03-06',
    },
    {
      id: '3', bcNumber: 'PIB-2026-001', supplier: 'Baosteel',
      cifValue: 950000000, status: 'GOODS_RECEIVED', taxDueDate: '2026-03-01',
      beaMasuk: 47500000, ppn: 108185000, pph22: 27312500, totalDuties: 182997500,
      importDate: '2026-02-28',
    },
    {
      id: '4', bcNumber: 'PIB-2026-004', supplier: 'JFE Steel',
      cifValue: 720000000, status: 'TAX_PAYMENT_PENDING', taxDueDate: '2026-03-15',
      beaMasuk: 36000000, ppn: 81840000, pph22: 20700000, totalDuties: 138540000,
      importDate: '2026-03-12',
    },
    {
      id: '5', bcNumber: 'PIB-2026-005', supplier: 'Hyundai Steel',
      cifValue: 530000000, status: 'DRAFT', taxDueDate: null,
      beaMasuk: 26500000, ppn: 60335000, pph22: 15237500, totalDuties: 102072500,
      importDate: '2026-03-13',
    },
  ],

  // Dual Billing Outstanding
  dualBilling: {
    vendorOutstanding: { count: 6, amount: 3820000000 },
    taxOutstanding: { count: 3, amount: 487500000 },
    paidThisMonth: { vendor: 1500000000, tax: 412000000 },
  },

  // Tax Asset Balance
  taxAssets: {
    ppnAvailable: 459330000,
    pph22Available: 87487500,
    ppnUsedThisMonth: 123000000,
    pph22UsedThisYear: 0,
  },

  // Landed Cost Summary
  landedCosts: [
    { material: 'Hot Rolled Coil', avgUnitCost: 9250, lastMonth: 8900, change: 3.93 },
    { material: 'Cold Rolled Coil', avgUnitCost: 11800, lastMonth: 12100, change: -2.48 },
    { material: 'Galvanized Sheet', avgUnitCost: 13500, lastMonth: 13200, change: 2.27 },
  ],

  // Cash Flow Forecast
  cashFlow: {
    next30: { vendor: 1200000000, tax: 302222500 },
    next60: { vendor: 2100000000, tax: 485000000 },
    next90: { vendor: 3500000000, tax: 760000000 },
  },

  // Recent Activities
  activities: [
    { type: 'TAX_PAYMENT', ref: 'PIB-2026-002', desc: 'Tax payment recorded', amount: 230900000, time: '2026-03-08 14:30' },
    { type: 'SPPB', ref: 'PIB-2026-002', desc: 'SPPB received - goods released', amount: null, time: '2026-03-09 09:15' },
    { type: 'GR', ref: 'PIB-2026-001', desc: 'Goods received at warehouse', amount: 950000000, time: '2026-03-10 11:00' },
    { type: 'NEW_BC20', ref: 'PIB-2026-005', desc: 'New BC 2.0 created (DRAFT)', amount: 530000000, time: '2026-03-13 08:45' },
    { type: 'TAX_ALERT', ref: 'PIB-2026-003', desc: 'Tax payment overdue!', amount: 163682500, time: '2026-03-14 09:00' },
  ],
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const formatMillions = (amount: number) => {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  return `Rp ${(amount / 1_000_000).toFixed(0)}jt`
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  UNDER_CUSTOMS_REVIEW: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
  TAX_PAYMENT_PENDING: { label: 'Tax Due!', color: 'bg-red-100 text-red-700' },
  TAX_PAID: { label: 'Tax Paid', color: 'bg-orange-100 text-orange-700' },
  CUSTOMS_RELEASED: { label: 'Released', color: 'bg-green-100 text-green-700' },
  GOODS_RECEIVED: { label: 'GR Done', color: 'bg-slate-100 text-slate-700' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-500' },
}

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  TAX_PAYMENT: <DollarSign className="h-4 w-4 text-green-600" />,
  SPPB: <CheckCircle className="h-4 w-4 text-blue-600" />,
  GR: <Package className="h-4 w-4 text-purple-600" />,
  NEW_BC20: <FileText className="h-4 w-4 text-gray-600" />,
  TAX_ALERT: <AlertCircle className="h-4 w-4 text-red-600" />,
}

export default function BC20DashboardPage() {
  const d = DASHBOARD_DATA

  const taxAlerts = d.recentBC20.filter(b => b.status === 'TAX_PAYMENT_PENDING')

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">BC 2.0 Import Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview BC 2.0, dual billing, tax assets & landed cost
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/purchasing/bc20/new">
              <Button size="sm">
                <FileText className="h-4 w-4 mr-2" />
                New BC 2.0
              </Button>
            </Link>
          </div>
        </div>

        {/* TAX PAYMENT ALERTS - RED BANNER */}
        {taxAlerts.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-bold text-red-800">
                ⚠️ {taxAlerts.length} Tax Payment(s) Pending — Goods Cannot Be Released!
              </h3>
            </div>
            <div className="space-y-2">
              {taxAlerts.map(bc => (
                <div key={bc.id} className="flex items-center justify-between bg-white border border-red-200 rounded p-3">
                  <div>
                    <span className="font-semibold text-red-800">{bc.bcNumber}</span>
                    <span className="text-sm text-red-600 ml-2">— {bc.supplier}</span>
                    <span className="text-xs text-red-500 ml-2">
                      Due: {bc.taxDueDate ? new Date(bc.taxDueDate).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-700">{formatMillions(bc.totalDuties)}</span>
                    <Link href={`/purchasing/bc20/${bc.id}`}>
                      <Button size="sm" variant="destructive">
                        Pay Now
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Active BC 2.0</p>
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{d.bc20Active.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatMillions(d.bc20Active.value)} total</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Tax Payment Due</p>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{d.taxPending.count}</p>
              <p className="text-xs text-red-500 mt-1 font-medium">{formatMillions(d.taxPending.amount)} outstanding</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Released This Month</p>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{d.customsReleasedThisMonth.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatMillions(d.customsReleasedThisMonth.value)} value</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Duties Paid YTD</p>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{formatMillions(d.totalDutiesPaidYTD)}</p>
              <p className="text-xs text-muted-foreground mt-1">Bea Masuk + PPN + PPh 22</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Recent BC 2.0 */}
          <div className="col-span-2 space-y-6">
            {/* Recent BC 2.0 Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent BC 2.0 Documents
                </CardTitle>
                <Link href="/purchasing/bc20">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {d.recentBC20.map(bc => {
                    const cfg = STATUS_CONFIG[bc.status] || { label: bc.status, color: 'bg-gray-100 text-gray-700' }
                    return (
                      <div key={bc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div>
                            <Link href={`/purchasing/bc20/${bc.id}`}>
                              <p className="font-semibold text-blue-600 hover:underline">{bc.bcNumber}</p>
                            </Link>
                            <p className="text-xs text-muted-foreground">{bc.supplier}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="font-medium">{formatMillions(bc.cifValue)}</p>
                            <p className="text-xs text-muted-foreground">
                              Duties: {formatMillions(bc.totalDuties)}
                            </p>
                          </div>
                          <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                          {bc.status === 'TAX_PAYMENT_PENDING' && bc.taxDueDate && (
                            <span className="text-xs text-red-600 font-medium">
                              Due {new Date(bc.taxDueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Dual Billing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Dual Billing Status
                </CardTitle>
                <CardDescription>Vendor payment vs tax payment outstanding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700 font-medium mb-1">Vendor Payments Outstanding</p>
                    <p className="text-2xl font-bold text-blue-800">{formatMillions(d.dualBilling.vendorOutstanding.amount)}</p>
                    <p className="text-xs text-blue-600">{d.dualBilling.vendorOutstanding.count} invoices</p>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground">Paid this month: {formatMillions(d.dualBilling.paidThisMonth.vendor)}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-700 font-medium mb-1">Tax Payments Outstanding</p>
                    <p className="text-2xl font-bold text-red-800">{formatMillions(d.dualBilling.taxOutstanding.amount)}</p>
                    <p className="text-xs text-red-600">{d.dualBilling.taxOutstanding.count} invoices — URGENT</p>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground">Paid this month: {formatMillions(d.dualBilling.paidThisMonth.tax)}</p>
                  </div>
                </div>

                {/* Cash Flow Forecast */}
                <div>
                  <p className="text-sm font-medium mb-3">Cash Outflow Forecast</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Next 30 Days', vendor: d.cashFlow.next30.vendor, tax: d.cashFlow.next30.tax },
                      { label: 'Next 60 Days', vendor: d.cashFlow.next60.vendor, tax: d.cashFlow.next60.tax },
                      { label: 'Next 90 Days', vendor: d.cashFlow.next90.vendor, tax: d.cashFlow.next90.tax },
                    ].map(row => {
                      const total = row.vendor + row.tax
                      const vendorPct = (row.vendor / total) * 100
                      return (
                        <div key={row.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-medium">{formatMillions(total)}</span>
                          </div>
                          <div className="flex h-4 rounded overflow-hidden">
                            <div className="bg-blue-400" style={{ width: `${vendorPct}%` }} title={`Vendor: ${formatMillions(row.vendor)}`} />
                            <div className="bg-red-400" style={{ width: `${100 - vendorPct}%` }} title={`Tax: ${formatMillions(row.tax)}`} />
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-sm inline-block" /> Vendor {formatMillions(row.vendor)}</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-sm inline-block" /> Tax {formatMillions(row.tax)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href="/finance/ap/dual-billing" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">View AP Dual Billing</Button>
                  </Link>
                  <Link href="/reports/dual-billing" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Reconciliation Report</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Landed Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Landed Cost Summary
                </CardTitle>
                <CardDescription>Average unit landed cost per material (IDR/kg)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {d.landedCosts.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded">
                      <p className="font-medium text-sm">{item.material}</p>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-bold">Rp {item.avgUnitCost.toLocaleString('id-ID')}/kg</p>
                          <p className="text-xs text-muted-foreground">Prev: Rp {item.lastMonth.toLocaleString('id-ID')}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.change > 0
                            ? <TrendingUp className="h-4 w-4" />
                            : <TrendingDown className="h-4 w-4" />
                          }
                          {Math.abs(item.change).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Link href="/reports/landed-cost-analysis">
                    <Button variant="outline" size="sm" className="w-full">View Landed Cost Analysis</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tax Asset Balance */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Tax Asset Balance
                </CardTitle>
                <CardDescription className="text-green-700">Prepaid tax credits available</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">PPN Import Credit</p>
                    <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{formatMillions(d.taxAssets.ppnAvailable)}</p>
                  <p className="text-xs text-muted-foreground">Used this month: {formatMillions(d.taxAssets.ppnUsedThisMonth)}</p>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">PPh 22 Prepaid</p>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Available</Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{formatMillions(d.taxAssets.pph22Available)}</p>
                  <p className="text-xs text-muted-foreground">Used this FY: {formatMillions(d.taxAssets.pph22UsedThisYear)}</p>
                </div>

                <Separator />

                <div className="p-3 bg-gray-50 rounded text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Tax Assets</p>
                  <p className="text-xl font-bold">
                    {formatMillions(d.taxAssets.ppnAvailable + d.taxAssets.pph22Available)}
                  </p>
                </div>

                <Link href="/finance/tax-assets">
                  <Button variant="outline" size="sm" className="w-full">View Tax Assets</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {d.activities.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {ACTIVITY_ICON[act.type] || <Clock className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{act.ref}</p>
                        <p className="text-xs text-muted-foreground">{act.desc}</p>
                        {act.amount && (
                          <p className="text-xs font-medium text-blue-600">{formatMillions(act.amount)}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(act.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/purchasing/bc20">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    BC 2.0 List
                  </Button>
                </Link>
                <Link href="/finance/ap/dual-billing">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
                    Dual Billing (AP)
                  </Button>
                </Link>
                <Link href="/finance/tax-assets/ppn">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    PPN Reconciliation
                  </Button>
                </Link>
                <Link href="/finance/tax-assets/pph22">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                    PPh 22 Tracking
                  </Button>
                </Link>
                <Link href="/reports/stock-movement">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2 text-orange-500" />
                    Stock Movement
                  </Button>
                </Link>
                <Link href="/logistics/peb">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Ship className="h-4 w-4 mr-2 text-teal-500" />
                    PEB Export
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
