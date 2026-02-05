'use client'

import React from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  Package, 
  Factory, 
  Truck, 
  DollarSign, 
  ShoppingCart,
  ArrowRight,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'

// Mock Data Imports
import { MOCK_SALES_REPORT } from '@/lib/mock-data/reports'
import { MOCK_PRODUCTION_YIELD } from '@/lib/mock-data/reports'
import { MOCK_INVENTORY_VALUE } from '@/lib/mock-data/reports'
import { MOCK_INVOICES } from '@/lib/mock-data/finance'
import { MOCK_SHIPMENTS } from '@/lib/mock-data/logistics'

export default function Dashboard() {
  // 1. Calculate Metrics
  const totalRevenue = MOCK_SALES_REPORT.reduce((acc, curr) => acc + curr.revenue, 0)
  const avgYield = MOCK_PRODUCTION_YIELD.reduce((acc, curr) => acc + curr.yield, 0) / MOCK_PRODUCTION_YIELD.length
  const totalInventoryValue = MOCK_INVENTORY_VALUE.reduce((acc, curr) => acc + curr.value, 0)
  
  const totalReceivables = MOCK_INVOICES.filter(i => i.type === 'AR' && i.status !== 'Paid' && i.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.amount, 0)
  const totalPayables = MOCK_INVOICES.filter(i => i.type === 'AP' && i.status !== 'Paid' && i.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.amount, 0)
  const netCashflow = totalReceivables - totalPayables

  const activeShipments = MOCK_SHIPMENTS.filter(s => s.status === 'In Transit').length

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
                <h1 className="text-3xl font-bold text-foreground">
                  Executive Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  JKJ Manufacturing - Real-time Enterprise Overview
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                System Online
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              
              <Link href="/reports/sales">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">Rp {(totalRevenue / 1000000000).toFixed(2)} B</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                    </p>
                    </CardContent>
                </Card>
              </Link>

              <Link href="/reports/production">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Production Yield</CardTitle>
                    <Factory className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{avgYield.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Target: 96.0%
                    </p>
                    </CardContent>
                </Card>
              </Link>

              <Link href="/reports/inventory">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                    <Package className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">Rp {(totalInventoryValue / 1000000000).toFixed(2)} B</div>
                    <p className="text-xs text-muted-foreground">
                        Across all warehouses
                    </p>
                    </CardContent>
                </Card>
              </Link>

              <Link href="/finance">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Cashflow Forecast</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                    <div className={`text-2xl font-bold ${netCashflow >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                        {netCashflow >= 0 ? '+' : ''}Rp {(netCashflow / 1000000).toFixed(1)} M
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Receivables - Payables
                    </p>
                    </CardContent>
                </Card>
              </Link>

            </div>

            {/* Quick Actions / Workflow Shortcuts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              
              {/* Workflow Status */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Workflow Status</CardTitle>
                  <CardDescription>
                    Active operations across the supply chain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Sales -> Production */}
                  <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                              <ShoppingCart className="h-4 w-4" />
                          </div>
                          <div>
                              <p className="font-semibold">Sales Orders</p>
                              <p className="text-xs text-muted-foreground">2 Pending Approval</p>
                          </div>
                      </div>
                      <Link href="/sales">
                        <Button variant="outline" size="sm" className="gap-2">
                            Review <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                  </div>

                  {/* Logistics */}
                  <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                              <Truck className="h-4 w-4" />
                          </div>
                          <div>
                              <p className="font-semibold">Active Shipments</p>
                              <p className="text-xs text-muted-foreground">{activeShipments} Trucks In Transit</p>
                          </div>
                      </div>
                      <Link href="/logistics/shipments">
                        <Button variant="outline" size="sm" className="gap-2">
                            Track <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                  </div>

                  {/* Finance */}
                   <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 text-green-600 rounded-full">
                              <DollarSign className="h-4 w-4" />
                          </div>
                          <div>
                              <p className="font-semibold">Pending Invoices</p>
                              <p className="text-xs text-muted-foreground">3 Overdue Payments</p>
                          </div>
                      </div>
                      <Link href="/finance/invoices">
                        <Button variant="outline" size="sm" className="gap-2">
                            Process <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                  </div>

                </CardContent>
              </Card>

              {/* System Health / Quick Links */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>System Activity</CardTitle>
                  <CardDescription>Recent automated actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                      <div className="flex gap-3 text-sm">
                          <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                              <p className="font-medium">Inventory Alert Triggered</p>
                              <p className="text-xs text-muted-foreground">10 mins ago • Raw Material stocks low</p>
                          </div>
                      </div>
                      <div className="flex gap-3 text-sm">
                          <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                              <p className="font-medium">New Production Plan Created</p>
                              <p className="text-xs text-muted-foreground">1 hour ago • By Production Manager</p>
                          </div>
                      </div>
                      <div className="flex gap-3 text-sm">
                          <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                              <p className="font-medium">PO-2026-003 Approved</p>
                              <p className="text-xs text-muted-foreground">2 hours ago • Auto-approval rules</p>
                          </div>
                      </div>
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
