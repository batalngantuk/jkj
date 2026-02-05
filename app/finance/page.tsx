'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, TrendingUp, TrendingDown, AlertCircle, Plus, Download, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const METRIC_CARDS = [
  {
    title: 'Accounts Payable',
    value: 'Rp 1,250,000,000',
    subtitle: 'Due this week: 5 invoices',
    status: 'warning',
    icon: TrendingDown,
    color: 'text-red-500',
  },
  {
    title: 'Accounts Receivable',
    value: 'Rp 3,500,000,000',
    subtitle: 'Overdue: 3 invoices',
    status: 'warning',
    icon: TrendingUp,
    color: 'text-yellow-500',
  },
  {
    title: 'Cash Position',
    value: 'Rp 2,850,000,000',
    subtitle: 'Available balance',
    status: 'success',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    title: 'This Month Revenue',
    value: 'Rp 5,200,000,000',
    subtitle: '+15% vs last month',
    status: 'success',
    icon: TrendingUp,
    color: 'text-green-500',
  },
]

const AP_DATA = [
  {
    id: 'INV/LAT/001',
    vendor: 'PT Latex Indonesia',
    po: 'PO-2026-101',
    amount: 'Rp 950,000,000',
    dueDate: '12 Feb 2026',
    age: '7 days',
    status: 'Pending',
    statusColor: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'INV/CHEM/045',
    vendor: 'Chemical Suppliers',
    po: 'PO-2026-102',
    amount: 'Rp 12,500,000',
    dueDate: '08 Feb 2026',
    age: 'OVERDUE 3 days',
    status: 'Pending',
    statusColor: 'bg-red-100 text-red-800',
  },
]

const AR_DATA = [
  {
    id: 'SI-2026-001',
    customer: 'ABC Corporation',
    so: 'SO-2026-001',
    amount: 'USD 15,000',
    dueDate: '28 Feb 2026',
    age: 'Current',
    status: 'Outstanding',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 'SI-2026-002',
    customer: 'XYZ Global Ltd',
    so: 'SO-2026-002',
    amount: 'USD 9,500',
    dueDate: '15 Feb 2026',
    age: '10 days',
    status: 'Overdue',
    statusColor: 'bg-yellow-100 text-yellow-800',
  },
]

const QUICK_ACTIONS = [
  { label: 'Create Vendor Payment', icon: Plus },
  { label: 'Record Customer Payment', icon: Plus },
  { label: 'Generate Faktur Pajak', icon: Download },
  { label: 'Reconcile Bank Statement', icon: Download },
]

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ap', label: 'Accounts Payable' },
    { id: 'ar', label: 'Accounts Receivable' },
    { id: 'tax', label: 'Tax & Faktur' },
    { id: 'banking', label: 'Banking' },
    { id: 'reports', label: 'Reports' },
  ]

  return (
    <div className="flex h-screen flex-col">
      {/* Page Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage AP, AR, and financial operations</p>
          </div>
          <Link href="/finance/faktur">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <FileText className="h-4 w-4" />
              e-Faktur Management
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="space-y-6 p-6">
          {/* Financial Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {METRIC_CARDS.map((card, idx) => {
              const Icon = card.icon
              return (
                <Card key={idx} className="flex flex-col gap-4 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{card.subtitle}</p>
                    </div>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="h-1 w-full bg-secondary rounded-full"></div>
                </Card>
              )
            })}
          </div>

          {/* Cash Flow Chart Section */}
          {activeTab === 'overview' && (
            <>
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Cash Flow Trend (Last 6 Months)</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Cash In (Green), Cash Out (Red), Net Flow (Blue)</p>
                </div>
                <div className="h-64 w-full rounded-lg bg-secondary/50 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Cash flow chart visualization</p>
                    <p className="mt-2 text-sm text-muted-foreground">Integrates Recharts for line chart</p>
                  </div>
                </div>
              </Card>

              {/* Accounts Payable Section */}
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Accounts Payable</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Total Outstanding: <span className="font-semibold text-foreground">Rp 1,250,000,000</span></p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    New Invoice
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>PO Reference</TableHead>
                        <TableHead>Amount (IDR)</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {AP_DATA.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium text-primary">{row.id}</TableCell>
                          <TableCell>{row.vendor}</TableCell>
                          <TableCell>{row.po}</TableCell>
                          <TableCell className="font-medium">{row.amount}</TableCell>
                          <TableCell>{row.dueDate}</TableCell>
                          <TableCell className={row.age.includes('OVERDUE') ? 'text-red-600 font-medium' : ''}>{row.age}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${row.statusColor}`}>
                              {row.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                Match PO
                              </Button>
                              <Button size="sm" className="text-xs">
                                Pay
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Accounts Receivable Section */}
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Accounts Receivable</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Total Outstanding: <span className="font-semibold text-foreground">Rp 3,500,000,000</span></p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    New Invoice
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>SO Reference</TableHead>
                        <TableHead>Amount (USD)</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {AR_DATA.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium text-primary">{row.id}</TableCell>
                          <TableCell>{row.customer}</TableCell>
                          <TableCell>{row.so}</TableCell>
                          <TableCell className="font-medium">{row.amount}</TableCell>
                          <TableCell>{row.dueDate}</TableCell>
                          <TableCell>{row.age}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${row.statusColor}`}>
                              {row.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                Send Reminder
                              </Button>
                              <Button size="sm" className="text-xs">
                                Record Payment
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Quick Actions Sidebar */}
              <div className="grid gap-6 lg:grid-cols-4">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon
                  return (
                    <Card key={idx} className="flex flex-col gap-4 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-medium text-foreground">{action.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Quick access action</p>
                    </Card>
                  )
                })}
              </div>

              {/* Aging Summary */}
              <Card className="p-6">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Aging Summary</h2>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm font-medium text-muted-foreground">0-30 Days</p>
                    <p className="text-2xl font-bold text-foreground">Rp 2,100,000,000</p>
                    <p className="text-xs text-muted-foreground">60% of total</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm font-medium text-muted-foreground">31-60 Days</p>
                    <p className="text-2xl font-bold text-foreground">Rp 900,000,000</p>
                    <p className="text-xs text-muted-foreground">26% of total</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm font-medium text-muted-foreground">61-90 Days</p>
                    <p className="text-2xl font-bold text-foreground">Rp 300,000,000</p>
                    <p className="text-xs text-muted-foreground">8% of total</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm font-medium text-muted-foreground">&gt;90 Days</p>
                    <p className="text-2xl font-bold text-red-600">Rp 150,000,000</p>
                    <p className="text-xs text-muted-foreground">6% of total</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
