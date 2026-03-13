'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Search, Download, FileText, Package, Factory,
  Ship, ArrowRight, CheckCircle, Info, AlertCircle
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

// Mock data — BC 2.0 optional traceability
// Catatan: bc20Reference di PEB adalah OPSIONAL, bukan mandatory
const MOCK_BC20_TRACES = [
  {
    id: 'TR-001',
    // BC 2.0 Import (Optional starting point)
    bc20Id: '1',
    bc20Number: 'PIB-2026-001',
    bc20Date: '2026-02-28',
    supplier: 'Baosteel',
    rmDescription: 'Hot Rolled Coil (HRC)',
    rmHsCode: '7208.10.00',
    rmLotNumber: 'RM-LOT-2026-001',
    rmQuantity: 100000,
    rmUnit: 'kg',
    cifValue: 950000000,
    landedCostUnit: 10340,

    // Goods Receipt
    grId: 'GR-001',
    grNumber: 'GR-2026-001',
    grDate: '2026-03-10',
    grQuantity: 100000,

    // Work Order (Production)
    woId: 'WO-001',
    woNumber: 'WO-2026-005',
    woDate: '2026-03-11',
    productName: 'Steel Coil Grade A (Export Quality)',
    productCode: 'FG-SCA-001',
    fgLotNumber: 'FG-LOT-2026-001',
    fgQuantity: 95000,
    fgUnit: 'kg',

    // Conversion
    conversionRatio: 0.95,
    standardRatio: 0.94,
    waste: 5000,
    wastePct: 5.0,

    // PEB Export (Optional end point)
    pebId: '1',
    pebNumber: 'PEB-2026-001',
    pebDate: '2026-03-15',
    customer: 'ABC Trading USA',
    destinationCountry: 'United States',
    exportQuantity: 95000,
    fobValue: 125000,
    fobCurrency: 'USD',
  },
  {
    id: 'TR-002',
    bc20Id: '2',
    bc20Number: 'PIB-2026-002',
    bc20Date: '2026-03-06',
    supplier: 'POSCO',
    rmDescription: 'Cold Rolled Coil (CRC)',
    rmHsCode: '7209.16.00',
    rmLotNumber: null, // No lot tracking — OPTIONAL
    rmQuantity: 80000,
    rmUnit: 'kg',
    cifValue: 1200000000,
    landedCostUnit: 16303,

    grId: 'GR-002',
    grNumber: 'GR-2026-002',
    grDate: '2026-03-11',
    grQuantity: 80000,

    woId: 'WO-002',
    woNumber: 'WO-2026-006',
    woDate: '2026-03-13',
    productName: 'Cold Rolled Sheet',
    productCode: 'FG-CRS-001',
    fgLotNumber: null, // No lot — OPTIONAL
    fgQuantity: 74500,
    fgUnit: 'kg',

    conversionRatio: 0.931,
    standardRatio: 0.94,
    waste: 5500,
    wastePct: 6.875,

    // Domestic sales — no PEB
    pebId: null,
    pebNumber: null,
    pebDate: null,
    customer: 'PT Mega Steel Indonesia',
    destinationCountry: 'Indonesia (Domestic)',
    exportQuantity: null,
    fobValue: null,
    fobCurrency: null,
  },
]

type TraceStep = {
  type: string
  icon: React.ReactNode
  label: string
  number: string
  date: string
  detail: string
  lotNumber: string | null
  quantity: string
  href?: string
  optional?: boolean
  color: string
}

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

export default function TraceabilityBC20Page() {
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState('bc20')
  const [selected, setSelected] = useState(MOCK_BC20_TRACES[0])

  const buildSteps = (tr: typeof MOCK_BC20_TRACES[0]): TraceStep[] => {
    const steps: TraceStep[] = [
      {
        type: 'BC20', icon: <FileText className="h-5 w-5" />, label: 'BC 2.0 Import',
        number: tr.bc20Number, date: tr.bc20Date,
        detail: `${tr.supplier} — ${tr.rmDescription}`,
        lotNumber: tr.rmLotNumber, quantity: `${tr.rmQuantity.toLocaleString()} ${tr.rmUnit}`,
        href: `/purchasing/bc20/${tr.bc20Id}`, optional: false,
        color: 'bg-blue-100 border-blue-300 text-blue-800',
      },
      {
        type: 'GR', icon: <Package className="h-5 w-5" />, label: 'Goods Receipt',
        number: tr.grNumber, date: tr.grDate,
        detail: `Received at warehouse`,
        lotNumber: tr.rmLotNumber, quantity: `${tr.grQuantity.toLocaleString()} ${tr.rmUnit}`,
        optional: false,
        color: 'bg-purple-100 border-purple-300 text-purple-800',
      },
      {
        type: 'WO', icon: <Factory className="h-5 w-5" />, label: 'Work Order (Production)',
        number: tr.woNumber, date: tr.woDate,
        detail: tr.productName,
        lotNumber: tr.fgLotNumber, quantity: `${tr.fgQuantity.toLocaleString()} ${tr.fgUnit}`,
        optional: true,
        color: 'bg-orange-100 border-orange-300 text-orange-800',
      },
    ]

    if (tr.pebId) {
      steps.push({
        type: 'PEB', icon: <Ship className="h-5 w-5" />, label: 'PEB Export',
        number: tr.pebNumber!, date: tr.pebDate!,
        detail: `${tr.customer} — ${tr.destinationCountry}`,
        lotNumber: tr.fgLotNumber, quantity: `${tr.exportQuantity!.toLocaleString()} ${tr.fgUnit}`,
        href: `/logistics/peb/${tr.pebId}`, optional: true,
        color: 'bg-green-100 border-green-300 text-green-800',
      })
    } else {
      steps.push({
        type: 'DOM', icon: <CheckCircle className="h-5 w-5" />, label: 'Domestic Sales',
        number: 'SO-Domestic', date: tr.woDate,
        detail: `${tr.customer} — ${tr.destinationCountry}`,
        lotNumber: null, quantity: `${tr.fgQuantity.toLocaleString()} ${tr.fgUnit}`,
        optional: true,
        color: 'bg-teal-100 border-teal-300 text-teal-800',
      })
    }

    return steps
  }

  const steps = buildSteps(selected)
  const varianceAlert = Math.abs(selected.conversionRatio - selected.standardRatio) / selected.standardRatio * 100 > 2

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Material Traceability (BC 2.0)</h1>
            <p className="text-muted-foreground mt-1">
              Keterlacakan material impor reguler: BC 2.0 → GR → Produksi → Ekspor/Domestik
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Certificate
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Optional Notice */}
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex gap-3">
          <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>⚠️ Traceability BC 2.0 bersifat OPSIONAL:</strong> Berbeda dengan BC 2.3 (bonded zone),
            BC 2.0 (regular import) <strong>tidak wajib</strong> melakukan pelacakan lot untuk bea cukai.
            Traceability ini hanya untuk <strong>kontrol kualitas internal</strong>, ISO certification,
            dan kebutuhan transparansi pelanggan tertentu.
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <div>
                <Label className="text-xs">Cari Berdasarkan</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bc20">BC 2.0 Number</SelectItem>
                    <SelectItem value="lot">Lot Number (RM)</SelectItem>
                    <SelectItem value="fglot">Lot Number (FG)</SelectItem>
                    <SelectItem value="peb">PEB Number</SelectItem>
                    <SelectItem value="wo">Work Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs">Nomor</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder={`Masukkan ${searchType}...`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button>Cari</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Traceability Chain (Left 2 cols) */}
          <div className="col-span-2 space-y-6">
            {/* Chain Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Rantai Keterlacakan</CardTitle>
                <CardDescription>
                  {selected.bc20Number} — {selected.rmDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Chain Nodes */}
                <div className="relative">
                  <div className="flex items-start gap-0">
                    {steps.map((step, idx) => (
                      <React.Fragment key={step.type}>
                        <div className="flex-1 min-w-0">
                          <div className={`border-2 rounded-lg p-3 ${step.color}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {step.icon}
                              <div>
                                <p className="font-bold text-xs">{step.label}</p>
                                {step.optional && (
                                  <span className="text-xs opacity-70">(opsional)</span>
                                )}
                              </div>
                            </div>
                            {step.href ? (
                              <Link href={step.href}>
                                <p className="font-semibold text-sm hover:underline truncate">
                                  {step.number}
                                </p>
                              </Link>
                            ) : (
                              <p className="font-semibold text-sm truncate">{step.number}</p>
                            )}
                            <p className="text-xs opacity-75 mt-1">
                              {new Date(step.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </p>
                            <p className="text-xs mt-1 truncate">{step.detail}</p>
                            <Separator className="my-2 opacity-30" />
                            <p className="text-xs font-medium">{step.quantity}</p>
                            {step.lotNumber && (
                              <p className="text-xs opacity-75 font-mono mt-0.5">
                                Lot: {step.lotNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        {idx < steps.length - 1 && (
                          <div className="flex items-center px-1 pt-8">
                            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Conversion Analysis */}
                <div className={`mt-6 p-4 rounded-lg border-2 ${varianceAlert ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {varianceAlert
                      ? <AlertCircle className="h-5 w-5 text-orange-600" />
                      : <CheckCircle className="h-5 w-5 text-green-600" />
                    }
                    <h3 className="font-semibold">Analisis Konversi (RM → FG)</h3>
                    {varianceAlert && (
                      <Badge className="bg-orange-100 text-orange-700 text-xs">Variance Alert</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Input (RM)</p>
                      <p className="font-bold">{selected.rmQuantity.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Output (FG)</p>
                      <p className="font-bold">{selected.fgQuantity.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Waste / Loss</p>
                      <p className={`font-bold ${selected.wastePct > 6 ? 'text-orange-600' : ''}`}>
                        {selected.waste.toLocaleString()} kg ({selected.wastePct.toFixed(1)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rasio Konversi</p>
                      <div>
                        <p className="font-bold">{(selected.conversionRatio * 100).toFixed(2)}%</p>
                        <p className="text-xs text-muted-foreground">
                          Std: {(selected.standardRatio * 100).toFixed(2)}%
                          {varianceAlert && <span className="text-orange-600 ml-1">⚠ Deviasi!</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traceability Certificate */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileText className="h-5 w-5" />
                  Sertifikat Keterlacakan Material (Internal)
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Untuk keperluan kontrol kualitas internal & audit pelanggan
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-xl font-bold">MATERIAL TRACEABILITY CERTIFICATE</h2>
                    <p className="text-sm text-muted-foreground">JKJ Manufacturing — Internal Quality Control</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚠ Dokumen ini bersifat internal — bukan persyaratan bea cukai BC 2.0
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2 text-blue-700">Bahan Baku (Import BC 2.0)</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BC 2.0 Number:</span>
                          <span className="font-mono font-medium">{selected.bc20Number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Supplier:</span>
                          <span>{selected.supplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Material:</span>
                          <span>{selected.rmDescription}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HS Code:</span>
                          <span className="font-mono">{selected.rmHsCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lot Number:</span>
                          <span className="font-mono text-blue-700">
                            {selected.rmLotNumber || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span>{selected.rmQuantity.toLocaleString()} {selected.rmUnit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GR Date:</span>
                          <span>{new Date(selected.grDate).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Landed Cost/Unit:</span>
                          <span>Rp {selected.landedCostUnit.toLocaleString('id-ID')}/kg</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-green-700">
                        {selected.pebId ? 'Produk Jadi (Ekspor)' : 'Produk Jadi (Domestik)'}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Work Order:</span>
                          <span className="font-mono">{selected.woNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product:</span>
                          <span>{selected.productName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">FG Lot Number:</span>
                          <span className="font-mono text-green-700">
                            {selected.fgLotNumber || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">FG Quantity:</span>
                          <span>{selected.fgQuantity.toLocaleString()} {selected.fgUnit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prod. Date:</span>
                          <span>{new Date(selected.woDate).toLocaleDateString('id-ID')}</span>
                        </div>
                        {selected.pebId && (
                          <>
                            <Separator className="my-1" />
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">PEB Number:</span>
                              <span className="font-mono font-medium">{selected.pebNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Customer:</span>
                              <span>{selected.customer}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Destination:</span>
                              <span>{selected.destinationCountry}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">FOB:</span>
                              <span>USD {selected.fobValue?.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        {!selected.pebId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pelanggan:</span>
                            <span>{selected.customer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-xs text-muted-foreground">Rasio Konversi</p>
                      <p className="font-bold">{(selected.conversionRatio * 100).toFixed(2)}%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-xs text-muted-foreground">Waste / Loss</p>
                      <p className="font-bold">{selected.wastePct.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-xs text-muted-foreground">Status Lot</p>
                      <p className="font-bold">
                        {selected.rmLotNumber ? 'Lot Tracked ✓' : 'Tanpa Lot'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Dicetak oleh: JKJ Manufacturing ERP | Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                    <p className="mt-1 italic">
                      Catatan: Dokumen ini untuk keperluan internal. Pelacakan lot di BC 2.0 bersifat opsional
                      sesuai regulasi impor reguler (bukan bonded zone).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Record List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pilih Record Traceability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_BC20_TRACES.map(tr => (
                  <div
                    key={tr.id}
                    onClick={() => setSelected(tr)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selected.id === tr.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-sm text-blue-600">{tr.bc20Number}</p>
                    <p className="text-xs text-muted-foreground">{tr.rmDescription}</p>
                    <p className="text-xs mt-1">{tr.supplier}</p>
                    <div className="flex gap-2 mt-1">
                      {tr.rmLotNumber
                        ? <Badge className="text-xs bg-green-100 text-green-700">Lot Tracked</Badge>
                        : <Badge className="text-xs bg-gray-100 text-gray-500">No Lot</Badge>
                      }
                      {tr.pebId
                        ? <Badge className="text-xs bg-blue-100 text-blue-700">Ekspor</Badge>
                        : <Badge className="text-xs bg-teal-100 text-teal-700">Domestik</Badge>
                      }
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* BC 2.0 vs BC 2.3 Comparison */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-900">BC 2.0 vs BC 2.3</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-yellow-800">
                <div>
                  <p className="font-semibold">BC 2.0 (Regular Import):</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li>Traceability <strong>opsional</strong></li>
                    <li>Lot number tidak wajib</li>
                    <li>PEB tidak perlu link ke BC 2.0</li>
                    <li>Bebas jual domestik atau ekspor</li>
                  </ul>
                </div>
                <Separator className="opacity-50" />
                <div>
                  <p className="font-semibold">BC 2.3 (Bonded Zone):</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li>Traceability <strong>wajib</strong> untuk bea cukai</li>
                    <li>Lot number harus tercatat</li>
                    <li>BC 3.0 wajib link ke BC 2.3</li>
                    <li>Hanya boleh ekspor</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Link href={`/purchasing/bc20/${selected.bc20Id}`}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    <FileText className="h-3 w-3 mr-2" />
                    Buka {selected.bc20Number}
                  </Button>
                </Link>
                {selected.pebId && (
                  <Link href={`/logistics/peb/${selected.pebId}`}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Ship className="h-3 w-3 mr-2" />
                      Buka {selected.pebNumber}
                    </Button>
                  </Link>
                )}
                <Link href="/reports/conversion-analysis">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    <Factory className="h-3 w-3 mr-2" />
                    Conversion Analysis
                  </Button>
                </Link>
                <Link href="/reports/landed-cost-analysis">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    <Package className="h-3 w-3 mr-2" />
                    Landed Cost Analysis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
