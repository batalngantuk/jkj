'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Package, Truck, Calendar, FileText, Upload, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { FileUpload } from "@/components/shared/file-upload"
import { MOCK_PURCHASE_ORDERS, PurchaseOrder } from "@/lib/mock-data/purchasing"

export default function InboundPage() {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  
  // Only show POs that can be received (Approved or Partial)
  const incomingPOs = MOCK_PURCHASE_ORDERS.filter(po => 
    po.status === 'APPROVED' || po.status === 'PARTIAL'
  )

  const handleReceive = (po: PurchaseOrder) => {
      setSelectedPO(po)
  }

  const columns = [
    {
       header: "PO Number",
       accessorKey: "id" as keyof typeof MOCK_PURCHASE_ORDERS[0],
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => <span className="font-medium text-primary">{item.id}</span>
    },
    { header: "Supplier", accessorKey: "supplier" as keyof typeof MOCK_PURCHASE_ORDERS[0] },
    { 
        header: "Items",
        cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => (
            <span className="text-sm">
                {item.items.map(i => i.name).join(', ').substring(0, 30)}
                {item.items.length > 1 ? '...' : ''}
            </span>
        )
    },
    { 
        header: "Expected Delivery", 
        accessorKey: "expectedDelivery" as keyof typeof MOCK_PURCHASE_ORDERS[0],
        cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => (
            <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{item.expectedDelivery}</span>
            </div>
        )
    },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_PURCHASE_ORDERS[0],
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => <StatusBadge status={item.status} />
    },
    {
       header: "Action",
       cell: (item: typeof MOCK_PURCHASE_ORDERS[0]) => (
           <Button size="sm" onClick={() => handleReceive(item)} className="gap-2">
               <Package className="h-4 w-4" />
               Receive
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
            
            <div className="flex items-center gap-4">
              <Link href="/warehouse">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Inbound Receiving</h1>
                <p className="text-sm text-muted-foreground">Process incoming shipments from approved Purchase Orders</p>
              </div>
            </div>

            {/* Incoming Queue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Incoming Shipments Queue
                    </CardTitle>
                    <CardDescription>
                        Approved Purchase Orders awaiting delivery.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        data={incomingPOs}
                        columns={columns}
                    />
                </CardContent>
            </Card>

            {/* Receiving Dialog */}
            <Dialog open={!!selectedPO} onOpenChange={(open) => !open && setSelectedPO(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Receive Shipment - {selectedPO?.id}</DialogTitle>
                        <CardDescription>{selectedPO?.supplier}</CardDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm border-b pb-2">Shipment Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Delivery Note No. (Surat Jalan)</Label>
                                    <Input placeholder="Enter SJ Number" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vehicle Number</Label>
                                    <Input placeholder="e.g. B 1234 XY" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Receiver Name</Label>
                                    <Input defaultValue="Current User" readOnly disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Received Date</Label>
                                    <Input type="datetime-local"  />
                                </div>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                                <Label>Upload Delivery Document</Label>
                                <FileUpload onFileSelect={() => {}} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm border-b pb-2">Items to Receive</h3>
                            <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                                {selectedPO?.items.map((item, idx) => (
                                    <div key={idx} className="bg-secondary/20 p-3 rounded-lg border">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-xs font-mono bg-white px-1 rounded border">{item.code}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 items-end">
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Ordered</span>
                                                <span className="font-bold">{item.quantity.toLocaleString()} {item.unit}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-xs mb-1 block">Received Quantity</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        defaultValue={item.quantity} 
                                                        className="h-8"
                                                    />
                                                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPO(null)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Confirm Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>
    </div>
  )
}
