'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  BarChart3,
  Download,
  Filter,
  ChevronRight,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Topbar from '@/components/top-nav'
import Sidebar from '@/components/sidebar'

const FEATURED_REPORTS = [
  {
    id: 1,
    name: 'Production Efficiency Report',
    description: 'Track production line efficiency, downtime, and output targets',
    icon: TrendingUp,
    color: 'bg-blue-100',
    category: 'Production',
  },
  {
    id: 2,
    name: 'Material Traceability Report',
    description: 'Complete material flow tracking linked to BC 2.3 imports',
    icon: Package,
    color: 'bg-green-100',
    category: 'Inventory',
    href: '/reports/traceability',
  },
  {
    id: 3,
    name: 'Sales Performance Analysis',
    description: 'Monthly sales trends, customer analysis, and revenue metrics',
    icon: DollarSign,
    color: 'bg-purple-100',
    category: 'Sales',
  },
  {
    id: 4,
    name: 'Inventory Aging Report',
    description: 'Track aging inventory and slow-moving items by warehouse',
    icon: Clock,
    color: 'bg-orange-100',
    category: 'Warehouse',
  },
]

const REPORT_CATEGORIES = [
  'All',
  'Sales',
  'Purchasing',
  'Warehouse',
  'Production',
  'Logistics',
  'Finance',
  'Compliance',
]

const RECENT_REPORTS = [
  {
    id: 1,
    name: 'Weekly Sales Report',
    category: 'Sales',
    createdBy: 'Admin User',
    createdAt: '2026-02-05',
    format: 'PDF',
    status: 'Ready',
  },
  {
    id: 2,
    name: 'BC 2.3 Customs Summary',
    category: 'Compliance',
    createdBy: 'Finance Team',
    createdAt: '2026-02-04',
    format: 'Excel',
    status: 'Ready',
  },
  {
    id: 3,
    name: 'Production Output Analysis',
    category: 'Production',
    createdBy: 'Production Manager',
    createdAt: '2026-02-03',
    format: 'PDF',
    status: 'Ready',
  },
  {
    id: 4,
    name: 'Inventory Stock Report',
    category: 'Warehouse',
    createdBy: 'Warehouse Supervisor',
    createdAt: '2026-02-02',
    format: 'Excel',
    status: 'Generating',
  },
]

const SCHEDULED_REPORTS = [
  {
    id: 1,
    name: 'Monthly Revenue Report',
    category: 'Finance',
    frequency: 'Monthly',
    nextRun: '2026-03-01',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Inventory Stock Aging',
    category: 'Warehouse',
    frequency: 'Weekly',
    nextRun: '2026-02-12',
    status: 'Active',
  },
  {
    id: 3,
    name: 'BC 3.0 Export Tracking',
    category: 'Compliance',
    frequency: 'Daily',
    nextRun: '2026-02-06',
    status: 'Active',
  },
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedReport, setSelectedReport] = useState<number | null>(null)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate and track all business reports and analytics
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Custom Report
              </Button>
            </div>

            {/* Featured Reports */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Featured Reports</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {FEATURED_REPORTS.map((report) => {
                  const Icon = report.icon
                  const cardContent = (
                    <Card
                      key={report.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                    >
                      <div className="space-y-3 p-4">
                        <div className={`${report.color} inline-flex rounded-lg p-3`}>
                          <Icon className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{report.name}</h3>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-primary">{report.category}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Card>
                  )
                  return report.href ? (
                    <Link key={report.id} href={report.href}>
                      {cardContent}
                    </Link>
                  ) : (
                    cardContent
                  )
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">All Reports</h2>
              <div className="flex flex-wrap gap-2">
                {REPORT_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-primary' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Reports Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Report Generator */}
                <Card className="border border-border p-6">
                  <h3 className="mb-4 font-semibold text-foreground">Quick Report Generator</h3>
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">Report Type</label>
                        <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option>Sales Performance</option>
                          <option>Production Efficiency</option>
                          <option>Inventory Status</option>
                          <option>Financial Summary</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Date Range</label>
                        <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option>This Month</option>
                          <option>Last Month</option>
                          <option>Last 3 Months</option>
                          <option>This Year</option>
                        </select>
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                </Card>

                {/* Recent Reports Table */}
                <Card className="border border-border">
                  <div className="p-6">
                    <h3 className="mb-4 font-semibold text-foreground">Recent Reports</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Format</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {RECENT_REPORTS.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium text-foreground">
                                {report.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {report.category}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {report.createdBy}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {report.createdAt}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                  {report.format}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    report.status === 'Ready'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {report.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar - Scheduled Reports */}
              <div className="space-y-6">
                <Card className="border border-border p-6">
                  <h3 className="mb-4 font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Scheduled Reports
                  </h3>
                  <div className="space-y-3">
                    {SCHEDULED_REPORTS.map((report) => (
                      <div
                        key={report.id}
                        className="rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm text-foreground">{report.name}</p>
                            <p className="text-xs text-muted-foreground">{report.frequency}</p>
                          </div>
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Next: {report.nextRun}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Report Help */}
                <Card className="border border-border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-900 text-sm">Report Tips</h4>
                      <ul className="mt-2 space-y-1 text-xs text-yellow-800">
                        <li>• Use filters for faster report generation</li>
                        <li>• Schedule recurring reports to save time</li>
                        <li>• Export as PDF or Excel for sharing</li>
                        <li>• Reports are automatically archived</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
