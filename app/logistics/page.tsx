'use client'

import React from 'react'
import Link from 'next/link'
import { Truck, MapPin, Calendar, FileText, Anchor, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_SHIPMENTS, MOCK_VEHICLES, MOCK_DRIVERS } from "@/lib/mock-data/logistics"

export default function LogisticsDashboard() {
  const activeShipments = MOCK_SHIPMENTS.filter(s => s.status === 'In Transit').length
  const availableVehicles = MOCK_VEHICLES.filter(v => v.status === 'Available').length
  
  const shipmentColumns = [
    {
       header: "Shipment ID",
       accessorKey: "id" as keyof typeof MOCK_SHIPMENTS[0],
       cell: (item: typeof MOCK_SHIPMENTS[0]) => <span className="font-medium text-primary">{item.id}</span>
    },
    { header: "Customer", accessorKey: "customer" as keyof typeof MOCK_SHIPMENTS[0] },
    { 
        header: "Destination", 
        accessorKey: "destination" as keyof typeof MOCK_SHIPMENTS[0],
        cell: (item: typeof MOCK_SHIPMENTS[0]) => (
            <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{item.destination}</span>
            </div>
        )
    },
    { header: "Driver / Vehicle", cell: (item: typeof MOCK_SHIPMENTS[0]) => `${item.driverId} / ${item.vehicleId}` },
    { header: "Customs Doc", accessorKey: "customsDoc" as keyof typeof MOCK_SHIPMENTS[0] },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_SHIPMENTS[0],
       cell: (item: typeof MOCK_SHIPMENTS[0]) => <StatusBadge status={item.status} />
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
                <h1 className="text-3xl font-bold text-foreground">Logistics & Customs</h1>
                <p className="text-sm text-muted-foreground">Fleet management and delivery tracking</p>
              </div>
              <div className="flex gap-3">
                 <Link href="/logistics/fleet">
                    <Button variant="outline" className="gap-2">
                        <Truck className="h-4 w-4" />
                        Fleet & Drivers
                    </Button>
                 </Link>
                 <Link href="/logistics/shipments">
                    <Button className="bg-primary hover:bg-primary/90 gap-2">
                        <MapPin className="h-4 w-4" />
                        Track Shipments
                    </Button>
                 </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Active Shipments</p>
                           <p className="text-2xl font-bold">{activeShipments}</p>
                       </div>
                       <Truck className="h-8 w-8 text-blue-500" />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Available Fleet</p>
                           <p className="text-2xl font-bold">{availableVehicles} <span className="text-sm text-muted-foreground font-normal">/ {MOCK_VEHICLES.length}</span></p>
                       </div>
                       <Truck className="h-8 w-8 text-green-500" />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Export Docs (BC 3.0)</p>
                           <p className="text-2xl font-bold">12 Pending</p>
                       </div>
                       <Anchor className="h-8 w-8 text-orange-500" />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">On-Time Rate</p>
                           <p className="text-2xl font-bold">98%</p>
                       </div>
                       <AlertCircle className="h-8 w-8 text-purple-500" />
                   </CardContent>
               </Card>
            </div>

            {/* Active Shipments */}
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>Active Shipments</CardTitle>
                    <CardDescription>Real-time delivery status and customs clearance</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        data={MOCK_SHIPMENTS}
                        columns={shipmentColumns}
                    />
                </CardContent>
            </Card>

             {/* Fleet Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_VEHICLES.map(v => (
                                <div key={v.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${v.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Truck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{v.plateNumber}</p>
                                            <p className="text-xs text-muted-foreground">{v.type} • {v.capacity}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={v.status} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Driver Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_DRIVERS.map(d => (
                                <div key={d.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${d.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-500'}`}>
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{d.name}</p>
                                            <p className="text-xs text-muted-foreground">{d.licenseNumber}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={d.status} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
