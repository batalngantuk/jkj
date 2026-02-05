'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, Users, Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_VEHICLES, MOCK_DRIVERS } from "@/lib/mock-data/logistics"

export default function FleetPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            
            <div className="flex items-center gap-4">
              <Link href="/logistics">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fleet Management</h1>
                <p className="text-sm text-muted-foreground">Manage vehicles and drivers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicles Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Vehicles</CardTitle>
                            <CardDescription>Active fleet inventory</CardDescription>
                        </div>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Add Vehicle
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_VEHICLES.map(v => (
                                <div key={v.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                            <Truck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{v.plateNumber}</p>
                                            <p className="text-xs text-muted-foreground">{v.type} • {v.capacity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={v.status} />
                                        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Drivers Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Drivers</CardTitle>
                            <CardDescription>Registered personnel</CardDescription>
                        </div>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Add Driver
                        </Button>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {MOCK_DRIVERS.map(d => (
                                <div key={d.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{d.name}</p>
                                            <p className="text-xs text-muted-foreground">{d.licenseNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={d.status} />
                                        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </div>
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
