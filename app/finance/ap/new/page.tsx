'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AppLayout from '@/components/app-layout'

// Mock Purchase Orders for selection
const MOCK_PURCHASE_ORDERS = [
  { id: 'po-001', poNumber: 'PO-2026-001', vendorName: 'PT. Supplier Material Utama', hasBC23: true, bc23Number: 'BC23-2026-001' },
  { id: 'po-002', poNumber: 'PO-2026-002', vendorName: 'CV. Packaging Solutions', hasBC23: false },
  { id: 'po-003', poNumber: 'PO-2026-003', vendorName: 'PT. Supplier Material Utama', hasBC23: true, bc23Number: 'BC23-2026-002' },
  { id: 'po-004', poNumber: 'PO-2026-004', vendorName: 'PT. Chemical Indo', hasBC23: false },
]

// Mock BC 2.3 Documents
const MOCK_BC23_DOCUMENTS = [
  { id: 'bc23-001', bcNumber: 'BC23-2026-001', poNumber: 'PO-2026-001' },
  { id: 'bc23-002', bcNumber: 'BC23-2026-002', poNumber: 'PO-2026-003' },
  { id: 'bc23-003', bcNumber: 'BC23-2026-003', poNumber: 'PO-2026-005' },
]

interface LineItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  pph22Rate: number
}

export default function NewAPBillPage() {
  const router = useRouter()
  
  // Form state
  const [selectedPO, setSelectedPO] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('30')
  const [selectedBC23, setSelectedBC23] = useState('')
  const [showBC23, setShowBC23] = useState(false)
  const [notes, setNotes] = useState('')
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 0, unitPrice: 0, taxRate: 11, pph22Rate: 0 }
  ])
  
  const [loading, setLoading] = useState(false)

  // Handle PO selection
  const handlePOChange = (poId: string) => {
    setSelectedPO(poId)
    const po = MOCK_PURCHASE_ORDERS.find(p => p.id === poId)
    if (po) {
      setVendorName(po.vendorName)
      setShowBC23(po.hasBC23)
      if (po.hasBC23 && po.bc23Number) {
        const bc23 = MOCK_BC23_DOCUMENTS.find(bc => bc.bcNumber === po.bc23Number)
        if (bc23) {
          setSelectedBC23(bc23.id)
        }
      } else {
        setSelectedBC23('')
      }
      // Auto-calculate due date based on payment terms
      updateDueDate(invoiceDate, paymentTerms)
    }
  }

  // Update due date based on invoice date and payment terms
  const updateDueDate = (invDate: string, terms: string) => {
    if (invDate && terms) {
      const date = new Date(invDate)
      date.setDate(date.getDate() + parseInt(terms))
      setDueDate(date.toISOString().split('T')[0])
    }
  }

  // Handle invoice date change
  const handleInvoiceDateChange = (date: string) => {
    setInvoiceDate(date)
    updateDueDate(date, paymentTerms)
  }

  // Handle payment terms change
  const handlePaymentTermsChange = (terms: string) => {
    setPaymentTerms(terms)
    updateDueDate(invoiceDate, terms)
  }

  // Line items management
  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id), 0) + 1
    setLineItems([...lineItems, { id: newId, description: '', quantity: 0, unitPrice: 0, taxRate: 11, pph22Rate: 0 }])
  }

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // Calculations
  const calculateLineTotal = (item: LineItem) => {
    return item.quantity * item.unitPrice
  }

  const calculateLinePPN = (item: LineItem) => {
    const subtotal = calculateLineTotal(item)
    return subtotal * (item.taxRate / 100)
  }

  const calculateLinePPh22 = (item: LineItem) => {
    const subtotal = calculateLineTotal(item)
    return subtotal * (item.pph22Rate / 100)
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  }

  const calculateTotalPPN = () => {
    return lineItems.reduce((sum, item) => sum + calculateLinePPN(item), 0)
  }

  const calculateTotalPPh22 = () => {
    return lineItems.reduce((sum, item) => sum + calculateLinePPh22(item), 0)
  }

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalPPN() + calculateTotalPPh22()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      router.push('/finance/ap')
    }, 1000)
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/finance/ap">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">New Vendor Bill</h1>
              <p className="text-sm text-muted-foreground">Record a vendor invoice for payment (AP)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Bill Details */}
            <Card>
              <CardHeader>
                <CardTitle>Bill Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label>Purchase Order (PO) <span className="text-red-500">*</span></Label>
                  <Select value={selectedPO} onValueChange={handlePOChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Purchase Order" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PURCHASE_ORDERS.map(po => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {po.vendorName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input value={vendorName} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Vendor Invoice Number <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="VND-INV-XXXX"
                    value={vendorInvoiceNumber}
                    onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Invoice Date <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date" 
                    value={invoiceDate}
                    onChange={(e) => handleInvoiceDateChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Terms (Days)</Label>
                  <Select value={paymentTerms} onValueChange={handlePaymentTermsChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="45">45 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled
                    className="bg-muted"
                  />
                </div>

                {showBC23 && (
                  <div className="space-y-2 col-span-2">
                    <Label>BC 2.3 Reference (Import) <span className="text-blue-600 text-xs">Optional</span></Label>
                    <Select value={selectedBC23} onValueChange={setSelectedBC23}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select BC 2.3 Document (if applicable)" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_BC23_DOCUMENTS.map(bc => (
                          <SelectItem key={bc.id} value={bc.id}>
                            {bc.bcNumber} - {bc.poNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* 3-Way Matching Alert */}
            {selectedPO && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>3-Way Matching:</strong> System will validate this bill against PO ({selectedPO}) and Goods Receipt (GR) records on submission.
                </AlertDescription>
              </Alert>
            )}

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" size="sm" onClick={addLineItem} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price (Rp)</TableHead>
                      <TableHead>PPN (%)</TableHead>
                      <TableHead>PPh 22 (%)</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">PPN</TableHead>
                      <TableHead className="text-right">PPh 22</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input 
                            placeholder="Item description" 
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            min="0"
                            value={item.quantity || ''}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            required
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            min="0"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            required
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.taxRate.toString()} 
                            onValueChange={(v) => updateLineItem(item.id, 'taxRate', parseFloat(v))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="11">11%</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.pph22Rate.toString()} 
                            onValueChange={(v) => updateLineItem(item.id, 'pph22Rate', parseFloat(v))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="2.5">2.5%</SelectItem>
                              <SelectItem value="7.5">7.5%</SelectItem>
                              <SelectItem value="10">10%</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {formatCurrency(calculateLineTotal(item))}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatCurrency(calculateLinePPN(item))}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatCurrency(calculateLinePPh22(item))}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {formatCurrency(calculateLineTotal(item) + calculateLinePPN(item) + calculateLinePPh22(item))}
                        </TableCell>
                        <TableCell>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Totals */}
                <div className="p-4 bg-secondary/10 border-t">
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex justify-between w-80">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between w-80">
                      <span className="text-sm text-muted-foreground">Total PPN (11%):</span>
                      <span className="font-medium">{formatCurrency(calculateTotalPPN())}</span>
                    </div>
                    <div className="flex justify-between w-80">
                      <span className="text-sm text-muted-foreground">Total PPh 22:</span>
                      <span className="font-medium">{formatCurrency(calculateTotalPPh22())}</span>
                    </div>
                    <div className="flex justify-between w-80 pt-2 border-t">
                      <span className="font-semibold">Grand Total:</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(calculateGrandTotal())}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Payment terms, delivery instructions, etc..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Link href="/finance/ap">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading || !selectedPO || !vendorInvoiceNumber} className="min-w-[150px]">
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
            </div>

          </form>

        </div>
      </div>
    </AppLayout>
  )
}
