'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus, Eye, MoreHorizontal, FileText } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'
import { MOCK_SALES_ORDERS, SalesOrder } from "@/lib/mock-data/sales"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"

export default function SalesOrderManagement() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = MOCK_SALES_ORDERS.filter((order) => {
    const statusMatch = statusFilter === 'All' || order.status === statusFilter
    const searchMatch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return statusMatch && searchMatch
  })

  const statusCounts = {
    DRAFT: MOCK_SALES_ORDERS.filter((o) => o.status === 'DRAFT').length,
    'PENDING APPROVAL': MOCK_SALES_ORDERS.filter((o) => o.status === 'PENDING APPROVAL').length,
    APPROVED: MOCK_SALES_ORDERS.filter((o) => o.status === 'APPROVED').length,
    'IN PRODUCTION': MOCK_SALES_ORDERS.filter((o) => o.status === 'IN PRODUCTION').length,
    'READY TO SHIP': MOCK_SALES_ORDERS.filter((o) => o.status === 'READY TO SHIP').length,
    COMPLETED: MOCK_SALES_ORDERS.filter((o) => o.status === 'COMPLETED').length,
  }

  const columns = [
    {
      header: "SO Number",
      accessorKey: "id" as keyof SalesOrder,
      cell: (item: SalesOrder) => <span className="font-medium text-primary">{item.id}</span>
    },
    {
      header: "PO Number",
      accessorKey: "poNumber" as keyof SalesOrder,
      cell: (item: SalesOrder) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{item.poNumber}</span>
          {item.poDocumentUrl && <FileText className="h-3 w-3 text-muted-foreground" />}
        </div>
      )
    },
    { header: "Customer", accessorKey: "customer" as keyof SalesOrder },
    { header: "Product", accessorKey: "product" as keyof SalesOrder },
    {
      header: "Qty",
      accessorKey: "quantity" as keyof SalesOrder,
      className: "text-right",
      cell: (item: SalesOrder) => <span>{item.quantity.toLocaleString()}</span>
    },
    {
      header: "Total",
      accessorKey: "total" as keyof SalesOrder,
      className: "text-right",
      cell: (item: SalesOrder) => <span className="font-medium">Rp {item.total.toLocaleString()}</span>
    },
    { header: "Delivery Date", accessorKey: "deliveryDate" as keyof SalesOrder },
    {
      header: "Status",
      accessorKey: "status" as keyof SalesOrder,
      cell: (item: SalesOrder) => <StatusBadge status={item.status} />
    },
    {
      header: "Actions",
      cell: (item: SalesOrder) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/sales/${item.id}`} className="flex w-full items-center">
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              {item.status === 'DRAFT' && (
                <DropdownMenuItem>Edit Order</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage and track customer orders workflow
                </p>
              </div>
              <Link href="/sales/new">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" />
                  New Sales Order
                </Button>
              </Link>
            </div>

            {/* Status Summary Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'DRAFT', count: statusCounts.DRAFT, color: 'bg-gray-50 border-gray-200' },
                {
                  label: 'PENDING APPROVAL',
                  count: statusCounts['PENDING APPROVAL'],
                  color: 'bg-yellow-50 border-yellow-200',
                },
                {
                  label: 'APPROVED',
                  count: statusCounts.APPROVED,
                  color: 'bg-green-50 border-green-200',
                },
                {
                  label: 'IN PRODUCTION',
                  count: statusCounts['IN PRODUCTION'],
                  color: 'bg-blue-50 border-blue-200',
                },
                {
                  label: 'READY TO SHIP',
                  count: statusCounts['READY TO SHIP'],
                  color: 'bg-purple-50 border-purple-200',
                },
                { label: 'COMPLETED', count: statusCounts.COMPLETED, color: 'bg-emerald-50 border-emerald-200' },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md border ${stat.color} ${
                    statusFilter === stat.label ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setStatusFilter(statusFilter === stat.label ? 'All' : stat.label)}
                >
                  <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground truncate">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Filter Bar */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                   <Input
                      placeholder="Search SO, PO or Customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="IN PRODUCTION">In Production</SelectItem>
                    <SelectItem value="READY TO SHIP">Ready to Ship</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Data Table */}
            <Card className="overflow-hidden p-0">
               <DataTable 
                  data={filteredOrders} 
                  columns={columns}
               />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
