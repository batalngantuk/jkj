'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, FileText, Factory, Truck, CreditCard, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MOCK_SALES_ORDERS, MOCK_CUSTOMERS, MOCK_PRODUCTS } from "@/lib/mock-data/sales"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTimeline, TimelineStep } from "@/components/shared/status-timeline"
import { ApprovalButtonGroup } from "@/components/shared/approval-button-group"
import { DocumentViewer } from "@/components/shared/document-viewer"
import { AlertBadge } from "@/components/shared/alert-badge"
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'

export default function SalesorderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  // Find mock data
  const order = MOCK_SALES_ORDERS.find(o => o.id === id)
  
  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <Link href="/sales">
            <Button className="mt-4">Back to Sales</Button>
          </Link>
        </div>
      </div>
    )
  }

  const customer = MOCK_CUSTOMERS.find(c => c.name === order.customer) // Simple match for mock

  // Mock Timeline Steps
  const timelineSteps: TimelineStep[] = [
    { 
      id: '1', 
      label: 'Draft Created', 
      date: order.createdAt, 
      status: 'completed',
      description: `Created by ${order.createdBy}`
    },
    { 
      id: '2', 
      label: 'Manager Approval', 
      date: order.status === 'DRAFT' ? undefined : '2026-02-05 10:00', 
      status: order.status === 'DRAFT' ? 'current' : order.status === 'PENDING APPROVAL' ? 'current' : 'completed',
    },
    { 
      id: '3', 
      label: 'Production Planning', 
      status: order.status === 'IN PRODUCTION' ? 'current' : ['READY TO SHIP', 'COMPLETED'].includes(order.status) ? 'completed' : 'upcoming'
    },
    { 
      id: '4', 
      label: 'Shipping', 
      status: order.status === 'READY TO SHIP' ? 'current' : order.status === 'COMPLETED' ? 'completed' : 'upcoming'
    },
    { 
      id: '5', 
      label: 'Completed', 
      status: order.status === 'COMPLETED' ? 'completed' : 'upcoming'
    }
  ]

  const handleApprove = () => {
    alert("Order Approved! System will now trigger Production check.")
    // In real app, this would call API and refresh data
  }

  const handleReject = () => {
    alert("Order Rejected.")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
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
                  <p className="text-sm text-muted-foreground">Created on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={order.status} size="md" />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Order
                 </Button>
                 {order.status === 'DRAFT' && (
                    <Button className="bg-primary hover:bg-primary/90">Edit Order</Button>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Order Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Customer & PO Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Customer</p>
                        <p className="font-semibold text-lg">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{customer?.address || 'Address not available'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">PO Number</p>
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
                        <p className="text-sm text-muted-foreground mb-1">Delivery Date</p>
                        <p className="font-medium">{order.deliveryDate}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Priority</p>
                        <div className="inline-block">
                             {order.priority === 'Urgent' ? (
                                <AlertBadge type="critical" message="Urgent" />
                             ) : (
                                <span className="text-sm">Normal</span>
                             )}
                        </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ordered Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-secondary/50">
                                <tr className="border-b">
                                    <th className="h-10 px-4 text-left font-medium">Product</th>
                                    <th className="h-10 px-4 text-right font-medium">Quantity</th>
                                    <th className="h-10 px-4 text-right font-medium">Unit Price</th>
                                    <th className="h-10 px-4 text-right font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-4">{order.product}</td>
                                    <td className="p-4 text-right">{order.quantity.toLocaleString()}</td>
                                    <td className="p-4 text-right">Rp {order.unitPrice.toLocaleString()}</td>
                                    <td className="p-4 text-right font-semibold">Rp {order.total.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end mt-4">
                        <div className="flex justify-between w-64 text-lg font-bold">
                            <span>Total:</span>
                            <span>Rp {order.total.toLocaleString()}</span>
                        </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Approvals Action */}
                {(order.status === 'PENDING APPROVAL' || order.status === 'DRAFT') && (
                     <Card className="border-yellow-200 bg-yellow-50/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                Action Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                This order requires approval to proceed to production planning.
                            </p>
                            <ApprovalButtonGroup 
                                status="PENDING APPROVAL"
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        </CardContent>
                     </Card>
                )}

              </div>

              {/* Right Column: Workflow & Related */}
              <div className="space-y-6">
                
                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatusTimeline steps={timelineSteps} />
                  </CardContent>
                </Card>

                {/* Related Records */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Related Records</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {['IN PRODUCTION', 'READY TO SHIP', 'COMPLETED'].includes(order.status) && (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                                        <Factory className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Production Order</p>
                                        <p className="text-xs text-muted-foreground">WO-2026-001</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ArrowLeft className="h-4 w-4 rotate-180" />
                                </Button>
                            </div>
                        )}

                        {['READY TO SHIP', 'COMPLETED'].includes(order.status) && (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center">
                                        <Truck className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Shipment</p>
                                        <p className="text-xs text-muted-foreground">SH-2026-088</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ArrowLeft className="h-4 w-4 rotate-180" />
                                </Button>
                            </div>
                        )}

                        {['COMPLETED'].includes(order.status) && (
                             <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Invoice</p>
                                        <p className="text-xs text-muted-foreground">INV-2026-999</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ArrowLeft className="h-4 w-4 rotate-180" />
                                </Button>
                            </div>
                        )}
                        
                        {order.status === 'DRAFT' && (
                            <p className="text-sm text-muted-foreground italic text-center py-2">
                                No related records yet.
                            </p>
                        )}
                    </CardContent>
                </Card>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
