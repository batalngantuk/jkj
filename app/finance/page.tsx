'use client'

import React from 'react'
import Link from 'next/link'
import { DollarSign, TrendingUp, TrendingDown, FileText, PieChart, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_INVOICES } from "@/lib/mock-data/finance"

export default function FinanceDashboard() {
  const totalReceivables = MOCK_INVOICES.filter(i => i.type === 'AR' && i.status !== 'Paid' && i.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.amount, 0)
    
  const totalPayables = MOCK_INVOICES.filter(i => i.type === 'AP' && i.status !== 'Paid' && i.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.amount, 0)
    
  const columns = [
    {
       header: "Invoice #",
       accessorKey: "id" as keyof typeof MOCK_INVOICES[0],
       cell: (item: typeof MOCK_INVOICES[0]) => (
           <div className="flex flex-col">
               <span className="font-medium text-primary">{item.id}</span>
               <span className="text-xs text-muted-foreground">{item.referenceNumber}</span>
           </div>
       )
    },
    { header: "Party", accessorKey: "counterparty" as keyof typeof MOCK_INVOICES[0] },
    {
       header: "Type",
       accessorKey: "type" as keyof typeof MOCK_INVOICES[0],
       cell: (item: typeof MOCK_INVOICES[0]) => (
           <div className={`flex items-center gap-1 font-medium ${item.type === 'AR' ? 'text-green-600' : 'text-orange-600'}`}>
               {item.type === 'AR' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
               {item.type === 'AR' ? 'Receivable' : 'Payable'}
           </div>
       )
    },
    { 
       header: "Due Date", 
       accessorKey: "dueDate" as keyof typeof MOCK_INVOICES[0],
       cell: (item: typeof MOCK_INVOICES[0]) => (
           <span className={item.status === 'Overdue' ? 'text-red-500 font-bold' : ''}>{item.dueDate}</span>
       )
    },
    {
       header: "Amount",
       accessorKey: "amount" as keyof typeof MOCK_INVOICES[0],
       cell: (item: typeof MOCK_INVOICES[0]) => (
           <span className="font-semibold">Rp {item.amount.toLocaleString()}</span>
       )
    },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_INVOICES[0],
       cell: (item: typeof MOCK_INVOICES[0]) => <StatusBadge status={item.status} />
    }
  ]

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
                <h1 className="text-3xl font-bold text-foreground">Finance Overview</h1>
                <p className="text-sm text-muted-foreground">Financial health, AR, and AP monitoring</p>
              </div>
              <div className="flex gap-3">
                 <Link href="/finance/invoices">
                    <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Invoices (AR/AP)
                    </Button>
                 </Link>
                 <Link href="/finance/reports">
                    <Button className="bg-primary hover:bg-primary/90 gap-2">
                        <PieChart className="h-4 w-4" />
                        Financial Reports
                    </Button>
                 </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="border-green-100 bg-green-50/20">
                   <CardContent className="p-6">
                       <div className="flex items-center justify-between mb-2">
                           <p className="text-sm text-muted-foreground">Outstanding Receivables (AR)</p>
                           <TrendingUp className="h-4 w-4 text-green-500" />
                       </div>
                       <p className="text-3xl font-bold text-green-700">Rp {(totalReceivables / 1000000).toFixed(1)} M</p>
                       <p className="text-xs text-muted-foreground mt-1">Pending payments from customers</p>
                   </CardContent>
               </Card>
               <Card className="border-orange-100 bg-orange-50/20">
                    <CardContent className="p-6">
                       <div className="flex items-center justify-between mb-2">
                           <p className="text-sm text-muted-foreground">Outstanding Payables (AP)</p>
                           <TrendingDown className="h-4 w-4 text-orange-500" />
                       </div>
                       <p className="text-3xl font-bold text-orange-700">Rp {(totalPayables / 1000000).toFixed(1)} M</p>
                       <p className="text-xs text-muted-foreground mt-1">Pending bills to suppliers</p>
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6">
                       <div className="flex items-center justify-between mb-2">
                           <p className="text-sm text-muted-foreground">Net Cash Flow Forecast</p>
                           <DollarSign className="h-4 w-4 text-blue-500" />
                       </div>
                       <p className="text-3xl font-bold text-blue-700">
                           {totalReceivables - totalPayables > 0 ? '+' : ''}
                           Rp {((totalReceivables - totalPayables) / 1000000).toFixed(1)} M
                        </p>
                       <p className="text-xs text-muted-foreground mt-1">Projected balance (AR - AP)</p>
                   </CardContent>
               </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>Recent Invoices & Bills</CardTitle>
                    <CardDescription>Latest financial documents generated</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        data={MOCK_INVOICES}
                        columns={columns}
                    />
                </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
