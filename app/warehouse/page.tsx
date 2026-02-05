'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Eye,
  MoreVertical,
  Package,
  Clock,
  TrendingUp,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PENDING_GR = [
  {
    id: 1,
    poNumber: 'PO-2026-101',
    vendor: 'PT Latex Indonesia',
    material: 'Natural Latex',
    orderedQty: '10 ton',
    suratJalan: 'SJ/LAT/2026/001',
    bc23Status: 'Approved',
    bc23Color: 'bg-green-100 text-green-800',
  },
  {
    id: 2,
    poNumber: 'PO-2026-105',
    vendor: 'PT Chemical Surabaya',
    material: 'Chemical Accelerator',
    orderedQty: '500 kg',
    suratJalan: 'SJ/CHM/2026/003',
    bc23Status: 'Submitted',
    bc23Color: 'bg-yellow-100 text-yellow-800',
  },
]

const STOCK_ALERTS = [
  {
    id: 1,
    type: 'critical',
    material: 'Latex Compound',
    message: 'Below reorder point',
    current: '5 ton',
    minimum: '8 ton',
    reorder: '15 ton',
    icon: AlertCircle,
  },
  {
    id: 2,
    type: 'warning',
    material: 'Chemical Accelerator',
    message: 'Expiring soon',
    expDate: '15 Mar 2026',
    stock: '150 kg',
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: 'critical',
    material: 'Nitrile Raw Material',
    message: 'Critical level',
    current: '2 ton',
    minimum: '5 ton',
    icon: AlertCircle,
  },
]

const FAST_MOVING_ITEMS = [
  { code: 'RAW-001', name: 'Natural Latex Size M', stock: '280 ton', turnover: '15x/month' },
  { code: 'RAW-002', name: 'Nitrile Compound', stock: '45 ton', turnover: '12x/month' },
  { code: 'PAK-001', name: 'Carton Box 100pc', stock: '5,000 cartons', turnover: '18x/month' },
  { code: 'CHM-001', name: 'Accelerator ZDC', stock: '80 kg', turnover: '8x/month' },
  { code: 'PAK-002', name: 'Rubber Bands', stock: '200 kg', turnover: '14x/month' },
]

const RECENT_MOVEMENTS = [
  { date: '05 Feb 2026 14:30', type: 'IN', material: 'Natural Latex', qty: '5 ton', ref: 'GR-2026-045' },
  { date: '05 Feb 2026 10:15', type: 'OUT', material: 'Finished Gloves L Size', qty: '2,500 cartons', ref: 'SO-2026-001' },
  { date: '04 Feb 2026 16:45', type: 'IN', material: 'Chemical Accelerator', qty: '250 kg', ref: 'GR-2026-044' },
  { date: '04 Feb 2026 09:00', type: 'OUT', material: 'Work in Progress', qty: '1,200 cartons', ref: 'MO-2026-012' },
  { date: '03 Feb 2026 13:20', type: 'IN', material: 'Packaging Material', qty: '100 kg', ref: 'GR-2026-043' },
]

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState('stock-overview')
  const [searchMaterial, setSearchMaterial] = useState('')

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page Header */}
        <div className="border-b border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>Home</span>
                <ChevronRight className="h-4 w-4" />
                <span>Warehouse</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Management</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Warehouse Management</h1>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-card px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('receiving')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'receiving'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Receiving
            </button>
            <button
              onClick={() => setActiveTab('stock-overview')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'stock-overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Stock Overview
            </button>
            <button
              onClick={() => setActiveTab('movement')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'movement'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Movement
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          {activeTab === 'stock-overview' && (
            <div className="space-y-6">
              {/* Inventory Status Cards */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Raw Material */}
                <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Raw Material</h3>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-foreground">850 ton</div>
                      <p className="text-xs text-muted-foreground">85% of capacity</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>23 items below reorder point</span>
                    </div>
                  </div>
                </Card>

                {/* Work in Progress */}
                <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Work in Progress</h3>
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-foreground">125 ton</div>
                      <p className="text-xs text-muted-foreground">Normal level</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>All items within target range</span>
                    </div>
                  </div>
                </Card>

                {/* Finished Goods */}
                <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Finished Goods</h3>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Warehouse Management</h1>
                </div>
                <Link href="/warehouse/gr">
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Goods Receipt
                  </Button>
                </Link>
              </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>12,000 ready to ship</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Pending Goods Receipt */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Pending Goods Receipt</h2>
                    <span className="text-xs text-muted-foreground">{PENDING_GR.length} POs waiting</span>
                  </div>

                  <Card className="border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50 border-b border-border">
                          <TableHead className="text-xs font-semibold text-foreground">PO Number</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Vendor</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Material</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Qty</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Surat Jalan</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">BC 2.3</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {PENDING_GR.map((item) => (
                          <TableRow key={item.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                            <TableCell className="text-sm font-medium text-primary">{item.poNumber}</TableCell>
                            <TableCell className="text-sm text-foreground">{item.vendor}</TableCell>
                            <TableCell className="text-sm text-foreground">{item.material}</TableCell>
                            <TableCell className="text-sm text-foreground">{item.orderedQty}</TableCell>
                            <TableCell className="text-sm text-foreground">{item.suratJalan}</TableCell>
                            <TableCell>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${item.bc23Color}`}>
                                {item.bc23Status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Link href="/warehouse/gr">
                                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                                    Create GR
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stock Check */}
                  <Card className="p-4 border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stock Check</h3>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by code/name"
                        value={searchMaterial}
                        onChange={(e) => setSearchMaterial(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                  </Card>

                  {/* Fast Moving Items */}
                  <Card className="p-4 border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Top 5 Fast-Moving</h3>
                    <div className="space-y-3">
                      {FAST_MOVING_ITEMS.map((item, idx) => (
                        <div key={idx} className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                          <p className="text-xs font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.stock}</p>
                          <p className="text-xs text-primary font-semibold mt-1">{item.turnover}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recent Movements */}
                  <Card className="p-4 border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Recent Movements</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {RECENT_MOVEMENTS.map((movement, idx) => (
                        <div key={idx} className="flex items-start gap-2 pb-2 border-b border-border last:border-0">
                          <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${movement.type === 'IN' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{movement.material}</p>
                            <p className="text-xs text-muted-foreground">{movement.qty}</p>
                            <p className="text-xs text-muted-foreground">{movement.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Stock Alerts Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Stock Alerts</h2>
                <div className="grid gap-4">
                  {STOCK_ALERTS.map((alert) => {
                    const Icon = alert.icon
                    return (
                      <Card key={alert.id} className={`p-4 border-l-4 ${alert.type === 'critical' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-foreground">{alert.material}</p>
                            <p className={`text-xs ${alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'} font-medium`}>{alert.message}</p>
                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                              {alert.current && <p>Current: <span className="font-medium">{alert.current}</span></p>}
                              {alert.minimum && <p>Minimum: <span className="font-medium">{alert.minimum}</span></p>}
                              {alert.reorder && <p>Reorder: <span className="font-medium">{alert.reorder}</span></p>}
                              {alert.expDate && <p>Exp Date: <span className="font-medium">{alert.expDate}</span></p>}
                              {alert.stock && <p>Stock: <span className="font-medium">{alert.stock}</span></p>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'stock-overview' && (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">Tab content coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
