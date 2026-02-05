'use client'

import React from 'react'
import Link from 'next/link'
import { Package, Truck, ArrowDownLeft, ArrowUpRight, Search, Filter, AlertTriangle, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import AppLayout from '@/components/app-layout'

import { DataTable } from '@/components/shared/data-table'
import { MOCK_INVENTORY, MOCK_TRANSACTIONS } from "@/lib/mock-data/warehouse"
import { AlertBadge } from "@/components/shared/alert-badge"

export default function WarehouseDashboard() {
  const lowStockCount = MOCK_INVENTORY.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length
  const totalValue = MOCK_INVENTORY.reduce((acc, curr) => acc + curr.value, 0)
  
  const inventoryColumns = [
    {
       header: "Code",
       accessorKey: "code" as keyof typeof MOCK_INVENTORY[0],
       cell: (item: typeof MOCK_INVENTORY[0]) => <span className="font-mono text-xs font-medium">{item.code}</span>
    },
    { header: "Item Name", accessorKey: "name" as keyof typeof MOCK_INVENTORY[0] },
    { header: "Category", accessorKey: "category" as keyof typeof MOCK_INVENTORY[0] },
    {
       header: "Stock Level",
       cell: (item: typeof MOCK_INVENTORY[0]) => (
           <div className="w-32">
               <div className="flex justify-between text-xs mb-1">
                   <span>{item.quantity.toLocaleString()} {item.unit}</span>
                   <span className="text-muted-foreground">{Math.round((item.quantity / item.maxStock) * 100)}%</span>
               </div>
               <Progress 
                  value={(item.quantity / item.maxStock) * 100} 
                  className={`h-1.5 ${item.status === 'Critical' ? 'bg-red-100' : ''}`} 
                  // Note: creating custom colored progress requires more complex setup or inline styles/classes on the indicator itself if using shadcn default.
                  // For now reliance on the Badge for status is sufficient visual cue.
               />
           </div>
       )
    },
    { header: "Location", accessorKey: "location" as keyof typeof MOCK_INVENTORY[0] },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_INVENTORY[0],
       cell: (item: typeof MOCK_INVENTORY[0]) => {
           let type: 'success' | 'warning' | 'critical' | 'info' = 'success'
           if (item.status === 'Low Stock') type = 'warning'
           if (item.status === 'Critical') type = 'critical'
           if (item.status === 'Overstock') type = 'info'
           return <AlertBadge type={type} message={item.status} />
       }
    }
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Warehouse Overview</h1>
                <p className="text-sm text-muted-foreground">Inventory management and stock movements</p>
              </div>
              <div className="flex gap-3">
                 <Link href="/warehouse/inbound">
                    <Button variant="outline" className="gap-2">
                        <ArrowDownLeft className="h-4 w-4" />
                        Inbound (Receiving)
                    </Button>
                 </Link>
                 <Link href="/warehouse/outbound">
                    <Button variant="outline" className="gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        Outbound (Shipping)
                    </Button>
                 </Link>
                 <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Layers className="h-4 w-4" />
                    Stock Adjustment
                 </Button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                           <p className="text-2xl font-bold">Rp {(totalValue / 1000000).toFixed(0)} M</p>
                       </div>
                       <Package className="h-8 w-8 text-blue-500" />
                   </CardContent>
               </Card>
               <Card className={lowStockCount > 0 ? "border-red-200 bg-red-50/30" : ""}>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                           <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : ""}`}>{lowStockCount} Items</p>
                       </div>
                       <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? "text-red-500" : "text-gray-400"}`} />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Pending Inbound</p>
                           <p className="text-2xl font-bold">5 POs</p>
                       </div>
                       <ArrowDownLeft className="h-8 w-8 text-green-500" />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Pending Outbound</p>
                           <p className="text-2xl font-bold">3 SOs</p>
                       </div>
                       <Truck className="h-8 w-8 text-orange-500" />
                   </CardContent>
               </Card>
            </div>

            {/* Main Inventory Table */}
            <Card className="flex-1">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Current Inventory</CardTitle>
                        <div className="flex gap-2 w-1/3">
                            <Input placeholder="Search items..." prefix={<Search className="h-4 w-4"/>} />
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        data={MOCK_INVENTORY}
                        columns={inventoryColumns}
                    />
                </CardContent>
            </Card>

            {/* Recent Movements */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Movements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {MOCK_TRANSACTIONS.map(trx => (
                            <div key={trx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        h-10 w-10 rounded-full flex items-center justify-center
                                        ${trx.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}
                                    `}>
                                        {trx.type === 'IN' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{trx.itemId} <span className="text-muted-foreground">• {trx.refNumber}</span></p>
                                        <p className="text-xs text-muted-foreground">{trx.date} • {trx.notes}</p>
                                    </div>
                                </div>
                                <div className="font-bold">
                                    {trx.type === 'IN' ? '+' : '-'}{trx.quantity.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
