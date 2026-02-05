'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AppLayout from '@/components/app-layout'
import { LineChartComponent } from '@/components/charts/line-chart'
import { BarChartComponent } from '@/components/charts/bar-chart'
import { PieChartComponent } from '@/components/charts/pie-chart'

export default function SalesReportPage() {
  // Mock data for sales analysis
  const monthlySales = [
    { month: 'Jan', revenue: 1.2, orders: 45, avgOrder: 26.7 },
    { month: 'Feb', revenue: 1.5, orders: 52, avgOrder: 28.8 },
    { month: 'Mar', revenue: 1.8, orders: 58, avgOrder: 31.0 },
    { month: 'Apr', revenue: 2.1, orders: 65, avgOrder: 32.3 },
    { month: 'May', revenue: 2.3, orders: 70, avgOrder: 32.9 },
    { month: 'Jun', revenue: 2.7, orders: 78, avgOrder: 34.6 },
  ]

  const salesByProduct = [
    { name: 'Rubber Gloves', value: 850 },
    { name: 'Medical Masks', value: 520 },
    { name: 'Protective Gear', value: 380 },
    { name: 'Surgical Supplies', value: 250 },
  ]

  const topCustomers = [
    { customer: 'PT. Global Trading', revenue: 450, orders: 28 },
    { customer: 'CV. Maju Jaya', revenue: 380, orders: 22 },
    { customer: 'PT. Sejahtera', revenue: 320, orders: 19 },
    { customer: 'Global Medical', revenue: 280, orders: 16 },
    { customer: 'Others', revenue: 570, orders: 35 },
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
                  <h1 className="text-2xl font-bold text-foreground">Sales Analysis</h1>
                  <p className="text-sm text-muted-foreground">Detailed sales performance and trends</p>
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp 2.7 B</div>
                  <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78</div>
                  <p className="text-xs text-green-600 mt-1">+11.4% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp 34.6 M</div>
                  <p className="text-xs text-green-600 mt-1">+5.2% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground mt-1">5 new this month</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Orders Trend</CardTitle>
                  <CardDescription>6-month performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChartComponent
                    data={monthlySales}
                    xKey="month"
                    lines={[
                      { key: 'revenue', color: '#3b82f6', name: 'Revenue (B)' },
                      { key: 'avgOrder', color: '#10b981', name: 'Avg Order (M)' }
                    ]}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Orders by Month */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Orders</CardTitle>
                  <CardDescription>Order volume by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={monthlySales}
                    xKey="month"
                    bars={[
                      { key: 'orders', color: '#8b5cf6', name: 'Orders' }
                    ]}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Sales by Product */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Product Category</CardTitle>
                  <CardDescription>Revenue distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChartComponent
                    data={salesByProduct}
                    nameKey="name"
                    valueKey="value"
                    colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers by Revenue</CardTitle>
                  <CardDescription>Revenue contribution (M)</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={topCustomers}
                    xKey="customer"
                    bars={[
                      { key: 'revenue', color: '#06b6d4', name: 'Revenue (M)' }
                    ]}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div></AppLayout>)
}
