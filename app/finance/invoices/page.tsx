'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import AppLayout from '@/components/app-layout'

import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_INVOICES } from "@/lib/mock-data/finance"
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function InvoicesPage() {
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
    { header: "Due Date", accessorKey: "dueDate" as keyof typeof MOCK_INVOICES[0] },
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
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            <div className="flex items-center gap-4">
              <Link href="/finance">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Invoices & Bills</h1>
                <p className="text-sm text-muted-foreground">Manage all Accounts Receivable and Payable</p>
              </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Financial Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between mb-4">
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search invoice number..." className="pl-8" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" /> Filter Type
                            </Button>
                        </div>
                    </div>
                    <DataTable 
                        data={MOCK_INVOICES}
                        columns={columns}
                    />
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
