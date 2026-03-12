'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Ship, FileText, Calendar, DollarSign, MapPin, Package,
  CheckCircle, Clock, Send, Download, Upload, Printer,
  AlertCircle, ArrowRight, Truck
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// Mock data - akan di-replace dengan API call
const MOCK_PEB_DETAIL = {
  id: '1',
  pebNumber: 'PEB-2026-001',
  npeNumber: 'NPE-123456',
  documentDate: '2026-03-10',
  status: 'APPROVED',

  // Customer
  customer: {
    id: '1',
    customerCode: 'CUST-001',
    customerName: 'ABC Trading USA',
    country: 'United States',
    email: 'contact@abctrading.com',
    phone: '+1-555-0123',
  },

  // Sales Order (optional)
  salesOrder: {
    soNumber: 'SO-2026-001',
    soDate: '2026-03-05',
  },

  // Export Details
  destinationCountry: 'United States',
  destinationPort: 'Port of Los Angeles',
  portOfLoading: 'Tanjung Priok',
  customsOffice: 'KPBC Tanjung Priok',
  exportDate: '2026-03-15',
  estimatedDeparture: '2026-03-16',
  actualDeparture: null,

  // Shipping
  vesselName: 'MV Pacific Star',
  voyageNumber: 'VOY-2026-001',
  containerNumber: 'ABCD1234567',
  blNumber: 'BL-2026-001',
  sealNumber: 'SEAL-12345',

  // Financial
  fobValue: 125000,
  currency: 'USD',
  exchangeRate: 15500,
  fobIdr: 1937500000,
  vatRate: 0,
  vatAmount: 0,

  // Export Incentive
  exportIncentive: 0,
  incentiveType: null,

  // Optional Traceability
  workOrderId: 'WO-2026-001',
  fgLotNumber: 'FG-LOT-001',
  bc20Reference: 'PIB-2026-001',

  // Customs
  customsReleaseDate: '2026-03-14',
  customsReleaseRef: 'CUS-REL-2026-001',
  exportPermitNumber: 'PERMIT-2026-001',

  // Documents
  pebFile: 'peb-2026-001.pdf',
  invoiceFile: 'invoice-2026-001.pdf',
  packingListFile: 'packing-list-2026-001.pdf',
  blFile: null,
  coaFile: 'coa-2026-001.pdf',
  formEFile: null,
  healthCertFile: null,

  // Items
  items: [
    {
      id: '1',
      materialCode: 'FG-001',
      materialName: 'Steel Coil Grade A',
      hsCode: '7208.10.00',
      hsDescription: 'Flat-rolled products of iron',
      quantity: 100,
      uom: 'MT',
      unitPrice: 1250,
      totalPrice: 125000,
      packagingType: 'Bundle',
      numberOfPackages: 10,
      grossWeight: 102000,
      netWeight: 100000,
      lotNumber: 'LOT-001',
    },
  ],

  // Audit
  notes: 'Export to regular customer. ASEAN market.',
  createdBy: 'user@jkj.com',
  createdAt: '2026-03-10T10:00:00Z',
  submittedAt: '2026-03-10T14:00:00Z',
  submittedBy: 'user@jkj.com',
  approvedAt: '2026-03-14T09:00:00Z',
  approvedBy: 'customs@beacukai.go.id',
}

export default function PEBDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [peb, setPeb] = useState(MOCK_PEB_DETAIL)
  const [loading, setLoading] = useState(false)

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700'
      case 'VERIFIED':
        return 'bg-blue-100 text-blue-700'
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-700'
      case 'UNDER_REVIEW':
        return 'bg-orange-100 text-orange-700'
      case 'APPROVED':
        return 'bg-green-100 text-green-700'
      case 'EXPORTED':
        return 'bg-purple-100 text-purple-700'
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'DRAFT': return 12.5
      case 'VERIFIED': return 25
      case 'SUBMITTED': return 37.5
      case 'UNDER_REVIEW': return 50
      case 'APPROVED': return 75
      case 'EXPORTED': return 87.5
      case 'COMPLETED': return 100
      default: return 0
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    // TODO: Call API /api/peb/[id]/submit
    setTimeout(() => {
      setLoading(false)
      setPeb({ ...peb, status: 'SUBMITTED' })
      alert('PEB submitted to customs successfully')
    }, 1000)
  }

  const handleMarkExported = async () => {
    setLoading(true)
    // TODO: Call API /api/peb/[id]/export
    setTimeout(() => {
      setLoading(false)
      setPeb({ ...peb, status: 'EXPORTED', actualDeparture: new Date().toISOString() })
      alert('PEB marked as exported successfully')
    }, 1000)
  }

  const canSubmit = peb.status === 'DRAFT' || peb.status === 'VERIFIED'
  const canExport = peb.status === 'APPROVED'

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{peb.pebNumber}</h1>
              <Badge className={`text-lg px-3 py-1 ${getStatusColor(peb.status)}`}>
                {peb.status}
              </Badge>
              <Badge className="text-lg px-3 py-1 bg-green-100 text-green-700">
                PPN 0% (Export)
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Export to {peb.customer.customerName} - {peb.destinationCountry}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/logistics/peb')}>
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to List
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {canSubmit && (
              <Button onClick={handleSubmit} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Submit to Customs
              </Button>
            )}
            {canExport && (
              <Button onClick={handleMarkExported} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                <Ship className="h-4 w-4 mr-2" />
                Mark as Exported
              </Button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Export Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{peb.status}</span>
                  <span className="text-muted-foreground">
                    {getStatusProgress(peb.status).toFixed(0)}% Complete
                  </span>
                </div>
                <Progress value={getStatusProgress(peb.status)} className="h-2" />
              </div>

              <div className="grid grid-cols-7 gap-2 text-xs">
                <div className={`text-center p-2 rounded ${peb.status === 'DRAFT' || getStatusProgress(peb.status) > 12.5 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="font-semibold">DRAFT</div>
                </div>
                <div className={`text-center p-2 rounded ${getStatusProgress(peb.status) >= 25 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="font-semibold">VERIFIED</div>
                </div>
                <div className={`text-center p-2 rounded ${getStatusProgress(peb.status) >= 37.5 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="font-semibold">SUBMITTED</div>
                </div>
                <div className={`text-center p-2 rounded ${getStatusProgress(peb.status) >= 50 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                  <div className="font-semibold">REVIEW</div>
                </div>
                <div className={`text-center p-2 rounded ${getStatusProgress(peb.status) >= 75 ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="font-semibold">APPROVED</div>
                </div>
                <div className={`text-center p-2 rounded ${getStatusProgress(peb.status) >= 87.5 ? 'bg-purple-50' : 'bg-gray-50'}`}>
                  <div className="font-semibold">EXPORTED</div>
                </div>
                <div className={`text-center p-2 rounded ${getStatusProgress(peb.status) === 100 ? 'bg-slate-50' : 'bg-gray-50'}`}>
                  <div className="font-semibold">COMPLETED</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Customer & Destination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Customer & Destination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-semibold">{peb.customer.customerName}</p>
                    <p className="text-sm text-muted-foreground">{peb.customer.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="text-sm">{peb.customer.email}</p>
                    <p className="text-sm">{peb.customer.phone}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Destination
                    </p>
                    <p className="font-semibold">{peb.destinationPort}</p>
                    <p className="text-sm text-muted-foreground">{peb.destinationCountry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Port of Loading
                    </p>
                    <p className="font-semibold">{peb.portOfLoading}</p>
                    <p className="text-sm text-muted-foreground">{peb.customsOffice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vessel Name</p>
                    <p className="font-semibold">{peb.vesselName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Voyage Number</p>
                    <p className="font-semibold">{peb.voyageNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">B/L Number</p>
                    <p className="font-semibold">{peb.blNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Container Number</p>
                    <p className="font-semibold">{peb.containerNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seal Number</p>
                    <p className="font-semibold">{peb.sealNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Export Date</p>
                    <p className="font-semibold">
                      {new Date(peb.exportDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Export Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {peb.items.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="font-semibold">{item.materialName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.materialCode} | HS: {item.hsCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(item.totalPrice, peb.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">
                            {item.quantity.toLocaleString('id-ID')} {item.uom}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Unit Price</p>
                          <p className="font-medium">
                            {formatCurrency(item.unitPrice, peb.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Packaging</p>
                          <p className="font-medium">
                            {item.numberOfPackages} {item.packagingType}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Weight</p>
                          <p className="font-medium">
                            {item.netWeight.toLocaleString('id-ID')} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'PEB Document', file: peb.pebFile, required: true },
                    { name: 'Commercial Invoice', file: peb.invoiceFile, required: true },
                    { name: 'Packing List', file: peb.packingListFile, required: true },
                    { name: 'Bill of Lading', file: peb.blFile, required: false },
                    { name: 'Certificate of Origin', file: peb.coaFile, required: false },
                    { name: 'Form E (ASEAN)', file: peb.formEFile, required: false },
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className={`h-4 w-4 ${doc.file ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          {doc.file && (
                            <p className="text-xs text-muted-foreground">{doc.file}</p>
                          )}
                        </div>
                      </div>
                      {doc.file ? (
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Upload className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* FOB Summary */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">FOB Value</CardTitle>
                <CardDescription className="text-blue-700">
                  Zero-rated VAT (0% PPN)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">FOB Value ({peb.currency})</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(peb.fobValue, peb.currency)}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">FOB Value (IDR)</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(peb.fobIdr, 'IDR')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rate: {peb.exchangeRate.toLocaleString('id-ID')}
                  </p>
                </div>

                <Separator />

                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-green-900">PPN (VAT)</p>
                    <Badge className="bg-green-100 text-green-700">ZERO-RATED</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{peb.vatRate}%</p>
                  <p className="text-xs text-green-700 mt-1">
                    Export tax benefit - No output tax charged
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Optional Traceability */}
            {(peb.bc20Reference || peb.workOrderId || peb.fgLotNumber) && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm">Internal Traceability</CardTitle>
                  <CardDescription className="text-xs">
                    Optional - for internal tracking only
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {peb.bc20Reference && (
                    <div>
                      <p className="text-muted-foreground">BC 2.0 Import Reference</p>
                      <Link href={`/purchasing/bc20/${peb.bc20Reference}`}>
                        <p className="font-medium text-blue-600 hover:underline">
                          {peb.bc20Reference}
                        </p>
                      </Link>
                    </div>
                  )}
                  {peb.workOrderId && (
                    <div>
                      <p className="text-muted-foreground">Work Order</p>
                      <p className="font-medium">{peb.workOrderId}</p>
                    </div>
                  )}
                  {peb.fgLotNumber && (
                    <div>
                      <p className="text-muted-foreground">FG Lot Number</p>
                      <p className="font-medium">{peb.fgLotNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sales Order Reference */}
            {peb.salesOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sales Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">SO Number</p>
                    <p className="font-medium">{peb.salesOrder.soNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SO Date</p>
                    <p className="font-medium">
                      {new Date(peb.salesOrder.soDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customs Info */}
            {peb.customsReleaseRef && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm text-green-900 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Customs Clearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Release Reference</p>
                    <p className="font-medium">{peb.customsReleaseRef}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Release Date</p>
                    <p className="font-medium">
                      {new Date(peb.customsReleaseDate!).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  {peb.exportPermitNumber && (
                    <div>
                      <p className="text-muted-foreground">Export Permit</p>
                      <p className="font-medium">{peb.exportPermitNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(peb.createdAt).toLocaleString('id-ID')}
                  </p>
                  <p className="text-muted-foreground">{peb.createdBy}</p>
                </div>
                {peb.submittedAt && (
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {new Date(peb.submittedAt).toLocaleString('id-ID')}
                    </p>
                    <p className="text-muted-foreground">{peb.submittedBy}</p>
                  </div>
                )}
                {peb.approvedAt && (
                  <div>
                    <p className="text-muted-foreground">Approved</p>
                    <p className="font-medium">
                      {new Date(peb.approvedAt).toLocaleString('id-ID')}
                    </p>
                    <p className="text-muted-foreground">{peb.approvedBy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
