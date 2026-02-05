'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, CheckCircle, Factory, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'

import AppLayout from '@/components/app-layout'
import { MOCK_SALES_ORDERS } from "@/lib/mock-data/sales"
import { AlertBadge } from "@/components/shared/alert-badge"

export default function ProductionPlanningPage() {
  // Filter SOs that need production (Approved status)
  const planningQueue = MOCK_SALES_ORDERS.filter(so => 
    so.status === 'APPROVED' || so.status === 'PENDING APPROVAL'
  )

  const columns = [
    {
      header: "SO Number",
      accessorKey: "id" as keyof typeof MOCK_SALES_ORDERS[0],
      cell: (item: typeof MOCK_SALES_ORDERS[0]) => <span className="font-medium text-primary">{item.id}</span>
    },
    { header: "Customer", accessorKey: "customer" as keyof typeof MOCK_SALES_ORDERS[0] },
    { header: "Product", accessorKey: "product" as keyof typeof MOCK_SALES_ORDERS[0] },
    { 
      header: "Qty", 
      accessorKey: "quantity" as keyof typeof MOCK_SALES_ORDERS[0],
      cell: (item: typeof MOCK_SALES_ORDERS[0]) => <span>{item.quantity.toLocaleString()}</span>
    },
    {
      header: "Deadline",
      accessorKey: "deliveryDate" as keyof typeof MOCK_SALES_ORDERS[0],
      cell: (item: typeof MOCK_SALES_ORDERS[0]) => (
        <span className={item.priority === 'Urgent' ? 'text-red-500 font-bold' : ''}>
           {item.deliveryDate}
        </span>
      )
    },
    {
       header: "Material Status",
       cell: (item: typeof MOCK_SALES_ORDERS[0]) => (
           <AlertBadge 
               type={item.id === 'SO-2026-004' ? 'success' : 'warning'} 
               message={item.id === 'SO-2026-004' ? 'Available' : 'Shortage'} 
           />
       )
    },
    {
      header: "Action",
      cell: (item: typeof MOCK_SALES_ORDERS[0]) => (
        <Link href={`/production/wo/create?so=${item.id}`}>
           <Button size="sm" className="gap-2">
             <Factory className="h-4 w-4" />
             Plan WO
           </Button>
        </Link>
      )
    }
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/production">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Production Planning</h1>
                <p className="text-sm text-muted-foreground">Plan and schedule work orders from approved sales orders</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="bg-blue-50 border-blue-200">
                   <CardContent className="p-6 flex items-center justify-between">
                       <div>
                           <p className="text-sm font-medium text-blue-800">Pending Planning</p>
                           <p className="text-3xl font-bold text-blue-900">{planningQueue.length}</p>
                       </div>
                       <Calendar className="h-10 w-10 text-blue-300" />
                   </CardContent>
               </Card>
               <Card className="bg-orange-50 border-orange-200">
                   <CardContent className="p-6 flex items-center justify-between">
                       <div>
                           <p className="text-sm font-medium text-orange-800">Urgent Orders</p>
                           <p className="text-3xl font-bold text-orange-900">
                               {planningQueue.filter(q => q.priority === 'Urgent').length}
                           </p>
                       </div>
                       <AlertCircle className="h-10 w-10 text-orange-300" />
                   </CardContent>
               </Card>
               <Card className="bg-green-50 border-green-200">
                   <CardContent className="p-6 flex items-center justify-between">
                       <div>
                           <p className="text-sm font-medium text-green-800">Material Ready</p>
                           <p className="text-3xl font-bold text-green-900">85%</p>
                       </div>
                       <CheckCircle className="h-10 w-10 text-green-300" />
                   </CardContent>
               </Card>
            </div>

            {/* Queue Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Order Queue</CardTitle>
                    <CardDescription>Approved orders waiting for production assignment</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        data={planningQueue}
                        columns={columns}
                    />
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
