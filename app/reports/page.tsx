'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, BarChart, TrendingUp, PieChart, Package, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AppLayout from '@/components/app-layout'
import { LineChartComponent } from '@/components/charts/line-chart'
import { BarChartComponent } from '@/components/charts/bar-chart'

import { MOCK_SALES_REPORT, MOCK_PRODUCTION_YIELD, TOP_CUSTOMERS } from "@/lib/mock-data/reports"

export default function ReportsDashboard() {
  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Executive Reports</h1>
                <p className="text-sm text-muted-foreground">Strategic insights and performance analytics</p>
              </div>
              <div className="flex gap-3">
                 <Link href="/reports/sales">
                    <Button variant="outline" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Sales Analysis
                    </Button>
                 </Link>
                 <Link href="/reports/production">
                    <Button variant="outline" className="gap-2">
                        <BarChart className="h-4 w-4" />
                        Production Efficiency
                    </Button>
                 </Link>
                 <Link href="/reports/inventory">
                    <Button variant="outline" className="gap-2">
                        <Package className="h-4 w-4" />
                        Inventory Valuation
                    </Button>
                 </Link>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card>
                   <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (YTD)</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="flex items-center justify-between">
                           <div className="text-3xl font-bold">Rp 1.52 M</div>
                           <TrendingUp className="h-4 w-4 text-green-500" />
                       </div>
                       <p className="text-xs text-green-600 mt-1 flex items-center">
                           <ArrowUpRight className="h-3 w-3 mr-1" />
                           +12.5% vs Last Year
                       </p>
                   </CardContent>
               </Card>
               <Card>
                   <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Production Yield</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="flex items-center justify-between">
                           <div className="text-3xl font-bold">96.8%</div>
                           <BarChart className="h-4 w-4 text-blue-500" />
                       </div>
                       <p className="text-xs text-green-600 mt-1 flex items-center">
                           <ArrowUpRight className="h-3 w-3 mr-1" />
                           +0.5% vs Target
                       </p>
                   </CardContent>
               </Card>
               <Card>
                   <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium text-muted-foreground">Top Customer Revenue</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="flex items-center justify-between">
                           <div className="text-3xl font-bold">Rp 1.5 B</div>
                           <DollarSign className="h-4 w-4 text-orange-500" />
                       </div>
                       <p className="text-xs text-muted-foreground mt-1">
                           PT. Maju Mundur (25% share)
                       </p>
                   </CardContent>
               </Card>
            </div>

            {/* Quick Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly revenue last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LineChartComponent
                          data={MOCK_SALES_REPORT.map(item => ({
                            month: item.month,
                            revenue: item.revenue / 1000000000
                          }))}
                          xKey="month"
                          lines={[
                            { key: 'revenue', color: '#3b82f6', name: 'Revenue (B)' }
                          ]}
                          height={300}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                        <CardDescription>By total purchase volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-6 pt-4">
                            {TOP_CUSTOMERS.map((customer, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{customer.name}</span>
                                         <span className="font-bold text-sm">Rp {(customer.totalPurchases / 1000000000).toFixed(1)} M</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500" 
                                            style={{ width: `${(customer.totalPurchases / 2000000000) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

          </div>
        </div></AppLayout>)
}
