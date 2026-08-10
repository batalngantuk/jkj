'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Box, Timer, AlertTriangle, CheckSquare,
  FileBarChart, Truck, Play, Pause, PackageCheck, ClipboardCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/status-badge'
import { StatusTimeline, TimelineStep } from '@/components/shared/status-timeline'
import AppLayout from '@/components/app-layout'
import { MOCK_BOMS } from '@/lib/mock-data/production'
import { useWorkOrders, useStock, useSalesOrders } from '@/lib/store/hooks'

const STATUS_ACTIONS: Record<string, { label: string; icon: React.ElementType; variant?: string }[]> = {
  'PLANNED': [
    { label: 'Mulai Produksi', icon: Play },
  ],
  'IN PROGRESS': [
    { label: 'Tahan (On Hold)', icon: Pause, variant: 'outline' },
    { label: 'Selesai → QC', icon: ClipboardCheck },
  ],
  'QC INSPECTION': [
    { label: 'QC Lulus → Selesai', icon: CheckSquare },
    { label: 'QC Gagal → Ulangi', icon: AlertTriangle, variant: 'destructive' },
  ],
  'COMPLETED': [],
  'ON HOLD': [
    { label: 'Lanjutkan Produksi', icon: Play },
  ],
}

export default function WorkOrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { getById, updateWorkOrder } = useWorkOrders()
  const { deductStock } = useStock()
  const { updateOrder } = useSalesOrders()
  const wo = getById(id)

  if (!wo) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Work Order tidak ditemukan: {id}</p>
          <Link href="/production/wo">
            <Button variant="outline" className="mt-4">Kembali ke Daftar WO</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const bom = MOCK_BOMS.find(b => b.id === wo.bomId)

  const timelineSteps: TimelineStep[] = [
    { id: '1', label: 'Dibuat / Planned', date: wo.startDate, status: 'completed' },
    {
      id: '2', label: 'In Production',
      status: wo.status === 'IN PROGRESS' ? 'current'
        : (wo.status === 'QC INSPECTION' || wo.status === 'COMPLETED') ? 'completed' : 'upcoming'
    },
    {
      id: '3', label: 'QC Inspection',
      status: wo.status === 'QC INSPECTION' ? 'current'
        : wo.status === 'COMPLETED' ? 'completed' : 'upcoming'
    },
    {
      id: '4', label: 'Selesai — BJ ke Gudang',
      date: wo.status === 'COMPLETED' ? wo.endDate : undefined,
      status: wo.status === 'COMPLETED' ? 'completed' : 'upcoming'
    },
  ]

  const actions = STATUS_ACTIONS[wo.status] || []

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/production/wo">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{wo.id}</h1>
              <p className="text-sm text-muted-foreground">Ref SO: {wo.soNumber}</p>
            </div>
            <StatusBadge status={wo.status} />
            {wo.priority === 'Urgent' && (
              <Badge variant="destructive" className="text-xs">Urgent</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Laporkan Masalah
            </Button>
            {actions.map((action) => {
              const Icon = action.icon
              const handleAction = () => {
                if (action.label === 'Mulai Produksi') {
                  if (bom) {
                    bom.items.forEach(item => {
                      deductStock(item.code, item.quantityPerUnit * wo.quantity, wo.id, 'WO', 'PRODUCTION_OUT', `satuan:${item.unit}`)
                    })
                  } else if (wo.bbItems?.length) {
                    wo.bbItems.forEach(item => {
                      deductStock(item.code, item.qty * wo.quantity, wo.id, 'WO', 'PRODUCTION_OUT', `satuan:${item.unit}`)
                    })
                  }
                  updateWorkOrder(wo.id, { status: 'IN PROGRESS', progress: 0 })
                }
                else if (action.label === 'Selesai → QC') updateWorkOrder(wo.id, { status: 'QC INSPECTION', progress: 90 })
                else if (action.label === 'QC Lulus → Selesai') {
                  updateWorkOrder(wo.id, { status: 'COMPLETED', progress: 100 })
                  if (wo.soNumber && wo.soNumber !== 'manual') {
                    updateOrder(wo.soNumber, { status: 'READY TO SHIP' })
                  }
                }
                else if (action.label === 'QC Gagal → Ulangi') updateWorkOrder(wo.id, { status: 'IN PROGRESS', progress: 50 })
                else if (action.label === 'Tahan (On Hold)') updateWorkOrder(wo.id, { status: 'ON HOLD' })
                else if (action.label === 'Lanjutkan Produksi') updateWorkOrder(wo.id, { status: 'IN PROGRESS' })
              }
              return (
                <Button
                  key={action.label}
                  size="sm"
                  variant={(action.variant as 'outline' | 'destructive' | 'default') || 'default'}
                  className="gap-2"
                  onClick={handleAction}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              )
            })}
            {wo.status === 'COMPLETED' && (
              <Link href="/warehouse/outbound">
                <Button size="sm" className="gap-2">
                  <PackageCheck className="h-4 w-4" />
                  Input BJ ke Gudang
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main — left 2 cols */}
          <div className="lg:col-span-2 space-y-6">

            {/* Production Info */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Produksi</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-muted-foreground">Produk</p>
                  <p className="font-semibold">{wo.product}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Line Produksi</p>
                  <p className="font-medium">{wo.line}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Qty</p>
                  <p className="font-semibold text-lg">{wo.quantity.toLocaleString()} carton</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jadwal</p>
                  <p className="font-medium">{wo.startDate} — {wo.endDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* BOM & Material */}
            <Card>
              <CardHeader>
                <CardTitle>Bill of Materials &amp; Konsumsi Bahan</CardTitle>
              </CardHeader>
              <CardContent>
                {bom ? (
                  <div className="space-y-4">
                    {bom.items.map(item => {
                      const totalReq = item.quantityPerUnit * wo.quantity
                      const consumed = totalReq * (wo.progress / 100)
                      return (
                        <div key={item.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{item.materialName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{item.code}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Kebutuhan total: {totalReq.toFixed(2)} {item.unit}</span>
                            <span>Terpakai (est.): {consumed.toFixed(2)} {item.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={wo.progress} className="h-1.5 flex-1" />
                            <span className="text-xs font-medium w-8">{wo.progress}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : wo.bbItems && wo.bbItems.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                      BOM resmi belum terdaftar. Menampilkan bahan baku yang diinput manual saat WO dibuat.
                    </p>
                    {wo.bbItems.map((item, i) => (
                      <div key={i} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{item.code}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Qty per unit: {item.qty} {item.unit}</span>
                          <span>Total kebutuhan: {(item.qty * wo.quantity).toFixed(2)} {item.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">BOM tidak tersedia untuk WO ini.</p>
                )}
              </CardContent>
            </Card>

            {/* History Log */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Aktivitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wo.history.map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-32 text-muted-foreground shrink-0">{h.date}</div>
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

          {/* Sidebar — right 1 col */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-1">{wo.progress}%</div>
                  <p className="text-sm text-muted-foreground">Tingkat Penyelesaian</p>
                </div>
                <StatusTimeline steps={timelineSteps} />
              </CardContent>
            </Card>

            {/* Traceability */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Traceability
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Source SO</span>
                  <span className="font-mono bg-white px-2 rounded border text-xs">{wo.soNumber}</span>
                </div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="flex justify-between items-center font-bold">
                  <span>WO (ini)</span>
                  <span className="font-mono bg-white px-2 rounded border border-blue-300 text-xs">{wo.id}</span>
                </div>
                {wo.status === 'COMPLETED' && (
                  <>
                    <div className="text-center text-muted-foreground">↓</div>
                    <div className="flex justify-between items-center text-green-700">
                      <span className="text-sm">Gudang BJ</span>
                      <Link href="/warehouse/outbound" className="text-xs underline">Lihat</Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* FG Location reminder */}
            {wo.status === 'COMPLETED' && (
              <Card className="bg-green-50/50 border-green-200">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <PackageCheck className="h-4 w-4" />
                    WO Selesai
                  </p>
                  <p className="text-xs text-green-700">
                    Barang jadi perlu diterima ke gudang agar stok diperbarui.
                  </p>
                  <Link href="/warehouse/outbound">
                    <Button size="sm" variant="outline" className="w-full mt-2 border-green-300 text-green-800">
                      Input BJ ke Gudang →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
