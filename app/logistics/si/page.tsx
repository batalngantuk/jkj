'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Check, Upload, X, AlertCircle } from 'lucide-react'
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

export default function ShippingInstructionForm() {
  const [shippingMethod, setShippingMethod] = useState('air')
  const [incoterms, setIncoterms] = useState('FOB')
  const [documentUploads, setDocumentUploads] = useState({
    commercialInvoice: true,
    packingList: false,
    bl: false,
    certificateOfOrigin: true,
    healthCertificate: false,
  })

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar text-sidebar-foreground shadow-md">
        <div className="flex flex-col gap-6 p-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              Quick Access
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">JKJ</span>
              </div>
              <span className="text-lg font-bold text-foreground">JKJ Manufacturing</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/logistics" className="hover:text-foreground">
                Logistics
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Shipping Instruction</span>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* LEFT COLUMN - Shipping Instruction */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Shipping Instruction</h1>
                  <p className="mt-1 text-sm text-muted-foreground">SI-2026-001</p>
                </div>

                {/* SO Reference */}
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">SO Reference</p>
                  <Link href="/sales" className="text-primary hover:underline">
                    <p className="mt-1 font-semibold">SO-2026-001</p>
                  </Link>
                </Card>

                {/* Consignee Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Consignee Information</h3>
                  <Card className="space-y-3 p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="font-medium text-foreground">ABC Corporation</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm text-foreground">123 Medical Plaza, Los Angeles, CA 90001, USA</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="font-medium text-foreground">John Smith</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">+1-213-555-0100</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Shipment Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Shipment Details</h3>
                  <Card className="space-y-4 p-4">
                    <div>
                      <p className="mb-3 font-medium text-foreground">Shipping Method</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value="sea"
                            checked={shippingMethod === 'sea'}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Sea Freight</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value="air"
                            checked={shippingMethod === 'air'}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Air Freight</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value="land"
                            checked={shippingMethod === 'land'}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Land</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Incoterms</label>
                      <select
                        value={incoterms}
                        onChange={(e) => setIncoterms(e.target.value)}
                        className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option>FOB</option>
                        <option>CIF</option>
                        <option>EXW</option>
                        <option>DDP</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Port of Loading</label>
                      <Input
                        placeholder="Tanjung Priok, Jakarta"
                        className="mt-1"
                        defaultValue="Tanjung Priok, Jakarta"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Port of Discharge</label>
                      <Input
                        placeholder="Los Angeles, USA"
                        className="mt-1"
                        defaultValue="Los Angeles, USA"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Forwarder</label>
                      <select className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm">
                        <option>Maersk Logistics</option>
                        <option>DHL Global</option>
                        <option>FedEx International</option>
                      </select>
                    </div>
                  </Card>
                </div>

                {/* Cargo Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Cargo Details</h3>
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">Qty</TableHead>
                          <TableHead className="text-xs">Gross Wt</TableHead>
                          <TableHead className="text-xs">Volume</TableHead>
                          <TableHead className="text-xs">Container</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-sm">Latex Exam Gloves M</TableCell>
                          <TableCell className="text-sm">1,000 ctns</TableCell>
                          <TableCell className="text-sm">10,000 kg</TableCell>
                          <TableCell className="text-sm">45 CBM</TableCell>
                          <TableCell className="text-sm">1x40'HC</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Special Instructions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Special Instructions</h3>
                  <textarea
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Any special handling or delivery instructions..."
                  />
                </div>

                {/* Generate Documents */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Generate Documents</h3>
                  <Card className="space-y-2 p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                      <span className="text-sm">Delivery Order (DO)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                      <span className="text-sm">Bill of Lading (BL)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                      <span className="text-sm">Packing List</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                      <span className="text-sm">Commercial Invoice</span>
                    </label>
                  </Card>
                </div>
              </div>

              {/* RIGHT COLUMN - BC 3.0 Export Declaration */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">BC 3.0 - Export Declaration</h1>
                  <p className="mt-1 text-sm text-muted-foreground">BC-3.0-2026-001</p>
                  <div className="mt-2 inline-block rounded bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                    Draft
                  </div>
                </div>

                {/* Exporter Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Exporter Information</h3>
                  <Card className="space-y-3 p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="font-medium text-foreground">JKJ Manufacturing</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">NPWP</p>
                      <p className="font-medium text-foreground">01.234.567.8-901.000</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Export License</p>
                      <p className="font-medium text-foreground">EP-67890</p>
                    </div>
                  </Card>
                </div>

                {/* Goods Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Goods Details</h3>
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">HS Code</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs">Qty</TableHead>
                          <TableHead className="text-xs">FOB Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-sm">4015.1900</TableCell>
                          <TableCell className="text-sm">Exam Gloves Latex</TableCell>
                          <TableCell className="text-sm">1,000</TableCell>
                          <TableCell className="text-sm">USD 15,000</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Material Traceability */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Material Traceability (BC 2.3)</h3>
                  <Card className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Raw Material Source</p>
                        <Link href="#" className="mt-1 text-primary hover:underline">
                          <p className="font-medium">BC-2.3-2026-001</p>
                        </Link>
                        <p className="text-xs text-muted-foreground">Latex from Thailand</p>
                      </div>
                      <div className="rounded bg-green-100 px-2 py-1">
                        <p className="text-xs font-semibold text-green-800">Approved</p>
                      </div>
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Conversion Ratio: 1:1</p>
                    </div>
                  </Card>
                </div>

                {/* Document Uploads */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Required Documents</h3>
                  <Card className="space-y-3 p-4">
                    {[
                      {
                        key: 'commercialInvoice',
                        label: 'Commercial Invoice (PDF)',
                      },
                      {
                        key: 'packingList',
                        label: 'Packing List (PDF)',
                      },
                      {
                        key: 'bl',
                        label: 'BL/AWB (PDF)',
                      },
                      {
                        key: 'certificateOfOrigin',
                        label: 'Certificate of Origin Form E (PDF)',
                      },
                      {
                        key: 'healthCertificate',
                        label: 'Health Certificate (PDF)',
                      },
                    ].map((doc) => (
                      <div key={doc.key} className="flex items-center justify-between rounded border border-input p-3">
                        <span className="text-sm">{doc.label}</span>
                        {documentUploads[doc.key as keyof typeof documentUploads] ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Uploaded</span>
                          </div>
                        ) : (
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <Upload className="h-4 w-4" />
                            Upload
                          </button>
                        )}
                      </div>
                    ))}
                  </Card>
                </div>

                {/* Export Duties */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Export Duties Summary</h3>
                  <Card className="space-y-2 p-4">
                    <div className="flex items-center justify-between border-b border-input pb-2">
                      <p className="text-sm text-muted-foreground">FOB Value</p>
                      <p className="font-medium text-foreground">USD 15,000</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-input pb-2">
                      <p className="text-sm text-muted-foreground">Export Tax (0%)</p>
                      <p className="font-medium text-foreground">USD 0</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <p className="font-semibold text-foreground">Total</p>
                      <p className="font-bold text-primary">USD 15,000</p>
                    </div>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline">Save SI Draft</Button>
                  <Button variant="outline">Generate DO & BL</Button>
                  <Button variant="outline">Save BC 3.0 Draft</Button>
                  <Button className="bg-primary hover:bg-primary/90">Submit BC 3.0 to Customs</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
