'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, FileText, CheckCircle, Clock, AlertCircle, XCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { DataTable } from '@/components/shared/data-table'

// BC 2.0 Status Types
type BC20Status = 'DRAFT' | 'SUBMITTED' | 'CUSTOMS_PROCESSING' | 'TAX_PAYMENT_PENDING' | 'TAX_PAID' | 'CUSTOMS_RELEASED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED'
type TaxPaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'

// Mock data for BC 2.0 (will be replaced with API calls)
const MOCK_BC20 = [
  {
    id: '1',
    documentNumber: 'PIB-001234-2026',
    poNumber: 'PO-2026-001',
    supplierName: 'Global Metals Ltd',
    goodsDescription: 'Stainless Steel Coils',
    hsCode: '72193200',
    cifValue: 50000,
    currency: 'USD',
    totalTax: 125000000,
    status: 'TAX_PAID' as BC20Status,
    taxPaymentStatus: 'PAID' as TaxPaymentStatus,
  },
  {
    id: '2',
    documentNumber: 'PIB-001235-2026',
    poNumber: 'PO-2026-002',
    supplierName: 'Polymer Solutions Inc',
    goodsDescription: 'PVC Resin',
    hsCode: '39042200',
    cifValue: 35000,
    currency: 'USD',
    totalTax: 87500000,
    status: 'TAX_PAYMENT_PENDING' as BC20Status,
    taxPaymentStatus: 'PENDING' as TaxPaymentStatus,
  },
]

export default function BC20ManagementPage() {
  const taxPendingCount = MOCK_BC20.filter(bc => bc.taxPaymentStatus === 'PENDING' || bc.taxPaymentStatus === 'PARTIAL').length
  const taxPaidCount = MOCK_BC20.filter(bc => bc.taxPaymentStatus === 'PAID').length
  const totalValue = MOCK_BC20.reduce((sum, bc) => sum + bc.cifValue, 0)

  const getStatusBadge = (status: BC20Status) => {
    const variants: Record<BC20Status, { color: string; icon: React.ReactNode }> = {
      'DRAFT': { color: 'bg-slate-100 text-slate-700', icon: <FileText className="h-3 w-3" /> },
      'SUBMITTED': { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
      'CUSTOMS_PROCESSING': { color: 'bg-purple-100 text-purple-700', icon: <AlertCircle className="h-3 w-3" /> },
      'TAX_PAYMENT_PENDING': { color: 'bg-orange-100 text-orange-700', icon: <DollarSign className="h-3 w-3" /> },
      'TAX_PAID': { color: 'bg-cyan-100 text-cyan-700', icon: <CheckCircle className="h-3 w-3" /> },
      'CUSTOMS_RELEASED': { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      'RECEIVED': { color: 'bg-teal-100 text-teal-700', icon: <CheckCircle className="h-3 w-3" /> },
      'COMPLETED': { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="h-3 w-3" /> },
      'CANCELLED': { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> }
    }

    const variant = variants[status]
    return (
      <Badge className={`${variant.color} gap-1 font-medium`}>
        {variant.icon}
        {status.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const getTaxStatusBadge = (status: TaxPaymentStatus) => {
    const variants: Record<TaxPaymentStatus, { color: string }> = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-700' },
      'PARTIAL': { color: 'bg-orange-100 text-orange-700' },
      'PAID': { color: 'bg-green-100 text-green-700' },
      'OVERDUE': { color: 'bg-red-100 text-red-700' }
    }

    return (
      <Badge className={`${variants[status].color} text-xs`}>
        Tax: {status}
      </Badge>
    )
  }

  const columns = [
    {
      header: "PIB Number",
      accessorKey: "documentNumber" as keyof typeof MOCK_BC20[0],
      cell: (item: typeof MOCK_BC20[0]) => (
        <Link href={`/purchasing/bc20/${item.id}`} className="font-mono text-sm font-semibold text-primary hover:underline">
          {item.documentNumber}
        </Link>
      )
    },
    {
      header: "PO Number",
      accessorKey: "poNumber" as keyof typeof MOCK_BC20[0],
      cell: (item: typeof MOCK_BC20[0]) => (
        <span className="font-mono text-sm">{item.poNumber}</span>
      )
    },
    {
      header: "Supplier",
      accessorKey: "supplierName" as keyof typeof MOCK_BC20[0]
    },
    {
      header: "Goods Description",
      accessorKey: "goodsDescription" as keyof typeof MOCK_BC20[0],
      cell: (item: typeof MOCK_BC20[0]) => (
        <div>
          <p className="font-medium">{item.goodsDescription}</p>
          <p className="text-xs text-muted-foreground">HS: {item.hsCode}</p>
        </div>
      )
    },
    {
      header: "CIF Value",
      cell: (item: typeof MOCK_BC20[0]) => (
        <div className="text-right">
          <p className="font-semibold">{item.currency} {item.cifValue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Tax: Rp {item.totalTax.toLocaleString()}</p>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status" as keyof typeof MOCK_BC20[0],
      cell: (item: typeof MOCK_BC20[0]) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(item.status)}
          {getTaxStatusBadge(item.taxPaymentStatus)}
        </div>
      )
    }
  ]

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchasing">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">BC 2.0 - Regular Import</h1>
              <p className="text-sm text-muted-foreground">Manage regular import declarations with dual billing and upfront tax payment</p>
            </div>
          </div>
          <Link href="/purchasing/bc20/new">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              New BC 2.0
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Payment Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{taxPendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting tax payment to customs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{taxPaidCount}</div>
              <p className="text-xs text-muted-foreground">
                Ready for customs clearance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Import Value</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">USD {totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Current month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* BC 2.0 List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Regular Import Declarations (PIB)</CardTitle>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold">Dual Billing:</span> Vendor Payment + Tax Payment
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search PIB number, PO, supplier..." className="pl-8" />
              </div>
            </div>
            <DataTable
              data={MOCK_BC20}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
