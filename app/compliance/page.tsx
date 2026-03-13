'use client'

import Link from 'next/link'
import { FileText, CheckCircle, Clock, AlertTriangle, Package, TrendingUp, Activity, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AppLayout from '@/components/app-layout'
import { MOCK_TRACEABILITY } from '@/lib/mock-data/traceability'
import { generateStockMovementSummary, MOCK_STOCK_MOVEMENTS } from '@/lib/mock-data/stock-movements'

export default function ComplianceDashboardPage() {
  // BC 2.0 stats from traceability
  const totalTraceability = MOCK_TRACEABILITY.length
  const exportedTraceability = MOCK_TRACEABILITY.filter(t => t.pebId).length
  const pendingExport = totalTraceability - exportedTraceability

  // Stock Balance
  const stockSummaries = generateStockMovementSummary(MOCK_STOCK_MOVEMENTS)
  const totalMaterials = stockSummaries.length

  // Mock BC 2.0 summary stats
  const bc20Active: number = 5
  const bc20PendingTax: number = 2
  const bc20Cleared: number = 3
  const pebSubmitted: number = 4
  const pebPending: number = 1
  const pebApproved: number = 3

  // Recent Activities (static mock)
  const recentActivities = [
    { action: 'BC 2.0 Tax Payment Recorded', type: 'BC20', number: 'PIB-2026-002', user: 'Finance Team', date: '2026-03-13', notes: 'Bea Masuk + PPN + PPh 22 paid' },
    { action: 'Goods Receipt Approved', type: 'GR', number: 'GR-2026-003', user: 'Warehouse Manager', date: '2026-03-12', notes: null },
    { action: 'PEB Export Approved', type: 'PEB', number: 'PEB-2026-001', user: 'Customs Officer', date: '2026-03-11', notes: 'NPE issued by Bea Cukai' },
    { action: 'BC 2.0 SPPB Released', type: 'BC20', number: 'PIB-2026-003', user: 'Customs System', date: '2026-03-10', notes: 'Goods cleared for release' },
    { action: 'PEB Submitted to Customs', type: 'PEB', number: 'PEB-2026-002', user: 'Logistics Team', date: '2026-03-09', notes: null },
  ]

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customs Compliance Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor BC 2.0 (Regular Import) and PEB (Export) for Bea Cukai compliance</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BC 2.0 Active</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bc20Active}</div>
              <p className="text-xs text-muted-foreground">
                {bc20PendingTax} pending tax payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PEB Export Docs</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pebSubmitted}</div>
              <p className="text-xs text-muted-foreground">
                {pebPending} pending approval
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
                {exportedTraceability} exported via PEB
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

        {/* BC 2.0 & PEB Status */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* BC 2.0 Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>BC 2.0 Import Status</span>
                <Link href="/purchasing/bc20/dashboard">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending Tax Payment</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">{bc20PendingTax}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Cleared (SPPB Issued)</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{bc20Cleared}</Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Recent BC 2.0 Documents</h4>
                <div className="space-y-2">
                  {MOCK_TRACEABILITY.slice(0, 3).map(record => (
                    <Link key={record.id} href={`/purchasing/bc20/${record.bc20Id}`}>
                      <div className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded transition-colors">
                        <div>
                          <p className="text-sm font-mono">{record.bc20Number}</p>
                          <p className="text-xs text-muted-foreground">{record.rmDescription}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">CLEARED</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PEB Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>PEB Export Status</span>
                <Link href="/logistics/peb">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending NPE</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">{pebPending}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Approved (NPE Issued)</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{pebApproved}</Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Recent PEB Documents</h4>
                <div className="space-y-2">
                  {MOCK_TRACEABILITY.filter(r => r.pebId).slice(0, 3).map(record => (
                    <Link key={record.id} href={`/logistics/peb/${record.pebId}`}>
                      <div className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded transition-colors">
                        <div>
                          <p className="text-sm font-mono">{record.pebNumber}</p>
                          <p className="text-xs text-muted-foreground">{record.productName}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">APPROVED</Badge>
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
                {bc20PendingTax > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-900">BC 2.0 Tax Payment Due</p>
                    <p className="text-xs text-red-800 mt-1">
                      {bc20PendingTax} import document(s) with outstanding Bea Masuk / PPN / PPh 22
                    </p>
                    <Link href="/purchasing/bc20/dashboard">
                      <Button size="sm" variant="destructive" className="mt-2 gap-1 text-xs">
                        Pay Now
                      </Button>
                    </Link>
                  </div>
                )}
                {pendingExport > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-semibold text-orange-900">Pending Export (PEB)</p>
                    <p className="text-xs text-orange-800 mt-1">
                      {pendingExport} production record(s) not yet exported via PEB
                    </p>
                  </div>
                )}
                {bc20PendingTax === 0 && pendingExport === 0 && (
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
                <span>Material Traceability (BC 2.0)</span>
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
                    <span>Exported via PEB</span>
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
