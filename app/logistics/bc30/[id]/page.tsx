'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, FileText, CheckCircle, Upload, Download, Calendar, User, Package, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/components/app-layout'
import { StatusTimeline } from '@/components/shared/status-timeline'
import { TraceabilityChain, TraceabilityStep } from '@/components/customs/traceability-chain'
import { MOCK_BC30, MOCK_HS_CODES } from '@/lib/mock-data/customs'
import { MOCK_TRACEABILITY } from '@/lib/mock-data/traceability'

export default function BC30DetailPage() {
  const params = useParams()
  const bc30 = MOCK_BC30.find(bc => bc.id === params.id) || MOCK_BC30[0]
  const hsCodeInfo = MOCK_HS_CODES.find(hs => hs.code === bc30.hsCode)
  
  // Get traceability data
  const traceability = MOCK_TRACEABILITY.find(t => t.bc30Id === bc30.id)

  const statusSteps = [
    { id: '1', label: 'Draft', status: 'complete' as const, date: bc30.createdAt },
    { id: '2', label: 'Verified', status: bc30.status === 'VERIFIED' || bc30.status === 'SUBMITTED' || bc30.status === 'APPROVED' ? 'completed' as const : 'upcoming' as const },
    { id: '3', label: 'Submitted', status: bc30.submissionDate ? 'completed' as const : 'upcoming' as const, date: bc30.submissionDate },
    { id: '4', label: 'Approved', status: bc30.status === 'APPROVED' ? 'completed' as const : 'upcoming' as const, date: bc30.approvalDate }
  ]

  // Build traceability chain if data exists
  let traceabilitySteps: TraceabilityStep[] = []
  if (traceability) {
    traceabilitySteps = [
      {
        type: 'BC23',
        id: traceability.bc23Id,
        number: traceability.bc23Number,
        description: traceability.rmDescription,
        date: traceability.grDate,
        quantity: `${traceability.rmQuantity.toLocaleString()} ${traceability.rmUnit}`,
        lotNumber: traceability.rmLotNumber,
        href: `/purchasing/bc23/${traceability.bc23Id}`
      },
      {
        type: 'WO',
        id: traceability.woId,
        number: traceability.woNumber,
        description: traceability.productName,
        date: traceability.productionDate,
        quantity: `${traceability.fgQuantity.toLocaleString()} ${traceability.fgUnit}`,
        lotNumber: traceability.fgLotNumber,
        href: `/production/wo/${traceability.woId}`
      },
      {
        type: 'BC30',
        id: bc30.id,
        number: bc30.bcNumber,
        description: bc30.goodsDescription,
        date: bc30.submissionDate || bc30.createdAt,
        quantity: `${bc30.quantity.toLocaleString()} ${bc30.unit}`,
        lotNumber: bc30.fgLotNumber
      }
    ]
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/logistics/bc30">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{bc30.bcNumber}</h1>
              <p className="text-sm text-muted-foreground">Export Declaration Detail</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            {bc30.status === 'DRAFT' && (
              <Button className="bg-primary hover:bg-primary/90">
                Submit to Customs
              </Button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline steps={statusSteps} />
            {bc30.pebNumber && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">PEB Issued</p>
                    <p className="text-sm text-green-700">Number: {bc30.pebNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reference Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales Order Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">SO Number</p>
                <Link href={`/sales/${bc30.soId}`} className="font-mono text-primary hover:underline">
                  {bc30.soNumber}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{bc30.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FG Lot Number</p>
                <p className="font-mono text-sm">{bc30.fgLotNumber || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{new Date(bc30.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium">{bc30.createdBy}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NPE</p>
                <p className="font-mono text-sm">{bc30.npe}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goods Details */}
        <Card>
          <CardHeader>
            <CardTitle>Goods Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">HS Code</p>
                <p className="font-mono text-lg font-semibold">{bc30.hsCode}</p>
                {hsCodeInfo && (
                  <p className="text-xs text-muted-foreground mt-1">{hsCodeInfo.description}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination Country</p>
                <p className="font-medium">{bc30.destinationCountry}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{bc30.goodsDescription}</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-xl font-semibold">{bc30.quantity.toLocaleString()} {bc30.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FOB Value</p>
                <p className="text-xl font-semibold text-primary">{bc30.currency} {bc30.fobValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traceability */}
        {traceability && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Material Traceability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TraceabilityChain 
                steps={traceabilitySteps}
                showConversion={true}
                conversionData={{
                  input: traceability.rmQuantity,
                  output: traceability.fgQuantity,
                  ratio: traceability.conversionRatio,
                  standardRatio: traceability.standardRatio,
                  variance: traceability.variance,
                  waste: traceability.waste
                }}
              />
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>BC 2.3 Reference:</strong> {bc30.bc23References.map(ref => (
                    <Link key={ref} href={`/purchasing/bc23/${ref}`} className="font-mono text-primary hover:underline ml-2">
                      {MOCK_TRACEABILITY.find(t => t.bc23Id === ref)?.bc23Number || ref}
                    </Link>
                  ))}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { key: 'commercialInvoice', label: 'Commercial Invoice', required: true },
                { key: 'packingList', label: 'Packing List', required: true },
                { key: 'certificateOfOrigin', label: 'Certificate of Origin', required: false },
                { key: 'healthCertificate', label: 'Health Certificate', required: false },
                { key: 'formE', label: 'Form E (ASEAN)', required: false }
              ].map((doc) => (
                <div key={doc.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">{doc.required ? 'Required' : 'Optional'}</p>
                    </div>
                  </div>
                  {bc30.documents[doc.key as keyof typeof bc30.documents] ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bc30.activities.map((activity, index) => (
                <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} • {new Date(activity.date).toLocaleString('id-ID')}
                    </p>
                    {activity.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
