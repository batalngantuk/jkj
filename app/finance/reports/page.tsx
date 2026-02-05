'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AppLayout from '@/components/app-layout'
import { LineChartComponent } from '@/components/charts/line-chart'
import { BarChartComponent } from '@/components/charts/bar-chart'
import { PieChartComponent } from '@/components/charts/pie-chart'
import { MOCK_AR_INVOICES, MOCK_AP_INVOICES } from '@/lib/mock-data/finance'

export default function FinanceReportsPage() {
  // Aggregate data for Charts
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    
    // 1. P&L Trend (Monthly)
    const pnlData = months.map(month => {
      // Mock random variation based on "real" data magnitude
      const income = 150000000 + Math.random() * 50000000
      const expenses = 85000000 + Math.random() * 30000000
      return {
        month,
        income: Math.round(income / 1000000), // in Millions
        expenses: Math.round(expenses / 1000000),
        profit: Math.round((income - expenses) / 1000000)
      }
    })

    // 2. Balance Sheet (Assets vs Liabilities)
    // Assets: Cash + AR
    // Liabilities: AP + Loans
    const totalAR = MOCK_AR_INVOICES.reduce((sum, inv) => sum + inv.balance, 0)
    const totalAP = MOCK_AP_INVOICES.reduce((sum, inv) => sum + inv.balance, 0)
    
    const balanceSheetData = [
      { name: 'Accounts Receivable', value: totalAR },
      { name: 'Cash on Hand', value: 450000000 }, // Mock cash
      { name: 'Inventory Asset', value: 320000000 }, // Mock inventory
    ]

    const liabilityData = [
        { name: 'Accounts Payable', value: totalAP },
        { name: 'VAT Payable', value: 45000000 },
        { name: 'Bank Loans', value: 150000000 }
    ]

    return { pnlData, balanceSheetData, liabilityData }
  }, [])

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            <div className="flex items-center gap-4">
              <Link href="/finance">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
                <p className="text-sm text-muted-foreground">Comprehensive financial analysis and statements</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit (YTD)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Rp 450.2M</div>
                        <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">Rp 1.2B</div>
                        <p className="text-xs text-muted-foreground">+8.2% vs target</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">Rp 750M</div>
                        <p className="text-xs text-muted-foreground">-2.1% (Good) vs budget</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
                        <Wallet className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">Rp 450M</div>
                        <p className="text-xs text-muted-foreground">Healthy liquidity</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profit & Loss Analysis</CardTitle>
                        <CardDescription>Monthly Income vs Expenses (Millions)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarChartComponent
                            data={chartData.pnlData}
                            xKey="month"
                            bars={[
                                { key: 'income', name: 'Income', color: '#10b981' },
                                { key: 'expenses', name: 'Expenses', color: '#ef4444' }
                            ]}
                            height={300}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Net Profit Trend</CardTitle>
                        <CardDescription>Monthly Net Profit Growth (Millions)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LineChartComponent
                            data={chartData.pnlData}
                            xKey="month"
                            lines={[
                                { key: 'profit', name: 'Net Profit', color: '#3b82f6' }
                            ]}
                            height={300}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                   <CardHeader>
                        <CardTitle>Asset Distribution</CardTitle>
                        <CardDescription>Current Assets Composition</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PieChartComponent
                            data={chartData.balanceSheetData}
                            nameKey="name"
                            valueKey="value"
                            colors={['#3b82f6', '#10b981', '#f59e0b']}
                            height={300}
                        />
                    </CardContent>
                </Card>
                <Card>
                   <CardHeader>
                        <CardTitle>Liability Breakdown</CardTitle>
                        <CardDescription>Current Liabilities Composition</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PieChartComponent
                            data={chartData.liabilityData}
                            nameKey="name"
                            valueKey="value"
                            colors={['#ef4444', '#f97316', '#8b5cf6']}
                            height={300}
                        />
                    </CardContent>
                </Card>
            </div>

          </div>
        </div></AppLayout>)
}
