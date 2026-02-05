'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

export default function GoodsReceiptPage() {
  const [deliveredQty, setDeliveredQty] = useState({
    'LAT-001': 10000,
    'LAT-002': 4950,
  })

  const [qualityStatus, setQualityStatus] = useState({
    'LAT-001': 'Passed',
    'LAT-002': 'Passed',
  })

  const [storageLocation, setStorageLocation] = useState({
    'LAT-001': 'Bin A-01',
    'LAT-002': 'Bin A-02',
  })

  const [temperature, setTemperature] = useState('25')
  const [inspectionChecks, setInspectionChecks] = useState({
    packaging: true,
    contamination: true,
    labeling: true,
    documentation: true,
  })
  const [sampledForLab, setSampledForLab] = useState(false)
  const [uploads, setUploads] = useState({
    deliveryNote: null,
    qualityPhotos: null,
    weightTicket: null,
  })

  const items = [
    {
      code: 'LAT-001',
      description: 'Natural Latex Premium Grade',
      poQty: 10000,
      unit: 'KG',
      remarks: '-',
    },
    {
      code: 'LAT-002',
      description: 'Latex Compound B',
      poQty: 5000,
      unit: 'KG',
      remarks: 'Slight shortage',
    },
  ]

  const calculateVariance = (code) => {
    const qty = deliveredQty[code] || 0
    const poQty = items.find((i) => i.code === code)?.poQty || 0
    return qty - poQty
  }

  const getVarianceColor = (variance) => {
    if (variance === 0) return 'text-green-600 bg-green-50'
    if (variance < 0) return 'text-yellow-600 bg-yellow-50'
    return 'text-blue-600 bg-blue-50'
  }

  const totalOrdered = items.reduce((sum, item) => sum + item.poQty, 0)
  const totalReceived = Object.values(deliveredQty).reduce((a, b) => a + b, 0)
  const totalVariance = totalReceived - totalOrdered
  const variancePercent = ((totalVariance / totalOrdered) * 100).toFixed(2)

  const handleFileUpload = (field, file) => {
    if (file) {
      setUploads((prev) => ({
        ...prev,
        [field]: file.name,
      }))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page Header */}
        <div className="border-b border-border bg-card px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/warehouse" className="text-sm text-muted-foreground hover:text-foreground">
                  Warehouse
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Goods Receipt Entry</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-foreground">
                Goods Receipt Entry - GR-2026-001
              </h1>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Reference Section */}
            <Card className="border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Reference Information</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">PO Reference</p>
                  <Link href="#" className="mt-1 text-sm font-semibold text-primary hover:underline">
                    PO-2026-101
                  </Link>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Vendor</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">PT Latex Indonesia</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Surat Jalan</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">SJ/LAT/2026/001</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">BC 2.3 Reference</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">BC-2.3-2026-001</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      <CheckCircle className="h-3 w-3" />
                      Approved
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Receipt Date</p>
                  <Input
                    type="date"
                    defaultValue="2026-02-05"
                    className="mt-1 h-9 text-sm"
                  />
                </div>
              </div>
            </Card>

            {/* Items Verification Table */}
            <Card className="border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Items Verification</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow className="border-border hover:bg-secondary/50">
                      <TableHead className="h-10 text-xs font-semibold text-foreground">
                        Material Code
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-foreground">
                        Description
                      </TableHead>
                      <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                        PO Qty
                      </TableHead>
                      <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                        Delivered Qty
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold text-foreground">
                        Unit
                      </TableHead>
                      <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                        Variance
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-foreground">
                        Quality Status
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-foreground">
                        Storage Location
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-foreground">
                        Remarks
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const variance = calculateVariance(item.code)
                      return (
                        <TableRow
                          key={item.code}
                          className="border-border hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="text-sm font-semibold text-primary">
                            {item.code}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-right text-sm text-foreground">
                            {item.poQty.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={deliveredQty[item.code]}
                              onChange={(e) =>
                                setDeliveredQty((prev) => ({
                                  ...prev,
                                  [item.code]: Number(e.target.value),
                                }))
                              }
                              className="h-8 w-24 text-right text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-center text-sm text-foreground">
                            {item.unit}
                          </TableCell>
                          <TableCell className={`text-right text-sm font-semibold ${getVarianceColor(variance)}`}>
                            {variance} ({((variance / item.poQty) * 100).toFixed(2)}%)
                          </TableCell>
                          <TableCell>
                            <Select
                              value={qualityStatus[item.code]}
                              onValueChange={(val) =>
                                setQualityStatus((prev) => ({
                                  ...prev,
                                  [item.code]: val,
                                }))
                              }
                            >
                              <SelectTrigger className="h-8 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Passed">Passed</SelectItem>
                                <SelectItem value="Failed">Failed</SelectItem>
                                <SelectItem value="Hold">Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={storageLocation[item.code]}
                              onValueChange={(val) =>
                                setStorageLocation((prev) => ({
                                  ...prev,
                                  [item.code]: val,
                                }))
                              }
                            >
                              <SelectTrigger className="h-8 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Bin A-01">Bin A-01</SelectItem>
                                <SelectItem value="Bin A-02">Bin A-02</SelectItem>
                                <SelectItem value="Bin B-01">Bin B-01</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.remarks}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Section */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Total Ordered
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalOrdered.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Total Received
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalReceived.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Variance
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      totalVariance === 0
                        ? 'text-green-600'
                        : totalVariance < 0
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                    }`}
                  >
                    {totalVariance} ({variancePercent}%)
                  </p>
                </div>
              </div>
            </Card>

            {/* Quality Check Section */}
            <Card className="border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Quality Check</h2>
              <div className="space-y-6">
                {/* Temperature */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Temperature on Arrival (°C)
                    </label>
                    <Input
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="mt-2 h-10"
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>

                {/* Visual Inspection Checklist */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-foreground">Visual Inspection</p>
                  <div className="space-y-3">
                    {[
                      { key: 'packaging', label: 'Packaging intact' },
                      { key: 'contamination', label: 'No contamination' },
                      { key: 'labeling', label: 'Proper labeling' },
                      { key: 'documentation', label: 'Documentation complete' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center gap-3">
                        <Checkbox
                          id={item.key}
                          checked={inspectionChecks[item.key]}
                          onCheckedChange={(checked) =>
                            setInspectionChecks((prev) => ({
                              ...prev,
                              [item.key]: checked,
                            }))
                          }
                        />
                        <label htmlFor={item.key} className="text-sm text-foreground">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lab Sample */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sampled"
                    checked={sampledForLab}
                    onCheckedChange={setSampledForLab}
                  />
                  <label htmlFor="sampled" className="text-sm font-semibold text-foreground">
                    Sampled for lab test
                  </label>
                </div>

                {/* Inspector Details */}
                <div className="grid gap-4 md:grid-cols-2 border-t border-border pt-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground">
                      Quality Inspector Name
                    </label>
                    <Input className="mt-2 h-10" placeholder="Enter inspector name" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Signature</label>
                    <Input className="mt-2 h-10" placeholder="Digital signature" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Documents Section */}
            <Card className="border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Documents Upload</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { key: 'deliveryNote', label: 'Delivery Note Photo' },
                  { key: 'qualityPhotos', label: 'Quality Check Photos' },
                  { key: 'weightTicket', label: 'Weight Bridge Ticket' },
                ].map((doc) => (
                  <div
                    key={doc.key}
                    className="rounded-lg border-2 border-dashed border-border bg-secondary/30 p-4 text-center"
                  >
                    <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="mb-2 text-xs font-semibold text-foreground">{doc.label}</p>
                    <input
                      type="file"
                      id={doc.key}
                      accept=".pdf,.jpg,.png"
                      onChange={(e) =>
                        handleFileUpload(doc.key, e.target.files?.[0])
                      }
                      className="hidden"
                    />
                    {uploads[doc.key] ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary font-semibold truncate">
                          {uploads[doc.key]}
                        </span>
                        <button
                          onClick={() =>
                            setUploads((prev) => ({
                              ...prev,
                              [doc.key]: null,
                            }))
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor={doc.key} className="cursor-pointer">
                        <span className="text-xs text-primary hover:underline">Click to upload</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pb-6">
              <Link href="/warehouse">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button variant="outline" className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <CheckCircle className="h-4 w-4" />
                Complete GR & Update Stock
              </Button>
              <Button variant="outline" className="text-destructive hover:bg-destructive/10 bg-transparent">
                Reject Delivery
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Print GR Document
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
