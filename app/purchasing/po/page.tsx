'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Filter, Eye, XCircle, AlertTriangle, Package, Pencil, Paperclip, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import AppLayout from '@/components/app-layout'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { usePurchaseOrders } from '@/lib/store/hooks'
import { useTempStorage } from '@/lib/store/useTempStorage'
import type { PurchaseOrder } from '@/lib/mock-data/purchasing'

const LOKASI_SEMENTARA = ['Gudang Sementara A', 'Gudang Sementara B', 'Gudang WIP-1', 'Gudang WIP-2']

export default function POListPage() {
  const { orders, updateOrder, refresh } = usePurchaseOrders()
  const { addItem } = useTempStorage()

  const [cancelTarget, setCancelTarget] = useState<PurchaseOrder | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [toTempStorage, setToTempStorage] = useState(false)
  const [tempLokasi, setTempLokasi] = useState('Gudang Sementara A')

  // Amend PO qty
  const [amendTarget, setAmendTarget] = useState<PurchaseOrder | null>(null)
  const [amendQtys, setAmendQtys] = useState<Record<number, string>>({})
  const [amendReason, setAmendReason] = useState('')

  // Attachment viewer
  const [attachTarget, setAttachTarget] = useState<PurchaseOrder | null>(null)

  const goodsReceived = cancelTarget?.status === 'RECEIVED' || cancelTarget?.status === 'PARTIAL'

  function openAmend(po: PurchaseOrder) {
    setAmendTarget(po)
    setAmendQtys(Object.fromEntries(po.items.map((item, i) => [i, String(item.quantity)])))
    setAmendReason('')
  }

  function saveAmend() {
    if (!amendTarget) return
    const updatedItems = amendTarget.items.map((item, i) => ({
      ...item,
      quantity: parseInt(amendQtys[i]) || item.quantity,
      total: (parseInt(amendQtys[i]) || item.quantity) * item.unitPrice,
    }))
    const newTotal = updatedItems.reduce((s, it) => s + it.total, 0)
    updateOrder(amendTarget.id, { items: updatedItems, totalAmount: newTotal })
    setAmendTarget(null)
    refresh()
  }

  function openCancel(po: PurchaseOrder) {
    setCancelTarget(po)
    setCancelReason('')
    setToTempStorage(false)
    setTempLokasi('Gudang Sementara A')
  }

  function handleConfirmCancel() {
    if (!cancelTarget) return

    if (toTempStorage && goodsReceived) {
      // Masukkan setiap item ke temp storage
      const today = new Date().toISOString().split('T')[0]
      for (const item of cancelTarget.items) {
        addItem({
          materialCode: item.code,
          materialName: item.name,
          qty: item.quantity,
          unit: item.unit,
          unitCost: item.unitPrice,
          totalValue: item.total,
          location: tempLokasi,
          sourcePoId: cancelTarget.id,
          supplier: cancelTarget.supplier,
          cancelledDate: today,
          cancelReason,
          status: 'IN_STORAGE',
        })
      }
      updateOrder(cancelTarget.id, { status: 'CANCELLED_WITH_STOCK' })
    } else {
      updateOrder(cancelTarget.id, { status: 'CANCELLED' })
    }

    setCancelTarget(null)
    refresh()
  }

  const columns = [
    {
      header: 'No. PO',
      accessorKey: 'id' as keyof PurchaseOrder,
      cell: (item: PurchaseOrder) => (
        <div>
          <span className="font-medium text-primary">{item.poNumber || item.id}</span>
          {item.poNumber && item.poNumber !== item.id && (
            <p className="text-xs text-muted-foreground">{item.id}</p>
          )}
        </div>
      )
    },
    {
      header: 'Tipe',
      accessorKey: 'poType' as keyof PurchaseOrder,
      cell: (item: PurchaseOrder) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.poType === 'Impor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {item.poType}
        </span>
      )
    },
    { header: 'Supplier', accessorKey: 'supplier' as keyof PurchaseOrder },
    { header: 'Order Date', accessorKey: 'orderDate' as keyof PurchaseOrder },
    {
      header: 'Total Amount',
      cell: (item: PurchaseOrder) => (
        <div>
          <span className="font-medium">Rp {item.totalAmount.toLocaleString()}</span>
          {item.currency && item.currency !== 'IDR' && (
            <p className="text-xs text-muted-foreground">{item.currency}</p>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof PurchaseOrder,
      cell: (item: PurchaseOrder) => <StatusBadge status={item.status} />
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus' as keyof PurchaseOrder,
      cell: (item: PurchaseOrder) => {
        const map = { PAID: 'bg-green-100 text-green-800', PARTIAL: 'bg-yellow-100 text-yellow-800', UNPAID: 'bg-red-100 text-red-800' }
        return <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[item.paymentStatus]}`}>{item.paymentStatus}</span>
      }
    },
    {
      header: 'Aksi',
      cell: (item: PurchaseOrder) => {
        const cancellable = !['CANCELLED', 'CANCELLED_WITH_STOCK'].includes(item.status)
        const amendable = ['APPROVED', 'PARTIAL'].includes(item.status)
        const hasAttachments = (item.attachments?.length ?? 0) > 0
        return (
          <div className="flex gap-1">
            {hasAttachments && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 relative"
                onClick={() => setAttachTarget(item)}
                title={`${item.attachments!.length} lampiran`}
              >
                <Paperclip className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {item.attachments!.length}
                </span>
              </Button>
            )}
            {amendable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                onClick={() => openAmend(item)}
                title="Revisi Qty PO"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {cancellable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => openCancel(item)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchasing">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Purchase Orders</h1>
              <p className="text-sm text-muted-foreground">Manage purchasing and procurement orders</p>
            </div>
          </div>
          <Link href="/purchasing/po/create">
            <Button className="gap-2"><Plus className="h-4 w-4" />Create New PO</Button>
          </Link>
        </div>

        <Card>
          <CardHeader><CardTitle>PO List</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search PO..." className="pl-8" />
              </div>
              <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Status</Button>
            </div>
            <DataTable data={orders} columns={columns} />
          </CardContent>
        </Card>
      </div>

      {/* ── Dialog Amend PO Qty ── */}
      <Dialog open={!!amendTarget} onOpenChange={open => { if (!open) setAmendTarget(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-700">
              <Pencil className="h-5 w-5" />Revisi Qty — {amendTarget?.poNumber || amendTarget?.id}
            </DialogTitle>
          </DialogHeader>
          {amendTarget && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Ubah qty item di bawah. PO yang sudah berjalan tetap bisa direvisi qty-nya.</p>
              <div className="space-y-2">
                {amendTarget.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 items-center rounded border px-3 py-2">
                    <div className="col-span-2">
                      <p className="text-sm font-medium">{item.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{item.code} · {item.unit}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Qty baru</Label>
                      <Input
                        type="number"
                        value={amendQtys[i] ?? item.quantity}
                        onChange={e => setAmendQtys(prev => ({ ...prev, [i]: e.target.value }))}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">Saat ini: {item.quantity.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label>Alasan Revisi</Label>
                <Textarea placeholder="Alasan perubahan qty..." rows={2} value={amendReason} onChange={e => setAmendReason(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAmendTarget(null)}>Batal</Button>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={saveAmend}>
              <Pencil className="h-4 w-4 mr-2" />Simpan Revisi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Lampiran PO ── */}
      <Dialog open={!!attachTarget} onOpenChange={open => { if (!open) setAttachTarget(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-blue-600" />Lampiran — {attachTarget?.poNumber || attachTarget?.id}
            </DialogTitle>
          </DialogHeader>
          {attachTarget && (
            <div className="space-y-2 py-2">
              {(attachTarget.attachments ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Tidak ada lampiran</p>
              ) : (
                (attachTarget.attachments ?? []).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 rounded border px-3 py-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.size < 1024 ? `${f.size} B` : `${(f.size / 1024).toFixed(1)} KB`} · {f.type}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttachTarget(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Cancel PO ── */}
      <Dialog open={!!cancelTarget} onOpenChange={open => { if (!open) setCancelTarget(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />Cancel Purchase Order
            </DialogTitle>
          </DialogHeader>

          {cancelTarget && (
            <div className="space-y-4 py-2">
              {/* PO Info */}
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PO Number</span>
                  <span className="font-medium">{cancelTarget.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier</span>
                  <span>{cancelTarget.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span>Rp {cancelTarget.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status saat ini</span>
                  <StatusBadge status={cancelTarget.status} />
                </div>
              </div>

              {/* Warning jika barang sudah diterima */}
              {goodsReceived && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm">
                  <div className="flex items-start gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>Barang dari PO ini sudah diterima. Simpan ke stok sementara agar bisa dikeluarkan untuk ekspor jika ada permintaan serupa.</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Item dalam PO ini</Label>
                <div className="space-y-1">
                  {cancelTarget.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      <span className="text-muted-foreground">{item.quantity.toLocaleString()} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Temp storage toggle */}
              {goodsReceived && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="toTemp"
                      checked={toTempStorage}
                      onCheckedChange={v => setToTempStorage(v === true)}
                    />
                    <Label htmlFor="toTemp" className="cursor-pointer">
                      Pindahkan barang ke <strong>stok sementara</strong>
                    </Label>
                  </div>

                  {toTempStorage && (
                    <div className="space-y-1.5 pl-6">
                      <Label className="text-xs">Lokasi Penyimpanan</Label>
                      <Select value={tempLokasi} onValueChange={setTempLokasi}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LOKASI_SEMENTARA.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Alasan */}
              <div className="space-y-1.5">
                <Label>Alasan Cancel</Label>
                <Textarea
                  placeholder="Masukkan alasan pembatalan PO..."
                  rows={2}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>Tutup</Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              <XCircle className="h-4 w-4 mr-2" />Konfirmasi Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
