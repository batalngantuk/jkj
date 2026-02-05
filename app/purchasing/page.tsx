'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Search, Filter, Eye, Edit2, Plus, FileCheck, MoreVertical, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'

const PURCHASE_ORDERS = [
  {
    id: 'PO-2026-101',
    vendor: 'PT Latex Indonesia',
    material: 'Natural Latex',
    quantity: '10 ton',
    unitPrice: 95000000,
    total: 950000000,
    eta: '10 Feb 2026',
    grStatus: 'Not Received',
    bc23Status: 'Submitted',
    bc23Color: 'yellow',
  },
  {
    id: 'PO-2026-102',
    vendor: 'Chemical Suppliers Co',
    material: 'Sulfur',
    quantity: '500 kg',
    unitPrice: 25000,
    total: 12500000,
    eta: '12 Feb 2026',
    grStatus: 'Not Received',
    bc23Status: 'Draft',
    bc23Color: 'gray',
  },
  {
    id: 'PO-2026-103',
    vendor: 'PackMaster Ltd',
    material: 'Carton Boxes',
    quantity: '5,000 pcs',
    unitPrice: 8500,
    total: 42500000,
    eta: '08 Feb 2026',
    grStatus: 'Complete',
    bc23Status: 'Approved',
    bc23Color: 'green',
  },
  {
    id: 'PO-2026-104',
    vendor: 'PT Latex Indonesia',
    material: 'Accelerator Powder',
    quantity: '2 ton',
    unitPrice: 120000000,
    total: 240000000,
    eta: '18 Feb 2026',
    grStatus: 'Partial',
    bc23Status: 'Rejected',
    bc23Color: 'red',
  },
  {
    id: 'PO-2026-105',
    vendor: 'Asian Chemicals Ltd',
    material: 'Zinc Oxide',
    quantity: '3 ton',
    unitPrice: 85000000,
    total: 255000000,
    eta: '22 Feb 2026',
    grStatus: 'Partial',
    bc23Status: 'Submitted',
    bc23Color: 'yellow',
  },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export default function PurchasingPage() {
  const [activeTab, setActiveTab] = useState('po')
  const [statusFilter, setStatusFilter] = useState('all')

  const tabItems = [
    { id: 'pr', label: 'Purchase Requisition' },
    { id: 'po', label: 'Purchase Orders' },
    { id: 'bc23', label: 'BC 2.3 Tracking' },
  ]

  const statusCards = [
    { label: 'Total Active PO', value: '15', color: 'bg-blue-100', textColor: 'text-blue-700' },
    { label: 'Partially Received', value: '6', color: 'bg-orange-100', textColor: 'text-orange-700' },
    { label: 'Awaiting GR', value: '9', color: 'bg-purple-100', textColor: 'text-purple-700' },
    { label: 'Outstanding BC 2.3', value: '4', color: 'bg-red-100', textColor: 'text-red-700' },
    { label: 'Total PO Value', value: 'Rp 2.5B', color: 'bg-green-100', textColor: 'text-green-700' },
  ]

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-200 text-gray-800'
      case 'Submitted':
        return 'bg-yellow-200 text-yellow-800'
      case 'Approved':
        return 'bg-green-200 text-green-800'
      case 'Rejected':
        return 'bg-red-200 text-red-800'
      case 'Complete':
        return 'bg-green-100 text-green-800'
      case 'Partial':
        return 'bg-orange-100 text-orange-800'
      case 'Not Received':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Breadcrumb and Title */}
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-foreground">
                    Home
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <Link href="/purchasing" className="hover:text-foreground">
                    Purchasing
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">Orders</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Purchasing Management</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Purchase Request
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Purchase Order
                </Button>
                <Link href="/purchasing/bc23">
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <FileCheck className="h-4 w-4" />
                    BC 2.3 Form
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Summary Cards */}
            <div className="grid gap-4 lg:grid-cols-5">
              {statusCards.map((card, idx) => (
                <Card
                  key={idx}
                  className={`${card.color} border-0 p-6 shadow-sm transition-transform hover:shadow-md hover:scale-105`}
                >
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/60">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Filter Bar */}
            <Card className="border border-border p-4">
              <div className="flex items-center gap-4">
                {/* GR Status Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">GR Status:</label>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="not-received">Not Received</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* BC 2.3 Status Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">BC 2.3:</label>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search PO, Vendor, Material..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filter Button */}
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Main Table */}
            <Card className="border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border hover:bg-muted/30">
                      <TableHead className="font-semibold">PO Number</TableHead>
                      <TableHead className="font-semibold">Vendor Name</TableHead>
                      <TableHead className="font-semibold">Material Type</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold text-right">Unit Price</TableHead>
                      <TableHead className="font-semibold text-right">Total Amount</TableHead>
                      <TableHead className="font-semibold">ETA Date</TableHead>
                      <TableHead className="font-semibold">GR Status</TableHead>
                      <TableHead className="font-semibold text-center">BC 2.3 Status</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PURCHASE_ORDERS.map((po) => (
                      <TableRow key={po.id} className="border-border hover:bg-secondary/30 transition-colors">
                        <TableCell className="font-semibold text-primary">{po.id}</TableCell>
                        <TableCell className="text-foreground">{po.vendor}</TableCell>
                        <TableCell>{po.material}</TableCell>
                        <TableCell>{po.quantity}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatCurrency(po.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(po.total)}
                        </TableCell>
                        <TableCell className="text-sm">{po.eta}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getBadgeColor(po.grStatus)}>
                            {po.grStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getBadgeColor(po.bc23Status)}>
                            {po.bc23Status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Pagination and Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing 1-5 of {PURCHASE_ORDERS.length} entries
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
