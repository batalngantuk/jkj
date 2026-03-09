'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, FileText, CheckCircle, Upload, Download, Calendar, User, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/components/app-layout'
import { StatusTimeline } from '@/components/shared/status-timeline'
import { MOCK_BC23, MOCK_HS_CODES } from '@/lib/mock-data/customs'

export default function BC23DetailPage() {
  const params = useParams()
  const bc23 = MOCK_BC23.find(bc => bc.id === params.id) || MOCK_BC23[0]
  const hsCodeInfo = MOCK_HS_CODES.find(hs => hs.code === bc23.hsCode)

  const statusSteps = [
    { label: 'Draft', status: 'complete' as const, date: bc23.createdAt },
    { label: 'Submitted', status: bc23.submissionDate ? 'complete' as const : 'pending' as const, date: bc23.submissionDate },
    { label: 'Under Review', status: bc23.status === 'UNDER REVIEW' || bc23.status === 'APPROVED' ? 'complete' as const : 'pending' as const },
    { label: 'Approved', status: bc23.status === 'APPROVED' ? 'complete' as const : 'pending' as const, date: bc23.approvalDate }
  ]

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchasing/bc23">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{bc23.bcNumber}</h1>
              <p className="text-sm text-muted-foreground">Import Declaration Detail</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            {bc23.status === 'DRAFT' && (
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
            {bc23.sppbNumber && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">SPPB Issued</p>
                    <p className="text-sm text-green-700">Number: {bc23.sppbNumber}</p>
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
              <CardTitle className="text-base">Purchase Order Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">PO Number</p>
                <Link href={`/purchasing/po/${bc23.poId}`} className="font-mono text-primary hover:underline">
                  {bc23.poNumber}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{bc23.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lot Number</p>
                <p className="font-mono text-sm">{bc23.lotNumber || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{new Date(bc23.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium">{bc23.createdBy}</p>
                </div>
              </div>
              {bc23.submissionDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-sm font-medium">{new Date(bc23.submissionDate).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              )}
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
                <p className="font-mono text-lg font-semibold">{bc23.hsCode}</p>
                {hsCodeInfo && (
                  <p className="text-xs text-muted-foreground mt-1">{hsCodeInfo.description}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country of Origin</p>
                <p className="font-medium">{bc23.countryOfOrigin}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{bc23.goodsDescription}</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-xl font-semibold">{bc23.quantity.toLocaleString()} {bc23.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CIF Value</p>
                <p className="text-xl font-semibold text-primary">{bc23.currency} {bc23.cifValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duty Calculations */}
        <Card className="border-green-200 bg-gradient-to-br from-card to-green-50/20">
          <CardHeader>
            <CardTitle>Customs Duties Calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">Bea Masuk ({hsCodeInfo?.dutyRate}%)</p>
                <p className="text-xl font-bold text-orange-600">Rp {bc23.dutyAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">PPN ({hsCodeInfo?.ppnRate}%)</p>
                <p className="text-xl font-bold text-blue-600">Rp {bc23.ppnAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">PPh 22 ({hsCodeInfo?.pph22Rate}%)</p>
                <p className="text-xl font-bold text-purple-600">Rp {bc23.pph22Amount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-600">
                <p className="text-sm font-semibold text-green-900">Total Duties</p>
                <p className="text-2xl font-bold text-green-600">Rp {bc23.totalDuties.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                { key: 'billOfLading', label: 'Bill of Lading', required: true },
                { key: 'certificateOfOrigin', label: 'Certificate of Origin', required: false }
              ].map((doc) => (
                <div key={doc.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">{doc.required ? 'Required' : 'Optional'}</p>
                    </div>
                  </div>
                  {bc23.documents[doc.key as keyof typeof bc23.documents] ? (
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
              {bc23.activities.map((activity, index) => (
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
