'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Filter, Eye, XCircle, AlertTriangle, Package } from 'lucide-react'
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

  const goodsReceived = cancelTarget?.status === 'RECEIVED' || cancelTarget?.status === 'PARTIAL'

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
      header: 'PO Number',
      accessorKey: 'id' as keyof PurchaseOrder,
      cell: (item: PurchaseOrder) => <span className="font-medium text-primary">{item.id}</span>
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
      cell: (item: PurchaseOrder) => <span className="font-medium">Rp {item.totalAmount.toLocaleString()}</span>
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
        return (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
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
