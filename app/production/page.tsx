'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, Activity, TrendingUp, AlertCircle, Play, Pause, Eye, Plus, Factory } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import AppLayout from '@/components/app-layout'

import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_PRODUCTION_LINES, MOCK_WORK_ORDERS } from "@/lib/mock-data/production"
import { DataTable } from "@/components/shared/data-table"

export default function ProductionDashboard() {
  const activeWOs = MOCK_WORK_ORDERS.filter(wo => wo.status !== 'COMPLETED')
  
  // Calculate specific metrics
  const runningLines = MOCK_PRODUCTION_LINES.filter(l => l.status === 'Running').length
  const totalTarget = MOCK_PRODUCTION_LINES.reduce((acc, curr) => acc + curr.target, 0)
  const totalCompleted = MOCK_PRODUCTION_LINES.reduce((acc, curr) => acc + curr.completed, 0)
  const efficiency = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0

  const woColumns = [
    {
      header: "WO Number",
      accessorKey: "id" as keyof typeof MOCK_WORK_ORDERS[0],
      cell: (item: typeof MOCK_WORK_ORDERS[0]) => <span className="font-medium text-primary">{item.id}</span>
    },
    {
      header: "SO Link",
      accessorKey: "soNumber" as keyof typeof MOCK_WORK_ORDERS[0],
    },
    { header: "Product", accessorKey: "product" as keyof typeof MOCK_WORK_ORDERS[0] },
    { 
      header: "Qty", 
      accessorKey: "quantity" as keyof typeof MOCK_WORK_ORDERS[0],
      cell: (item: typeof MOCK_WORK_ORDERS[0]) => <span>{item.quantity.toLocaleString()}</span>
    },
    {
      header: "Line",
      accessorKey: "line" as keyof typeof MOCK_WORK_ORDERS[0],
    },
    {
      header: "Progress",
      cell: (item: typeof MOCK_WORK_ORDERS[0]) => (
        <div className="flex items-center gap-2">
           <Progress value={item.progress} className="w-16 h-2" />
           <span className="text-xs">{item.progress}%</span>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status" as keyof typeof MOCK_WORK_ORDERS[0],
      cell: (item: typeof MOCK_WORK_ORDERS[0]) => <StatusBadge status={item.status} />
    },
    {
        header: "Actions",
        cell: (item: typeof MOCK_WORK_ORDERS[0]) => (
            <div className="flex gap-2">
                <Link href={`/production/wo/${item.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        )
    }
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Production Dashboard</h1>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-muted-foreground">Live Monitoring</span>
                  <span className="text-muted-foreground">•</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex gap-3">
                 <Link href="/production/planning">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Production Planning
                    </Button>
                 </Link>
                 <Link href="/production/wo/new">
                    <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Create WO Manual
                    </Button>
                 </Link>
              </div>
            </div>

            {/* Top Metrics */}
            <div className="grid gap-4 grid-cols-4">
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Lines</p>
                  <p className="text-2xl font-bold text-foreground">{runningLines} / {MOCK_PRODUCTION_LINES.length}</p>
                  <Progress value={(runningLines / MOCK_PRODUCTION_LINES.length) * 100} className="h-1 mt-2" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Daily Target</p>
                  <p className="text-2xl font-bold text-foreground">{totalTarget.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Cartons</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Actual Production</p>
                  <p className="text-2xl font-bold text-foreground">{totalCompleted.toLocaleString()}</p>
                  <p className={`text-xs ${efficiency >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {efficiency}% Efficiency
                  </p>
                </div>
              </Card>
              <Card className="p-6">
                 <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active WOs</p>
                  <p className="text-2xl font-bold text-foreground">{activeWOs.length}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </Card>
            </div>

            {/* Production Lines */}
            <h2 className="text-lg font-semibold text-foreground">Production Lines Status</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {MOCK_PRODUCTION_LINES.map(line => (
                   <Card key={line.id} className={line.status === 'Running' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}>
                       <CardContent className="p-4 space-y-3">
                           <div className="flex justify-between items-start">
                               <div>
                                   <p className="font-semibold">{line.name}</p>
                                   <StatusBadge status={line.status} className="mt-1" />
                               </div>
                               <Factory className={`h-8 w-8 ${line.status === 'Running' ? 'text-green-100' : 'text-gray-100'}`} />
                           </div>
                           
                           <div className="space-y-1">
                               <div className="flex justify-between text-sm">
                                   <span className="text-muted-foreground">Current WO</span>
                                   <span className="font-medium">{line.currentWo || '-'}</span>
                               </div>
                               <div className="flex justify-between text-sm">
                                   <span className="text-muted-foreground">Operator</span>
                                   <span>{line.operator}</span>
                               </div>
                           </div>

                           <div className="space-y-1 pt-2">
                               <div className="flex justify-between text-xs">
                                   <span>Progress</span>
                                   <span>{Math.round((line.completed / line.target) * 100 || 0)}%</span>
                               </div>
                               <Progress value={(line.completed / line.target) * 100 || 0} className="h-2" />
                               <p className="text-xs text-center text-muted-foreground mt-1">
                                   {line.completed.toLocaleString()} / {line.target.toLocaleString()}
                               </p>
                           </div>
                       </CardContent>
                   </Card>
               ))}
            </div>

            {/* Active Work Orders Table */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Active Production Runs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable 
                        data={activeWOs}
                        columns={woColumns}
                    />
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
