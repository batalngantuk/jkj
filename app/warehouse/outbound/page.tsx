'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, Calendar, MapPin, PackageCheck, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import AppLayout from '@/components/app-layout'

import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_SALES_ORDERS, SalesOrder } from "@/lib/mock-data/sales"
import { FileUpload } from "@/components/shared/file-upload"

export default function OutboundPage() {
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null)

  // Filter SOs that are Ready to Ship
  const outboundQueue = MOCK_SALES_ORDERS.filter(so => 
    so.status === 'READY TO SHIP' || so.status === 'IN PRODUCTION' // In production included just for demo if none ready
  )

  const handleShip = (so: SalesOrder) => {
      setSelectedSO(so)
  }

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
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_SALES_ORDERS[0],
       cell: (item: typeof MOCK_SALES_ORDERS[0]) => <StatusBadge status={item.status} />
    },
    {
       header: "Action",
       cell: (item: typeof MOCK_SALES_ORDERS[0]) => (
           <Button size="sm" onClick={() => handleShip(item)} disabled={item.status !== 'READY TO SHIP' && item.status !== 'IN PRODUCTION'} className="gap-2">
               <Truck className="h-4 w-4" />
               Ship
           </Button>
       )
    }
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            <div className="flex items-center gap-4">
              <Link href="/warehouse">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Outbound Shipping</h1>
                <p className="text-sm text-muted-foreground">Process outgoing shipments for Sales Orders</p>
              </div>
            </div>

            {/* Outbound Queue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                         <PackageCheck className="h-5 w-5 text-primary" />
                         Ready for Shipping
                    </CardTitle>
                    <CardDescription>
                        Orders where production is completed and goods are in FG zone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        data={outboundQueue}
                        columns={columns}
                    />
                </CardContent>
            </Card>

            {/* Shipping Dialog */}
             <Dialog open={!!selectedSO} onOpenChange={(open) => !open && setSelectedSO(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Process Shipment - {selectedSO?.id}</DialogTitle>
                        <CardDescription>{selectedSO?.customer}</CardDescription>
                    </DialogHeader>

                     <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm border-b pb-2">Logistics Info</h3>
                            <div className="space-y-2">
                                <Label>Select Transporter</Label>
                                <Input placeholder="e.g. JNE Trucking / Own Fleet" />
                            </div>
                            <div className="space-y-2">
                                <Label>Vehicle Number</Label>
                                <Input placeholder="e.g. B 9999 XX" />
                            </div>
                            <div className="space-y-2">
                                <Label>Driver Name</Label>
                                <Input placeholder="Driver Name" />
                            </div>
                             <div className="space-y-2 mt-4">
                                <Label>Upload Shipping Docs (Surat Jalan)</Label>
                                <FileUpload onFileSelect={() => {}} />
                            </div>
                        </div>

                         <div className="space-y-4">
                            <h3 className="font-semibold text-sm border-b pb-2">Load Check</h3>
                            <div className="bg-secondary/20 p-4 rounded-lg">
                                 <div className="flex justify-between mb-2">
                                     <span className="text-sm text-muted-foreground">Product</span>
                                     <span className="font-medium">{selectedSO?.product}</span>
                                 </div>
                                 <div className="flex justify-between mb-2">
                                     <span className="text-sm text-muted-foreground">Ordered Qty</span>
                                     <span className="font-bold">{selectedSO?.quantity.toLocaleString()} Cartons</span>
                                 </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Shipping Quantity</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        type="number" 
                                        defaultValue={selectedSO?.quantity} 
                                    />
                                    <Button variant="outline">Full</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Stock in FG Zone: 2,000 (Mock)
                                </p>
                            </div>
                        </div>
                     </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedSO(null)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Truck className="h-4 w-4" />
                            Dispatch Shipment
                        </Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>

          </div>
        </div></AppLayout>)
}
