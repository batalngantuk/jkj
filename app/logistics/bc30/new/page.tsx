'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Save, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'

export default function NewBC30Page() {
  const router = useRouter()
  
  // Form state
  const [soId, setSoId] = useState('')
  const [exportDate, setExportDate] = useState('')
  const [portOfExport, setPortOfExport] = useState('')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [hsCode, setHsCode] = useState('')
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('KG')
  const [fobValueUSD, setFobValueUSD] = useState('')
  const [pebNumber, setPebNumber] = useState('')
  const [npeNumber, setNpeNumber] = useState('')
  const [notes, setNotes] = useState('')

  // Mock traceability data (would come from API based on SO)
  const traceabilityChain = soId ? {
    bc23: { number: 'BC23-2026-001', lotNumber: 'RM-2026-001' },
    gr: { number: 'GR-2026-001', date: '2026-01-15' },
    wo: { number: 'WO-2026-001', conversionRate: 92 },
    fg: { lotNumber: 'FG-2026-001', quantity: 920 }
  } : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('BC 3.0 Form submitted')
    router.push('/logistics/bc30')
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/logistics/bc30">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">New BC 3.0 Export</h1>
              <p className="text-sm text-muted-foreground">Create new export declaration</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
              <CardDescription>Basic export document details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="soId">Sales Order *</Label>
                  <Select value={soId} onValueChange={setSoId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="so-001">SO-2026-001 - PT. Global Trading Indonesia</SelectItem>
                      <SelectItem value="so-002">SO-2026-002 - CV. Maju Jaya</SelectItem>
                      <SelectItem value="so-003">SO-2026-003 - PT. Sejahtera Abadi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exportDate">Export Date *</Label>
                  <Input
                    id="exportDate"
                    type="date"
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portOfExport">Port of Export *</Label>
                  <Select value={portOfExport} onValueChange={setPortOfExport} required>
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

                <div className="space-y-2">
                  <Label htmlFor="destinationCountry">Destination Country *</Label>
                  <Select value={destinationCountry} onValueChange={setDestinationCountry} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="MY">Malaysia</SelectItem>
                      <SelectItem value="TH">Thailand</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
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
              <CardDescription>Product and export classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Rubber Gloves"
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
                      <SelectItem value="4015.19.00">4015.19.00 - Rubber gloves</SelectItem>
                      <SelectItem value="4016.99.00">4016.99.00 - Other rubber articles</SelectItem>
                      <SelectItem value="3926.20.00">3926.20.00 - Plastic articles of apparel</SelectItem>
                      <SelectItem value="6116.10.00">6116.10.00 - Gloves impregnated</SelectItem>
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
                      <SelectItem value="BOX">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fobValueUSD">FOB Value (USD) *</Label>
                  <Input
                    id="fobValueUSD"
                    type="number"
                    step="0.01"
                    value={fobValueUSD}
                    onChange={(e) => setFobValueUSD(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traceability Display */}
          {traceabilityChain && (
            <Card className="border-green-200 bg-green-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Material Traceability Chain
                </CardTitle>
                <CardDescription>Full traceability from import to export</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Visual Chain */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <div className="flex flex-col items-center min-w-[120px]">
                      <Badge className="bg-blue-100 text-blue-800 mb-1">BC 2.3 Import</Badge>
                      <div className="text-sm font-mono">{traceabilityChain.bc23.number}</div>
                      <div className="text-xs text-muted-foreground">Lot: {traceabilityChain.bc23.lotNumber}</div>
                    </div>
                    
                    <div className="text-2xl text-muted-foreground">→</div>
                    
                    <div className="flex flex-col items-center min-w-[120px]">
                      <Badge className="bg-purple-100 text-purple-800 mb-1">Goods Receipt</Badge>
                      <div className="text-sm font-mono">{traceabilityChain.gr.number}</div>
                      <div className="text-xs text-muted-foreground">{traceabilityChain.gr.date}</div>
                    </div>
                    
                    <div className="text-2xl text-muted-foreground">→</div>
                    
                    <div className="flex flex-col items-center min-w-[120px]">
                      <Badge className="bg-orange-100 text-orange-800 mb-1">Work Order</Badge>
                      <div className="text-sm font-mono">{traceabilityChain.wo.number}</div>
                      <div className="text-xs text-muted-foreground">Yield: {traceabilityChain.wo.conversionRate}%</div>
                    </div>
                    
                    <div className="text-2xl text-muted-foreground">→</div>
                    
                    <div className="flex flex-col items-center min-w-[120px]">
                      <Badge className="bg-green-100 text-green-800 mb-1">Finished Goods</Badge>
                      <div className="text-sm font-mono">{traceabilityChain.fg.lotNumber}</div>
                      <div className="text-xs text-muted-foreground">Qty: {traceabilityChain.fg.quantity}</div>
                    </div>
                    
                    <div className="text-2xl text-muted-foreground">→</div>
                    
                    <div className="flex flex-col items-center min-w-[120px]">
                      <Badge className="bg-blue-100 text-blue-800 mb-1">BC 3.0 Export</Badge>
                      <div className="text-sm font-mono">This Document</div>
                      <div className="text-xs text-muted-foreground">New</div>
                    </div>
                  </div>

                  {/* Conversion Analysis */}
                  <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Import Lot</div>
                      <div className="font-semibold">{traceabilityChain.bc23.lotNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      <div className="font-semibold text-green-600">{traceabilityChain.wo.conversionRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Export Lot</div>
                      <div className="font-semibold">{traceabilityChain.fg.lotNumber}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Export Documents</CardTitle>
              <CardDescription>Upload required export documents</CardDescription>
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
                  <Label>Certificate of Origin *</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".pdf,.jpg,.png" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Health Certificate</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".pdf,.jpg,.png" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Form E (if applicable)</Label>
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
              <CardDescription>PEB and NPE details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pebNumber">PEB Number</Label>
                  <Input
                    id="pebNumber"
                    value={pebNumber}
                    onChange={(e) => setPebNumber(e.target.value)}
                    placeholder="Will be filled after customs submission"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="npeNumber">NPE Number</Label>
                  <Input
                    id="npeNumber"
                    value={npeNumber}
                    onChange={(e) => setNpeNumber(e.target.value)}
                    placeholder="Nomor Pendaftaran Eksportir"
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
            <Link href="/logistics/bc30">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Save BC 3.0
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
