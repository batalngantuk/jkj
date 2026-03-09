'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Calculator, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/components/app-layout'

export default function NewBC23Page() {
  const router = useRouter()
  
  // Form state
  const [poId, setPoId] = useState('')
  const [importDate, setImportDate] = useState('')
  const [portOfEntry, setPortOfEntry] = useState('')
  const [hsCode, setHsCode] = useState('')
  const [materialName, setMaterialName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('KG')
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [cifValueUSD, setCifValueUSD] = useState('')
  const [exchangeRate, setExchangeRate] = useState('15800')
  const [sppbNumber, setSppbNumber] = useState('')
  const [notes, setNotes] = useState('')

  // Calculated values
  const [cifValueIDR, setCifValueIDR] = useState(0)
  const [beaMasuk, setBeaMasuk] = useState(0)
  const [ppn, setPpn] = useState(0)
  const [pph22, setPph22] = useState(0)
  const [totalDuties, setTotalDuties] = useState(0)

  // HS Code rates (simplified)
  const hsCodeRates: Record<string, number> = {
    '3901': 5,  // Polymers
    '3902': 5,
    '3903': 5,
    '3904': 5,
    '4001': 0,  // Natural rubber
    '4002': 5,  // Synthetic rubber
    '7326': 7.5, // Iron/steel articles
    '8483': 7.5, // Transmission shafts
  }

  // Auto-calculate duties when values change
  useEffect(() => {
    const cifUSD = parseFloat(cifValueUSD) || 0
    const rate = parseFloat(exchangeRate) || 15800
    const cifIDR = cifUSD * rate
    
    setCifValueIDR(cifIDR)

    // Get Bea Masuk rate based on HS Code
    const hsPrefix = hsCode.substring(0, 4)
    const beaMasukRate = hsCodeRates[hsPrefix] || 5
    
    const beaMasukAmount = cifIDR * (beaMasukRate / 100)
    const nilaiImpor = cifIDR + beaMasukAmount
    const ppnAmount = nilaiImpor * 0.11 // PPN 11%
    const pph22Amount = nilaiImpor * 0.025 // PPh 22 2.5%
    const total = beaMasukAmount + ppnAmount + pph22Amount

    setBeaMasuk(beaMasukAmount)
    setPpn(ppnAmount)
    setPph22(pph22Amount)
    setTotalDuties(total)
  }, [cifValueUSD, exchangeRate, hsCode])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, this would save to backend
    console.log('BC 2.3 Form submitted')
    router.push('/purchasing/bc23')
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchasing/bc23">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">New BC 2.3 Import</h1>
              <p className="text-sm text-muted-foreground">Create new import declaration</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
              <CardDescription>Basic import document details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="poId">Purchase Order *</Label>
                  <Select value={poId} onValueChange={setPoId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="po-001">PO-2026-001 - PT. Supplier Material Utama</SelectItem>
                      <SelectItem value="po-002">PO-2026-002 - CV. Packaging Solutions</SelectItem>
                      <SelectItem value="po-003">PO-2026-003 - PT. Supplier Material Utama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importDate">Import Date *</Label>
                  <Input
                    id="importDate"
                    type="date"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portOfEntry">Port of Entry *</Label>
                  <Select value={portOfEntry} onValueChange={setPortOfEntry} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select port" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDTPP">Tanjung Priok, Jakarta</SelectItem>
                      <SelectItem value="IDSUB">Tanjung Perak, Surabaya</SelectItem>
                      <SelectItem value="IDBLW">Belawan, Medan</SelectItem>
                      <SelectItem value="IDMAK">Soekarno-Hatta, Makassar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goods Details */}
          <Card>
            <CardHeader>
              <CardTitle>Goods Details</CardTitle>
              <CardDescription>Material and customs classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="materialName">Material Name *</Label>
                  <Input
                    id="materialName"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="e.g., Natural Rubber Latex"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hsCode">HS Code *</Label>
                  <Select value={hsCode} onValueChange={setHsCode} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select HS Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4001.10.00">4001.10.00 - Natural rubber latex</SelectItem>
                      <SelectItem value="4002.19.00">4002.19.00 - Synthetic rubber</SelectItem>
                      <SelectItem value="3901.10.00">3901.10.00 - Polyethylene</SelectItem>
                      <SelectItem value="3902.10.00">3902.10.00 - Polypropylene</SelectItem>
                      <SelectItem value="7326.90.00">7326.90.00 - Iron/steel articles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={unit} onValueChange={setUnit} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">Kilogram (KG)</SelectItem>
                      <SelectItem value="TON">Ton</SelectItem>
                      <SelectItem value="PCS">Pieces (PCS)</SelectItem>
                      <SelectItem value="CTN">Carton (CTN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryOfOrigin">Country of Origin *</Label>
                  <Select value={countryOfOrigin} onValueChange={setCountryOfOrigin} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TH">Thailand</SelectItem>
                      <SelectItem value="MY">Malaysia</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="KR">South Korea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cifValueUSD">CIF Value (USD) *</Label>
                  <Input
                    id="cifValueUSD"
                    type="number"
                    step="0.01"
                    value={cifValueUSD}
                    onChange={(e) => setCifValueUSD(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duty Calculation */}
          <Card className="border-blue-200 bg-blue-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Duty Calculation (Auto-calculated)
              </CardTitle>
              <CardDescription>Import duties and taxes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Exchange Rate (USD to IDR)</Label>
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>CIF Value (IDR)</Label>
                  <div className="text-lg font-semibold text-blue-700">
                    {formatCurrency(cifValueIDR)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Bea Masuk ({hsCode ? hsCodeRates[hsCode.substring(0, 4)] || 5 : 5}%)</Label>
                  <div className="text-lg font-semibold">{formatCurrency(beaMasuk)}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">PPN (11%)</Label>
                  <div className="text-lg font-semibold">{formatCurrency(ppn)}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">PPh 22 (2.5%)</Label>
                  <div className="text-lg font-semibold">{formatCurrency(pph22)}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Total Duties</Label>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalDuties)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>Upload required customs documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Commercial Invoice *</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".pdf,.jpg,.png" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Packing List *</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".pdf,.jpg,.png" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bill of Lading *</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".pdf,.jpg,.png" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certificate of Origin</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".pdf,.jpg,.png" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customs Submission */}
          <Card>
            <CardHeader>
              <CardTitle>Customs Submission</CardTitle>
              <CardDescription>SPPB and submission details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sppbNumber">SPPB Number</Label>
                  <Input
                    id="sppbNumber"
                    value={sppbNumber}
                    onChange={(e) => setSppbNumber(e.target.value)}
                    placeholder="Will be filled after customs approval"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/purchasing/bc23">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Save BC 2.3
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
