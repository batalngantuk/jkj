'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Download, Factory, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, Package, ArrowRight, BarChart2
} from 'lucide-react'
import AppLayout from '@/components/app-layout'

const MOCK_CONVERSIONS = [
  {
    id: 'CV-001', woNumber: 'WO-2026-005', woDate: '2026-03-11',
    productName: 'Steel Coil Grade A', productCode: 'FG-SCA-001',
    rmMaterial: 'Hot Rolled Coil', rmCode: 'RM-HRC-001',
    bc20Ref: 'PIB-2026-001', bc20Optional: true,

    // Quantities
    rmInput: 100000, rmUnit: 'kg',
    fgOutput: 95000, fgUnit: 'kg',
    waste: 5000, wastePct: 5.0,
    conversionRatio: 0.950,
    standardRatio: 0.940,
    variance: 1.064, // (0.950-0.940)/0.940 * 100

    // Cost
    rmLandedCost: 1034000000, // per batch
    rmUnitCost: 10340,
    fgUnitCost: 14500,
    wasteValue: 51700000,

    // Sub-components waste
    wasteBreakdown: [
      { type: 'Cutting Loss', qty: 2500, pct: 2.5 },
      { type: 'Edge Trim', qty: 1500, pct: 1.5 },
      { type: 'Process Loss', qty: 1000, pct: 1.0 },
    ],
  },
  {
    id: 'CV-002', woNumber: 'WO-2026-006', woDate: '2026-03-13',
    productName: 'Cold Rolled Sheet', productCode: 'FG-CRS-001',
    rmMaterial: 'Cold Rolled Coil', rmCode: 'RM-CRC-001',
    bc20Ref: 'PIB-2026-002', bc20Optional: true,

    rmInput: 80000, rmUnit: 'kg',
    fgOutput: 74500, fgUnit: 'kg',
    waste: 5500, wastePct: 6.875,
    conversionRatio: 0.931,
    standardRatio: 0.940,
    variance: -0.957, // below standard

    rmLandedCost: 1304200000,
    rmUnitCost: 16303,
    fgUnitCost: 22000,
    wasteValue: 89667000,

    wasteBreakdown: [
      { type: 'Cutting Loss', qty: 2200, pct: 2.75 },
      { type: 'Edge Trim', qty: 2000, pct: 2.5 },
      { type: 'Process Loss', qty: 1300, pct: 1.625 },
    ],
  },
  {
    id: 'CV-003', woNumber: 'WO-2026-004', woDate: '2026-03-08',
    productName: 'Galvanized Steel Sheet', productCode: 'FG-GSS-001',
    rmMaterial: 'Hot Rolled Coil', rmCode: 'RM-HRC-001',
    bc20Ref: null, bc20Optional: true,

    rmInput: 60000, rmUnit: 'kg',
    fgOutput: 56800, fgUnit: 'kg',
    waste: 3200, wastePct: 5.33,
    conversionRatio: 0.947,
    standardRatio: 0.940,
    variance: 0.745,

    rmLandedCost: 620400000,
    rmUnitCost: 10340,
    fgUnitCost: 15800,
    wasteValue: 33088000,

    wasteBreakdown: [
      { type: 'Cutting Loss', qty: 1600, pct: 2.67 },
      { type: 'Edge Trim', qty: 1000, pct: 1.67 },
      { type: 'Process Loss', qty: 600, pct: 1.0 },
    ],
  },
]

const THRESHOLD = 2.0 // % variance threshold for alert

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
const formatM = (v: number) =>
  v >= 1e9 ? `Rp ${(v / 1e9).toFixed(2)}M` : `Rp ${(v / 1e6).toFixed(1)}jt`

export default function ConversionAnalysisPage() {
  const [period, setPeriod] = useState('2026-03')
  const [product, setProduct] = useState('ALL')

  const filtered = product === 'ALL'
    ? MOCK_CONVERSIONS
    : MOCK_CONVERSIONS.filter(c => c.productCode === product)

  const totalRmInput = filtered.reduce((s, c) => s + c.rmInput, 0)
  const totalFgOutput = filtered.reduce((s, c) => s + c.fgOutput, 0)
  const totalWaste = filtered.reduce((s, c) => s + c.waste, 0)
  const totalWasteValue = filtered.reduce((s, c) => s + c.wasteValue, 0)
  const avgConversion = totalFgOutput / totalRmInput
  const alertCount = filtered.filter(c => Math.abs(c.variance) > THRESHOLD).length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conversion Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Analisis konversi bahan baku → produk jadi (RM → FG) per Work Order
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Excel</Button>
          </div>
        </div>

        {/* Variance Alerts */}
        {alertCount > 0 && (
          <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-orange-800">
                {alertCount} Work Order dengan variance konversi &gt; {THRESHOLD}% dari standar
              </p>
              <p className="text-sm text-orange-600">
                Investigasi penyebab: kerusakan mesin, kualitas bahan baku, atau setting proses tidak optimal
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4 items-end">
              <div>
                <Label className="text-xs">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-02">Feb 2026</SelectItem>
                    <SelectItem value="2026-03">Mar 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Produk</Label>
                <Select value={product} onValueChange={setProduct}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Produk</SelectItem>
                    <SelectItem value="FG-SCA-001">Steel Coil Grade A</SelectItem>
                    <SelectItem value="FG-CRS-001">Cold Rolled Sheet</SelectItem>
                    <SelectItem value="FG-GSS-001">Galvanized Sheet</SelectItem>
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
              <p className="text-xs text-muted-foreground">Total RM Input</p>
              <p className="text-2xl font-bold">{(totalRmInput / 1000).toFixed(0)} MT</p>
              <p className="text-xs text-muted-foreground mt-1">{totalRmInput.toLocaleString('id-ID')} kg</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total FG Output</p>
              <p className="text-2xl font-bold text-green-700">{(totalFgOutput / 1000).toFixed(0)} MT</p>
              <p className="text-xs text-muted-foreground mt-1">{totalFgOutput.toLocaleString('id-ID')} kg</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Waste</p>
              <p className="text-2xl font-bold text-orange-700">{(totalWaste / 1000).toFixed(1)} MT</p>
              <p className="text-xs text-muted-foreground mt-1">{formatM(totalWasteValue)} nilai</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Avg Conversion Ratio</p>
              <p className="text-2xl font-bold text-purple-700">{(avgConversion * 100).toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Std: 94.00%</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Summary Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Komposisi Input → Output (Total)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex h-8 rounded overflow-hidden">
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(totalFgOutput / totalRmInput) * 100}%` }}
                >
                  FG {((totalFgOutput / totalRmInput) * 100).toFixed(1)}%
                </div>
                <div
                  className="bg-orange-400 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(totalWaste / totalRmInput) * 100}%` }}
                >
                  Waste {((totalWaste / totalRmInput) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm inline-block" /> FG Output: {totalFgOutput.toLocaleString('id-ID')} kg</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-400 rounded-sm inline-block" /> Waste/Loss: {totalWaste.toLocaleString('id-ID')} kg ({formatM(totalWasteValue)})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per-WO Detail Cards */}
        <div className="space-y-4">
          {filtered.map(cv => {
            const hasAlert = Math.abs(cv.variance) > THRESHOLD
            const aboveStd = cv.conversionRatio >= cv.standardRatio
            return (
              <Card key={cv.id} className={`${hasAlert ? 'border-orange-300 border-2' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Factory className="h-5 w-5 text-orange-500" />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {cv.woNumber}
                          {hasAlert && <Badge className="bg-orange-100 text-orange-700 text-xs">⚠ Variance Alert</Badge>}
                        </CardTitle>
                        <CardDescription>
                          {cv.rmMaterial} → {cv.productName}
                          {cv.bc20Ref && (
                            <span className="ml-2 text-blue-600">({cv.bc20Ref})</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-lg font-bold ${aboveStd ? 'text-green-700' : 'text-red-600'}`}>
                        {aboveStd ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                        {(cv.conversionRatio * 100).toFixed(2)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Std: {(cv.standardRatio * 100).toFixed(2)}%
                        <span className={`ml-1 font-medium ${hasAlert ? 'text-orange-600' : 'text-muted-foreground'}`}>
                          ({cv.variance > 0 ? '+' : ''}{cv.variance.toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    {/* Flow */}
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Alur Konversi</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                          <Package className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">RM Input</p>
                          <p className="font-bold">{cv.rmInput.toLocaleString('id-ID')} kg</p>
                          <p className="text-xs text-muted-foreground">{cv.rmMaterial}</p>
                          <p className="text-xs text-blue-600">Rp {cv.rmUnitCost.toLocaleString()}/kg</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 p-3 bg-green-50 rounded-lg text-center border border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">FG Output</p>
                          <p className="font-bold text-green-700">{cv.fgOutput.toLocaleString('id-ID')} kg</p>
                          <p className="text-xs text-muted-foreground">{cv.productName}</p>
                          <p className="text-xs text-green-600">Rp {cv.fgUnitCost.toLocaleString()}/kg</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 p-3 bg-orange-50 rounded-lg text-center border border-orange-200">
                          <AlertCircle className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Waste / Loss</p>
                          <p className="font-bold text-orange-600">{cv.waste.toLocaleString('id-ID')} kg</p>
                          <p className="text-xs text-muted-foreground">{cv.wastePct.toFixed(2)}%</p>
                          <p className="text-xs text-orange-600">{formatM(cv.wasteValue)}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex h-3 rounded overflow-hidden">
                          <div
                            className="bg-green-500"
                            style={{ width: `${(cv.fgOutput / cv.rmInput) * 100}%` }}
                            title={`FG: ${cv.fgOutput.toLocaleString()} kg`}
                          />
                          <div
                            className="bg-orange-400"
                            style={{ width: `${(cv.waste / cv.rmInput) * 100}%` }}
                            title={`Waste: ${cv.waste.toLocaleString()} kg`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Waste Breakdown */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Waste Breakdown</p>
                      <div className="space-y-2">
                        {cv.wasteBreakdown.map((wb, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span>{wb.type}</span>
                              <span className="font-medium">{wb.pct.toFixed(2)}%</span>
                            </div>
                            <div className="flex h-1.5 bg-gray-100 rounded overflow-hidden">
                              <div className="bg-orange-400" style={{ width: `${(wb.pct / cv.wastePct) * 100}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground">{wb.qty.toLocaleString()} kg</p>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-3" />

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Waste Value:</span>
                          <span className="font-bold text-orange-700">{formatM(cv.wasteValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">RM Total Cost:</span>
                          <span className="font-medium">{formatM(cv.rmLandedCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Waste % of Cost:</span>
                          <span className={`font-bold ${cv.wastePct > 6 ? 'text-red-600' : ''}`}>
                            {((cv.wasteValue / cv.rmLandedCost) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mt-3 text-xs text-muted-foreground flex gap-4">
                    <span>WO Date: {new Date(cv.woDate).toLocaleDateString('id-ID')}</span>
                    {cv.bc20Ref
                      ? <span>BC 2.0: <span className="text-blue-600 font-medium">{cv.bc20Ref}</span> (opsional)</span>
                      : <span className="italic">Tanpa referensi BC 2.0</span>
                    }
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
                <p className="text-xs text-muted-foreground">Total RM Input</p>
                <p className="font-bold">{totalRmInput.toLocaleString('id-ID')} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total FG Output</p>
                <p className="font-bold text-green-700">{totalFgOutput.toLocaleString('id-ID')} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Waste</p>
                <p className="font-bold text-orange-700">{totalWaste.toLocaleString('id-ID')} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nilai Waste</p>
                <p className="font-bold text-orange-700">{formatIDR(totalWasteValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Conversion</p>
                <p className="font-bold text-purple-700">{(avgConversion * 100).toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
