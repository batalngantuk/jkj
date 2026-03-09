'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Upload, Calculator, Save, DollarSign, TrendingUp,
  AlertCircle, Ship, Package, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import AppLayout from '@/components/app-layout'
import { HSCodeSelector, type HSCode } from '@/components/purchasing/hs-code-selector'

export default function NewBC20Page() {
  const router = useRouter()

  // Form state - Document Info
  const [supplierId, setSupplierId] = useState('')
  const [poId, setPoId] = useState('')
  const [estimatedArrival, setEstimatedArrival] = useState('')
  const [portOfEntry, setPortOfEntry] = useState('')
  const [customsOffice, setCustomsOffice] = useState('')

  // Material & HS Code
  const [materialId, setMaterialId] = useState('')
  const [selectedHSCode, setSelectedHSCode] = useState<HSCode | null>(null)
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [countryOfOrigin, setCountryOfOrigin] = useState('')

  // Financial
  const [cifValue, setCifValue] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState('15750')
  const [freightCost, setFreightCost] = useState('')
  const [insuranceCost, setInsuranceCost] = useState('')
  const [handlingCost, setHandlingCost] = useState('')
  const [otherCosts, setOtherCosts] = useState('0')

  // Calculated values
  const [cifIdr, setCifIdr] = useState(0)
  const [beaMasuk, setBeaMasuk] = useState(0)
  const [ppnImport, setPpnImport] = useState(0)
  const [pph22, setPph22] = useState(0)
  const [totalTax, setTotalTax] = useState(0)
  const [totalLandedCost, setTotalLandedCost] = useState(0)
  const [vendorBillAmount, setVendorBillAmount] = useState(0)
  const [taxBillAmount, setTaxBillAmount] = useState(0)

  // Notes
  const [notes, setNotes] = useState('')

  // Auto-calculate duties and costs
  useEffect(() => {
    const cif = parseFloat(cifValue) || 0
    const rate = parseFloat(exchangeRate) || 15750
    const freight = parseFloat(freightCost) || 0
    const insurance = parseFloat(insuranceCost) || 0
    const handling = parseFloat(handlingCost) || 0
    const other = parseFloat(otherCosts) || 0

    // CIF in IDR
    const cifInIdr = cif * rate
    setCifIdr(cifInIdr)

    // Get duty rate from HS Code
    const dutyRate = selectedHSCode?.dutyRate || 5.0 // default 5%

    // BC 2.0 Tax Calculations
    // 1. Bea Masuk = CIF × Duty Rate
    const beaMasukAmount = cifInIdr * (dutyRate / 100)
    setBeaMasuk(beaMasukAmount)

    // 2. PPN Import = (CIF + Bea Masuk) × 11%
    const nilaiImpor = cifInIdr + beaMasukAmount
    const ppnAmount = nilaiImpor * 0.11
    setPpnImport(ppnAmount)

    // 3. PPh 22 = (CIF + Bea Masuk) × 2.5%
    const pph22Amount = nilaiImpor * 0.025
    setPph22(pph22Amount)

    // Total Tax (Bea Masuk + PPN + PPh22)
    const totalTaxAmount = beaMasukAmount + ppnAmount + pph22Amount
    setTotalTax(totalTaxAmount)

    // Landed Cost = CIF + Bea Masuk + Freight + Insurance + Handling + Other
    // NOTE: PPN & PPh22 NOT included (recorded as tax assets)
    const landedCost = cifInIdr + beaMasukAmount + freight + insurance + handling + other
    setTotalLandedCost(landedCost)

    // Dual Billing
    // Vendor Bill = CIF value in IDR
    setVendorBillAmount(cifInIdr)

    // Tax Bill = Bea Masuk + PPN + PPh22
    setTaxBillAmount(totalTaxAmount)

  }, [cifValue, exchangeRate, selectedHSCode, freightCost, insuranceCost, handlingCost, otherCosts])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // In real app, this would call API
    console.log('BC 2.0 Form submitted', {
      supplierId,
      poId,
      estimatedArrival,
      cifValue,
      totalTax,
      totalLandedCost,
      vendorBillAmount,
      taxBillAmount
    })

    // Redirect to BC 2.0 list
    router.push('/purchasing/bc20')
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchasing/bc20">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">New BC 2.0 - Regular Import</h1>
              <p className="text-sm text-muted-foreground">Create new import declaration with dual billing</p>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">BC 2.0 Regular Import System</AlertTitle>
          <AlertDescription className="text-blue-700">
            This system uses <strong>dual billing</strong> (Vendor + Tax) and requires <strong>upfront tax payment</strong> before customs clearance.
            Landed cost will be calculated automatically.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
              <CardDescription>Import declaration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUP001">Global Metals Ltd (China)</SelectItem>
                      <SelectItem value="SUP002">Polymer Solutions Inc (Thailand)</SelectItem>
                      <SelectItem value="SUP003">Steel Trading Co (Japan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poId">Purchase Order</Label>
                  <Select value={poId} onValueChange={setPoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PO (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PO001">PO-2026-001 - Global Metals</SelectItem>
                      <SelectItem value="PO002">PO-2026-002 - Polymer Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portOfEntry">Port of Entry *</Label>
                  <Select value={portOfEntry} onValueChange={setPortOfEntry} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select port" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tanjung Priok">Tanjung Priok, Jakarta</SelectItem>
                      <SelectItem value="Tanjung Perak">Tanjung Perak, Surabaya</SelectItem>
                      <SelectItem value="Belawan">Belawan, Medan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customsOffice">Customs Office *</Label>
                  <Select value={customsOffice} onValueChange={setCustomsOffice} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customs office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KPU Tanjung Priok">KPU Bea Cukai Tanjung Priok</SelectItem>
                      <SelectItem value="KPU Tanjung Perak">KPU Bea Cukai Tanjung Perak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedArrival">Estimated Arrival *</Label>
                  <Input
                    id="estimatedArrival"
                    type="date"
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material & HS Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Material & Customs Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="materialId">Material *</Label>
                  <Select value={materialId} onValueChange={setMaterialId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAT001">RM-SS-001 - Stainless Steel Coils 304</SelectItem>
                      <SelectItem value="MAT002">RM-PVC-001 - PVC Resin</SelectItem>
                      <SelectItem value="MAT003">RM-SHAFT-001 - Transmission Shaft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hsCodeId">HS Code *</Label>
                  <HSCodeSelector
                    value={selectedHSCode?.id}
                    onValueChange={setSelectedHSCode}
                    placeholder="Search and select HS Code..."
                  />
                  {selectedHSCode && (
                    <p className="text-xs text-muted-foreground">
                      Duty Rate: <span className="font-semibold text-blue-600">{selectedHSCode.dutyRate}%</span>
                      {' • '}PPN: {selectedHSCode.ppnRate}%
                      {' • '}PPh 22: {selectedHSCode.pph22Rate}%
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.001"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.000"
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
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
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
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="South Korea">South Korea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </CardTitle>
              <CardDescription>CIF value and additional costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cifValue">CIF Value *</Label>
                  <Input
                    id="cifValue"
                    type="number"
                    step="0.01"
                    value={cifValue}
                    onChange={(e) => setCifValue(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={currency} onValueChange={setCurrency} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">Exchange Rate to IDR *</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freightCost">Freight Cost (IDR)</Label>
                  <Input
                    id="freightCost"
                    type="number"
                    step="0.01"
                    value={freightCost}
                    onChange={(e) => setFreightCost(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceCost">Insurance Cost (IDR)</Label>
                  <Input
                    id="insuranceCost"
                    type="number"
                    step="0.01"
                    value={insuranceCost}
                    onChange={(e) => setInsuranceCost(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handlingCost">Handling Cost (IDR)</Label>
                  <Input
                    id="handlingCost"
                    type="number"
                    step="0.01"
                    value={handlingCost}
                    onChange={(e) => setHandlingCost(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">CIF Value in IDR</span>
                  <span className="text-xl font-bold text-blue-700">{formatCurrency(cifIdr)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duty & Tax Calculation */}
          <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-600" />
                Duty & Tax Calculation (Auto-calculated)
              </CardTitle>
              <CardDescription>Import duties and taxes - BC 2.0 Regular Import</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-muted-foreground">Bea Masuk ({selectedHSCode?.dutyRate || 5}%)</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(beaMasuk)}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-muted-foreground">PPN Import (11%)</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(ppnImport)}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-muted-foreground">PPh 22 (2.5%)</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(pph22)}</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-600">
                  <p className="text-sm font-semibold text-orange-900">Total Tax</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalTax)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dual Billing Preview */}
          <Card className="border-green-200 bg-gradient-to-br from-white to-green-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-green-600" />
                Dual Billing Preview
              </CardTitle>
              <CardDescription>Two separate bills will be generated upon submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Vendor Bill */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Vendor Bill (CIF Payment)</p>
                  <p className="text-3xl font-bold text-blue-700">{formatCurrency(vendorBillAmount)}</p>
                  <p className="text-xs text-blue-600 mt-2">Payment to supplier for goods</p>
                </div>

                {/* Tax Bill */}
                <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <p className="text-sm font-semibold text-orange-900 mb-2">Tax Bill (Import Duties)</p>
                  <p className="text-3xl font-bold text-orange-700">{formatCurrency(taxBillAmount)}</p>
                  <p className="text-xs text-orange-600 mt-2">Payment to customs (Bea Masuk + PPN + PPh22)</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important:</strong> Tax payment must be completed before customs clearance can proceed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Landed Cost Preview */}
          <Card className="border-teal-200 bg-gradient-to-br from-white to-teal-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Landed Cost Calculation
              </CardTitle>
              <CardDescription>Total inventory capitalization cost (excludes tax assets)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CIF Value (IDR)</span>
                  <span className="font-medium">{formatCurrency(cifIdr)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">+ Bea Masuk</span>
                  <span className="font-medium text-orange-600">{formatCurrency(beaMasuk)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">+ Freight Cost</span>
                  <span className="font-medium">{formatCurrency(parseFloat(freightCost) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">+ Insurance Cost</span>
                  <span className="font-medium">{formatCurrency(parseFloat(insuranceCost) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">+ Handling Cost</span>
                  <span className="font-medium">{formatCurrency(parseFloat(handlingCost) || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-teal-900">Total Landed Cost</span>
                  <span className="text-2xl font-bold text-teal-700">{formatCurrency(totalLandedCost)}</span>
                </div>
              </div>

              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-sm">
                  <strong>Note:</strong> PPN Import ({formatCurrency(ppnImport)}) and PPh 22 ({formatCurrency(pph22)})
                  are recorded as tax assets, NOT included in inventory cost.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or special instructions..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/purchasing/bc20">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
