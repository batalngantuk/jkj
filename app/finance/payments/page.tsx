'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { MOCK_PAYMENTS, MOCK_AR_INVOICES, MOCK_AP_INVOICES } from '@/lib/mock-data/finance'

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('ALL')

  const paymentsWithDetails = MOCK_PAYMENTS.map(payment => {
    const arInvoice = MOCK_AR_INVOICES.find(inv => inv.id === payment.invoiceId)
    const apInvoice = MOCK_AP_INVOICES.find(inv => inv.id === payment.invoiceId)
    
    return {
      ...payment,
      type: arInvoice ? 'AR' : 'AP',
      invoiceNumber: arInvoice?.invoiceNumber || apInvoice?.invoiceNumber || '',
      counterparty: arInvoice?.customerName || apInvoice?.vendorName || ''
    }
  })

  const filteredPayments = paymentsWithDetails.filter(payment => {
    const matchesSearch = 
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.counterparty.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMethod = methodFilter === 'ALL' || payment.method === methodFilter
    
    return matchesSearch && matchesMethod
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const totalPayments = filteredPayments.reduce((sum, pay) => sum + pay.amount, 0)
  const totalReceived = filteredPayments.filter(p => p.type === 'AR').reduce((sum, pay) => sum + pay.amount, 0)
  const totalPaid = filteredPayments.filter(p => p.type === 'AP').reduce((sum, pay) => sum + pay.amount, 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/finance">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment Transactions</h1>
              <p className="text-sm text-muted-foreground">All payment receipts and disbursements</p>
            </div>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
              <p className="text-xs text-muted-foreground mt-1">{filteredPayments.length} transactions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Received (AR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredPayments.filter(p => p.type === 'AR').length} payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Paid (AP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredPayments.filter(p => p.type === 'AP').length} payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by payment number, invoice, or party..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Methods</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History ({filteredPayments.length})</CardTitle>
            <CardDescription>All payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.paymentNumber}</TableCell>
                      <TableCell>
                        <Badge variant={payment.type === 'AR' ? 'default' : 'secondary'} className={payment.type === 'AR' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {payment.type === 'AR' ? 'Received' : 'Paid'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={payment.type === 'AR' ? `/finance/ar/${payment.invoiceId}` : `/finance/ap/${payment.invoiceId}`} 
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {payment.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{payment.counterparty}</TableCell>
                      <TableCell className="text-sm">{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.method.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{payment.reference}</TableCell>
                      <TableCell className={`text-sm font-semibold ${payment.type === 'AR' ? 'text-green-600' : 'text-red-600'}`}>
                        {payment.type === 'AR' ? '+' : '-'}{formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
