'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, FileText, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { DataTable } from '@/components/shared/data-table'
import { MOCK_BC23, BC23Status, getBC23ByStatus } from '@/lib/mock-data/customs'

export default function BC23ManagementPage() {
  const pendingCount = getBC23ByStatus('SUBMITTED').length + getBC23ByStatus('UNDER REVIEW').length
  const approvedCount = getBC23ByStatus('APPROVED').length
  const totalValue = MOCK_BC23.reduce((sum, bc) => sum + bc.cifValue, 0)

  const getStatusBadge = (status: BC23Status) => {
    const variants: Record<BC23Status, { color: string; icon: React.ReactNode }> = {
      'DRAFT': { color: 'bg-slate-100 text-slate-700', icon: <FileText className="h-3 w-3" /> },
      'SUBMITTED': { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
      'UNDER REVIEW': { color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="h-3 w-3" /> },
      'QUERY': { color: 'bg-orange-100 text-orange-700', icon: <XCircle className="h-3 w-3" /> },
      'APPROVED': { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      'CLOSED': { color: 'bg-gray-100 text-gray-700', icon: <CheckCircle className="h-3 w-3" /> }
    }
    
    const variant = variants[status]
    return (
      <Badge className={`${variant.color} gap-1 font-medium`}>
        {variant.icon}
        {status}
      </Badge>
    )
  }

  const columns = [
    {
      header: "BC Number",
      accessorKey: "bcNumber" as keyof typeof MOCK_BC23[0],
      cell: (item: typeof MOCK_BC23[0]) => (
        <Link href={`/purchasing/bc23/${item.id}`} className="font-mono text-sm font-semibold text-primary hover:underline">
          {item.bcNumber}
        </Link>
      )
    },
    {
      header: "PO Number",
      accessorKey: "poNumber" as keyof typeof MOCK_BC23[0],
      cell: (item: typeof MOCK_BC23[0]) => (
        <span className="font-mono text-sm">{item.poNumber}</span>
      )
    },
    {
      header: "Supplier",
      accessorKey: "supplierName" as keyof typeof MOCK_BC23[0]
    },
    {
      header: "Goods Description",
      accessorKey: "goodsDescription" as keyof typeof MOCK_BC23[0],
      cell: (item: typeof MOCK_BC23[0]) => (
        <div>
          <p className="font-medium">{item.goodsDescription}</p>
          <p className="text-xs text-muted-foreground">HS: {item.hsCode}</p>
        </div>
      )
    },
    {
      header: "CIF Value",
      cell: (item: typeof MOCK_BC23[0]) => (
        <div className="text-right">
          <p className="font-semibold">{item.currency} {item.cifValue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Duties: Rp {item.totalDuties.toLocaleString()}</p>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status" as keyof typeof MOCK_BC23[0],
      cell: (item: typeof MOCK_BC23[0]) => getStatusBadge(item.status)
    },
    {
      header: "SPPB",
      cell: (item: typeof MOCK_BC23[0]) => (
        item.sppbNumber ? (
          <span className="font-mono text-xs text-green-600">{item.sppbNumber}</span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
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
              <h1 className="text-2xl font-bold text-foreground">BC 2.3 - Import Customs</h1>
              <p className="text-sm text-muted-foreground">Manage import declarations and customs clearance</p>
            </div>
          </div>
          <Link href="/purchasing/bc23/new">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              New BC 2.3
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Documents awaiting customs approval
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                SPPB issued, ready for GR
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

        {/* BC 2.3 List */}
        <Card>
          <CardHeader>
            <CardTitle>Import Declarations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search BC number, PO, supplier..." className="pl-8" />
              </div>
            </div>
            <DataTable 
              data={MOCK_BC23}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
