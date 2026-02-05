'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Filter, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_PURCHASE_ORDERS } from "@/lib/mock-data/purchasing"

export default function POListPage() {
  const columns = [
    {
       header: "PO Number",
       accessorKey: "id" as keyof typeof MOCK_PURCHASE_ORDERS[0],
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => <span className="font-medium text-primary">{item.id}</span>
    },
    { header: "Supplier", accessorKey: "supplier" as keyof typeof MOCK_PURCHASE_ORDERS[0] },
    { 
       header: "Order Date", 
       accessorKey: "orderDate" as keyof typeof MOCK_PURCHASE_ORDERS[0] 
    },
    {
       header: "Total Amount",
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => (
           <span className="font-medium">Rp {item.totalAmount.toLocaleString()}</span>
       )
    },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_PURCHASE_ORDERS[0],
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => <StatusBadge status={item.status} />
    },
    {
       header: "Payment",
       accessorKey: "paymentStatus" as keyof typeof MOCK_PURCHASE_ORDERS[0],
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => {
           let type = 'default'
           if (item.paymentStatus === 'PAID') type = 'success'
           if (item.paymentStatus === 'PARTIAL') type = 'warning'
           if (item.paymentStatus === 'UNPAID') type = 'destructive'
           
           return (
               <span className={`text-xs px-2 py-1 rounded-full font-medium 
                   ${type === 'success' ? 'bg-green-100 text-green-800' : 
                     type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                     type === 'destructive' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                   }`}>
                   {item.paymentStatus}
               </span>
           )
       }
    },
    {
       header: "Action",
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => (
           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
               <Eye className="h-4 w-4" />
           </Button>
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/purchasing">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
                  <p className="text-sm text-muted-foreground">Manage purchasing and procurement orders</p>
                </div>
              </div>
              <Link href="/purchasing/po/create">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Create New PO
                </Button>
              </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>PO List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                             <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search PO..." className="pl-8" />
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Status
                            </Button>
                        </div>
                    </div>
                    <DataTable 
                        data={MOCK_PURCHASE_ORDERS}
                        columns={columns}
                    />
                </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
