'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from '@/components/app-layout'

// Mock Sales Orders for selection
const MOCK_SALES_ORDERS = [
  { id: 'so-001', soNumber: 'SO-2026-001', customerName: 'PT. Global Trading Indonesia' },
  { id: 'so-002', soNumber: 'SO-2026-002', customerName: 'CV. Maju Jaya' },
  { id: 'so-003', soNumber: 'SO-2026-003', customerName: 'PT. Sejahtera Abadi' },
  { id: 'so-004', soNumber: 'SO-2026-004', customerName: 'PT. Elektronik Nusantara' },
]

interface LineItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export default function NewARInvoicePage() {
  const router = useRouter()
  
  // Form state
  const [selectedSO, setSelectedSO] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('30')
  const [fakturPajak, setFakturPajak] = useState('')
  const [notes, setNotes] = useState('')
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 0, unitPrice: 0, taxRate: 11 }
  ])
  
  const [loading, setLoading] = useState(false)

  // Handle SO selection
  const handleSOChange = (soId: string) => {
    setSelectedSO(soId)
    const so = MOCK_SALES_ORDERS.find(s => s.id === soId)
    if (so) {
      setCustomerName(so.customerName)
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
    setLineItems([...lineItems, { id: newId, description: '', quantity: 0, unitPrice: 0, taxRate: 11 }])
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

  const calculateLineTax = (item: LineItem) => {
    const subtotal = calculateLineTotal(item)
    return subtotal * (item.taxRate / 100)
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  }

  const calculateTotalTax = () => {
    return lineItems.reduce((sum, item) => sum + calculateLineTax(item), 0)
  }

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax()
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
      router.push('/finance/ar')
    }, 1000)
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/finance/ar">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">New Sales Invoice</h1>
              <p className="text-sm text-muted-foreground">Create a new customer invoice (AR)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label>Sales Order (SO) <span className="text-red-500">*</span></Label>
                  <Select value={selectedSO} onValueChange={handleSOChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sales Order" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_SALES_ORDERS.map(so => (
                        <SelectItem key={so.id} value={so.id}>
                          {so.soNumber} - {so.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Input value={customerName} disabled className="bg-muted" />
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

                <div className="space-y-2">
                  <Label>Faktur Pajak Number (Optional)</Label>
                  <Input 
                    placeholder="FP-XXX-YY-ZZZZZ"
                    value={fakturPajak}
                    onChange={(e) => setFakturPajak(e.target.value)}
                  />
                </div>

              </CardContent>
            </Card>

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
                      <TableHead className="w-[35%]">Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price (Rp)</TableHead>
                      <TableHead>Tax (%)</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
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
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.taxRate.toString()} 
                            onValueChange={(v) => updateLineItem(item.id, 'taxRate', parseFloat(v))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="11">11%</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(calculateLineTotal(item))}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatCurrency(calculateLineTax(item))}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(calculateLineTotal(item) + calculateLineTax(item))}
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
                    <div className="flex justify-between w-64">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between w-64">
                      <span className="text-sm text-muted-foreground">Total Tax (PPN):</span>
                      <span className="font-medium">{formatCurrency(calculateTotalTax())}</span>
                    </div>
                    <div className="flex justify-between w-64 pt-2 border-t">
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
                    placeholder="Payment instructions, additional terms, etc..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Link href="/finance/ar">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading || !selectedSO} className="min-w-[150px]">
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
            </div>

          </form>

        </div>
      </div>
    </AppLayout>
  )
}
