'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Box, Timer, AlertTriangle, CheckSquare, FileBarChart, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from "@/components/shared/status-badge"
import { AlertBadge } from "@/components/shared/alert-badge"
import { StatusTimeline, TimelineStep } from "@/components/shared/status-timeline"
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'
import { MOCK_WORK_ORDERS, MOCK_BOMS } from "@/lib/mock-data/production"

export default function WorkOrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const wo = MOCK_WORK_ORDERS.find(w => w.id === id)

  if (!wo) {
     return <div>WO Not Found</div>
  }

  const bom = MOCK_BOMS.find(b => b.id === wo.bomId)

  // Timeline Logic
  const timelineSteps: TimelineStep[] = [
    { id: '1', label: 'Released', date: wo.startDate, status: 'completed' },
    { id: '2', label: 'In Production', status: wo.status === 'IN PROGRESS' ? 'current' : wo.status === 'COMPLETED' ? 'completed' : 'upcoming' },
    { id: '3', label: 'QC Inspection', status: wo.status === 'QC INSPECTION' ? 'current' : wo.status === 'COMPLETED' ? 'completed' : 'upcoming' },
    { id: '4', label: 'Finished Goods', status: wo.status === 'COMPLETED' ? 'completed' : 'upcoming' }
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/production">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{wo.id}</h1>
                  <p className="text-sm text-muted-foreground">Ref: {wo.soNumber}</p>
                </div>
                <StatusBadge status={wo.status} />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report Issue
                 </Button>
                 {wo.status === 'COMPLETED' && (
                     <Button className="gap-2">
                        <FileBarChart className="h-4 w-4" />
                        Konversi Report
                     </Button>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Production Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Product</p>
                                <p className="font-semibold">{wo.product}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Assigned Line</p>
                                <p className="font-medium">{wo.line}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Target Quantity</p>
                                <p className="font-semibold text-lg">{wo.quantity.toLocaleString()} Cartons</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Schedule</p>
                                <p className="font-medium">{wo.startDate} - {wo.endDate}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BOM & Material Tracker */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bill of Materials & Consumption</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {bom?.items.map(item => (
                                    <div key={item.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{item.materialName}</span>
                                            <span className="text-sm text-muted-foreground">
                                                Req: {(item.quantityPerUnit * wo.quantity).toFixed(2)} {item.unit}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Progress value={wo.progress} className="h-2 flex-1" />
                                            <span className="text-xs font-medium">{wo.progress}% Used</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center mb-6">
                                <div className="text-4xl font-bold text-primary mb-1">{wo.progress}%</div>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                            </div>
                            <StatusTimeline steps={timelineSteps} />
                        </CardContent>
                    </Card>

                    {/* Traceability Link (Mock) */}
                    <Card className="bg-blue-50/50 border-blue-200">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Traceability Chain
                             </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Source (BC 2.3)</span>
                                <span className="font-mono bg-white px-2 rounded border">AJU-001/2026</span>
                            </div>
                             <div className="text-center text-muted-foreground">↓</div>
                             <div className="flex justify-between items-center font-bold">
                                <span>Current (WO)</span>
                                <span className="font-mono bg-white px-2 rounded border border-blue-300">{wo.id}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
