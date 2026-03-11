'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DollarSign, Receipt, TrendingUp, AlertCircle, Calendar,
  CreditCard, Package, FileText, ArrowRight
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

// Mock data - akan di-replace dengan API call
const MOCK_DUAL_BILLING_SUMMARY = {
  // Vendor Bills (CIF Payments)
  vendorBills: {
    totalOutstanding: 1575000000, // Rp 1.575B
    count: 3,
    dueThisMonth: 787500000,
    overdue: 0,
    bills: [
      {
        id: '1',
        billNumber: 'VB-PIB-2026-001',
        bc20Number: 'PIB-2026-001',
        supplier: 'Shanghai Steel Co.',
        amount: 787500000,
        currency: 'IDR',
        dueDate: '2026-04-10',
        status: 'PENDING' as const,
        description: 'CIF payment for stainless steel import',
      },
      {
        id: '2',
        billNumber: 'VB-PIB-2026-002',
        bc20Number: 'PIB-2026-002',
        supplier: 'Tokyo Parts Ltd.',
        amount: 525000000,
        currency: 'IDR',
        dueDate: '2026-04-15',
        status: 'PENDING' as const,
        description: 'CIF payment for transmission parts',
      },
      {
        id: '3',
        billNumber: 'VB-PIB-2026-003',
        bc20Number: 'PIB-2026-003',
        supplier: 'Bangkok Rubber Co.',
        amount: 262500000,
        currency: 'IDR',
        dueDate: '2026-04-20',
        status: 'PENDING' as const,
        description: 'CIF payment for natural rubber',
      },
    ],
  },

  // Tax Bills (Import Duties)
  taxBills: {
    totalOutstanding: 365625000, // Rp 365.6M
    count: 3,
    dueThisWeek: 365625000, // All URGENT!
    overdue: 0,
    bills: [
      {
        id: '1',
        billNumber: 'TB-PIB-2026-001',
        bc20Number: 'PIB-2026-001',
        amount: 182812500,
        currency: 'IDR',
        dueDate: '2026-03-14', // 3 days from submission
        status: 'PENDING' as const,
        urgent: true,
        breakdown: {
          beaMasuk: 78750000,
          ppnImport: 86625000,
          pph22: 17437500,
        },
      },
      {
        id: '2',
        billNumber: 'TB-PIB-2026-002',
        bc20Number: 'PIB-2026-002',
        amount: 121875000,
        currency: 'IDR',
        dueDate: '2026-03-15',
        status: 'PENDING' as const,
        urgent: true,
        breakdown: {
          beaMasuk: 52500000,
          ppnImport: 57750000,
          pph22: 11625000,
        },
      },
      {
        id: '3',
        billNumber: 'TB-PIB-2026-003',
        bc20Number: 'PIB-2026-003',
        amount: 60937500,
        currency: 'IDR',
        dueDate: '2026-03-16',
        status: 'PENDING' as const,
        urgent: true,
        breakdown: {
          beaMasuk: 26250000,
          ppnImport: 28875000,
          pph22: 5812500,
        },
      },
    ],
  },

  // Cash flow forecast
  cashFlow: {
    next7Days: 365625000, // All tax payments
    next30Days: 1575000000 + 365625000, // Vendor + tax
    next60Days: 0,
    next90Days: 0,
  },
}

export default function DualBillingPage() {
  const summary = MOCK_DUAL_BILLING_SUMMARY

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dual Billing - BC 2.0 Imports</h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor payments (CIF) and tax payments (import duties) separately
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendor Bills Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.vendorBills.totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.vendorBills.count} bills • CIF payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tax Bills Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.taxBills.totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.taxBills.count} bills • Import duties
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Due This Week (URGENT)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.taxBills.dueThisWeek)}
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Tax payments - blocks GR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cash Outflow (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.cashFlow.next30Days)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vendor + Tax payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dual Billing Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vendor Bills */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    Vendor Bills
                  </CardTitle>
                  <CardDescription>CIF payments to suppliers</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {summary.vendorBills.count} bills
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {summary.vendorBills.bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono font-semibold">{bill.billNumber}</p>
                        <p className="text-sm text-muted-foreground">{bill.supplier}</p>
                      </div>
                      <Badge variant="outline">{bill.status}</Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(bill.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">
                          {new Date(bill.dueDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay
                      </Button>
                      <Link href={`/purchasing/bc20/${bill.bc20Number}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tax Bills */}
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Tax Bills
                  </CardTitle>
                  <CardDescription>Import duties to customs</CardDescription>
                </div>
                <Badge className="bg-orange-100 text-orange-700">
                  {summary.taxBills.count} bills
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {summary.taxBills.bills.map((bill) => (
                  <div
                    key={bill.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      bill.urgent ? 'border-orange-300 bg-orange-50' : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono font-semibold">{bill.billNumber}</p>
                        {bill.urgent && (
                          <Badge className="bg-orange-600 text-white text-xs mt-1">
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline">{bill.status}</Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bea Masuk</span>
                        <span className="font-medium">
                          {formatCurrency(bill.breakdown.beaMasuk)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PPN Import</span>
                        <span className="font-medium">
                          {formatCurrency(bill.breakdown.ppnImport)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PPh 22</span>
                        <span className="font-medium">
                          {formatCurrency(bill.breakdown.pph22)}
                        </span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-orange-600">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        size="sm"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay Tax
                      </Button>
                      <Link href={`/purchasing/bc20/${bill.bc20Number}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cash Flow Forecast
            </CardTitle>
            <CardDescription>
              Projected cash outflow for vendor and tax payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-900 font-medium mb-1">Next 7 Days</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.cashFlow.next7Days)}
                </p>
                <p className="text-xs text-orange-700 mt-1">Tax payments (URGENT)</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-1">Next 30 Days</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.cashFlow.next30Days)}
                </p>
                <p className="text-xs text-blue-700 mt-1">Vendor + Tax</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground font-medium mb-1">Next 60 Days</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.cashFlow.next60Days)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">No scheduled payments</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground font-medium mb-1">Next 90 Days</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.cashFlow.next90Days)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">No scheduled payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
