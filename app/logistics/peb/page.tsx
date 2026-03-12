'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package, Plus, Search, Filter, FileText, Ship,
  Calendar, DollarSign, MapPin, CheckCircle, Clock
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

// Mock data - akan di-replace dengan API call
const MOCK_PEB_DATA = [
  {
    id: '1',
    pebNumber: 'PEB-2026-001',
    npeNumber: 'NPE-123456',
    documentDate: '2026-03-10',
    status: 'APPROVED',
    customer: {
      customerName: 'ABC Trading USA',
      country: 'United States',
    },
    destinationCountry: 'United States',
    destinationPort: 'Port of Los Angeles',
    exportDate: '2026-03-15',
    fobValue: 125000,
    fobIdr: 1937500000,
    currency: 'USD',
    vatRate: 0,
    vatAmount: 0,
    itemCount: 3,
  },
  {
    id: '2',
    pebNumber: 'PEB-2026-002',
    npeNumber: 'NPE-123456',
    documentDate: '2026-03-11',
    status: 'SUBMITTED',
    customer: {
      customerName: 'XYZ Corp Japan',
      country: 'Japan',
    },
    destinationCountry: 'Japan',
    destinationPort: 'Port of Tokyo',
    exportDate: '2026-03-18',
    fobValue: 85000,
    fobIdr: 1317500000,
    currency: 'USD',
    vatRate: 0,
    vatAmount: 0,
    itemCount: 2,
  },
  {
    id: '3',
    pebNumber: 'PEB-2026-003',
    npeNumber: 'NPE-123456',
    documentDate: '2026-03-12',
    status: 'DRAFT',
    customer: {
      customerName: 'EuroTech GmbH',
      country: 'Germany',
    },
    destinationCountry: 'Germany',
    destinationPort: 'Port of Hamburg',
    exportDate: '2026-03-20',
    fobValue: 95000,
    fobIdr: 1472500000,
    currency: 'USD',
    vatRate: 0,
    vatAmount: 0,
    itemCount: 4,
  },
]

export default function PEBListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700'
      case 'VERIFIED':
        return 'bg-blue-100 text-blue-700'
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-700'
      case 'UNDER_REVIEW':
        return 'bg-orange-100 text-orange-700'
      case 'APPROVED':
        return 'bg-green-100 text-green-700'
      case 'EXPORTED':
        return 'bg-purple-100 text-purple-700'
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredData = MOCK_PEB_DATA.filter(peb => {
    const matchesSearch = peb.pebNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         peb.customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || peb.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: MOCK_PEB_DATA.length,
    draft: MOCK_PEB_DATA.filter(p => p.status === 'DRAFT').length,
    submitted: MOCK_PEB_DATA.filter(p => p.status === 'SUBMITTED').length,
    approved: MOCK_PEB_DATA.filter(p => p.status === 'APPROVED').length,
    exported: MOCK_PEB_DATA.filter(p => p.status === 'EXPORTED').length,
    totalValueUSD: MOCK_PEB_DATA.reduce((sum, p) => sum + p.fobValue, 0),
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">PEB Export Documents</h1>
            <p className="text-muted-foreground mt-1">
              Regular export declarations - Zero-rated VAT (0% PPN for exports)
            </p>
          </div>
          <Link href="/logistics/peb/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create PEB
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total PEB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All documents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending submission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
              <p className="text-xs text-muted-foreground mt-1">Under review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to ship</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total FOB Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalValueUSD, 'USD')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All exports</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Export Documents</CardTitle>
                <CardDescription>
                  Manage PEB (Pemberitahuan Ekspor Barang) - Regular Export
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by PEB number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ALL')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('DRAFT')}
                  size="sm"
                >
                  Draft
                </Button>
                <Button
                  variant={statusFilter === 'SUBMITTED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('SUBMITTED')}
                  size="sm"
                >
                  Submitted
                </Button>
                <Button
                  variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('APPROVED')}
                  size="sm"
                >
                  Approved
                </Button>
              </div>
            </div>

            {/* PEB List */}
            <div className="space-y-3">
              {filteredData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No PEB documents found</p>
                  <p className="text-sm mt-1">Create your first export document to get started</p>
                  <Link href="/logistics/peb/new">
                    <Button className="mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create PEB
                    </Button>
                  </Link>
                </div>
              ) : (
                filteredData.map((peb) => (
                  <Card key={peb.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link href={`/logistics/peb/${peb.id}`}>
                              <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                                {peb.pebNumber}
                              </h3>
                            </Link>
                            <Badge className={getStatusColor(peb.status)}>
                              {peb.status}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              PPN 0% (Export)
                            </Badge>
                          </div>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                Customer
                              </p>
                              <p className="font-medium">{peb.customer.customerName}</p>
                              <p className="text-xs text-muted-foreground">{peb.customer.country}</p>
                            </div>

                            <div>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Destination
                              </p>
                              <p className="font-medium">{peb.destinationPort}</p>
                              <p className="text-xs text-muted-foreground">{peb.destinationCountry}</p>
                            </div>

                            <div>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Export Date
                              </p>
                              <p className="font-medium">
                                {new Date(peb.exportDate).toLocaleDateString('id-ID')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {peb.itemCount} item{peb.itemCount > 1 ? 's' : ''}
                              </p>
                            </div>

                            <div>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                FOB Value
                              </p>
                              <p className="font-medium text-blue-600">
                                {formatCurrency(peb.fobValue, peb.currency)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(peb.fobIdr, 'IDR')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <Link href={`/logistics/peb/${peb.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              About PEB Export (BC 2.0 Regular Export)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>
              <strong>PEB (Pemberitahuan Ekspor Barang):</strong> Regular export declaration for BC 2.0 system.
            </p>
            <p>
              <strong>Zero-Rated VAT:</strong> Exports are subject to 0% PPN (VAT). No output tax charged.
            </p>
            <p>
              <strong>No Mandatory BC 2.0 Linkage:</strong> Unlike BC 2.3 bonded imports, BC 2.0 regular imports
              can be sold domestically OR exported freely. PEB linkage to BC 2.0 is optional for internal tracking only.
            </p>
            <p>
              <strong>Export Incentives:</strong> May be eligible for export incentives like KITE or Drawback programs.
            </p>
            <p>
              <strong>FOB Value:</strong> Free on Board - seller's responsibility ends when goods are loaded on vessel.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
