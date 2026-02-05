'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Activity, TrendingUp, AlertCircle, Play, Pause, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PRODUCTION_LINES = [
  {
    id: 1,
    name: 'Line 1',
    progress: 90,
    status: 'Running',
    wo: 'WO-501',
    product: 'Latex S',
    completed: 450,
    target: 500,
  },
  {
    id: 2,
    name: 'Line 2',
    progress: 75,
    status: 'Running',
    wo: 'WO-502',
    product: 'Nitrile M',
    completed: 750,
    target: 1000,
  },
  {
    id: 3,
    name: 'Line 3',
    progress: 50,
    status: 'Setup',
    wo: 'WO-503',
    product: 'Latex L',
    completed: 0,
    target: 800,
  },
  {
    id: 4,
    name: 'Line 4',
    progress: 0,
    status: 'Idle',
    wo: '-',
    product: 'Maintenance',
    completed: 0,
    target: 0,
  },
]

const ACTIVE_WORK_ORDERS = [
  {
    id: 'WO-501',
    so: 'SO-2026-001',
    product: 'Latex Size S',
    target: 500,
    completed: 450,
    startTime: '08:00',
    status: 'Running',
    progress: 90,
  },
  {
    id: 'WO-502',
    so: 'SO-2026-003',
    product: 'Nitrile Size M',
    target: 1000,
    completed: 750,
    startTime: '06:00',
    status: 'QC Inspection',
    progress: 75,
  },
  {
    id: 'WO-503',
    so: 'SO-2026-005',
    product: 'Latex Size L',
    target: 800,
    completed: 0,
    startTime: '14:00',
    status: 'Setup',
    progress: 50,
  },
]

const MATERIAL_CONSUMPTION = [
  {
    name: 'Latex',
    used: 2.5,
    available: 25,
    unit: 'ton',
    status: 'OK',
    percentage: 90,
  },
  {
    name: 'Chemical Mix',
    used: 150,
    available: 800,
    unit: 'kg',
    status: 'OK',
    percentage: 81,
  },
  {
    name: 'Nitrile Compound',
    used: 1.8,
    available: 3,
    unit: 'ton',
    status: 'Warning',
    percentage: 40,
  },
]

const SCHEDULE = [
  { time: '06:00 - 10:00', wo: 'WO-502', product: 'Nitrile M', shift: 'Shift 1', color: 'bg-blue-500' },
  { time: '10:00 - 14:00', wo: 'WO-501', product: 'Latex S', shift: 'Shift 2', color: 'bg-purple-500' },
  { time: '14:00 - 18:00', wo: 'WO-503', product: 'Latex L', shift: 'Shift 2', color: 'bg-emerald-500' },
  { time: '18:00 - 22:00', wo: 'WO-504', product: 'Latex M', shift: 'Shift 3', color: 'bg-orange-500' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Running':
      return 'bg-blue-100 text-blue-800'
    case 'QC Inspection':
      return 'bg-yellow-100 text-yellow-800'
    case 'Setup':
      return 'bg-gray-100 text-gray-800'
    case 'Idle':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ProductionDashboard() {
  const [selectedDate] = useState('5 Feb 2026')

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Header with Date Selector */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Production Dashboard</h1>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-muted-foreground">LIVE</span>
                  <span className="text-muted-foreground">•</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Today - {selectedDate}</span>
                </div>
              </div>
              <Link href="/production/wo">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Work Order
                </Button>
              </Link>
            </div>

            {/* Top Metrics */}
            <div className="grid gap-4 grid-cols-4">
              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Target Today</p>
                  <p className="text-2xl font-bold text-foreground">5,000</p>
                  <p className="text-xs text-muted-foreground">from 10 Work Orders</p>
                </div>
              </Card>
              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Actual Production</p>
                  <p className="text-2xl font-bold text-foreground">4,200</p>
                  <p className="text-xs text-muted-foreground">8 WO completed</p>
                </div>
              </Card>
              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Production Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">84%</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">↑ 3%</span> from yesterday
                  </p>
                </div>
              </Card>
              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Reject Rate</p>
                  <p className="text-2xl font-bold text-green-600">2.3%</p>
                  <p className="text-xs text-muted-foreground">Below 3% target</p>
                </div>
              </Card>
            </div>

            {/* Production Lines Status */}
            <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Production Lines Status</h2>
              <div className="space-y-4">
                {PRODUCTION_LINES.map((line) => (
                  <div key={line.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{line.name}</span>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(line.status)}`}>
                          {line.status}
                        </span>
                        <span className="text-sm text-muted-foreground">{line.wo}</span>
                        <span className="text-sm text-muted-foreground">-</span>
                        <span className="text-sm font-medium text-foreground">{line.product}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {line.completed}/{line.target} cartons
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={line.progress} className="flex-1 h-2" />
                      <span className="text-sm font-medium text-foreground w-8 text-right">{line.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Work Orders Table and Schedule */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Work Orders Table */}
                <Card className="border border-border bg-card rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Active Work Orders</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-foreground">WO Number</TableHead>
                          <TableHead className="text-foreground">SO Reference</TableHead>
                          <TableHead className="text-foreground">Product Type</TableHead>
                          <TableHead className="text-right text-foreground">Target Qty</TableHead>
                          <TableHead className="text-right text-foreground">Completed</TableHead>
                          <TableHead className="text-foreground">Start Time</TableHead>
                          <TableHead className="text-foreground">Status</TableHead>
                          <TableHead className="text-foreground">Progress</TableHead>
                          <TableHead className="text-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ACTIVE_WORK_ORDERS.map((wo) => (
                          <TableRow key={wo.id} className="border-border hover:bg-secondary/30">
                            <TableCell className="font-semibold text-primary">{wo.id}</TableCell>
                            <TableCell className="text-muted-foreground">{wo.so}</TableCell>
                            <TableCell className="text-foreground">{wo.product}</TableCell>
                            <TableCell className="text-right text-foreground">{wo.target}</TableCell>
                            <TableCell className="text-right text-foreground font-medium">{wo.completed}</TableCell>
                            <TableCell className="text-muted-foreground">{wo.startTime}</TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(wo.status)}`}>
                                {wo.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={wo.progress} className="w-16 h-1.5" />
                                <span className="text-xs font-medium">{wo.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  {wo.status === 'Running' ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                {/* Material Consumption */}
                <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Real-time Material Consumption</h2>
                  <div className="space-y-4">
                    {MATERIAL_CONSUMPTION.map((material) => (
                      <div key={material.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{material.name}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {material.used} {material.unit} used
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Available: {material.available} {material.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={material.percentage}
                            className={`flex-1 h-2 ${
                              material.status === 'Warning' ? 'bg-yellow-100' : 'bg-green-100'
                            }`}
                          />
                          <span
                            className={`text-xs font-semibold rounded px-2 py-1 ${
                              material.status === 'Warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {material.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Today's Schedule Panel */}
              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Today's Schedule</h2>
                <div className="space-y-2">
                  {SCHEDULE.map((slot, idx) => (
                    <div key={idx} className={`rounded-lg p-3 text-white ${slot.color} space-y-1`}>
                      <p className="text-xs font-semibold opacity-90">{slot.time}</p>
                      <p className="text-sm font-bold">{slot.wo}</p>
                      <p className="text-xs opacity-80">{slot.product}</p>
                      <p className="text-xs opacity-70 border-t border-white/20 pt-1 mt-1">{slot.shift}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Create Work Order
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                View Full Schedule
              </Button>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                Material Consumption Report
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
