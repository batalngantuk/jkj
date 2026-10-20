'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Printer, FileText, Factory, Truck, AlertTriangle, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MOCK_CUSTOMERS } from '@/lib/mock-data/sales'
import { useSalesOrders, useWorkOrders, useFGReceipts, useShipments } from '@/lib/store/hooks'
import { StatusBadge } from '@/components/shared/status-badge'
import { StatusTimeline, TimelineStep } from '@/components/shared/status-timeline'
import { ApprovalButtonGroup } from '@/components/shared/approval-button-group'
import { DocumentViewer } from '@/components/shared/document-viewer'
import { AlertBadge } from '@/components/shared/alert-badge'
import AppLayout from '@/components/app-layout'

export default function SalesOrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { getById, updateOrder } = useSalesOrders()
  const { getBySoNumber } = useWorkOrders()
  const { receipts: fgReceipts } = useFGReceipts()
  const { shipments } = useShipments()

  // Edit dialog state
  const [showEdit, setShowEdit] = useState(false)
  const [editLines, setEditLines] = useState<{ id: string; label: string; satuan: string; qty: string; price: string }[]>([])
  const [editDelivery, setEditDelivery] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const order = getById(id)

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
  const relatedWOs = getBySoNumber(order.id)

  // Progress fulfillment
  const woIds = new Set(relatedWOs.map(w => w.id))
  const soFGReceipts = fgReceipts.filter(r => woIds.has(r.woId))
  const totalFGReceived = soFGReceipts.reduce((s, r) => s + r.qtyReceived, 0)
  const soShipments = shipments.filter(s => s.soId === order.id)
  const totalShipped = soShipments.reduce((s, sh) => s + sh.items.reduce((a, i) => a + i.qtyDikirim, 0), 0)
  const remainingToShip = Math.max(0, order.quantity - totalShipped)

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
    updateOrder(order.id, { status: 'APPROVED', progress: 0 })
  }

  const handleReject = () => {
    updateOrder(order.id, { status: 'REJECTED' })
  }

  const EDITABLE_STATUSES = ['DRAFT', 'PENDING APPROVAL', 'APPROVED', 'IN PRODUCTION']
  const canEdit = EDITABLE_STATUSES.includes(order.status)

  function openEdit() {
    if (!order) return
    setEditLines(order.lineItems && order.lineItems.length > 0
      ? order.lineItems.map(i => ({ id: i.id, label: i.namaBarang, satuan: i.satuan, qty: String(i.qty), price: String(i.hargaSatuan) }))
      : [{ id: 'single', label: order.product, satuan: 'carton', qty: String(order.quantity), price: String(order.unitPrice) }])
    setEditDelivery(order.deliveryDate)
    setShowEdit(true)
  }

  function updateEditLine(id: string, patch: Partial<{ qty: string; price: string }>) {
    setEditLines(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }

  const editTotalQty = editLines.reduce((s, l) => s + (Number(l.qty) || 0), 0)
  const editGrandTotal = editLines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0)
  const editBelowShipped = totalShipped > 0 && editTotalQty < totalShipped

  function saveEdit() {
    if (!order || editBelowShipped) return
    const newLines = editLines.map(l => ({ ...l, qtyNum: Number(l.qty) || 0, priceNum: Number(l.price) || 0 }))
    const detail = newLines.map(l => `${l.label}: qty ${l.qtyNum.toLocaleString('id-ID')}, harga ${l.priceNum.toLocaleString('id-ID')}`).join('; ')
    const patch: Partial<typeof order> = {
      quantity: editTotalQty,
      unitPrice: newLines[0]?.priceNum ?? order.unitPrice,
      total: editGrandTotal,
      deliveryDate: editDelivery || order.deliveryDate,
      history: [
        ...order.history,
        { date: new Date().toLocaleString('id-ID'), action: `Revisi (${order.status}): ${detail}`, user: 'Sales Admin', status: order.status }
      ]
    }
    if (order.lineItems && order.lineItems.length > 0) {
      patch.lineItems = order.lineItems.map(i => {
        const l = newLines.find(x => x.id === i.id)
        return l ? { ...i, qty: l.qtyNum, hargaSatuan: l.priceNum } : i
      })
    }
    updateOrder(order.id, patch)
    setShowEdit(false)
  }

  function printOrder() {
    if (!order) return
    const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const num = (n: number) => n.toLocaleString('id-ID')
    const lines = order.lineItems && order.lineItems.length > 0
      ? order.lineItems.map(i => ({ nama: i.namaBarang, kode: i.kodeBarang || '', qty: i.qty, satuan: i.satuan, harga: i.hargaSatuan, catatan: i.catatan || '' }))
      : [{ nama: order.product, kode: '', qty: order.quantity, satuan: 'carton', harga: order.unitPrice, catatan: '' }]
    const totalQty = lines.reduce((s, l) => s + l.qty, 0)
    const itemRows = lines.map((l, i) => `<tr><td class="c">${i + 1}</td><td>${esc(l.nama)}</td><td>${esc(l.kode)}</td><td class="r">${num(l.qty)}</td><td class="c">${esc(l.satuan)}</td><td class="r">${num(l.harga)}</td><td class="r b">${num(l.qty * l.harga)}</td></tr>`).join('')
    const bom = order.bomItems || []
    const bomRows = bom.map((b, i) => `<tr><td class="c">${i + 1}</td><td>${esc(b.namaMaterial)}</td><td>${esc(b.spesifikasi)}</td><td>${esc(b.warna)}</td><td class="r">${b.konsumsi === '' ? '' : esc(b.konsumsi)}</td><td class="c">${esc(b.satuan)}</td><td>${esc(b.penggunaan)}</td><td class="c">${esc(b.asalMaterial)}</td></tr>`).join('')
    const bomSection = bom.length > 0
      ? `<div class="section">MAIN MATERIAL</div><table><thead><tr><th class="c" style="width:32px">NO</th><th>MAIN MATERIAL NAME</th><th>SPEC</th><th>COLOR</th><th class="r">CONSUMTION</th><th class="c">SATUAN</th><th>USE</th><th class="c">SUPPLY</th></tr></thead><tbody>${bomRows}</tbody></table>`
      : ''
    const notesSection = order.notes ? `<div class="section">KETERANGAN</div><div class="notes">${esc(order.notes).split('\n').join('<br>')}</div>` : ''
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sales Order ${esc(order.id)}</title><style>
      @page{size:A4 landscape;margin:10mm}
      body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:0;padding:12px}
      table{width:100%;border-collapse:collapse;margin-bottom:8px}
      th,td{border:1px solid #333;padding:3px 6px;vertical-align:top}
      th{background:#e5e7eb;text-align:left;font-size:10px}
      .c{text-align:center}.r{text-align:right}.b{font-weight:bold}
      .title{text-align:center;font-size:15px;font-weight:bold;margin:0 0 8px}
      .head td{border:1px solid #333}.head .lbl{background:#f3f4f6;font-size:9px;color:#444;width:14%}
      .section{background:#d1d5db;text-align:center;font-weight:bold;border:1px solid #333;padding:2px;margin-top:6px}
      .notes{border:1px solid #333;padding:6px;min-height:40px;margin-bottom:8px}
      .sign td{width:25%;height:70px;text-align:center;font-size:11px}
      .foot{text-align:center;color:#6b7280;font-size:10px;margin-top:8px}
      @media print{button{display:none}}
    </style></head><body>
    <p class="title">${esc(order.customer).toUpperCase()} — SALES ORDER ${esc(order.id)}</p>
    <table class="head"><tr>
      <td class="lbl">MAIN FACTORY</td><td><b>PT. JKJ MANUFACTURING</b></td>
      <td class="lbl">PO NUMBER</td><td><b>${esc(order.poNumber)}</b></td>
      <td class="lbl">ORDER NUMBER</td><td><b>${esc(order.id)}</b></td>
      <td class="lbl">DELIVERY</td><td><b>${esc(order.deliveryDate)}</b></td>
    </tr><tr>
      <td class="lbl">BUYER</td><td>${esc(order.customer)}</td>
      <td class="lbl">STATUS</td><td>${esc(order.status)}</td>
      <td class="lbl">PRIORITAS</td><td>${esc(order.priority)}</td>
      <td class="lbl">DIBUAT OLEH</td><td>${esc(order.createdBy)}</td>
    </tr></table>
    <table><thead><tr><th class="c" style="width:32px">NO</th><th>PRODUK / TRADE NAME</th><th>KODE</th><th class="r">QTY</th><th class="c">SATUAN</th><th class="r">HARGA SATUAN</th><th class="r">SUBTOTAL</th></tr></thead>
    <tbody>${itemRows}<tr class="b"><td colspan="3" class="r">GRAND TOTAL</td><td class="r">${num(totalQty)}</td><td></td><td></td><td class="r">${num(order.total)}</td></tr></tbody></table>
    ${bomSection}
    ${notesSection}
    <table class="sign"><tr><td>Sales<br><br><br></td><td>Manager<br><br><br></td><td>Accounting<br><br><br></td><td>Direktur Utama<br><br><br></td></tr></table>
    <p class="foot">Dicetak ${new Date().toLocaleString('id-ID')}</p>
    <script>window.onload=function(){window.print()}</script></body></html>`)
    win.document.close()
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
              <Button variant="outline" className="gap-2" onClick={printOrder}>
                <Printer className="h-4 w-4" />
                Cetak Order
              </Button>
              {canEdit && (
                <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={openEdit}>
                  <Pencil className="h-4 w-4" />Edit Order
                </Button>
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
                          <th className="h-10 px-4 text-left font-medium">Kode</th>
                          <th className="h-10 px-4 text-right font-medium">Qty</th>
                          <th className="h-10 px-4 text-right font-medium">Satuan</th>
                          <th className="h-10 px-4 text-right font-medium">Harga Satuan</th>
                          <th className="h-10 px-4 text-right font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.lineItems && order.lineItems.length > 0 ? (
                          order.lineItems.map((item, i) => (
                            <tr key={item.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                              <td className="p-4 font-medium">{item.namaBarang}</td>
                              <td className="p-4 text-muted-foreground font-mono text-xs">{item.kodeBarang || '—'}</td>
                              <td className="p-4 text-right">{item.qty.toLocaleString('id-ID')}</td>
                              <td className="p-4 text-right text-muted-foreground">{item.satuan}</td>
                              <td className="p-4 text-right">{item.hargaSatuan.toLocaleString('id-ID')}</td>
                              <td className="p-4 text-right font-semibold">{(item.qty * item.hargaSatuan).toLocaleString('id-ID')}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-4 font-medium">{order.product}</td>
                            <td className="p-4 text-muted-foreground">—</td>
                            <td className="p-4 text-right">{order.quantity.toLocaleString('id-ID')}</td>
                            <td className="p-4 text-right text-muted-foreground">carton</td>
                            <td className="p-4 text-right">{order.unitPrice.toLocaleString('id-ID')}</td>
                            <td className="p-4 text-right font-semibold">{order.total.toLocaleString('id-ID')}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="text-lg font-bold">
                      Grand Total: {order.total.toLocaleString('id-ID')}
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

              {/* Progress Fulfillment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    Progress Fulfillment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Target Qty SO</p>
                      <p className="text-xl font-bold">{order.quantity.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">BJ Sudah Masuk Gudang</p>
                      <p className={`text-xl font-bold ${totalFGReceived >= order.quantity ? 'text-green-600' : 'text-amber-600'}`}>{totalFGReceived.toLocaleString('id-ID')}</p>
                      {soFGReceipts.length > 1 && <p className="text-xs text-muted-foreground">({soFGReceipts.length}x penerimaan)</p>}
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Sudah Dikirim ke Customer</p>
                      <p className={`text-xl font-bold ${totalShipped >= order.quantity ? 'text-green-600' : remainingToShip > 0 ? 'text-red-600' : 'text-foreground'}`}>{totalShipped.toLocaleString('id-ID')}</p>
                      {remainingToShip > 0 && <p className="text-xs text-red-500">Sisa: {remainingToShip.toLocaleString('id-ID')}</p>}
                    </div>
                  </div>
                  {soFGReceipts.length > 0 && (
                    <div className="text-xs space-y-1">
                      <p className="font-medium text-muted-foreground">Detail Penerimaan BJ:</p>
                      {soFGReceipts.map(r => (
                        <div key={r.id} className="flex justify-between text-muted-foreground border-b pb-1">
                          <span>{r.id} · {r.tanggal}</span>
                          <span className="font-medium">{r.qtyReceived.toLocaleString('id-ID')} {r.unit} ({r.gudangTujuan})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {soFGReceipts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">Belum ada BJ yang masuk dari WO terkait.</p>
                  )}
                </CardContent>
              </Card>

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

      {/* Edit Order Dialog */}
      <Dialog open={showEdit} onOpenChange={v => { if (!v) setShowEdit(false) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />Edit Order — {order.id}
            </DialogTitle>
            <DialogDescription>Revisi qty, harga, dan tanggal pengiriman Sales Order. Setiap revisi tercatat di riwayat aktivitas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {order.status !== 'DRAFT' && order.status !== 'PENDING APPROVAL' && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>SO sudah {order.status === 'APPROVED' ? 'disetujui' : 'masuk produksi'}. Pastikan Work Order dan kebutuhan material terkait disesuaikan setelah revisi.</span>
              </div>
            )}
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="h-9 px-3 text-left font-medium">Produk</th>
                    <th className="h-9 px-3 text-right font-medium w-32">Qty</th>
                    <th className="h-9 px-3 text-left font-medium w-16">Satuan</th>
                    <th className="h-9 px-3 text-right font-medium w-36">Harga Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {editLines.map(l => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{l.label}</td>
                      <td className="px-3 py-2"><Input type="number" min={0} className="h-8 text-right" value={l.qty} onChange={e => updateEditLine(l.id, { qty: e.target.value })} /></td>
                      <td className="px-3 py-2 text-muted-foreground">{l.satuan}</td>
                      <td className="px-3 py-2"><Input type="number" min={0} step="any" className="h-8 text-right" value={l.price} onChange={e => updateEditLine(l.id, { price: e.target.value })} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1">
              <Label>Tanggal Pengiriman</Label>
              <Input type="text" placeholder="e.g. 15 Feb 2026" value={editDelivery} onChange={e => setEditDelivery(e.target.value)} />
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
              <p className="text-muted-foreground">Total qty baru: <strong>{editTotalQty.toLocaleString('id-ID')}</strong> · Grand total baru: <strong>{editGrandTotal.toLocaleString('id-ID')}</strong></p>
              {editBelowShipped && (
                <p className="text-red-600">Total qty tidak boleh kurang dari qty yang sudah dikirim ({totalShipped.toLocaleString('id-ID')}).</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowEdit(false)}>Batal</Button>
            <Button onClick={saveEdit} disabled={editBelowShipped || editTotalQty <= 0} className="gap-2"><Pencil className="h-4 w-4" />Simpan Perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
