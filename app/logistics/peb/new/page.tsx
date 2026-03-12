'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Ship, Plus, Trash2, Save, Send, DollarSign, Package,
  AlertCircle, CheckCircle, Calendar, MapPin, FileText
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { useRouter } from 'next/navigation'

export default function PEBCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form State
  const [pebNumber, setPebNumber] = useState('')
  const [npeNumber, setNpeNumber] = useState('NPE-123456') // Default NPE
  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [portOfLoading, setPortOfLoading] = useState('Tanjung Priok')
  const [customsOffice, setCustomsOffice] = useState('KPBC Tanjung Priok')
  const [exportDate, setExportDate] = useState('')
  const [estimatedDeparture, setEstimatedDeparture] = useState('')

  // Shipping Details
  const [vesselName, setVesselName] = useState('')
  const [voyageNumber, setVoyageNumber] = useState('')
  const [containerNumber, setContainerNumber] = useState('')
  const [sealNumber, setSealNumber] = useState('')

  // Financial
  const [currency, setCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState(15500) // USD to IDR

  // Optional Traceability
  const [workOrderId, setWorkOrderId] = useState('')
  const [fgLotNumber, setFgLotNumber] = useState('')
  const [bc20Reference, setBc20Reference] = useState('')

  // Items
  const [items, setItems] = useState<any[]>([
    {
      materialId: '1',
      materialCode: 'FG-001',
      materialName: 'Steel Coil Grade A',
      hsCode: '7208.10.00',
      hsDescription: 'Flat-rolled products of iron',
      quantity: 100,
      uom: 'MT',
      unitPrice: 1250,
      totalPrice: 125000,
      packagingType: 'Bundle',
      numberOfPackages: 10,
      grossWeight: 102000,
      netWeight: 100000,
    },
  ])

  // Calculations
  const [fobValue, setFobValue] = useState(0)
  const [fobIdr, setFobIdr] = useState(0)
  const [vatRate] = useState(0) // Zero-rated for exports
  const [vatAmount] = useState(0)

  // Auto-calculate FOB value from items
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0)
    setFobValue(total)
    setFobIdr(total * exchangeRate)
  }, [items, exchangeRate])

  // Auto-generate PEB number
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    setPebNumber(`PEB-${year}-${seq}`)
  }, [])

  const formatCurrency = (amount: number, curr: string = 'USD') => {
    if (curr === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        materialId: '',
        materialCode: '',
        materialName: '',
        hsCode: '',
        hsDescription: '',
        quantity: 0,
        uom: 'MT',
        unitPrice: 0,
        totalPrice: 0,
        packagingType: '',
        numberOfPackages: 0,
        grossWeight: 0,
        netWeight: 0,
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value

    // Auto-calculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = parseFloat(newItems[index].quantity) || 0
      const price = parseFloat(newItems[index].unitPrice) || 0
      newItems[index].totalPrice = qty * price
    }

    setItems(newItems)
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    // TODO: Call API to save as DRAFT
    setTimeout(() => {
      setLoading(false)
      alert('PEB saved as draft')
    }, 1000)
  }

  const handleSubmit = async () => {
    setLoading(true)
    // TODO: Call API to create and submit PEB
    setTimeout(() => {
      setLoading(false)
      router.push('/logistics/peb')
    }, 1000)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create PEB Export Document</h1>
            <p className="text-muted-foreground mt-1">
              Regular export declaration - Zero-rated VAT (0% PPN)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              Create PEB
            </Button>
          </div>
        </div>

        {/* Zero-rated VAT Notice */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Zero-Rated VAT for Exports</p>
                <p>This export is subject to 0% PPN (VAT). No output tax will be charged.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>PEB document and customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pebNumber">PEB Number *</Label>
                <Input
                  id="pebNumber"
                  value={pebNumber}
                  onChange={(e) => setPebNumber(e.target.value)}
                  placeholder="PEB-2026-001"
                />
              </div>
              <div>
                <Label htmlFor="npeNumber">NPE Number</Label>
                <Input
                  id="npeNumber"
                  value={npeNumber}
                  onChange={(e) => setNpeNumber(e.target.value)}
                  placeholder="NPE-123456"
                />
              </div>
              <div>
                <Label htmlFor="customerId">Customer *</Label>
                <Select value={customerId} onValueChange={(value) => {
                  setCustomerId(value)
                  if (value === '1') setCustomerName('ABC Trading USA')
                  if (value === '2') setCustomerName('XYZ Corp Japan')
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">ABC Trading USA</SelectItem>
                    <SelectItem value="2">XYZ Corp Japan</SelectItem>
                    <SelectItem value="3">EuroTech GmbH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Export Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="destinationCountry">Destination Country *</Label>
                <Select value={destinationCountry} onValueChange={setDestinationCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="destinationPort">Destination Port *</Label>
                <Input
                  id="destinationPort"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  placeholder="Port of Los Angeles"
                />
              </div>
              <div>
                <Label htmlFor="portOfLoading">Port of Loading *</Label>
                <Select value={portOfLoading} onValueChange={setPortOfLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tanjung Priok">Tanjung Priok</SelectItem>
                    <SelectItem value="Tanjung Perak">Tanjung Perak</SelectItem>
                    <SelectItem value="Belawan">Belawan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="customsOffice">Customs Office *</Label>
                <Input
                  id="customsOffice"
                  value={customsOffice}
                  onChange={(e) => setCustomsOffice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="exportDate">Export Date *</Label>
                <Input
                  id="exportDate"
                  type="date"
                  value={exportDate}
                  onChange={(e) => setExportDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estimatedDeparture">Estimated Departure *</Label>
                <Input
                  id="estimatedDeparture"
                  type="date"
                  value={estimatedDeparture}
                  onChange={(e) => setEstimatedDeparture(e.target.value)}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="vesselName">Vessel Name</Label>
                <Input
                  id="vesselName"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="MV Ocean Carrier"
                />
              </div>
              <div>
                <Label htmlFor="voyageNumber">Voyage Number</Label>
                <Input
                  id="voyageNumber"
                  value={voyageNumber}
                  onChange={(e) => setVoyageNumber(e.target.value)}
                  placeholder="VOY-2026-001"
                />
              </div>
              <div>
                <Label htmlFor="containerNumber">Container Number</Label>
                <Input
                  id="containerNumber"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                  placeholder="ABCD1234567"
                />
              </div>
              <div>
                <Label htmlFor="sealNumber">Seal Number</Label>
                <Input
                  id="sealNumber"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder="SEAL-12345"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exchangeRate">Exchange Rate to IDR</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Traceability */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Optional Internal Traceability
            </CardTitle>
            <CardDescription className="text-xs">
              These fields are optional and for internal tracking only. NOT required for customs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bc20Reference">BC 2.0 Reference (Optional)</Label>
                <Input
                  id="bc20Reference"
                  value={bc20Reference}
                  onChange={(e) => setBc20Reference(e.target.value)}
                  placeholder="PIB-2026-001"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to import document for internal tracking
                </p>
              </div>
              <div>
                <Label htmlFor="workOrderId">Work Order (Optional)</Label>
                <Input
                  id="workOrderId"
                  value={workOrderId}
                  onChange={(e) => setWorkOrderId(e.target.value)}
                  placeholder="WO-2026-001"
                />
              </div>
              <div>
                <Label htmlFor="fgLotNumber">FG Lot Number (Optional)</Label>
                <Input
                  id="fgLotNumber"
                  value={fgLotNumber}
                  onChange={(e) => setFgLotNumber(e.target.value)}
                  placeholder="FG-LOT-001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Export Items
                </CardTitle>
                <CardDescription>Add materials to be exported</CardDescription>
              </div>
              <Button onClick={handleAddItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Material Code</Label>
                    <Input
                      value={item.materialCode}
                      onChange={(e) => handleItemChange(index, 'materialCode', e.target.value)}
                      placeholder="FG-001"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Material Name</Label>
                    <Input
                      value={item.materialName}
                      onChange={(e) => handleItemChange(index, 'materialName', e.target.value)}
                      placeholder="Steel Coil Grade A"
                    />
                  </div>
                  <div>
                    <Label>HS Code</Label>
                    <Input
                      value={item.hsCode}
                      onChange={(e) => handleItemChange(index, 'hsCode', e.target.value)}
                      placeholder="7208.10.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>UOM</Label>
                    <Select
                      value={item.uom}
                      onValueChange={(value) => handleItemChange(index, 'uom', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                        <SelectItem value="KG">KG (Kilogram)</SelectItem>
                        <SelectItem value="PCS">PCS (Pieces)</SelectItem>
                        <SelectItem value="CTN">CTN (Carton)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit Price ({currency})</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Total Price</Label>
                    <Input
                      type="number"
                      value={item.totalPrice}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Packaging Type</Label>
                    <Input
                      value={item.packagingType}
                      onChange={(e) => handleItemChange(index, 'packagingType', e.target.value)}
                      placeholder="Bundle"
                    />
                  </div>
                  <div>
                    <Label>Number of Packages</Label>
                    <Input
                      type="number"
                      value={item.numberOfPackages}
                      onChange={(e) => handleItemChange(index, 'numberOfPackages', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Gross Weight (kg)</Label>
                    <Input
                      type="number"
                      value={item.grossWeight}
                      onChange={(e) => handleItemChange(index, 'grossWeight', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Net Weight (kg)</Label>
                    <Input
                      type="number"
                      value={item.netWeight}
                      onChange={(e) => handleItemChange(index, 'netWeight', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FOB Summary */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">FOB Value Summary</CardTitle>
            <CardDescription className="text-blue-700">
              Free on Board - Zero-rated VAT (0% PPN for exports)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">FOB Value ({currency})</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(fobValue, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">FOB Value (IDR)</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(fobIdr, 'IDR')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rate: {exchangeRate.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">PPN (VAT)</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-green-600">{vatRate}%</p>
                  <Badge className="bg-green-100 text-green-700">ZERO-RATED</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(vatAmount, 'IDR')}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-semibold">Export Tax Benefit</p>
                  <p>
                    This export is subject to 0% PPN (VAT). No output tax will be charged,
                    supporting Indonesia's export competitiveness.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
