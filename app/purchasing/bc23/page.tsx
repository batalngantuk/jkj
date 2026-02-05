'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Upload, Check, X, ArrowLeft, FileText, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'

export default function BC23Form() {
  const [formData, setFormData] = useState({
    vesselName: 'MV Seatrade Harmony',
    billingNumber: 'BL-TH-2026-12345',
    portOfLoading: 'Bangkok (Thailand)',
    arrivalDate: '2026-02-10',
    exchangeRate: 15800,
  })

  const [uploadedDocs, setUploadedDocs] = useState({
    invoice: true,
    packingList: false,
    bol: true,
    coo: false,
  })

  // Calculate duties
  const cifValue = 65000 // USD
  const cifIDR = cifValue * formData.exchangeRate
  const importDuty = cifIDR * 0.05
  const vat = cifIDR * 0.11
  const totalDuties = importDuty + vat

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Breadcrumb and Header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/purchasing" className="hover:text-foreground">
                  Purchasing
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span>BC 2.3 Import Declaration</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    BC 2.3 - Import Declaration
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Document Number: BC-2.3-2026-001
                  </p>
                </div>
              </div>
            </div>

            {/* Reference Information Card */}
            <Card className="border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    PO Number
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    PO-2026-101
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Vendor
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    PT Latex Indonesia
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Import Value
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    USD 65,000
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Status
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-300">
                        Draft
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Form Sections */}
            <div className="space-y-6">
              {/* Section 1: Importer Information */}
              <Card className="border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-6 border-b border-border pb-4 text-lg font-bold text-foreground">
                  Section 1: Importer Information
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Company Name
                    </label>
                    <p className="mt-2 rounded bg-secondary p-3 text-foreground">
                      JKJ Manufacturing
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      NPWP (Tax Number)
                    </label>
                    <p className="mt-2 rounded bg-secondary p-3 text-foreground">
                      01.234.567.8-901.000
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      API (Import ID)
                    </label>
                    <p className="mt-2 rounded bg-secondary p-3 text-foreground">
                      API-12345
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Address
                    </label>
                    <p className="mt-2 rounded bg-secondary p-3 text-sm text-foreground">
                      Kawasan Industri MM2100, Bekasi
                    </p>
                  </div>
                </div>
              </Card>

              {/* Section 2: Goods Details */}
              <Card className="border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-6 border-b border-border pb-4 text-lg font-bold text-foreground">
                  Section 2: Goods Details
                </h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="text-foreground">HS Code</TableHead>
                        <TableHead className="text-foreground">Description</TableHead>
                        <TableHead className="text-foreground">Country of Origin</TableHead>
                        <TableHead className="text-right text-foreground">Quantity</TableHead>
                        <TableHead className="text-center text-foreground">Unit</TableHead>
                        <TableHead className="text-right text-foreground">FOB (USD)</TableHead>
                        <TableHead className="text-right text-foreground">Freight (USD)</TableHead>
                        <TableHead className="text-right text-foreground">Insurance (USD)</TableHead>
                        <TableHead className="text-right text-foreground">CIF (USD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-border hover:bg-secondary/30">
                        <TableCell className="font-mono text-sm text-foreground">
                          4001.2100
                        </TableCell>
                        <TableCell className="text-foreground">
                          Natural Latex in Primary Forms
                        </TableCell>
                        <TableCell className="text-foreground">Thailand</TableCell>
                        <TableCell className="text-right text-foreground">10,000</TableCell>
                        <TableCell className="text-center text-foreground">KG</TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          60,000
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          3,500
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          1,500
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          65,000
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Section 3: Transport & Documents */}
              <Card className="border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-6 border-b border-border pb-4 text-lg font-bold text-foreground">
                  Section 3: Transport & Documents
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Bill of Lading Number
                    </label>
                    <Input
                      value={formData.billingNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, billingNumber: e.target.value })
                      }
                      className="mt-2 border-border bg-background"
                      placeholder="BL-TH-2026-12345"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Vessel/Flight Name
                    </label>
                    <Input
                      value={formData.vesselName}
                      onChange={(e) =>
                        setFormData({ ...formData, vesselName: e.target.value })
                      }
                      className="mt-2 border-border bg-background"
                      placeholder="MV Seatrade Harmony"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Port of Loading
                    </label>
                    <Select defaultValue="bangkok">
                      <SelectTrigger className="mt-2 border-border bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bangkok">Bangkok (Thailand)</SelectItem>
                        <SelectItem value="singapore">Singapore</SelectItem>
                        <SelectItem value="hongkong">Hong Kong</SelectItem>
                        <SelectItem value="shanghai">Shanghai (China)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Port of Discharge
                    </label>
                    <Input
                      value="Tanjung Priok"
                      disabled
                      className="mt-2 border-border bg-secondary"
                      placeholder="Tanjung Priok"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-foreground">
                      Arrival Date
                    </label>
                    <Input
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) =>
                        setFormData({ ...formData, arrivalDate: e.target.value })
                      }
                      className="mt-2 border-border bg-background"
                    />
                  </div>
                </div>
              </Card>

              {/* Section 4: Document Uploads */}
              <Card className="border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-6 border-b border-border pb-4 text-lg font-bold text-foreground">
                  Section 4: Document Uploads
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { key: 'invoice', label: 'Commercial Invoice', required: true },
                    { key: 'packingList', label: 'Packing List', required: true },
                    { key: 'bol', label: 'Bill of Lading', required: true },
                    { key: 'coo', label: 'Certificate of Origin', required: false },
                  ].map((doc) => (
                    <div
                      key={doc.key}
                      className="flex items-center justify-between rounded-lg border-2 border-dashed border-border bg-secondary/20 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {doc.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.required ? 'Required' : 'Optional'}
                          </p>
                        </div>
                      </div>
                      {uploadedDocs[doc.key as keyof typeof uploadedDocs] ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Section 5: Duties Calculation */}
              <Card className="border border-green-600/30 bg-gradient-to-br from-card to-green-50/10 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-green-600/20">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-bold text-foreground">
                    Section 5: Duties Calculation (Auto-Calculated)
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">CIF Value (USD)</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      ${cifValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">Exchange Rate</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.exchangeRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            exchangeRate: parseInt(e.target.value),
                          })
                        }
                        className="border-border bg-background"
                      />
                      <span className="text-sm text-muted-foreground">/USD</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-4">
                    <p className="text-sm text-muted-foreground">CIF in IDR</p>
                    <p className="mt-2 text-xl font-bold text-primary">
                      Rp {cifIDR.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50/50 p-4">
                    <p className="text-sm text-muted-foreground">Import Duty (5%)</p>
                    <p className="mt-2 text-2xl font-bold text-orange-600">
                      Rp {importDuty.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50/50 p-4">
                    <p className="text-sm text-muted-foreground">VAT (11%)</p>
                    <p className="mt-2 text-2xl font-bold text-blue-600">
                      Rp {vat.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-green-600 bg-green-50/50 p-4">
                    <p className="text-sm font-semibold text-muted-foreground">
                      TOTAL DUTIES
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-600">
                      Rp {totalDuties.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between">
              <Link href="/purchasing">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Button>
              </Link>
              <div className="flex gap-3">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Print Preview
                </Button>
                <Button variant="outline">Save Draft</Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Submit to Customs
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
