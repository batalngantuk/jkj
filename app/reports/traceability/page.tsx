'use client'

import Link from 'next/link'
import { ChevronRight, Download, Printer as Print, Mail, ArrowLeft } from 'lucide-react'
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

export default function TraceabilityReport() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
            </Link>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Material Traceability</span>
              <ChevronRight className="h-4 w-4" />
              <span>Compliance Report</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Print className="h-4 w-4" />
              Print
            </Button>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Official Header */}
        <div className="border-b-2 border-primary pb-6 text-center">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Kementerian Keuangan Republik Indonesia
          </div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Direktorat Jenderal Bea dan Cukai
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            MATERIAL TRACEABILITY COMPLIANCE REPORT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            BC 2.3 Import to BC 3.0 Export Documentation Flow
          </p>
        </div>

        {/* Report Metadata */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Report Date</p>
              <p className="mt-1 font-medium text-foreground">15 February 2026</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Report Period</p>
              <p className="mt-1 font-medium text-foreground">Feb 2026</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Company</p>
              <p className="mt-1 font-medium text-foreground">JKJ Manufacturing</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">NPWP</p>
              <p className="mt-1 font-medium text-foreground">12.345.678.901-999</p>
            </div>
          </div>
        </Card>

        {/* Executive Summary */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-foreground">Executive Summary</h2>
          <Card className="border-l-4 border-l-primary p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Imports (BC 2.3)</p>
                <p className="mt-1 text-2xl font-bold text-primary">45 POs</p>
                <p className="mt-1 text-xs text-muted-foreground">Rp 2.5 Billion</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Materials Traced to Exports</p>
                <p className="mt-1 text-2xl font-bold text-green-600">42 POs</p>
                <p className="mt-1 text-xs text-muted-foreground">93.3% Coverage</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Export Value (BC 3.0)</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">Rp 4.8 Billion</p>
                <p className="mt-1 text-xs text-muted-foreground">Finalized</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Material Flow Diagram */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-foreground">Material Flow Overview</h2>
          <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-100 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-blue-900">IMPORT</p>
                <p className="text-sm font-bold text-blue-900">BC 2.3 Filed</p>
                <p className="text-xs text-blue-800">45 Purchase Orders</p>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-primary mx-2"></div>
              <div className="rounded-lg bg-yellow-100 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-yellow-900">IN WAREHOUSE</p>
                <p className="text-sm font-bold text-yellow-900">Stock Control</p>
                <p className="text-xs text-yellow-800">Material Tracking</p>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-primary mx-2"></div>
              <div className="rounded-lg bg-green-100 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-green-900">EXPORT</p>
                <p className="text-sm font-bold text-green-900">BC 3.0 Filed</p>
                <p className="text-xs text-green-800">42 Sales Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Traceability Table */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-foreground">Material Traceability Details</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Import Doc</TableHead>
                  <TableHead>Material Code</TableHead>
                  <TableHead>Qty Imported</TableHead>
                  <TableHead>Qty Used</TableHead>
                  <TableHead>Export Doc</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    import: 'BC.2.3/2026/001',
                    material: 'LAT-001',
                    imported: '5,000 kg',
                    used: '4,800 kg',
                    export: 'BC.3.0/2026/001',
                    status: 'Approved',
                  },
                  {
                    import: 'BC.2.3/2026/002',
                    material: 'NIT-002',
                    imported: '3,000 kg',
                    used: '2,950 kg',
                    export: 'BC.3.0/2026/002',
                    status: 'Approved',
                  },
                  {
                    import: 'BC.2.3/2026/003',
                    material: 'CHM-001',
                    imported: '500 L',
                    used: '480 L',
                    export: 'BC.3.0/2026/001',
                    status: 'Approved',
                  },
                  {
                    import: 'BC.2.3/2026/004',
                    material: 'PKG-005',
                    imported: '10,000 pcs',
                    used: '9,850 pcs',
                    export: 'BC.3.0/2026/003',
                    status: 'Pending',
                  },
                  {
                    import: 'BC.2.3/2026/005',
                    material: 'LAT-001',
                    imported: '2,500 kg',
                    used: '2,200 kg',
                    export: 'BC.3.0/2026/004',
                    status: 'Approved',
                  },
                ].map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.import}</TableCell>
                    <TableCell>{row.material}</TableCell>
                    <TableCell>{row.imported}</TableCell>
                    <TableCell>{row.used}</TableCell>
                    <TableCell className="text-blue-600">{row.export}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          row.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Material Balance */}
        <Card className="p-4">
          <h3 className="mb-4 font-bold text-foreground">Material Balance Sheet</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Total Imported Quantity</span>
              <span className="font-semibold text-foreground">45,000 kg</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Total Used in Production</span>
              <span className="font-semibold text-green-600">42,200 kg</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">Waste / Scrap</span>
              <span className="font-semibold text-yellow-600">1,800 kg (4%)</span>
            </div>
            <div className="flex justify-between bg-secondary/50 px-3 py-2 rounded">
              <span className="font-semibold text-foreground">Ending Inventory</span>
              <span className="font-bold text-primary">1,000 kg</span>
            </div>
          </div>
        </Card>

        {/* Compliance Statement */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-foreground">Compliance Statement</h2>
          <Card className="border-l-4 border-l-green-500 p-4">
            <p className="text-sm text-muted-foreground">
              JKJ Manufacturing hereby certifies that all materials imported under BC 2.3 declarations have been 
              properly tracked, accounted for, and traced to corresponding exports under BC 3.0 declarations. 
              The material balance discrepancies of 4% are within acceptable industry standards and attributed to 
              processing waste. All supporting documentation is available for DJP audit verification.
            </p>
          </Card>
        </div>

        {/* Signature Block */}
        <div className="border-t border-border pt-6">
          <p className="mb-4 text-sm font-semibold text-foreground">Authorized by:</p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Finance Manager</p>
              <div className="mt-8 h-16"></div>
              <p className="border-t border-border pt-2 text-xs font-semibold">Budi Santoso</p>
              <p className="text-xs text-muted-foreground">15 February 2026</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plant Manager</p>
              <div className="mt-8 h-16"></div>
              <p className="border-t border-border pt-2 text-xs font-semibold">Siti Nurhaliza</p>
              <p className="text-xs text-muted-foreground">15 February 2026</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 border-t border-border pt-6">
          <Link href="/reports">
            <Button variant="outline">Back to Reports</Button>
          </Link>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Email Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2 ml-auto">
            <Download className="h-4 w-4" />
            Download as PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
