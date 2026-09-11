'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  DollarSign, TrendingUp, FileText, Minus
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

const USAGE_KEY = 'jkj_tax_asset_usage'

interface UsageRecord {
  id: string          // assetId-type e.g. "1-ppn"
  amountUsed: number
  entries: Array<{ tanggal: string; jumlah: number; keterangan: string }>
}

// Mock data - akan di-replace dengan API call
const MOCK_TAX_ASSET_SUMMARY = {
  // PPN Import (Tax Input Credit)
  ppnImport: {
    totalAssets: 172837500, // Rp 172.8M
    used: 0,
    remaining: 172837500,
    utilizationRate: 0,
    count: 3,
    assets: [
      {
        id: '1',
        bc20Number: 'PIB-2026-001',
        amount: 86625000,
        amountUsed: 0,
        amountRemaining: 86625000,
        period: '2026-03',
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '2',
        bc20Number: 'PIB-2026-002',
        amount: 57750000,
        amountUsed: 0,
        amountRemaining: 57750000,
        period: '2026-03',
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '3',
        bc20Number: 'PIB-2026-003',
        amount: 28462500,
        amountUsed: 0,
        amountRemaining: 28462500,
        period: '2026-03',
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
    ],
  },

  // PPh 22 Import (Prepaid Income Tax)
  pph22Import: {
    totalAssets: 34875000, // Rp 34.9M
    used: 0,
    remaining: 34875000,
    utilizationRate: 0,
    count: 3,
    fiscalYear: 2026,
    assets: [
      {
        id: '1',
        bc20Number: 'PIB-2026-001',
        amount: 17437500,
        amountUsed: 0,
        amountRemaining: 17437500,
        fiscalYear: 2026,
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '2',
        bc20Number: 'PIB-2026-002',
        amount: 11625000,
        amountUsed: 0,
        amountRemaining: 11625000,
        fiscalYear: 2026,
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
      {
        id: '3',
        bc20Number: 'PIB-2026-003',
        amount: 5812500,
        amountUsed: 0,
        amountRemaining: 5812500,
        fiscalYear: 2026,
        status: 'AVAILABLE' as const,
        recordedDate: '2026-03-11',
      },
    ],
  },

  // Monthly PPN Reconciliation (March 2026)
  ppnReconciliation: {
    period: '2026-03',
    ppnMasukan: {
      ppnImport: 172837500,
      ppnDomestic: 0,
      total: 172837500,
    },
    ppnKeluaran: {
      total: 0, // No sales yet
    },
    netPPN: -172837500, // Creditable
    status: 'CREDITABLE' as const,
    amountCarryForward: 172837500,
  },
}

export default function TaxAssetsPage() {
  const summary = MOCK_TAX_ASSET_SUMMARY

  // Usage state (localStorage-backed)
  const [usages, setUsages] = useState<Record<string, UsageRecord>>({})
  const [pakaDialog, setPakaDialog] = useState<{ id: string; label: string; max: number } | null>(null)
  const [pakaJumlah, setPakaJumlah] = useState('')
  const [pakaKet, setPakaKet] = useState('')
  const [pakaTgl, setPakaTgl] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USAGE_KEY)
      if (raw) setUsages(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  function getUsed(id: string): number {
    return usages[id]?.amountUsed ?? 0
  }

  function openPakai(id: string, label: string, totalAsset: number) {
    const used = getUsed(id)
    setPakaDialog({ id, label, max: totalAsset - used })
    setPakaJumlah('')
    setPakaKet('')
    setPakaTgl(new Date().toISOString().slice(0, 10))
  }

  function savePakai() {
    if (!pakaDialog) return
    const jumlah = parseInt(pakaJumlah.replace(/\D/g, '')) || 0
    if (!jumlah) return
    const prev = usages[pakaDialog.id] ?? { id: pakaDialog.id, amountUsed: 0, entries: [] }
    const updated = {
      ...usages,
      [pakaDialog.id]: {
        id: pakaDialog.id,
        amountUsed: prev.amountUsed + jumlah,
        entries: [...prev.entries, { tanggal: pakaTgl, jumlah, keterangan: pakaKet || '-' }],
      },
    }
    localStorage.setItem(USAGE_KEY, JSON.stringify(updated))
    setUsages(updated)
    setPakaDialog(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (remaining: number, total: number) => {
    if (remaining <= 0) return 'bg-gray-100 text-gray-700'
    if (remaining < total) return 'bg-blue-100 text-blue-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusLabel = (remaining: number, total: number) => {
    if (remaining <= 0) return 'FULLY_USED'
    if (remaining < total) return 'PARTIALLY_USED'
    return 'AVAILABLE'
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tax Assets Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track PPN Import and PPh 22 prepaid tax assets from BC 2.0 imports
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PPN Import Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.ppnImport.remaining)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.ppnImport.count} assets • Tax input credit
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PPh 22 Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.pph22Import.remaining)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.pph22Import.count} assets • FY {summary.pph22Import.fiscalYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tax Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  summary.ppnImport.remaining + summary.pph22Import.remaining
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for offsetting
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                PPN Status (March)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                CREDITABLE
              </div>
              <p className="text-xs text-green-700 mt-1">
                Carry forward available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* PPN Import Assets */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  PPN Import Credits
                </CardTitle>
                <CardDescription>
                  Tax input credit (11%) from BC 2.0 imports
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-700">
                {summary.ppnImport.count} assets
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {summary.ppnImport.assets.map((asset) => {
                const uid = `${asset.id}-ppn`
                const used = getUsed(uid)
                const remaining = asset.amount - used
                return (
                  <div key={asset.id} className="p-4 border border-green-100 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-semibold">BC 2.0: {asset.bc20Number}</p>
                        <p className="text-sm text-muted-foreground">Period: {asset.period}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(remaining, asset.amount)}>
                          {getStatusLabel(remaining, asset.amount)}
                        </Badge>
                        {remaining > 0 && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openPakai(uid, `PPN ${asset.bc20Number}`, asset.amount)}>
                            <Minus className="h-3 w-3" />Catat Pemakaian
                          </Button>
                        )}
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Total Asset</p><p className="font-semibold text-green-600">{formatCurrency(asset.amount)}</p></div>
                      <div><p className="text-muted-foreground">Terpakai</p><p className="font-semibold">{formatCurrency(used)}</p></div>
                      <div><p className="text-muted-foreground">Remaining</p><p className="font-semibold text-green-600">{formatCurrency(Math.max(0, remaining))}</p></div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Utilization</span>
                        <span>{asset.amount > 0 ? ((used / asset.amount) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <Progress value={asset.amount > 0 ? Math.min(100, (used / asset.amount) * 100) : 0} className="h-2" />
                    </div>
                    {(usages[uid]?.entries ?? []).length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Riwayat Pemakaian:</p>
                        {usages[uid].entries.map((e, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{e.tanggal} — {e.keterangan}</span>
                            <span className="text-red-600">-{formatCurrency(e.jumlah)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* PPh 22 Import Assets */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  PPh 22 Import Prepaid
                </CardTitle>
                <CardDescription>
                  Prepaid income tax (2.5%) from BC 2.0 imports — terhubung ke Dual Billing BC 2.0 (<Link href="/finance/ap/dual-billing" className="text-blue-600 underline">lihat Dual Billing</Link>)
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                FY {summary.pph22Import.fiscalYear}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {summary.pph22Import.assets.map((asset) => {
                const uid = `${asset.id}-pph22`
                const used = getUsed(uid)
                const remaining = asset.amount - used
                return (
                  <div key={asset.id} className="p-4 border border-blue-100 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-semibold">BC 2.0: {asset.bc20Number}</p>
                        <p className="text-sm text-muted-foreground">FY {asset.fiscalYear}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(remaining, asset.amount)}>
                          {getStatusLabel(remaining, asset.amount)}
                        </Badge>
                        {remaining > 0 && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openPakai(uid, `PPh 22 ${asset.bc20Number}`, asset.amount)}>
                            <Minus className="h-3 w-3" />Catat Pemakaian
                          </Button>
                        )}
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Total Asset</p><p className="font-semibold text-blue-600">{formatCurrency(asset.amount)}</p></div>
                      <div><p className="text-muted-foreground">Terpakai</p><p className="font-semibold">{formatCurrency(used)}</p></div>
                      <div><p className="text-muted-foreground">Remaining</p><p className="font-semibold text-blue-600">{formatCurrency(Math.max(0, remaining))}</p></div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Utilization</span>
                        <span>{asset.amount > 0 ? ((used / asset.amount) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <Progress value={asset.amount > 0 ? Math.min(100, (used / asset.amount) * 100) : 0} className="h-2" />
                    </div>
                    {(usages[uid]?.entries ?? []).length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Riwayat Pemakaian:</p>
                        {usages[uid].entries.map((e, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{e.tanggal} — {e.keterangan}</span>
                            <span className="text-red-600">-{formatCurrency(e.jumlah)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* PPN Monthly Reconciliation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              PPN Monthly Reconciliation - {summary.ppnReconciliation.period}
            </CardTitle>
            <CardDescription>
              PPN Input (Masukan) vs PPN Output (Keluaran)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-2">
                  PPN Input (Credit)
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PPN Import</span>
                    <span className="font-semibold">
                      {formatCurrency(summary.ppnReconciliation.ppnMasukan.ppnImport)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PPN Domestic</span>
                    <span className="font-semibold">
                      {formatCurrency(summary.ppnReconciliation.ppnMasukan.ppnDomestic)}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-green-600">
                      {formatCurrency(summary.ppnReconciliation.ppnMasukan.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-900 mb-2">
                  PPN Output (Charge)
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From Sales</span>
                    <span className="font-semibold">
                      {formatCurrency(summary.ppnReconciliation.ppnKeluaran.total)}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-orange-600">
                      {formatCurrency(summary.ppnReconciliation.ppnKeluaran.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Net Position
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className="bg-green-100 text-green-700 mt-1">
                      {summary.ppnReconciliation.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carry Forward</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(summary.ppnReconciliation.amountCarryForward)}
                    </p>
                  </div>
                  <p className="text-xs text-blue-700">
                    ✓ Available for offsetting next month's PPN Output
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Catat Pemakaian */}
      <Dialog open={!!pakaDialog} onOpenChange={v => { if (!v) setPakaDialog(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-blue-600" />Catat Pemakaian — {pakaDialog?.label}
            </DialogTitle>
            <DialogDescription>
              Catat berapa pajak kredit yang digunakan untuk offset pajak keluaran atau PPh Badan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Tanggal</Label>
              <Input type="date" value={pakaTgl} onChange={e => setPakaTgl(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Jumlah yang Dipakai (Rp) <span className="text-red-500">*</span></Label>
              <Input
                placeholder="0"
                value={pakaJumlah}
                onChange={e => setPakaJumlah(e.target.value.replace(/\D/g, ''))}
              />
              {pakaDialog && (
                <p className="text-xs text-muted-foreground">Max tersedia: {formatCurrency(pakaDialog.max)}</p>
              )}
              {pakaDialog && parseInt(pakaJumlah || '0') > pakaDialog.max && (
                <p className="text-xs text-red-600">⚠ Melebihi saldo tersedia</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Keterangan</Label>
              <Input placeholder="Misal: Offset PPN Keluaran Mei 2026 / Bayar PPh Badan" value={pakaKet} onChange={e => setPakaKet(e.target.value)} />
            </div>
            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
              💡 Pastikan sesuai dengan pembayaran PPh 22 di <Link href="/finance/ap/dual-billing" className="underline font-medium">Dual Billing BC 2.0</Link> atau rekonsiliasi PPN bulanan.
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPakaDialog(null)}>Batal</Button>
            <Button
              disabled={!pakaJumlah || !pakaTgl || (pakaDialog ? parseInt(pakaJumlah) > pakaDialog.max : false)}
              onClick={savePakai}
              className="gap-2"
            >
              <Minus className="h-4 w-4" />Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
