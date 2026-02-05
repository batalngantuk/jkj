'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import AppLayout from '@/components/app-layout'

import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_SHIPMENTS } from "@/lib/mock-data/logistics"

export default function ShipmentsPage() {
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
    { header: "Schedule", cell: (item: typeof MOCK_SHIPMENTS[0]) => (
        <div className="text-xs">
            <div>Dep: {item.departureDate}</div>
            <div className="text-muted-foreground">Est: {item.estimatedArrival}</div>
        </div>
    )},
    { header: "Customs Doc", accessorKey: "customsDoc" as keyof typeof MOCK_SHIPMENTS[0] },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_SHIPMENTS[0],
       cell: (item: typeof MOCK_SHIPMENTS[0]) => <StatusBadge status={item.status} />
    }
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            <div className="flex items-center gap-4">
              <Link href="/logistics">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Track Shipments</h1>
                <p className="text-sm text-muted-foreground">Monitor ongoing deliveries and customs clearance</p>
              </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shipment List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between mb-4">
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search shipment ID..." className="pl-8" />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>
                    <DataTable 
                        data={MOCK_SHIPMENTS}
                        columns={shipmentColumns}
                    />
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
