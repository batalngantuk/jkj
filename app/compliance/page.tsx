'use client'

import React from 'react'
import Link from 'next/link'
import { FileText, CheckCircle, Clock, AlertTriangle, Package, TrendingUp, Activity, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AppLayout from '@/components/app-layout'
import { MOCK_BC23, MOCK_BC30, getBC23ByStatus, getBC30ByStatus } from '@/lib/mock-data/customs'
import { MOCK_TRACEABILITY } from '@/lib/mock-data/traceability'
import { generateStockMovementSummary, MOCK_STOCK_MOVEMENTS } from '@/lib/mock-data/stock-movements'

export default function ComplianceDashboardPage() {
  // BC 2.3 Stats
  const bc23Pending = getBC23ByStatus('SUBMITTED').length + getBC23ByStatus('UNDER REVIEW').length
  const bc23Approved = getBC23ByStatus('APPROVED').length
  const bc23Draft = getBC23ByStatus('DRAFT').length
  const bc23Total = MOCK_BC23.length

  // BC 3.0 Stats
  const bc30Pending = getBC30ByStatus('SUBMITTED').length + getBC30ByStatus('UNDER REVIEW').length
  const bc30Approved = getBC30ByStatus('APPROVED').length
  const bc30Draft = getBC30ByStatus('DRAFT').length
  const bc30Total = MOCK_BC30.length

  // Traceability Stats
  const totalTraceability = MOCK_TRACEABILITY.length
  const exportedTraceability = MOCK_TRACEABILITY.filter(t => t.bc30Id).length
  const traceabilityGaps = totalTraceability - exportedTraceability

  // Stock Balance
  const stockSummaries = generateStockMovementSummary(MOCK_STOCK_MOVEMENTS)
  const totalMaterials = stockSummaries.length

  // Recent Activities
  const recentActivities = [
    ...MOCK_BC23.flatMap(bc => bc.activities.map(a => ({ ...a, type: 'BC23', number: bc.bcNumber }))),
    ...MOCK_BC30.flatMap(bc => bc.activities.map(a => ({ ...a, type: 'BC30', number: bc.bcNumber })))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customs Compliance Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor BC 2.3, BC 3.0, and material traceability for Bea Cukai compliance</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BC 2.3 Active</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bc23Total}</div>
              <p className="text-xs text-muted-foreground">
                {bc23Pending} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BC 3.0 Active</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bc30Total}</div>
              <p className="text-xs text-muted-foreground">
                {bc30Pending} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Traceability Records</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTraceability}</div>
              <p className="text-xs text-muted-foreground">
                {exportedTraceability} exported
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials Tracked</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMaterials}</div>
              <p className="text-xs text-muted-foreground">
                Stock movement reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* BC 2.3 & BC 3.0 Status */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* BC 2.3 Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>BC 2.3 Import Status</span>
                <Link href="/purchasing/bc23">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium">Draft</span>
                  </div>
                  <Badge variant="outline">{bc23Draft}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending Review</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">{bc23Pending}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Approved (SPPB)</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{bc23Approved}</Badge>
                </div>
              </div>

              {/* Recent BC 2.3 */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Recent Documents</h4>
                <div className="space-y-2">
                  {MOCK_BC23.slice(0, 3).map(bc => (
                    <Link key={bc.id} href={`/purchasing/bc23/${bc.id}`}>
                      <div className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded transition-colors">
                        <div>
                          <p className="text-sm font-mono">{bc.bcNumber}</p>
                          <p className="text-xs text-muted-foreground">{bc.supplierName}</p>
                        </div>
                        <Badge className={
                          bc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          bc.status === 'UNDER REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {bc.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BC 3.0 Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>BC 3.0 Export Status</span>
                <Link href="/logistics/bc30">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium">Draft</span>
                  </div>
                  <Badge variant="outline">{bc30Draft}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending Review</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">{bc30Pending}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Approved (PEB)</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{bc30Approved}</Badge>
                </div>
              </div>

              {/* Recent BC 3.0 */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Recent Documents</h4>
                <div className="space-y-2">
                  {MOCK_BC30.slice(0, 3).map(bc => (
                    <Link key={bc.id} href={`/logistics/bc30/${bc.id}`}>
                      <div className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded transition-colors">
                        <div>
                          <p className="text-sm font-mono">{bc.bcNumber}</p>
                          <p className="text-xs text-muted-foreground">{bc.customerName}</p>
                        </div>
                        <Badge className={
                          bc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          bc.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {bc.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Traceability */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Alerts */}
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Compliance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bc23Pending > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900">BC 2.3 Pending Review</p>
                    <p className="text-xs text-yellow-800 mt-1">
                      {bc23Pending} import document(s) awaiting customs approval
                    </p>
                  </div>
                )}
                {bc30Pending > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900">BC 3.0 Pending Review</p>
                    <p className="text-xs text-yellow-800 mt-1">
                      {bc30Pending} export document(s) awaiting customs approval
                    </p>
                  </div>
                )}
                {traceabilityGaps > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-semibold text-orange-900">Traceability Gaps</p>
                    <p className="text-xs text-orange-800 mt-1">
                      {traceabilityGaps} production record(s) not yet exported
                    </p>
                  </div>
                )}
                {bc23Pending === 0 && bc30Pending === 0 && traceabilityGaps === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      All Clear
                    </p>
                    <p className="text-xs text-green-800 mt-1">
                      No pending compliance issues
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Traceability Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Material Traceability</span>
                <Link href="/reports/traceability">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View Report
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Records</span>
                  <span className="text-2xl font-bold">{totalTraceability}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Exported (BC 3.0)</span>
                    <span className="font-semibold text-green-600">{exportedTraceability}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(exportedTraceability / totalTraceability) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <Link href="/reports/stock-movement">
                    <Button variant="outline" className="w-full gap-2">
                      <Package className="h-4 w-4" />
                      View Stock Movement Report
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.type} {activity.number} • {activity.user}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {activity.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{activity.notes}</p>
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
