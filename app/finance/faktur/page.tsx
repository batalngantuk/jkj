'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Download, Eye, Printer, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
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

const FAKTUR_DATA = [
  {
    id: 1,
    fakturNo: '010.000-26.00000001',
    siNo: 'SI-2026-001',
    customer: 'ABC Corporation',
    npwp: '02.345.678.9-012.000',
    invoiceDate: '05 Feb 2026',
    dpp: 135000000,
    ppn: 14850000,
    total: 149850000,
    status: 'uploaded',
  },
  {
    id: 2,
    fakturNo: '010.000-26.00000002',
    siNo: 'SI-2026-003',
    customer: 'MediSupply Inc',
    npwp: '03.456.789.0-123.000',
    invoiceDate: '06 Feb 2026',
    dpp: 260000000,
    ppn: 28600000,
    total: 288600000,
    status: 'approved',
  },
  {
    id: 3,
    fakturNo: '010.000-26.00000003',
    siNo: 'SI-2026-005',
    customer: 'XYZ Global Ltd',
    npwp: '04.567.890.1-234.000',
    invoiceDate: '07 Feb 2026',
    dpp: 85500000,
    ppn: 9405000,
    total: 94905000,
    status: 'draft',
  },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    uploaded: { label: 'Uploaded ✓', color: 'text-green-700', bg: 'bg-green-50' },
    approved: { label: 'Approved ✓', color: 'text-blue-700', bg: 'bg-blue-50' },
    draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-50' },
  }
  const config = statusConfig[status] || statusConfig.draft
  return <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>{config.label}</div>
}

export default function FakturPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Faktur Pajak Management</h1>
                <p className="mt-1 text-sm text-muted-foreground">Integration with DJP e-Faktur System</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month Faktur</p>
                    <h3 className="mt-2 text-2xl font-bold text-foreground">24</h3>
                    <p className="mt-2 text-xs text-muted-foreground">Total DPP: {formatCurrency(4500000000)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Total PPN: {formatCurrency(495000000)}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary/30" />
                </div>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-transparent p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Awaiting Upload to DJP</p>
                    <h3 className="mt-2 text-2xl font-bold text-yellow-700">3</h3>
                    <p className="mt-2 text-xs text-muted-foreground">Invoices pending submission</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500/30" />
                </div>
              </Card>

              <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-transparent p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected by DJP</p>
                    <h3 className="mt-2 text-2xl font-bold text-red-700">0</h3>
                    <p className="mt-2 text-xs text-muted-foreground">No rejected invoices</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500/30" />
                </div>
              </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by customer or NPWP..."
                  className="h-10 bg-secondary/30 placeholder:text-muted-foreground/50"
                />
              </div>
              <select className="h-10 rounded-md border border-border bg-card px-3 text-sm">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="uploaded">Uploaded</option>
                <option value="rejected">Rejected</option>
              </select>
              <select className="h-10 rounded-md border border-border bg-card px-3 text-sm">
                <option value="">Feb 2026</option>
                <option value="">Jan 2026</option>
                <option value="">Dec 2025</option>
              </select>
            </div>

            {/* Main Table */}
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-secondary/30">
                    <TableHead className="font-semibold text-foreground">Faktur No</TableHead>
                    <TableHead className="font-semibold text-foreground">Sales Invoice</TableHead>
                    <TableHead className="font-semibold text-foreground">Customer</TableHead>
                    <TableHead className="font-semibold text-foreground">NPWP</TableHead>
                    <TableHead className="font-semibold text-foreground">Invoice Date</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">DPP</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">PPN 11%</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Total</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAKTUR_DATA.map((item) => (
                    <TableRow key={item.id} className="border-b border-border hover:bg-secondary/10">
                      <TableCell className="font-medium text-primary">{item.fakturNo}</TableCell>
                      <TableCell>{item.siNo}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.npwp}</TableCell>
                      <TableCell className="text-sm">{item.invoiceDate}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(item.dpp)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(item.ppn)}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">{formatCurrency(item.total)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Printer className="h-4 w-4" />
                          </Button>
                          {item.status !== 'draft' && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bottom Section with Right Sidebar */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Tax Period Summary */}
              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground">Tax Period Summary - Feb 2026</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="bg-gradient-to-br from-blue-50 to-transparent p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <h4 className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(4500000000)}</h4>
                    <p className="mt-2 text-xs text-muted-foreground">All invoices this period</p>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-transparent p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Output VAT (PPN Keluaran)</p>
                    <h4 className="mt-2 text-2xl font-bold text-green-700">{formatCurrency(495000000)}</h4>
                    <p className="mt-2 text-xs text-muted-foreground">11% of total sales</p>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-transparent p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Input VAT (PPN Masukan)</p>
                    <h4 className="mt-2 text-2xl font-bold text-orange-700">{formatCurrency(164385000)}</h4>
                    <p className="mt-2 text-xs text-muted-foreground">From purchases & BC 2.3</p>
                  </Card>
                  <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/10 to-transparent p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">VAT Payable</p>
                    <h4 className="mt-2 text-2xl font-bold text-primary">{formatCurrency(330615000)}</h4>
                    <p className="mt-2 text-xs text-muted-foreground">Output - Input VAT</p>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Faktur Pajak
                  </Button>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Export Period Report
                  </Button>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Reconcile e-Faktur
                  </Button>
                </div>
              </div>

              {/* Right Sidebar - e-Faktur Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">e-Faktur Actions</h3>
                <Card className="space-y-4 p-6 shadow-sm">
                  <div>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Request Faktur Number Range
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground">Current Range:</p>
                    <p className="text-xs font-mono text-foreground">010.000-26.00000001</p>
                    <p className="text-xs font-mono text-foreground">010.000-26.00001000</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Bulk Upload to DJP
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">Upload 3 pending invoices</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Download CSV
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">For e-Faktur desktop app</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <FileText className="h-4 w-4" />
                      Generate SPT PPN
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">Monthly tax report</p>
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
