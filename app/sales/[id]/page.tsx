'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, FileText, Factory, Truck, CreditCard, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_SALES_ORDERS, MOCK_CUSTOMERS } from '@/lib/mock-data/sales'
import { MOCK_WORK_ORDERS } from '@/lib/mock-data/production'
import { StatusBadge } from '@/components/shared/status-badge'
import { StatusTimeline, TimelineStep } from '@/components/shared/status-timeline'
import { ApprovalButtonGroup } from '@/components/shared/approval-button-group'
import { DocumentViewer } from '@/components/shared/document-viewer'
import { AlertBadge } from '@/components/shared/alert-badge'
import AppLayout from '@/components/app-layout'

export default function SalesOrderDetailPage() {
  const params = useParams()
  const id = params.id as string

  const order = MOCK_SALES_ORDERS.find(o => o.id === id)

  if (!order) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Sales Order tidak ditemukan: {id}</p>
          <Link href="/sales">
            <Button variant="outline" className="mt-4">Kembali ke Sales Orders</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const customer = MOCK_CUSTOMERS.find(c => c.name === order.customer)

  // Find related WOs from mock production data
  const relatedWOs = MOCK_WORK_ORDERS.filter(wo => wo.soNumber === order.id)

  const timelineSteps: TimelineStep[] = [
    {
      id: '1',
      label: 'Draft Dibuat',
      date: order.createdAt,
      status: 'completed',
      description: `Dibuat oleh ${order.createdBy}`
    },
    {
      id: '2',
      label: 'Persetujuan Manager',
      date: order.status === 'DRAFT' ? undefined : undefined,
      status: order.status === 'DRAFT' ? 'upcoming'
        : order.status === 'PENDING APPROVAL' ? 'current'
        : 'completed',
    },
    {
      id: '3',
      label: 'Perencanaan Produksi',
      status: order.status === 'IN PRODUCTION' ? 'current'
        : ['READY TO SHIP', 'COMPLETED'].includes(order.status) ? 'completed'
        : 'upcoming'
    },
    {
      id: '4',
      label: 'Pengiriman',
      status: order.status === 'READY TO SHIP' ? 'current'
        : order.status === 'COMPLETED' ? 'completed'
        : 'upcoming'
    },
    {
      id: '5',
      label: 'Selesai',
      status: order.status === 'COMPLETED' ? 'completed' : 'upcoming'
    }
  ]

  const handleApprove = () => {
    alert('Order Approved! System akan trigger cek produksi.')
  }

  const handleReject = () => {
    alert('Order Rejected.')
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sales">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{order.id}</h1>
                <p className="text-sm text-muted-foreground">
                  Dibuat {new Date(order.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
              <StatusBadge status={order.status} size="md" />
              {order.priority === 'Urgent' && (
                <Badge variant="destructive" className="text-xs">Urgent</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Cetak Order
              </Button>
              {order.status === 'DRAFT' && (
                <Button className="bg-primary hover:bg-primary/90">Edit Order</Button>
              )}
              {order.status === 'APPROVED' && (
                <Link href={`/production/wo/new?so=${order.id}`}>
                  <Button className="gap-2">
                    <Factory className="h-4 w-4" />
                    Buat Work Order
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Order Info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Customer & PO */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Order</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Customer</p>
                    <p className="font-semibold text-lg">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{customer?.address || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">No. PO Customer</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg">{order.poNumber}</p>
                      {order.poDocumentUrl && (
                        <DocumentViewer
                          filename={order.poNumber}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tanggal Pengiriman</p>
                    <p className="font-medium">{order.deliveryDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prioritas</p>
                    {order.priority === 'Urgent'
                      ? <AlertBadge type="critical" message="Urgent" />
                      : <span className="text-sm">Normal</span>
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Item yang Dipesan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="h-10 px-4 text-left font-medium">Produk</th>
                          <th className="h-10 px-4 text-right font-medium">Qty</th>
                          <th className="h-10 px-4 text-right font-medium">Harga Satuan</th>
                          <th className="h-10 px-4 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-4">{order.product}</td>
                          <td className="p-4 text-right">{order.quantity.toLocaleString()} carton</td>
                          <td className="p-4 text-right">Rp {order.unitPrice.toLocaleString()}</td>
                          <td className="p-4 text-right font-semibold">Rp {order.total.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="text-lg font-bold">
                      Total: Rp {order.total.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Action */}
              {(order.status === 'PENDING APPROVAL' || order.status === 'DRAFT') && (
                <Card className="border-yellow-200 bg-yellow-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Tindakan Diperlukan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Order ini memerlukan persetujuan sebelum lanjut ke produksi.
                    </p>
                    <ApprovalButtonGroup
                      status="PENDING APPROVAL"
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  </CardContent>
                </Card>
              )}

              {/* History */}
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Aktivitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.history.map((h, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-36 text-muted-foreground shrink-0">{h.date}</div>
                        <div>
                          <span className="font-medium">{h.action}</span>
                          <span className="text-muted-foreground ml-1">oleh {h.user}</span>
                          <span className="ml-2">
                            <Badge variant="outline" className="text-xs">{h.status}</Badge>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right: Timeline & Related */}
            <div className="space-y-6">

              <Card>
                <CardHeader>
                  <CardTitle>Progress Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatusTimeline steps={timelineSteps} />
                </CardContent>
              </Card>

              {/* Related Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dokumen Terkait</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">

                  {/* Work Orders */}
                  {relatedWOs.length > 0 ? (
                    relatedWOs.map(wo => (
                      <Link key={wo.id} href={`/production/wo/${wo.id}`} className="block">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                              <Factory className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Work Order</p>
                              <p className="text-xs text-muted-foreground">{wo.id} — {wo.status}</p>
                            </div>
                          </div>
                          <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    ['IN PRODUCTION', 'READY TO SHIP', 'COMPLETED'].includes(order.status) && (
                      <div className="flex items-center p-3 border rounded-lg bg-secondary/10">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                            <Factory className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Work Order</p>
                            <p className="text-xs text-muted-foreground">Sedang berjalan</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {order.status === 'APPROVED' && relatedWOs.length === 0 && (
                    <Link href={`/production/wo/new?so=${order.id}`}>
                      <div className="flex items-center justify-between p-3 border-2 border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                            <Factory className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Buat Work Order</p>
                            <p className="text-xs text-muted-foreground">Order sudah disetujui</p>
                          </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180 text-primary" />
                      </div>
                    </Link>
                  )}

                  {['READY TO SHIP', 'COMPLETED'].includes(order.status) && (
                    <Link href="/warehouse/outbound">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Pengiriman</p>
                            <p className="text-xs text-muted-foreground">Warehouse → Outbound</p>
                          </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                      </div>
                    </Link>
                  )}

                  {order.status === 'DRAFT' && relatedWOs.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-2">
                      Belum ada dokumen terkait.
                    </p>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
