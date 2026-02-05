'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, PieChart, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'

export default function FinanceReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profit & Loss</CardTitle>
                        <CardDescription>Income Statement</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center bg-secondary/10 rounded-lg border border-dashed text-muted-foreground">
                        <div className="text-center">
                            <BarChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Chart Placeholder: P&L Analysis</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Balance Sheet</CardTitle>
                        <CardDescription>Assets vs Liabilities</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center bg-secondary/10 rounded-lg border border-dashed text-muted-foreground">
                        <div className="text-center">
                            <PieChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Chart Placeholder: Asset Distribution</p>
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
