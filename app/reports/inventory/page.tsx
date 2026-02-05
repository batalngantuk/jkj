'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AppLayout from '@/components/app-layout'
import { BarChartComponent } from '@/components/charts/bar-chart'
import { PieChartComponent } from '@/components/charts/pie-chart'
import { LineChartComponent } from '@/components/charts/line-chart'

export default function InventoryReportPage() {
  // Mock data for inventory analysis
  const inventoryByCategory = [
    { category: 'Raw Materials', value: 850, quantity: 12500 },
    { category: 'Work in Progress', value: 320, quantity: 4200 },
    { category: 'Finished Goods', value: 1200, quantity: 8900 },
    { category: 'Packaging', value: 180, quantity: 15000 },
  ]

  const inventoryTrend = [
    { month: 'Jan', value: 2100, turnover: 4.2 },
    { month: 'Feb', value: 2250, turnover: 4.5 },
    { month: 'Mar', value: 2400, turnover: 4.8 },
    { month: 'Apr', value: 2350, turnover: 4.6 },
    { month: 'May', value: 2500, turnover: 5.0 },
    { month: 'Jun', value: 2550, turnover: 5.1 },
  ]

  const topItems = [
    { item: 'Natural Rubber', value: 450, stock: 5000 },
    { item: 'Nitrile Gloves', value: 380, stock: 3500 },
    { item: 'Latex Material', value: 320, stock: 4200 },
    { item: 'Packaging Box', value: 180, stock: 8000 },
    { item: 'Medical Masks', value: 220, stock: 6500 },
  ]

  const stockStatus = [
    { name: 'Optimal', value: 65 },
    { name: 'Low Stock', value: 20 },
    { name: 'Overstock', value: 10 },
    { name: 'Out of Stock', value: 5 },
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/reports">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Inventory Valuation</h1>
                  <p className="text-sm text-muted-foreground">Stock value, turnover, and movement analysis</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp 2.55 B</div>
                  <p className="text-xs text-green-600 mt-1">+2.0% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Turnover</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5.1x</div>
                  <p className="text-xs text-green-600 mt-1">+0.1 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total SKUs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground mt-1">Across 4 categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Inventory by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Value by Category</CardTitle>
                  <CardDescription>Value distribution (M)</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={inventoryByCategory}
                    xKey="category"
                    bars={[
                      { key: 'value', color: '#3b82f6', name: 'Value (M)' }
                    ]}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Stock Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Stock Status Distribution</CardTitle>
                  <CardDescription>Percentage of items by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChartComponent
                    data={stockStatus}
                    nameKey="name"
                    valueKey="value"
                    colors={['#10b981', '#f59e0b', '#3b82f6', '#ef4444']}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Inventory Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Value & Turnover Trend</CardTitle>
                  <CardDescription>6-month performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChartComponent
                    data={inventoryTrend}
                    xKey="month"
                    lines={[
                      { key: 'value', color: '#3b82f6', name: 'Value (M)' },
                      { key: 'turnover', color: '#10b981', name: 'Turnover (x)' }
                    ]}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Top Items by Value */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Items by Value</CardTitle>
                  <CardDescription>Highest value inventory items (M)</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={topItems}
                    xKey="item"
                    bars={[
                      { key: 'value', color: '#8b5cf6', name: 'Value (M)' }
                    ]}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div></AppLayout>)
}
