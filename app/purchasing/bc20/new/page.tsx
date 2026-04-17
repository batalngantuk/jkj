'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Calculator, Save, DollarSign, TrendingUp,
  AlertCircle, Ship, Package, FileText, Plus, Trash2, ChevronDown, ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'

// HS Code duty rates (simplified)
const HS_DUTY_RATES: Record<string, number> = {
  '7208': 5, '7209': 5, '7210': 5, '7211': 5, '7212': 5,
  '3901': 10, '3902': 10, '3903': 10, '3904': 10,
  '8481': 15, '8482': 15, '8483': 15,
  '6116': 20, '4015': 20,
}

function getDutyRate(hsCode: string): number {
  const prefix = hsCode.replace(/\./g, '').substring(0, 4)
  return HS_DUTY_RATES[prefix] ?? 5
}

interface MaterialLine {
  id: string
  kodeBarang: string       // free input kode material
  namaBarang: string       // free input nama material
  hsCode: string           // free input HS Code
  negaraAsal: string
  satuan: string
  berat: string            // berat per satuan (kg)
  jumlah: string           // qty
  hargaSatuan: string      // harga per satuan (dalam currency)
  // calculated
  nilaiCIF: number         // jumlah × hargaSatuan
  beaMasuk: number
  ppnImport: number
  pph22: number
  totalPajak: number
  landedCostPerSatuan: number
}

function newMaterialLine(): MaterialLine {
  return {
    id: crypto.randomUUID(),
    kodeBarang: '',
    namaBarang: '',
    hsCode: '',
    negaraAsal: '',
    satuan: 'KG',
    berat: '',
    jumlah: '',
    hargaSatuan: '',
    nilaiCIF: 0,
    beaMasuk: 0,
    ppnImport: 0,
    pph22: 0,
    totalPajak: 0,
    landedCostPerSatuan: 0,
  }
}

function calcLine(line: MaterialLine, exchangeRate: number, freight: number, insurance: number, handling: number, totalJumlah: number): MaterialLine {
  const qty = parseFloat(line.jumlah) || 0
  const harga = parseFloat(line.hargaSatuan) || 0
  const nilaiCIF = qty * harga
  const nilaiCIFIdr = nilaiCIF * exchangeRate
  const dutyRate = getDutyRate(line.hsCode)
  const beaMasuk = nilaiCIFIdr * (dutyRate / 100)
  const nilaiImpor = nilaiCIFIdr + beaMasuk
  const ppnImport = nilaiImpor * 0.11
  const pph22 = nilaiImpor * 0.025
  const totalPajak = beaMasuk + ppnImport + pph22

  // Alokasi biaya tambahan proporsional berdasarkan qty
  const proporsi = totalJumlah > 0 ? qty / totalJumlah : 0
  const biayaTambahan = (freight + insurance + handling) * proporsi
  const landedCostPerSatuan = qty > 0 ? (nilaiCIFIdr + beaMasuk + biayaTambahan) / qty : 0

  return { ...line, nilaiCIF, beaMasuk, ppnImport, pph22, totalPajak, landedCostPerSatuan }
}

export default function NewBC20Page() {
  const router = useRouter()

  // Document Info
  const [supplier, setSupplier] = useState('')
  const [supplierCustom, setSupplierCustom] = useState('')
  const [poReference, setPoReference] = useState('')
  const [noAjuPIB, setNoAjuPIB] = useState('')
  const [portOfEntry, setPortOfEntry] = useState('')
  const [customsOffice, setCustomsOffice] = useState('')
  const [estimatedArrival, setEstimatedArrival] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState('15750')
  const [freightCost, setFreightCost] = useState('0')
  const [insuranceCost, setInsuranceCost] = useState('0')
  const [handlingCost, setHandlingCost] = useState('0')
  const [notes, setNotes] = useState('')

  // Material lines
  const [lines, setLines] = useState<MaterialLine[]>([newMaterialLine()])
  const [expandedLine, setExpandedLine] = useState<string | null>(lines[0].id)

  const rate = parseFloat(exchangeRate) || 15750
  const freight = parseFloat(freightCost) || 0
  const insurance = parseFloat(insuranceCost) || 0
  const handling = parseFloat(handlingCost) || 0
  const totalJumlah = lines.reduce((s, l) => s + (parseFloat(l.jumlah) || 0), 0)

  const calculatedLines = lines.map(l => calcLine(l, rate, freight, insurance, handling, totalJumlah))

  // Totals
  const totalNilaiCIF = calculatedLines.reduce((s, l) => s + l.nilaiCIF, 0)
  const totalNilaiCIFIdr = totalNilaiCIF * rate
  const totalBeaMasuk = calculatedLines.reduce((s, l) => s + l.beaMasuk, 0)
  const totalPPN = calculatedLines.reduce((s, l) => s + l.ppnImport, 0)
  const totalPPh22 = calculatedLines.reduce((s, l) => s + l.pph22, 0)
  const totalPajak = calculatedLines.reduce((s, l) => s + l.totalPajak, 0)
  const totalLandedCost = totalNilaiCIFIdr + totalBeaMasuk + freight + insurance + handling

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  const fmtNum = (n: number) => n.toLocaleString('id-ID')

  function updateLine(id: string, field: keyof MaterialLine, value: string) {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function addLine() {
    const nl = newMaterialLine()
    setLines(prev => [...prev, nl])
    setExpandedLine(nl.id)
  }

  function removeLine(id: string) {
    if (lines.length === 1) return
    setLines(prev => prev.filter(l => l.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push('/purchasing/bc20')
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/purchasing/bc20">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New BC 2.0 — Regular Import</h1>
            <p className="text-sm text-muted-foreground">Pemberitahuan Impor Barang (PIB) dengan dual billing</p>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">BC 2.0 Regular Import</AlertTitle>
          <AlertDescription className="text-blue-700">
            Satu PIB bisa terdiri dari beberapa material. Pajak dihitung otomatis per material berdasarkan HS Code.
            Dual billing (Vendor + Tax) dibuat otomatis saat submit.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Informasi Dokumen ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Dokumen PIB
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <Label>No. Aju PIB</Label>
                  <Input
                    value={noAjuPIB}
                    onChange={e => setNoAjuPIB(e.target.value)}
                    placeholder="cth: 000000-2026-000001"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Referensi PO</Label>
                  <Input
                    value={poReference}
                    onChange={e => setPoReference(e.target.value)}
                    placeholder="cth: PO-2026-001"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Estimasi Tiba</Label>
                  <Input type="date" value={estimatedArrival} onChange={e => setEstimatedArrival(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Supplier <span className="text-red-500">*</span></Label>
                  <Input
                    value={supplierCustom}
                    onChange={e => setSupplierCustom(e.target.value)}
                    placeholder="Nama supplier / eksportir"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Pelabuhan Masuk</Label>
                  <Select value={portOfEntry} onValueChange={setPortOfEntry}>
                    <SelectTrigger><SelectValue placeholder="Pilih pelabuhan..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tanjung Priok">Tanjung Priok, Jakarta</SelectItem>
                      <SelectItem value="Tanjung Perak">Tanjung Perak, Surabaya</SelectItem>
                      <SelectItem value="Belawan">Belawan, Medan</SelectItem>
                      <SelectItem value="Soekarno Hatta">Soekarno-Hatta, Makassar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Kantor Pabean</Label>
                  <Select value={customsOffice} onValueChange={setCustomsOffice}>
                    <SelectTrigger><SelectValue placeholder="Pilih kantor..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KPU Tanjung Priok">KPU BC Tanjung Priok</SelectItem>
                      <SelectItem value="KPU Tanjung Perak">KPU BC Tanjung Perak</SelectItem>
                      <SelectItem value="KPPBC Belawan">KPPBC Belawan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Kurs & Biaya Tambahan ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Kurs & Biaya Tambahan
              </CardTitle>
              <CardDescription>Kurs digunakan untuk menghitung semua nilai material dalam PIB ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="space-y-1">
                  <Label>Mata Uang</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Kurs ke IDR <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                    placeholder="15750"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Kurs NDPBM pada tanggal PIB</p>
                </div>
                <div className="space-y-1">
                  <Label>Freight (IDR)</Label>
                  <Input type="number" value={freightCost} onChange={e => setFreightCost(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label>Insurance (IDR)</Label>
                  <Input type="number" value={insuranceCost} onChange={e => setInsuranceCost(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label>Handling (IDR)</Label>
                  <Input type="number" value={handlingCost} onChange={e => setHandlingCost(e.target.value)} placeholder="0" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Material Lines ── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Daftar Material
                </CardTitle>
                <CardDescription>Satu PIB bisa terdiri dari beberapa jenis material</CardDescription>
              </div>
              <Button type="button" variant="outline" className="gap-2" onClick={addLine}>
                <Plus className="h-4 w-4" />
                Tambah Material
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {calculatedLines.map((line, idx) => (
                <div key={line.id} className="border rounded-lg overflow-hidden">
                  {/* Line header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedLine(expandedLine === line.id ? null : line.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs w-7 h-7 rounded-full flex items-center justify-center p-0">
                        {idx + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">
                          {line.namaBarang || <span className="text-muted-foreground italic">Material {idx + 1}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {line.kodeBarang && `${line.kodeBarang} · `}
                          {line.hsCode && `HS: ${line.hsCode} · `}
                          {line.jumlah && line.satuan && `${fmtNum(parseFloat(line.jumlah) || 0)} ${line.satuan}`}
                          {line.nilaiCIF > 0 && ` · ${currency} ${fmtNum(line.nilaiCIF)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {line.totalPajak > 0 && (
                        <span className="text-xs text-orange-600 font-medium">{fmt(line.totalPajak)}</span>
                      )}
                      {lines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          onClick={e => { e.stopPropagation(); removeLine(line.id) }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      {expandedLine === line.id
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                  </div>

                  {/* Line form */}
                  {expandedLine === line.id && (
                    <div className="p-4 space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Kode Material <span className="text-red-500">*</span></Label>
                          <Input
                            value={line.kodeBarang}
                            onChange={e => updateLine(line.id, 'kodeBarang', e.target.value)}
                            placeholder="cth: BB-HRC-001"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">Nama Material / Uraian Barang <span className="text-red-500">*</span></Label>
                          <Input
                            value={line.namaBarang}
                            onChange={e => updateLine(line.id, 'namaBarang', e.target.value)}
                            placeholder="cth: Hot Rolled Coil (HRC) Grade A"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Kode HS <span className="text-red-500">*</span></Label>
                          <Input
                            value={line.hsCode}
                            onChange={e => updateLine(line.id, 'hsCode', e.target.value)}
                            placeholder="cth: 7208.10.00"
                          />
                          {line.hsCode && (
                            <p className="text-xs text-blue-600">Bea Masuk: {getDutyRate(line.hsCode)}%</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Negara Asal</Label>
                          <Input
                            value={line.negaraAsal}
                            onChange={e => updateLine(line.id, 'negaraAsal', e.target.value)}
                            placeholder="cth: CN, JP, KR"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Satuan</Label>
                          <Select value={line.satuan} onValueChange={v => updateLine(line.id, 'satuan', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="KG">Kilogram (KG)</SelectItem>
                              <SelectItem value="TON">Ton</SelectItem>
                              <SelectItem value="PCS">Pieces (PCS)</SelectItem>
                              <SelectItem value="MTR">Meter (MTR)</SelectItem>
                              <SelectItem value="LTR">Liter (LTR)</SelectItem>
                              <SelectItem value="SET">Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Jumlah <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            value={line.jumlah}
                            onChange={e => updateLine(line.id, 'jumlah', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Berat per {line.satuan || 'Satuan'} (KG)</Label>
                          <Input
                            type="number"
                            value={line.berat}
                            onChange={e => updateLine(line.id, 'berat', e.target.value)}
                            placeholder="0.000"
                          />
                          {line.berat && line.jumlah && (
                            <p className="text-xs text-muted-foreground">
                              Total berat: {fmtNum((parseFloat(line.berat) || 0) * (parseFloat(line.jumlah) || 0))} KG
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Harga per {line.satuan || 'Satuan'} ({currency}) <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={line.hargaSatuan}
                            onChange={e => updateLine(line.id, 'hargaSatuan', e.target.value)}
                            placeholder="0.00"
                          />
                          {line.hargaSatuan && line.jumlah && (
                            <p className="text-xs text-muted-foreground">
                              Nilai CIF: {currency} {fmtNum(line.nilaiCIF)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Kalkulasi per line */}
                      {line.nilaiCIF > 0 && (
                        <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Nilai CIF (IDR)</p>
                            <p className="font-semibold">{fmt(line.nilaiCIF * rate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Bea Masuk ({getDutyRate(line.hsCode)}%)</p>
                            <p className="font-semibold text-orange-600">{fmt(line.beaMasuk)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">PPN + PPh 22</p>
                            <p className="font-semibold text-blue-600">{fmt(line.ppnImport + line.pph22)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Landed Cost / {line.satuan}</p>
                            <p className="font-semibold text-teal-600">{fmt(line.landedCostPerSatuan)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Summary table */}
              {calculatedLines.length > 0 && totalNilaiCIF > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Nilai CIF ({currency})</TableHead>
                        <TableHead className="text-right">Nilai CIF (IDR)</TableHead>
                        <TableHead className="text-right">Bea Masuk</TableHead>
                        <TableHead className="text-right">Total Pajak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculatedLines.map(line => (
                        <TableRow key={line.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{line.namaBarang || '—'}</p>
                            <p className="text-xs text-muted-foreground">{line.kodeBarang} {line.hsCode && `· HS ${line.hsCode}`}</p>
                          </TableCell>
                          <TableCell className="text-right">{fmtNum(parseFloat(line.jumlah) || 0)} {line.satuan}</TableCell>
                          <TableCell className="text-right">{fmtNum(line.nilaiCIF)}</TableCell>
                          <TableCell className="text-right">{fmt(line.nilaiCIF * rate)}</TableCell>
                          <TableCell className="text-right text-orange-600">{fmt(line.beaMasuk)}</TableCell>
                          <TableCell className="text-right text-red-600 font-medium">{fmt(line.totalPajak)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30 font-bold">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">{fmtNum(totalNilaiCIF)}</TableCell>
                        <TableCell className="text-right">{fmt(totalNilaiCIFIdr)}</TableCell>
                        <TableCell className="text-right text-orange-600">{fmt(totalBeaMasuk)}</TableCell>
                        <TableCell className="text-right text-red-600">{fmt(totalPajak)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Ringkasan Pajak & Dual Billing ── */}
          {totalNilaiCIF > 0 && (
            <>
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    Ringkasan Pajak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-3 bg-white rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground">Bea Masuk</p>
                      <p className="text-xl font-bold text-orange-600">{fmt(totalBeaMasuk)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground">PPN Import (11%)</p>
                      <p className="text-xl font-bold text-blue-600">{fmt(totalPPN)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground">PPh 22 (2.5%)</p>
                      <p className="text-xl font-bold text-purple-600">{fmt(totalPPh22)}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-400 text-center">
                      <p className="text-xs font-semibold text-orange-900">Total Pajak</p>
                      <p className="text-2xl font-bold text-orange-600">{fmt(totalPajak)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-green-600" />
                    Dual Billing Preview
                  </CardTitle>
                  <CardDescription>Dua tagihan terpisah dibuat otomatis saat submit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Vendor Bill (CIF)</p>
                      <p className="text-3xl font-bold text-blue-700">{fmt(totalNilaiCIFIdr)}</p>
                      <p className="text-xs text-blue-600 mt-1">Dibayar ke supplier</p>
                    </div>
                    <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                      <p className="text-sm font-semibold text-orange-900 mb-1">Tax Bill (Bea Cukai)</p>
                      <p className="text-3xl font-bold text-orange-700">{fmt(totalPajak)}</p>
                      <p className="text-xs text-orange-600 mt-1">Dibayar ke Bea Cukai (wajib sebelum SPPB)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    Landed Cost
                  </CardTitle>
                  <CardDescription>Total biaya yang dikapitalisasi ke inventori (tidak termasuk PPN & PPh sebagai tax asset)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nilai CIF (IDR)</span>
                      <span>{fmt(totalNilaiCIFIdr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">+ Bea Masuk</span>
                      <span className="text-orange-600">{fmt(totalBeaMasuk)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">+ Freight</span>
                      <span>{fmt(freight)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">+ Insurance</span>
                      <span>{fmt(insurance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">+ Handling</span>
                      <span>{fmt(handling)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span className="text-teal-900">Total Landed Cost</span>
                      <span className="text-teal-700 text-2xl">{fmt(totalLandedCost)}</span>
                    </div>
                  </div>
                  <Alert className="mt-3 border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 text-xs">
                      PPN ({fmt(totalPPN)}) dan PPh 22 ({fmt(totalPPh22)}) dicatat sebagai tax asset, tidak masuk ke biaya inventori.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notes */}
          <Card>
            <CardHeader><CardTitle>Catatan Tambahan</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan atau instruksi khusus..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/purchasing/bc20">
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
              Simpan sebagai Draft
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
