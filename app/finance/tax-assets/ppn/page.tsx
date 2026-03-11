'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, FileText,
  Package, Receipt, ArrowRight, CheckCircle, Clock
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

// Mock data - akan di-replace dengan API call
const MOCK_PPN_DATA = {
  // Current Period
  currentPeriod: '2026-03',

  // Monthly Reconciliation
  monthlyReconciliation: {
    ppnMasukan: {
      ppnImport: 172837500, // From BC 2.0
      ppnDomestic: 0, // From domestic purchases
      total: 172837500,
    },
    ppnKeluaran: {
      ppnExport: 0, // From exports (usually 0%)
      ppnDomestic: 0, // From domestic sales
      total: 0,
    },
    netPPN: -172837500, // Negative = creditable
    status: 'CREDITABLE' as const,
    amountPayable: 0,
    amountCarryForward: 172837500,
  },

  // PPN Masukan Details (Input Tax Credits)
  ppnMasukanDetails: [
    {
      id: '1',
      date: '2026-03-11',
      type: 'IMPORT',
      documentNumber: 'PIB-2026-001',
      bc20Number: 'PIB-2026-001',
      description: 'Import stainless steel coils',
      supplier: 'Shanghai Steel Co.',
      ppnAmount: 86625000,
      status: 'AVAILABLE' as const,
    },
    {
      id: '2',
      date: '2026-03-11',
      type: 'IMPORT',
      documentNumber: 'PIB-2026-002',
      bc20Number: 'PIB-2026-002',
      description: 'Import transmission parts',
      supplier: 'Tokyo Parts Ltd.',
      ppnAmount: 57750000,
      status: 'AVAILABLE' as const,
    },
    {
      id: '3',
      date: '2026-03-11',
      type: 'IMPORT',
      documentNumber: 'PIB-2026-003',
      bc20Number: 'PIB-2026-003',
      description: 'Import natural rubber',
      supplier: 'Bangkok Rubber Co.',
      ppnAmount: 28462500,
      status: 'AVAILABLE' as const,
    },
  ],

  // PPN Keluaran Details (Output Tax)
  ppnKeluaranDetails: [
    // No sales yet
  ],

  // Historical Periods
  historicalPeriods: [
    {
      period: '2026-02',
      ppnMasukan: 0,
      ppnKeluaran: 0,
      netPPN: 0,
      status: 'BALANCED' as const,
      carryForward: 0,
    },
    {
      period: '2026-01',
      ppnMasukan: 0,
      ppnKeluaran: 0,
      netPPN: 0,
      status: 'BALANCED' as const,
      carryForward: 0,
    },
  ],

  // Carry Forward from Previous Periods
  carryForwardFromPrevious: 0,
}

export default function PPNTrackingPage() {
  const data = MOCK_PPN_DATA
  const [selectedPeriod, setSelectedPeriod] = useState(data.currentPeriod)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-')
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAYABLE':
        return 'bg-orange-100 text-orange-700'
      case 'CREDITABLE':
        return 'bg-green-100 text-green-700'
      case 'BALANCED':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">PPN Tracking & Reconciliation</h1>
            <p className="text-muted-foreground mt-1">
              Monthly PPN Input (Masukan) vs PPN Output (Keluaran) - SPT Masa PPN
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/finance/tax-assets">
              <Button variant="outline">
                <ArrowRight className="h-4 w-4 mr-2" />
                Tax Assets Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Current Period Summary */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {formatPeriod(data.currentPeriod)}
                </CardTitle>
                <CardDescription>
                  SPT Masa PPN - Monthly Reconciliation
                </CardDescription>
              </div>
              <Badge className={`text-lg px-4 py-2 ${getStatusColor(data.monthlyReconciliation.status)}`}>
                {data.monthlyReconciliation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* PPN Masukan (Input/Credit) */}
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">PPN Masukan (Credit)</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PPN Import</span>
                    <span className="font-semibold">
                      {formatCurrency(data.monthlyReconciliation.ppnMasukan.ppnImport)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PPN Domestic</span>
                    <span className="font-semibold">
                      {formatCurrency(data.monthlyReconciliation.ppnMasukan.ppnDomestic)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(data.monthlyReconciliation.ppnMasukan.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PPN Keluaran (Output/Charge) */}
              <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">PPN Keluaran (Charge)</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PPN Export (0%)</span>
                    <span className="font-semibold">
                      {formatCurrency(data.monthlyReconciliation.ppnKeluaran.ppnExport)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PPN Domestic</span>
                    <span className="font-semibold">
                      {formatCurrency(data.monthlyReconciliation.ppnKeluaran.ppnDomestic)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(data.monthlyReconciliation.ppnKeluaran.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Position */}
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Net Position</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Net PPN</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(Math.abs(data.monthlyReconciliation.netPPN))}
                    </p>
                  </div>
                  {data.monthlyReconciliation.status === 'CREDITABLE' && (
                    <div className="p-3 bg-green-100 border border-green-200 rounded">
                      <p className="text-xs font-medium text-green-900 mb-1">
                        ✓ Carry Forward to Next Month
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(data.monthlyReconciliation.amountCarryForward)}
                      </p>
                    </div>
                  )}
                  {data.monthlyReconciliation.status === 'PAYABLE' && (
                    <div className="p-3 bg-orange-100 border border-orange-200 rounded">
                      <p className="text-xs font-medium text-orange-900 mb-1">
                        ⚠ Amount Payable to Tax Office
                      </p>
                      <p className="text-lg font-bold text-orange-700">
                        {formatCurrency(data.monthlyReconciliation.amountPayable)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Transactions */}
        <Tabs defaultValue="masukan" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="masukan">
              PPN Masukan ({data.ppnMasukanDetails.length})
            </TabsTrigger>
            <TabsTrigger value="keluaran">
              PPN Keluaran ({data.ppnKeluaranDetails.length})
            </TabsTrigger>
          </TabsList>

          {/* PPN Masukan Tab */}
          <TabsContent value="masukan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  PPN Masukan - Input Tax Credits
                </CardTitle>
                <CardDescription>
                  Tax credits from imports and domestic purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.ppnMasukanDetails.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No PPN Masukan transactions for this period
                    </div>
                  ) : (
                    data.ppnMasukanDetails.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-green-100 rounded-lg hover:bg-green-50/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-green-50">
                                {item.type}
                              </Badge>
                              <span className="font-mono text-sm font-semibold">
                                {item.documentNumber}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supplier: {item.supplier}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(item.ppnAmount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        {item.bc20Number && (
                          <div className="mt-2 pt-2 border-t">
                            <Link href={`/purchasing/bc20/${item.bc20Number}`}>
                              <Button variant="ghost" size="sm" className="h-7">
                                <FileText className="h-3 w-3 mr-1" />
                                View BC 2.0: {item.bc20Number}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PPN Keluaran Tab */}
          <TabsContent value="keluaran" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-600" />
                  PPN Keluaran - Output Tax
                </CardTitle>
                <CardDescription>
                  Tax charged on sales (exports and domestic)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.ppnKeluaranDetails.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-2">No sales transactions yet for this period</p>
                      <p className="text-sm">
                        PPN Keluaran will appear when sales invoices are created
                      </p>
                    </div>
                  ) : (
                    data.ppnKeluaranDetails.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 border border-orange-100 rounded-lg hover:bg-orange-50/50 transition-colors"
                      >
                        {/* Sales transaction details */}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Historical Periods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historical Periods
            </CardTitle>
            <CardDescription>
              Previous months' PPN reconciliation summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.historicalPeriods.map((period) => (
                <div
                  key={period.period}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{formatPeriod(period.period)}</p>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Masukan: {formatCurrency(period.ppnMasukan)}</span>
                        <span>Keluaran: {formatCurrency(period.ppnKeluaran)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(period.status)}>
                        {period.status}
                      </Badge>
                      {period.carryForward > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Carry Forward: {formatCurrency(period.carryForward)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Information Box */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900">Understanding PPN Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>
              <strong>PPN Masukan (Input Tax):</strong> Tax credits from purchases (imports & domestic).
              Can be used to offset PPN Keluaran.
            </p>
            <p>
              <strong>PPN Keluaran (Output Tax):</strong> Tax charged on sales (11% for domestic, 0% for exports).
            </p>
            <p>
              <strong>Net Position:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>PAYABLE:</strong> PPN Keluaran {'>'} PPN Masukan → Must pay to tax office</li>
              <li><strong>CREDITABLE:</strong> PPN Keluaran {'<'} PPN Masukan → Carry forward to next month</li>
              <li><strong>BALANCED:</strong> PPN Keluaran = PPN Masukan → No payment, no credit</li>
            </ul>
            <p>
              <strong>Filing:</strong> SPT Masa PPN must be filed monthly by the end of the following month.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
