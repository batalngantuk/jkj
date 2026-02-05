'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Plus,
  Eye,
  MoreHorizontal,
  Ship,
  Plane,
  TrendingUp,
  FileText,
  MapPin,
  Calendar,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const READY_TO_SHIP = [
  {
    id: 1,
    soNumber: 'SO-2026-001',
    customer: 'ABC Corporation',
    destination: 'USA',
    product: 'Latex M',
    quantity: '1,000',
    shipDate: '15 Feb 2026',
    bc30Status: 'Draft',
    bc30StatusColor: 'gray',
  },
  {
    id: 2,
    soNumber: 'SO-2026-003',
    customer: 'MediSupply Inc',
    destination: 'Singapore',
    product: 'Latex S',
    quantity: '2,000',
    shipDate: '18 Feb 2026',
    bc30Status: 'In Progress',
    bc30StatusColor: 'yellow',
  },
]

const ACTIVE_SHIPMENTS = [
  {
    id: 1,
    doNumber: 'DO-2026-001',
    mode: 'Sea Freight',
    vessel: 'MV EVER SUMMIT',
    customer: 'XYZ Global',
    destination: 'Los Angeles USA',
    container: 'MSCU1234567',
    etd: '10 Feb 2026',
    eta: '28 Feb 2026',
    bc30Status: 'Approved',
    bc30StatusColor: 'green',
  },
  {
    id: 2,
    doNumber: 'DO-2026-002',
    mode: 'Air Freight',
    vessel: 'SQ 988',
    customer: 'HealthCare Ltd',
    destination: 'Dubai UAE',
    container: 'AWB-12345',
    etd: '12 Feb 2026',
    eta: '14 Feb 2026',
    bc30Status: 'Submitted',
    bc30StatusColor: 'yellow',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'green':
      return 'bg-green-100 text-green-800'
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800'
    case 'gray':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function LogisticsDashboard() {
  const [activeTab, setActiveTab] = useState('shipments')

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Logistics & Shipping Management
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage shipments and BC 3.0 export customs documentation
                </p>
              </div>
              <Link href="/logistics/si">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Shipping Instruction
                </Button>
              </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ready to Ship</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">6</p>
                    <p className="text-xs text-muted-foreground mt-1">12,000 cartons</p>
                  </div>
                  <Package className="h-10 w-10 text-primary/30" />
                </div>
              </Card>

              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Transit</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">4</p>
                    <p className="text-xs text-muted-foreground mt-1">Active shipments</p>
                  </div>
                  <Ship className="h-10 w-10 text-primary/30" />
                </div>
              </Card>

              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">BC 3.0 Pending</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                  </div>
                  <FileText className="h-10 w-10 text-primary/30" />
                </div>
              </Card>

              <Card className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivered This Month</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">45</p>
                    <p className="text-xs text-muted-foreground mt-1">Successful deliveries</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-primary/30" />
                </div>
              </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-border">
              {['shipments', 'bc30', 'tracking', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'shipments' && 'Shipments'}
                  {tab === 'bc30' && 'BC 3.0'}
                  {tab === 'tracking' && 'Container Tracking'}
                  {tab === 'reports' && 'Reports'}
                </button>
              ))}
            </div>

            {/* Content Sections */}
            {activeTab === 'shipments' && (
              <div className="space-y-6">
                {/* Ready to Ship Section */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    Ready to Ship
                  </h2>
                  <Card className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-secondary/50">
                        <TableRow className="border-b border-border hover:bg-transparent">
                          <TableHead className="font-semibold text-foreground">SO Number</TableHead>
                          <TableHead className="font-semibold text-foreground">Customer</TableHead>
                          <TableHead className="font-semibold text-foreground">Destination</TableHead>
                          <TableHead className="font-semibold text-foreground">Product</TableHead>
                          <TableHead className="font-semibold text-foreground">Quantity</TableHead>
                          <TableHead className="font-semibold text-foreground">Ship Date</TableHead>
                          <TableHead className="font-semibold text-foreground">BC 3.0 Status</TableHead>
                          <TableHead className="font-semibold text-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {READY_TO_SHIP.map((row) => (
                          <TableRow key={row.id} className="border-b border-border hover:bg-secondary/30">
                            <TableCell className="font-medium text-primary">{row.soNumber}</TableCell>
                            <TableCell className="text-foreground">{row.customer}</TableCell>
                            <TableCell className="text-foreground">{row.destination}</TableCell>
                            <TableCell className="text-foreground">{row.product}</TableCell>
                            <TableCell className="text-foreground">{row.quantity} cartons</TableCell>
                            <TableCell className="text-foreground">{row.shipDate}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                  row.bc30StatusColor,
                                )}`}
                              >
                                {row.bc30Status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link href="/logistics/si">
                                  <Button size="sm" className="text-xs">
                                    Create SI
                                  </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                                  BC 3.0
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Active Shipments Section */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    Active Shipments
                  </h2>
                  <Card className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-secondary/50">
                        <TableRow className="border-b border-border hover:bg-transparent">
                          <TableHead className="font-semibold text-foreground">DO Number</TableHead>
                          <TableHead className="font-semibold text-foreground">Shipping Mode</TableHead>
                          <TableHead className="font-semibold text-foreground">Vessel/Flight</TableHead>
                          <TableHead className="font-semibold text-foreground">Customer</TableHead>
                          <TableHead className="font-semibold text-foreground">Destination</TableHead>
                          <TableHead className="font-semibold text-foreground">Container No</TableHead>
                          <TableHead className="font-semibold text-foreground">ETD</TableHead>
                          <TableHead className="font-semibold text-foreground">ETA</TableHead>
                          <TableHead className="font-semibold text-foreground">BC 3.0 Status</TableHead>
                          <TableHead className="font-semibold text-foreground">Tracking</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ACTIVE_SHIPMENTS.map((row) => (
                          <TableRow key={row.id} className="border-b border-border hover:bg-secondary/30">
                            <TableCell className="font-medium text-primary">{row.doNumber}</TableCell>
                            <TableCell className="text-foreground">{row.mode}</TableCell>
                            <TableCell className="text-foreground">{row.vessel}</TableCell>
                            <TableCell className="text-foreground">{row.customer}</TableCell>
                            <TableCell className="text-foreground">{row.destination}</TableCell>
                            <TableCell className="font-mono text-sm text-foreground">{row.container}</TableCell>
                            <TableCell className="text-foreground">{row.etd}</TableCell>
                            <TableCell className="text-foreground">{row.eta}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                  row.bc30StatusColor,
                                )}`}
                              >
                                {row.bc30Status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="text-xs bg-transparent">
                                <MapPin className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'bc30' && (
              <Card className="border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">BC 3.0 Export Management</h2>
                <p className="text-muted-foreground">BC 3.0 customs documentation management view</p>
              </Card>
            )}

            {activeTab === 'tracking' && (
              <Card className="border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Container Tracking Map</h2>
                <div className="h-96 bg-secondary/30 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">World map container tracking visualization</p>
                </div>
              </Card>
            )}

            {activeTab === 'reports' && (
              <Card className="border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Logistics Reports</h2>
                <p className="text-muted-foreground">Monthly shipment reports and analytics</p>
              </Card>
            )}

            {/* Bottom Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Shipping Instruction
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                BC 3.0 Reports
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Calendar className="mr-2 h-4 w-4" />
                Export Schedule
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
