'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign, TrendingUp, Calendar, FileText,
  CheckCircle, Clock, ArrowRight, Package
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

// Mock data - akan di-replace dengan API call
const MOCK_TAX_ASSET_SUMMARY = {
  // PPN Import (Tax Input Credit)
  ppnImport: {
    totalAssets: 172837500, // Rp 172.8M
    used: 0,
    remaining: 172837500,
    utilizationRate: 0,
    count: 3,
    assets: [
      {
        id: '1',
        bc20Number: 'PIB-2026-001',
        amount: 86625000,
        amountUsed: 0,
        amountRemaining: 86625000,
        period: '2026-03',
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '2',
        bc20Number: 'PIB-2026-002',
        amount: 57750000,
        amountUsed: 0,
        amountRemaining: 57750000,
        period: '2026-03',
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '3',
        bc20Number: 'PIB-2026-003',
        amount: 28462500,
        amountUsed: 0,
        amountRemaining: 28462500,
        period: '2026-03',
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
    ],
  },

  // PPh 22 Import (Prepaid Income Tax)
  pph22Import: {
    totalAssets: 34875000, // Rp 34.9M
    used: 0,
    remaining: 34875000,
    utilizationRate: 0,
    count: 3,
    fiscalYear: 2026,
    assets: [
      {
        id: '1',
        bc20Number: 'PIB-2026-001',
        amount: 17437500,
        amountUsed: 0,
        amountRemaining: 17437500,
        fiscalYear: 2026,
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '2',
        bc20Number: 'PIB-2026-002',
        amount: 11625000,
        amountUsed: 0,
        amountRemaining: 11625000,
        fiscalYear: 2026,
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '3',
        bc20Number: 'PIB-2026-003',
        amount: 5812500,
        amountUsed: 0,
        amountRemaining: 5812500,
        fiscalYear: 2026,
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
    ],
  },

  // Monthly PPN Reconciliation (March 2026)
  ppnReconciliation: {
    period: '2026-03',
    ppnMasukan: {
      ppnImport: 172837500,
      ppnDomestic: 0,
      total: 172837500,
    },
    ppnKeluaran: {
      total: 0, // No sales yet
    },
    netPPN: -172837500, // Creditable
    status: 'CREDITABLE' as const,
    amountCarryForward: 172837500,
  },
}

export default function TaxAssetsPage() {
  const summary = MOCK_TAX_ASSET_SUMMARY

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
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tax Assets Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track PPN Import and PPh 22 prepaid tax assets from BC 2.0 imports
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PPN Import Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.ppnImport.remaining)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.ppnImport.count} assets • Tax input credit
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PPh 22 Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.pph22Import.remaining)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.pph22Import.count} assets • FY {summary.pph22Import.fiscalYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tax Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  summary.ppnImport.remaining + summary.pph22Import.remaining
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for offsetting
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                PPN Status (March)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                CREDITABLE
              </div>
              <p className="text-xs text-green-700 mt-1">
                Carry forward available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* PPN Import Assets */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  PPN Import Credits
                </CardTitle>
                <CardDescription>
                  Tax input credit (11%) from BC 2.0 imports
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-700">
                {summary.ppnImport.count} assets
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {summary.ppnImport.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 border border-green-100 rounded-lg hover:bg-green-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-semibold">
                        BC 2.0: {asset.bc20Number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Period: {asset.period}
                      </p>
                    </div>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Asset</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(asset.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Used</p>
                      <p className="font-semibold">
                        {formatCurrency(asset.amountUsed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(asset.amountRemaining)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Utilization</span>
                      <span>
                        {asset.amount > 0
                          ? ((asset.amountUsed / asset.amount) * 100).toFixed(1)
                          : 0}
                        %
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PPh 22 Import Assets */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  PPh 22 Import Prepaid
                </CardTitle>
                <CardDescription>
                  Prepaid income tax (2.5%) from BC 2.0 imports
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                FY {summary.pph22Import.fiscalYear}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {summary.pph22Import.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-semibold">
                        BC 2.0: {asset.bc20Number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        FY {asset.fiscalYear}
                      </p>
                    </div>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Asset</p>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(asset.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credited</p>
                      <p className="font-semibold">
                        {formatCurrency(asset.amountUsed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(asset.amountRemaining)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Utilization</span>
                      <span>
                        {asset.amount > 0
                          ? ((asset.amountUsed / asset.amount) * 100).toFixed(1)
                          : 0}
                        %
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PPN Monthly Reconciliation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              PPN Monthly Reconciliation - {summary.ppnReconciliation.period}
            </CardTitle>
            <CardDescription>
              PPN Input (Masukan) vs PPN Output (Keluaran)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-2">
                  PPN Input (Credit)
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PPN Import</span>
                    <span className="font-semibold">
                      {formatCurrency(summary.ppnReconciliation.ppnMasukan.ppnImport)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PPN Domestic</span>
                    <span className="font-semibold">
                      {formatCurrency(summary.ppnReconciliation.ppnMasukan.ppnDomestic)}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-green-600">
                      {formatCurrency(summary.ppnReconciliation.ppnMasukan.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-900 mb-2">
                  PPN Output (Charge)
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From Sales</span>
                    <span className="font-semibold">
                      {formatCurrency(summary.ppnReconciliation.ppnKeluaran.total)}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-orange-600">
                      {formatCurrency(summary.ppnReconciliation.ppnKeluaran.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Net Position
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className="bg-green-100 text-green-700 mt-1">
                      {summary.ppnReconciliation.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carry Forward</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(summary.ppnReconciliation.amountCarryForward)}
                    </p>
                  </div>
                  <p className="text-xs text-blue-700">
                    ✓ Available for offsetting next month's PPN Output
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
