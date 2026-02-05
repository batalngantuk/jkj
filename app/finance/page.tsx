'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AppLayout from '@/components/app-layout'
import { StatusBadge } from '@/components/shared/status-badge'
import { 
  MOCK_AR_INVOICES, 
  MOCK_AP_INVOICES, 
  getTotalAR, 
  getTotalAP, 
  getOverdueAR, 
  getOverdueAP 
} from '@/lib/mock-data/finance'

export default function FinanceDashboardPage() {
  const totalAR = getTotalAR()
  const totalAP = getTotalAP()
  const overdueAR = getOverdueAR()
  const overdueAP = getOverdueAP()
  const cashBalance = 500000000 // Mock cash balance
  const netPosition = cashBalance + totalAR - totalAP

  // Recent invoices (last 5)
  const recentARInvoices = MOCK_AR_INVOICES.slice(0, 5)
  const recentAPInvoices = MOCK_AP_INVOICES.slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
              <p className="text-sm text-muted-foreground">Accounts Receivable, Payable & Cash Management</p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total AR */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAR)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {overdueAR.length} overdue invoice{overdueAR.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Total AP */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalAP)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {overdueAP.length} overdue bill{overdueAP.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Cash Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(cashBalance)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available funds
              </p>
            </CardContent>
          </Card>

          {/* Net Position */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Position</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netPosition)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cash + AR - AP
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(overdueAR.length > 0 || overdueAP.length > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueAR.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-orange-800">
                    <strong>{overdueAR.length}</strong> overdue receivable{overdueAR.length !== 1 ? 's' : ''} totaling{' '}
                    <strong>{formatCurrency(overdueAR.reduce((sum, inv) => sum + inv.balance, 0))}</strong>
                  </p>
                  <Link href="/finance/ar">
                    <Button variant="outline" size="sm" className="gap-2">
                      Review <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
              {overdueAP.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-orange-800">
                    <strong>{overdueAP.length}</strong> overdue payable{overdueAP.length !== 1 ? 's' : ''} totaling{' '}
                    <strong>{formatCurrency(overdueAP.reduce((sum, inv) => sum + inv.balance, 0))}</strong>
                  </p>
                  <Link href="/finance/ap">
                    <Button variant="outline" size="sm" className="gap-2">
                      Review <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/finance/ar">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Accounts Receivable
                </CardTitle>
                <CardDescription>Manage customer invoices & payments</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/finance/ap">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Accounts Payable
                </CardTitle>
                <CardDescription>Manage vendor bills & payments</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/finance/payments">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Payments
                </CardTitle>
                <CardDescription>Track all payment transactions</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Invoices */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent AR */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Receivables</CardTitle>
                <Link href="/finance/ar">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Latest customer invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentARInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/finance/ar/${invoice.id}`} className="font-mono text-sm text-primary hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{invoice.customerName}</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(invoice.balance)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent AP */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Payables</CardTitle>
                <Link href="/finance/ap">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Latest vendor bills</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAPInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/finance/ap/${invoice.id}`} className="font-mono text-sm text-primary hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{invoice.vendorName}</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(invoice.balance)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
