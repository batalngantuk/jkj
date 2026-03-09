'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, FileText, CheckCircle, Upload, Download, Calendar, User,
  DollarSign, AlertCircle, Clock, Package, TrendingUp, Receipt, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import AppLayout from '@/components/app-layout'
import { StatusTimeline } from '@/components/shared/status-timeline'

// BC 2.0 Status Types
type BC20Status = 'DRAFT' | 'SUBMITTED' | 'CUSTOMS_PROCESSING' | 'TAX_PAYMENT_PENDING' | 'TAX_PAID' | 'CUSTOMS_RELEASED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED'
type TaxPaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'

// Mock data for BC 2.0 detail (will be replaced with API call)
const MOCK_BC20_DETAIL = {
  id: '1',
  documentNumber: 'PIB-001234-2026',
  documentDate: '2026-03-01',
  status: 'TAX_PAYMENT_PENDING' as BC20Status,

  // Supplier & PO
  supplierId: 'SUP001',
  supplierName: 'Global Metals Ltd',
  supplierCountry: 'China',
  poNumber: 'PO-2026-001',
  poId: 'po1',

  // Customs Details
  portOfEntry: 'Tanjung Priok',
  customsOffice: 'KPU Bea Cukai Tanjung Priok',
  estimatedArrival: '2026-03-15',
  actualArrival: null,

  // Financial Summary
  cifValue: 50000,
  currency: 'USD',
  exchangeRate: 15750,
  cifIdr: 787500000,

  // Duty & Tax
  beaMasuk: 39375000,
  ppnImport: 90956250,
  pph22: 20668750,
  totalTax: 151000000,

  // Landed Cost
  freightCost: 15000000,
  insuranceCost: 5000000,
  handlingCost: 10000000,
  otherCosts: 2000000,
  totalLandedCost: 858875000,

  // Dual Billing
  vendorBill: {
    id: 'VB-001234',
    billNumber: 'VB-PIB-001234-2026',
    amount: 787500000,
    dueDate: '2026-03-31',
    status: 'PENDING' as const,
    paidAmount: 0,
    remainingAmount: 787500000,
  },
  taxBill: {
    id: 'TB-001234',
    billNumber: 'TB-PIB-001234-2026',
    beaMasuk: 39375000,
    ppnImport: 90956250,
    pph22: 20668750,
    totalAmount: 151000000,
    dueDate: '2026-03-08',
    status: 'PENDING' as const,
    paidAmount: 0,
    remainingAmount: 151000000,
  },
  taxPaymentStatus: 'PENDING' as TaxPaymentStatus,

  // Items
  items: [
    {
      lineNumber: 1,
      materialCode: 'RM-SS-001',
      materialName: 'Stainless Steel Coils 304',
      hsCode: '72193200',
      hsCodeDescription: 'Flat-rolled products of stainless steel',
      quantity: 10000,
      unit: 'kg',
      unitPriceForeign: 5,
      totalPriceForeign: 50000,
      unitPriceIdr: 78750,
      totalPriceIdr: 787500000,
      dutyRate: 5,
      dutyAmount: 39375000,
      countryOfOrigin: 'China',
    }
  ],

  // Documents
  documents: {
    pib: { uploaded: false },
    invoice: { uploaded: false },
    packingList: { uploaded: false },
    bl: { uploaded: false },
    coa: { uploaded: false },
  },

  // Audit
  createdBy: 'john.doe',
  createdAt: '2026-03-01T10:00:00',
  submittedBy: null,
  submittedAt: null,
}

export default function BC20DetailPage() {
  const params = useParams()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  // Tax payment form state
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In real implementation, fetch data from API
  const bc20 = MOCK_BC20_DETAIL

  const getStatusBadge = (status: BC20Status) => {
    const variants: Record<BC20Status, { color: string; icon: React.ReactNode }> = {
      'DRAFT': { color: 'bg-slate-100 text-slate-700', icon: <FileText className="h-3 w-3" /> },
      'SUBMITTED': { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
      'CUSTOMS_PROCESSING': { color: 'bg-purple-100 text-purple-700', icon: <AlertCircle className="h-3 w-3" /> },
      'TAX_PAYMENT_PENDING': { color: 'bg-orange-100 text-orange-700', icon: <DollarSign className="h-3 w-3" /> },
      'TAX_PAID': { color: 'bg-cyan-100 text-cyan-700', icon: <CheckCircle className="h-3 w-3" /> },
      'CUSTOMS_RELEASED': { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      'RECEIVED': { color: 'bg-teal-100 text-teal-700', icon: <CheckCircle className="h-3 w-3" /> },
      'COMPLETED': { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="h-3 w-3" /> },
      'CANCELLED': { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-3 w-3" /> }
    }

    const variant = variants[status]
    return (
      <Badge className={`${variant.color} gap-1 font-medium`}>
        {variant.icon}
        {status.replace(/_/g, ' ')}
      </Badge>
    )
  }

  // Handle tax payment submission
  const handleTaxPayment = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/bc20/${params.id}/pay-tax`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          paymentDate,
          paymentMethod,
          referenceNumber,
          bankAccount,
          notes: paymentNotes,
          createdBy: 'current-user', // Will be replaced with actual user
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Tax payment recorded successfully!')
        setShowPaymentDialog(false)
        // Refresh page data
        window.location.reload()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error recording tax payment:', error)
      alert('Failed to record tax payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusSteps = [
    {
      label: 'Draft',
      status: 'complete' as const,
      date: new Date(bc20.createdAt).toLocaleDateString('id-ID')
    },
    {
      label: 'Submitted',
      status: bc20.submittedAt ? 'complete' as const : 'pending' as const,
      date: bc20.submittedAt ? new Date(bc20.submittedAt).toLocaleDateString('id-ID') : undefined
    },
    {
      label: 'Tax Payment',
      status: bc20.taxPaymentStatus === 'PAID' ? 'complete' as const :
              bc20.status === 'TAX_PAYMENT_PENDING' ? 'current' as const : 'pending' as const,
    },
    {
      label: 'Customs Released',
      status: bc20.status === 'CUSTOMS_RELEASED' || bc20.status === 'RECEIVED' || bc20.status === 'COMPLETED' ? 'complete' as const : 'pending' as const,
    },
    {
      label: 'Goods Received',
      status: bc20.status === 'RECEIVED' || bc20.status === 'COMPLETED' ? 'complete' as const : 'pending' as const,
    }
  ]

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground font-mono">{bc20.documentNumber}</h1>
                {getStatusBadge(bc20.status)}
              </div>
              <p className="text-sm text-muted-foreground">BC 2.0 Regular Import Declaration (PIB)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            {bc20.status === 'DRAFT' && (
              <Button className="bg-primary hover:bg-primary/90">
                Submit to Customs
              </Button>
            )}
            {bc20.status === 'TAX_PAYMENT_PENDING' && (
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pay Tax
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Record Tax Payment</DialogTitle>
                    <DialogDescription>
                      Record payment for import duties and taxes for BC 2.0 document {bc20.documentNumber}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Tax Bill Summary */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-orange-900">Tax Bill Summary</h3>
                        <Badge className="bg-orange-600 text-white">
                          {bc20.taxBill.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Bea Masuk</p>
                          <p className="font-semibold">Rp {bc20.taxBill.beaMasuk.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">PPN Import (11%)</p>
                          <p className="font-semibold">Rp {bc20.taxBill.ppnImport.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">PPh 22 (2.5%)</p>
                          <p className="font-semibold">Rp {bc20.taxBill.pph22.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Tax Bill</p>
                          <p className="font-bold text-lg text-orange-600">
                            Rp {bc20.taxBill.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Paid Amount</p>
                          <p className="font-semibold text-green-600">
                            Rp {bc20.taxBill.paidAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining Amount</p>
                          <p className="font-bold text-orange-600">
                            Rp {bc20.taxBill.remainingAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Form */}
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Payment Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter payment amount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          max={bc20.taxBill.remainingAmount}
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum: Rp {bc20.taxBill.remainingAmount.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="paymentDate">Payment Date *</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="VIRTUAL_ACCOUNT">Virtual Account</SelectItem>
                            <SelectItem value="EDC">EDC / Card</SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CLEARING">Clearing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="referenceNumber">Reference Number</Label>
                        <Input
                          id="referenceNumber"
                          placeholder="e.g., NTPN, Transaction ID"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          NTPN (Nomor Transaksi Penerimaan Negara) or bank reference number
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bankAccount">Bank Account</Label>
                        <Input
                          id="bankAccount"
                          placeholder="e.g., BCA 1234567890"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional payment notes"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Important Notice */}
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-900">Important</AlertTitle>
                      <AlertDescription className="text-blue-700 text-sm">
                        • Customs clearance will be allowed only after full tax payment<br/>
                        • PPN Import and PPh 22 will be recorded as tax assets (prepaid tax)<br/>
                        • Tax assets can be used to offset future tax liabilities
                      </AlertDescription>
                    </Alert>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentDialog(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleTaxPayment}
                      disabled={
                        !paymentAmount ||
                        parseFloat(paymentAmount) <= 0 ||
                        parseFloat(paymentAmount) > bc20.taxBill.remainingAmount ||
                        !paymentDate ||
                        isSubmitting
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isSubmitting ? 'Processing...' : 'Record Payment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Tax Payment Alert */}
        {bc20.taxPaymentStatus === 'PENDING' && bc20.status === 'TAX_PAYMENT_PENDING' && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Tax Payment Required</AlertTitle>
            <AlertDescription className="text-orange-700">
              Import duties and taxes must be paid before customs clearance.
              Payment due: <strong>{new Date(bc20.taxBill.dueDate).toLocaleDateString('id-ID')}</strong>
              {' - '}Rp {bc20.totalTax.toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
            <CardDescription>Track your BC 2.0 import declaration progress</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusTimeline steps={statusSteps} />
          </CardContent>
        </Card>

        {/* DUAL BILLING SECTION - Key Feature of BC 2.0 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Vendor Bill (CIF Payment) */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    Vendor Bill
                  </CardTitle>
                  <CardDescription>CIF Value Payment to Supplier</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {bc20.vendorBill.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Bill Number</p>
                <p className="font-mono font-semibold">{bc20.vendorBill.billNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount (CIF Value in IDR)</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {bc20.vendorBill.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bc20.currency} {bc20.cifValue.toLocaleString()} × Rp {bc20.exchangeRate.toLocaleString()}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Paid Amount</p>
                  <p className="font-semibold">Rp {bc20.vendorBill.paidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="font-semibold text-blue-600">
                    Rp {bc20.vendorBill.remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{new Date(bc20.vendorBill.dueDate).toLocaleDateString('id-ID')}</p>
              </div>
              <Button variant="outline" className="w-full" disabled={bc20.vendorBill.status === 'PAID'}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Vendor Bill
              </Button>
            </CardContent>
          </Card>

          {/* Tax Bill (Import Duties) */}
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Tax Bill
                  </CardTitle>
                  <CardDescription>Import Duties & Taxes to Customs</CardDescription>
                </div>
                <Badge className="bg-orange-100 text-orange-700">
                  {bc20.taxBill.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Bill Number</p>
                <p className="font-mono font-semibold">{bc20.taxBill.billNumber}</p>
              </div>

              {/* Tax Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bea Masuk (5%)</span>
                  <span className="font-medium">Rp {bc20.taxBill.beaMasuk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPN Import (11%)</span>
                  <span className="font-medium">Rp {bc20.taxBill.ppnImport.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPh 22 (2.5%)</span>
                  <span className="font-medium">Rp {bc20.taxBill.pph22.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total Tax Amount</span>
                  <span className="text-2xl font-bold text-orange-600">
                    Rp {bc20.taxBill.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Paid Amount</p>
                  <p className="font-semibold">Rp {bc20.taxBill.paidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="font-semibold text-orange-600">
                    Rp {bc20.taxBill.remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-orange-900">Payment Due Date</p>
                <p className="font-bold text-orange-700">{new Date(bc20.taxBill.dueDate).toLocaleDateString('id-ID')}</p>
                <p className="text-xs text-orange-600 mt-1">⚠️ Payment required for customs release</p>
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={bc20.taxBill.status === 'PAID'}
                onClick={() => setShowPaymentDialog(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Tax Bill Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Landed Cost Breakdown */}
        <Card className="border-green-200 bg-gradient-to-br from-card to-green-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Landed Cost Calculation
            </CardTitle>
            <CardDescription>
              Total inventory capitalization cost (excludes tax assets)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">CIF Value</p>
                <p className="text-lg font-bold">Rp {bc20.cifIdr.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">Bea Masuk</p>
                <p className="text-lg font-bold text-orange-600">+ Rp {bc20.beaMasuk.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">Freight</p>
                <p className="text-lg font-bold">+ Rp {bc20.freightCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">Insurance</p>
                <p className="text-lg font-bold">+ Rp {bc20.insuranceCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">Handling</p>
                <p className="text-lg font-bold">+ Rp {bc20.handlingCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-600">
                <p className="text-sm font-semibold text-green-900">Total Landed Cost</p>
                <p className="text-xl font-bold text-green-600">Rp {bc20.totalLandedCost.toLocaleString()}</p>
              </div>
            </div>
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 text-sm">Note on Tax Assets</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                PPN Import (Rp {bc20.ppnImport.toLocaleString()}) and PPh 22 (Rp {bc20.pph22.toLocaleString()}) are recorded as prepaid tax assets, NOT included in inventory cost.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Import Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Line</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Material</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">HS Code</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Unit Price</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total Value</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Duty</th>
                  </tr>
                </thead>
                <tbody>
                  {bc20.items.map((item) => (
                    <tr key={item.lineNumber} className="border-b">
                      <td className="p-3 text-sm">{item.lineNumber}</td>
                      <td className="p-3">
                        <p className="font-medium text-sm">{item.materialName}</p>
                        <p className="text-xs text-muted-foreground">{item.materialCode}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-mono text-sm font-semibold">{item.hsCode}</p>
                        <p className="text-xs text-muted-foreground">{item.hsCodeDescription}</p>
                      </td>
                      <td className="p-3 text-right font-medium">{item.quantity.toLocaleString()} {item.unit}</td>
                      <td className="p-3 text-right">
                        <p className="font-medium">{bc20.currency} {item.unitPriceForeign.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Rp {item.unitPriceIdr.toLocaleString()}</p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-semibold">Rp {item.totalPriceIdr.toLocaleString()}</p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-medium text-orange-600">Rp {item.dutyAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{item.dutyRate}%</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Reference Information */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Purchase Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">PO Number</p>
                <Link href={`/purchasing/po/${bc20.poId}`} className="font-mono text-primary hover:underline">
                  {bc20.poNumber}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{bc20.supplierName}</p>
                <p className="text-xs text-muted-foreground">{bc20.supplierCountry}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customs Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Port of Entry</p>
                <p className="font-medium">{bc20.portOfEntry}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customs Office</p>
                <p className="text-sm">{bc20.customsOffice}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Arrival</p>
                <p className="font-medium">{new Date(bc20.estimatedArrival).toLocaleDateString('id-ID')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{new Date(bc20.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium">{bc20.createdBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Required Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>Upload supporting documents for customs clearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { key: 'pib', label: 'PIB Document', required: true },
                { key: 'invoice', label: 'Commercial Invoice', required: true },
                { key: 'packingList', label: 'Packing List', required: true },
                { key: 'bl', label: 'Bill of Lading', required: true },
                { key: 'coa', label: 'Certificate of Analysis', required: false }
              ].map((doc) => (
                <div key={doc.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.required ? '• Required' : '• Optional'}
                      </p>
                    </div>
                  </div>
                  {bc20.documents[doc.key as keyof typeof bc20.documents].uploaded ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
