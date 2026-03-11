'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign, TrendingUp, Calendar, FileText,
  Package, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

// Mock data - akan di-replace dengan API call
const MOCK_PPH22_DATA = {
  // Current Fiscal Year
  currentFiscalYear: 2026,

  // Annual Summary
  annualSummary: {
    totalPph22Prepaid: 34875000, // Rp 34.9M
    creditedAgainstIncomeTax: 0,
    remainingCredit: 34875000,
    utilizationRate: 0,
    assetCount: 3,
  },

  // PPh 22 Import Assets
  pph22Assets: [
    {
      id: '1',
      bc20Number: 'PIB-2026-001',
      bc20Id: '1',
      recordedDate: '2026-03-11',
      amount: 17437500,
      amountUsed: 0,
      amountRemaining: 17437500,
      status: 'AVAILABLE' as const,
      nilaiImport: 697500000, // Nilai Impor (CIF + Bea Masuk)
      rate: 2.5, // 2.5% for API holder
      supplier: 'Shanghai Steel Co.',
      description: 'Import stainless steel coils',
    },
    {
      id: '2',
      bc20Number: 'PIB-2026-002',
      bc20Id: '2',
      recordedDate: '2026-03-11',
      amount: 11625000,
      amountUsed: 0,
      amountRemaining: 11625000,
      status: 'AVAILABLE' as const,
      nilaiImport: 465000000,
      rate: 2.5,
      supplier: 'Tokyo Parts Ltd.',
      description: 'Import transmission parts',
    },
    {
      id: '3',
      bc20Number: 'PIB-2026-003',
      bc20Id: '3',
      recordedDate: '2026-03-11',
      amount: 5812500,
      amountUsed: 0,
      amountRemaining: 5812500,
      status: 'AVAILABLE' as const,
      nilaiImport: 232500000,
      rate: 2.5,
      supplier: 'Bangkok Rubber Co.',
      description: 'Import natural rubber',
    },
  ],

  // Utilization History (when credited against income tax)
  utilizationHistory: [
    // Will be populated when annual tax filing happens
  ],

  // Historical Years
  historicalYears: [
    {
      fiscalYear: 2025,
      totalPrepaid: 0,
      creditedAmount: 0,
      remainingCredit: 0,
      status: 'CLOSED' as const,
    },
  ],

  // Corporate Income Tax Info (for context)
  corporateTaxInfo: {
    estimatedAnnualIncome: 0, // Not yet calculated
    estimatedTaxLiability: 0, // 22% of taxable income
    pph22CreditAvailable: 34875000,
    netTaxPayable: 0, // Will be calculated at year-end
  },
}

export default function PPh22TrackingPage() {
  const data = MOCK_PPH22_DATA
  const [selectedYear, setSelectedYear] = useState(data.currentFiscalYear)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700'
      case 'PARTIALLY_USED':
        return 'bg-blue-100 text-blue-700'
      case 'FULLY_USED':
        return 'bg-gray-100 text-gray-700'
      case 'EXPIRED':
        return 'bg-red-100 text-red-700'
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
            <h1 className="text-3xl font-bold">PPh 22 Import Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Prepaid income tax from BC 2.0 imports - Annual fiscal year tracking
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

        {/* Fiscal Year Summary */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Fiscal Year {data.currentFiscalYear}
                </CardTitle>
                <CardDescription>
                  PPh 22 Import prepaid tax credits for annual SPT Tahunan
                </CardDescription>
              </div>
              <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-700">
                {data.annualSummary.assetCount} Assets
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Total Prepaid
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.annualSummary.totalPph22Prepaid)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  From {data.annualSummary.assetCount} imports
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900 font-medium mb-2">
                  Credited
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(data.annualSummary.creditedAgainstIncomeTax)}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Against income tax
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900 font-medium mb-2">
                  Remaining Credit
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.annualSummary.remainingCredit)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Available for offsetting
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  Utilization Rate
                </p>
                <p className="text-2xl font-bold">
                  {data.annualSummary.utilizationRate.toFixed(1)}%
                </p>
                <Progress
                  value={data.annualSummary.utilizationRate}
                  className="h-2 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PPh 22 Assets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              PPh 22 Import Assets - FY {data.currentFiscalYear}
            </CardTitle>
            <CardDescription>
              Prepaid income tax from BC 2.0 imports (2.5% for API holder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.pph22Assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono font-semibold">
                          BC 2.0: {asset.bc20Number}
                        </p>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {asset.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supplier: {asset.supplier}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Recorded</p>
                      <p className="text-sm font-medium">
                        {new Date(asset.recordedDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nilai Impor</p>
                      <p className="font-semibold">
                        {formatCurrency(asset.nilaiImport)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CIF + Bea Masuk
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate</p>
                      <p className="font-semibold text-blue-600">
                        {asset.rate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        API holder
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">PPh 22 Prepaid</p>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(asset.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total asset
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(asset.amountRemaining)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Available credit
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Utilization</span>
                      <span>
                        {asset.amount > 0
                          ? ((asset.amountUsed / asset.amount) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <Progress
                      value={
                        asset.amount > 0
                          ? (asset.amountUsed / asset.amount) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <Link href={`/purchasing/bc20/${asset.bc20Number}`}>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-3 w-3 mr-1" />
                        View BC 2.0 Document
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Corporate Income Tax Context */}
        <Card className="border-purple-200">
          <CardHeader className="bg-purple-50/50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Corporate Income Tax Context - FY {data.currentFiscalYear}
            </CardTitle>
            <CardDescription>
              How PPh 22 prepaid credits will offset annual corporate income tax
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900 font-medium mb-2">
                  Estimated Tax Liability
                </p>
                <p className="text-2xl font-bold text-yellow-700">
                  {data.corporateTaxInfo.estimatedTaxLiability > 0
                    ? formatCurrency(data.corporateTaxInfo.estimatedTaxLiability)
                    : 'TBD'}
                </p>
                <p className="text-xs text-yellow-800 mt-1">
                  22% of taxable income
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  PPh 22 Credit Available
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.corporateTaxInfo.pph22CreditAvailable)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Can offset tax liability
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900 font-medium mb-2">
                  Net Tax Payable
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {data.corporateTaxInfo.netTaxPayable > 0
                    ? formatCurrency(data.corporateTaxInfo.netTaxPayable)
                    : 'TBD'}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  After PPh 22 credit
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">How PPh 22 Credits Work:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>
                      PPh 22 Import is prepaid income tax (2.5% for API, 7.5% non-API, 10% no NPWP)
                    </li>
                    <li>
                      Credits can be used to offset annual corporate income tax (PPh Badan 22%)
                    </li>
                    <li>
                      Tracked in SPT Tahunan PPh Badan (annual corporate tax return)
                    </li>
                    <li>
                      If credits exceed tax liability, the excess can be refunded or carried forward
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilization History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Utilization History
            </CardTitle>
            <CardDescription>
              When PPh 22 credits were applied against income tax
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.utilizationHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No utilization recorded yet for FY {data.currentFiscalYear}</p>
                <p className="text-sm">
                  PPh 22 credits will be applied during annual tax filing (SPT Tahunan)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.utilizationHistory.map((record: any) => (
                  <div
                    key={record.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {/* Utilization record details */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historical Years */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historical Fiscal Years
            </CardTitle>
            <CardDescription>
              Previous years' PPh 22 summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.historicalYears.map((year) => (
                <div
                  key={year.fiscalYear}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">FY {year.fiscalYear}</p>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Prepaid: {formatCurrency(year.totalPrepaid)}</span>
                        <span>Credited: {formatCurrency(year.creditedAmount)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{year.status}</Badge>
                      {year.remainingCredit > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Unused: {formatCurrency(year.remainingCredit)}
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
            <CardTitle className="text-blue-900">Understanding PPh 22 Import</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>
              <strong>What is PPh 22 Import?</strong> Prepaid income tax withheld by customs on imported goods.
              This is NOT an expense - it's a tax asset that reduces your annual corporate tax.
            </p>
            <p>
              <strong>Tax Rates:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>2.5%:</strong> For companies with API (Angka Pengenal Importir) license</li>
              <li><strong>7.5%:</strong> For companies without API license</li>
              <li><strong>10%:</strong> For companies without NPWP (tax ID)</li>
            </ul>
            <p>
              <strong>Calculation Base:</strong> Nilai Impor (CIF + Bea Masuk)
            </p>
            <p>
              <strong>How to Use:</strong> Credits are applied in SPT Tahunan (annual corporate tax return)
              to reduce PPh Badan (corporate income tax, currently 22% rate).
            </p>
            <p>
              <strong>Refund:</strong> If PPh 22 credits exceed annual tax liability, you can request
              a refund or carry forward the excess.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
