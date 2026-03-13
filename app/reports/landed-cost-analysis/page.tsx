'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Download, Package, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react'
import AppLayout from '@/components/app-layout'

const MOCK_LANDED_COSTS = [
  {
    bc20Id: '1', bcNumber: 'PIB-2026-001', supplier: 'Baosteel', grDate: '2026-03-10',
    material: 'Hot Rolled Coil', materialCode: 'RM-HRC-001', quantity: 100000, uom: 'kg',
    cifIDR: 950000000,
    components: {
      cif:            950000000,
      beaMasuk:       47500000,
      domesticFreight: 18500000,
      handlingFees:    9200000,
      customsBroker:   5000000,
      portCharges:     3800000,
      other:           0,
    },
    totalLandedCost: 1034000000,
    unitLandedCost: 10340,
    prevUnitCost: null,
    // Tax Assets (NOT in landed cost)
    ppnAsset: 108185000,
    pph22Asset: 27312500,
  },
  {
    bc20Id: '2', bcNumber: 'PIB-2026-002', supplier: 'POSCO', grDate: '2026-03-11',
    material: 'Cold Rolled Coil', materialCode: 'RM-CRC-001', quantity: 80000, uom: 'kg',
    cifIDR: 1200000000,
    components: {
      cif:             1200000000,
      beaMasuk:         60000000,
      domesticFreight:  22000000,
      handlingFees:     11500000,
      customsBroker:     5000000,
      portCharges:       4200000,
      other:             1500000,
    },
    totalLandedCost: 1304200000,
    unitLandedCost: 16303,
    prevUnitCost: 15800,
    ppnAsset: 136400000,
    pph22Asset: 34500000,
  },
  {
    bc20Id: '3', bcNumber: 'PIB-2026-003', supplier: 'Nippon Steel', grDate: null,
    material: 'Hot Rolled Coil', materialCode: 'RM-HRC-001', quantity: 85000, uom: 'kg',
    cifIDR: 850000000,
    components: {
      cif:             850000000,
      beaMasuk:         42500000,
      domesticFreight:  16000000,
      handlingFees:      8300000,
      customsBroker:     5000000,
      portCharges:       3400000,
      other:             0,
    },
    totalLandedCost: 925200000,
    unitLandedCost: 10885,
    prevUnitCost: 10340,
    ppnAsset: 96745000,
    pph22Asset: 24437500,
  },
]

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
const formatM = (v: number) =>
  v >= 1e9 ? `Rp ${(v / 1e9).toFixed(2)}M` : `Rp ${(v / 1e6).toFixed(1)}jt`

const COMPONENT_LABELS: Record<string, { label: string; color: string }> = {
  cif:             { label: 'CIF Value', color: 'bg-blue-500' },
  beaMasuk:        { label: 'Bea Masuk', color: 'bg-orange-500' },
  domesticFreight: { label: 'Domestic Freight', color: 'bg-purple-500' },
  handlingFees:    { label: 'Handling Fees', color: 'bg-teal-500' },
  customsBroker:   { label: 'Customs Broker', color: 'bg-pink-500' },
  portCharges:     { label: 'Port Charges', color: 'bg-yellow-500' },
  other:           { label: 'Other', color: 'bg-gray-500' },
}

export default function LandedCostAnalysisPage() {
  const [period, setPeriod] = useState('2026-03')
  const [material, setMaterial] = useState('ALL')

  const totalLandedCost = MOCK_LANDED_COSTS.reduce((s, lc) => s + lc.totalLandedCost, 0)
  const totalCIF = MOCK_LANDED_COSTS.reduce((s, lc) => s + lc.components.cif, 0)
  const totalDuties = MOCK_LANDED_COSTS.reduce((s, lc) => s + lc.components.beaMasuk, 0)
  const totalFreightHandling = MOCK_LANDED_COSTS.reduce((s, lc) =>
    s + lc.components.domesticFreight + lc.components.handlingFees + lc.components.portCharges + lc.components.customsBroker, 0)
  const totalTaxAssets = MOCK_LANDED_COSTS.reduce((s, lc) => s + lc.ppnAsset + lc.pph22Asset, 0)

  const filtered = material === 'ALL' ? MOCK_LANDED_COSTS : MOCK_LANDED_COSTS.filter(lc => lc.materialCode === material)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Landed Cost Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Analisis komponen biaya impor yang dikapitalisasi ke inventaris BC 2.0
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Excel</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
          </div>
        </div>

        {/* Key Info Banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>BC 2.0 Landed Cost Formula:</strong>
            {' '}Landed Cost = CIF + Bea Masuk + Domestic Freight + Handling + Port Charges + Customs Broker Fee.
            <br />
            <strong>TIDAK termasuk:</strong> PPN Import & PPh 22 (dicatat sebagai Tax Asset di Finance, bukan biaya inventaris).
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4 items-end">
              <div>
                <Label className="text-xs">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-01">Jan 2026</SelectItem>
                    <SelectItem value="2026-02">Feb 2026</SelectItem>
                    <SelectItem value="2026-03">Mar 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Material</Label>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Materials</SelectItem>
                    <SelectItem value="RM-HRC-001">Hot Rolled Coil</SelectItem>
                    <SelectItem value="RM-CRC-001">Cold Rolled Coil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm">Apply</Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Landed Cost</p>
              <p className="text-xl font-bold text-blue-700">{formatM(totalLandedCost)}</p>
              <p className="text-xs text-muted-foreground mt-1">Dikapitalisasi ke inventaris</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">CIF Value</p>
              <p className="text-xl font-bold">{formatM(totalCIF)}</p>
              <p className="text-xs text-muted-foreground mt-1">{((totalCIF / totalLandedCost) * 100).toFixed(1)}% dari landed cost</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Bea Masuk (Duty)</p>
              <p className="text-xl font-bold text-orange-700">{formatM(totalDuties)}</p>
              <p className="text-xs text-muted-foreground mt-1">{((totalDuties / totalLandedCost) * 100).toFixed(1)}% dari landed cost</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Tax Assets (off-balance)</p>
              <p className="text-xl font-bold text-green-700">{formatM(totalTaxAssets)}</p>
              <p className="text-xs text-muted-foreground mt-1">PPN + PPh 22 (tidak dikapitalisasi)</p>
            </CardContent>
          </Card>
        </div>

        {/* Global Composition Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Komposisi Total Landed Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-6 rounded overflow-hidden mb-3">
              {Object.entries(COMPONENT_LABELS).map(([key, cfg]) => {
                const total = MOCK_LANDED_COSTS.reduce((s, lc) => s + ((lc.components as any)[key] || 0), 0)
                const pct = (total / totalLandedCost) * 100
                if (pct < 0.5) return null
                return (
                  <div
                    key={key}
                    className={`${cfg.color} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${cfg.label}: ${formatM(total)} (${pct.toFixed(1)}%)`}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {Object.entries(COMPONENT_LABELS).map(([key, cfg]) => {
                const total = MOCK_LANDED_COSTS.reduce((s, lc) => s + ((lc.components as any)[key] || 0), 0)
                const pct = (total / totalLandedCost) * 100
                if (pct < 0.5) return null
                return (
                  <span key={key} className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-sm ${cfg.color}`} />
                    {cfg.label} {pct.toFixed(1)}% ({formatM(total)})
                  </span>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Per-BC 2.0 Detail */}
        <div className="space-y-4">
          {filtered.map(lc => {
            const variance = lc.prevUnitCost
              ? ((lc.unitLandedCost - lc.prevUnitCost) / lc.prevUnitCost) * 100
              : null
            const varAlert = variance !== null && Math.abs(variance) > 5

            return (
              <Card key={lc.bc20Id} className={varAlert ? 'border-orange-300' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <Package className="h-5 w-5" />
                        {lc.bcNumber}
                        <span className="text-base font-normal text-muted-foreground">— {lc.supplier}</span>
                        {!lc.grDate && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Belum GR</Badge>}
                      </CardTitle>
                      <CardDescription>
                        {lc.material} ({lc.materialCode}) — {lc.quantity.toLocaleString('id-ID')} {lc.uom}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-700">
                        Rp {lc.unitLandedCost.toLocaleString('id-ID')} / {lc.uom}
                      </p>
                      {variance !== null && (
                        <div className={`flex items-center justify-end gap-1 text-sm ${varAlert ? 'text-orange-600 font-bold' : variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {variance > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}% vs periode lalu
                          {varAlert && <AlertCircle className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Component Breakdown */}
                    <div>
                      <p className="text-sm font-medium mb-3">Breakdown Komponen</p>
                      <div className="space-y-2">
                        {Object.entries(COMPONENT_LABELS).map(([key, cfg]) => {
                          const val = (lc.components as any)[key] || 0
                          if (val === 0) return null
                          const pct = (val / lc.totalLandedCost) * 100
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-xs mb-0.5">
                                <span>{cfg.label}</span>
                                <span className="font-medium">{formatIDR(val)} ({pct.toFixed(1)}%)</span>
                              </div>
                              <div className="flex h-1.5 bg-gray-100 rounded overflow-hidden">
                                <div className={`${cfg.color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Total Landed Cost (Inventaris)</p>
                        <p className="text-xl font-bold text-blue-700">{formatIDR(lc.totalLandedCost)}</p>
                      </div>

                      <Separator />

                      <div className="text-xs space-y-2 text-muted-foreground">
                        <p className="font-medium text-foreground">Tax Assets (TIDAK dikapitalisasi):</p>
                        <div className="flex justify-between">
                          <span>PPN Import (11%)</span>
                          <span className="font-medium text-green-600">{formatIDR(lc.ppnAsset)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PPh 22 Import (2.5%)</span>
                          <span className="font-medium text-green-600">{formatIDR(lc.pph22Asset)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-medium">Total Cash Out (all-in)</span>
                          <span className="font-bold">{formatIDR(lc.totalLandedCost + lc.ppnAsset + lc.pph22Asset)}</span>
                        </div>
                      </div>

                      <div className={`p-2 rounded text-xs ${varAlert ? 'bg-orange-50 border border-orange-200 text-orange-800' : 'bg-gray-50'}`}>
                        {varAlert
                          ? `⚠ Variance ${variance!.toFixed(1)}% — melebihi threshold 5%! Periksa perubahan tarif atau kurs.`
                          : lc.prevUnitCost
                            ? `Stabil — variance ${variance!.toFixed(1)}% vs periode lalu.`
                            : 'Tidak ada data periode sebelumnya untuk perbandingan.'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Grand Total */}
        <Card className="bg-gray-50 border-2">
          <CardContent className="pt-4">
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total CIF</p>
                <p className="font-bold">{formatIDR(totalCIF)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Bea Masuk</p>
                <p className="font-bold text-orange-700">{formatIDR(totalDuties)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Freight & Handling</p>
                <p className="font-bold">{formatIDR(totalFreightHandling)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Landed Cost</p>
                <p className="font-bold text-blue-700">{formatIDR(totalLandedCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tax Assets (off)</p>
                <p className="font-bold text-green-700">{formatIDR(totalTaxAssets)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
